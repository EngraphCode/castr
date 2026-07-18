import { describe, expect, it } from 'vitest';

import {
  buildAgentRoster,
  deriveRuleDescription,
  renderAgentAdapter,
  renderCursorRule,
  toTitleCase,
} from '../../src/agent-adapter-generate/generator.js';
import type { AgentRosterEntry } from '../../src/agent-adapter-generate/generator.js';

const CONFIG_TEXT = `[features]
multi_agent = true

[agents."code-reviewer"]
description = "Gateway reviewer for non-trivial changes."
config_file = ".codex/agents/code-reviewer.toml"

[agents."architecture-expert-barney"]
description = "Simplification-first architecture reviewer."
config_file = ".codex/agents/architecture-expert-barney.toml"
`;

const CODE_REVIEWER_TOML = `name = "code-reviewer"
description = "Gateway reviewer for non-trivial changes."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/code-reviewer.md\`.

This file is a thin Codex adapter. Mode: Observe, analyse, and report. Do not modify code.
"""
`;

const BARNEY_TOML = `name = "architecture-expert-barney"
description = "Simplification-first architecture reviewer."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and apply \`.agent/sub-agents/components/personas/barney.md\` for your persona identity and review lens.

Your first action MUST be to read and internalise \`.agent/sub-agents/templates/architecture-expert.md\`.

This file is a thin Codex adapter. Mode: Observe, analyse, and report. Do not modify code.
"""
`;

const TEMPLATE_TEXT_BY_PATH = new Map([
  ['.agent/sub-agents/templates/code-reviewer.md', '# Code Reviewer\n'],
  ['.agent/sub-agents/templates/architecture-expert.md', '# Architecture Expert\n'],
]);

describe('buildAgentRoster', () => {
  it('derives name, description, and template path for a non-persona adapter', () => {
    const roster = buildAgentRoster(
      CONFIG_TEXT,
      new Map([['code-reviewer', CODE_REVIEWER_TOML]]),
      TEMPLATE_TEXT_BY_PATH,
    );
    expect(roster).toHaveLength(1);
    expect(roster[0]).toMatchObject({
      name: 'code-reviewer',
      description: 'Gateway reviewer for non-trivial changes.',
      templatePath: '.agent/sub-agents/templates/code-reviewer.md',
    });
  });

  it('captures the persona path when present', () => {
    const roster = buildAgentRoster(
      CONFIG_TEXT,
      new Map([['architecture-expert-barney', BARNEY_TOML]]),
      TEMPLATE_TEXT_BY_PATH,
    );
    expect(roster).toHaveLength(1);
    expect(roster[0]).toMatchObject({
      name: 'architecture-expert-barney',
      templatePath: '.agent/sub-agents/templates/architecture-expert.md',
      personaPath: '.agent/sub-agents/components/personas/barney.md',
    });
  });

  it('returns entries sorted by name', () => {
    const roster = buildAgentRoster(
      CONFIG_TEXT,
      new Map([
        ['code-reviewer', CODE_REVIEWER_TOML],
        ['architecture-expert-barney', BARNEY_TOML],
      ]),
      TEMPLATE_TEXT_BY_PATH,
    );
    expect(roster.map((entry) => entry.name)).toEqual([
      'architecture-expert-barney',
      'code-reviewer',
    ]);
  });

  it('throws when an adapter references no canonical template', () => {
    const badToml = CODE_REVIEWER_TOML.replace(
      '.agent/sub-agents/templates/code-reviewer.md',
      '.agent/sub-agents/components/personas/barney.md',
    );
    expect(() =>
      buildAgentRoster(CONFIG_TEXT, new Map([['code-reviewer', badToml]]), TEMPLATE_TEXT_BY_PATH),
    ).toThrow(/no canonical template/);
  });

  it('throws when the config has no registration for an adapter', () => {
    expect(() =>
      buildAgentRoster(
        '[features]\nmulti_agent = true\n',
        new Map([['code-reviewer', CODE_REVIEWER_TOML]]),
        TEMPLATE_TEXT_BY_PATH,
      ),
    ).toThrow(/no registration/);
  });
});

describe('renderAgentAdapter', () => {
  const codeReviewer = {
    name: 'code-reviewer',
    description: 'Gateway reviewer for non-trivial changes.',
    templatePath: '.agent/sub-agents/templates/code-reviewer.md',
    agentClass: 'reviewer' as const,
    tools: [],
  };
  const barney = {
    name: 'architecture-expert-barney',
    description: 'Simplification-first architecture reviewer.',
    templatePath: '.agent/sub-agents/templates/architecture-expert.md',
    personaPath: '.agent/sub-agents/components/personas/barney.md',
    agentClass: 'reviewer' as const,
    tools: [],
  };

  it('renders a Cursor adapter with required frontmatter and the template-load line', () => {
    const out = renderAgentAdapter(codeReviewer, 'cursor');
    expect(out).toMatch(/^---\n/);
    expect(out).toContain('name: code-reviewer');
    expect(out).toContain('model: gpt-5.5');
    expect(out).toContain('description: Gateway reviewer for non-trivial changes.');
    expect(out).toContain(
      'Your first action MUST be to read and internalise `.agent/sub-agents/templates/code-reviewer.md`.',
    );
    expect(out.endsWith('\n')).toBe(true);
  });

  it('renders a Claude adapter with read-only posture and the template-load line', () => {
    const out = renderAgentAdapter(codeReviewer, 'claude');
    expect(out).toContain('name: code-reviewer');
    expect(out).toContain('model: opus');
    expect(out).toContain('disallowedTools: Write, Edit, NotebookEdit');
    expect(out).toContain(
      'Your first action MUST be to read and internalise `.agent/sub-agents/templates/code-reviewer.md`.',
    );
  });

  it('includes the persona-apply line before the template-load line for persona adapters', () => {
    const out = renderAgentAdapter(barney, 'cursor');
    const personaIdx = out.indexOf(
      'Read and apply `.agent/sub-agents/components/personas/barney.md`',
    );
    const templateIdx = out.indexOf('Your first action MUST be to read and internalise');
    expect(personaIdx).toBeGreaterThan(-1);
    expect(templateIdx).toBeGreaterThan(personaIdx);
  });

  it('is idempotent — rendering twice yields identical output', () => {
    expect(renderAgentAdapter(barney, 'claude')).toBe(renderAgentAdapter(barney, 'claude'));
  });

  it('single-quotes descriptions that contain YAML-significant characters', () => {
    const tricky = { ...codeReviewer, description: "Reviewer: gateway, it's #1." };
    const out = renderAgentAdapter(tricky, 'cursor');
    expect(out).toContain("description: 'Reviewer: gateway, it''s #1.'");
  });
});

describe('renderAgentAdapter — worker class (behaviour through the canonical template → adapter seam)', () => {
  const WORKER_CONFIG = `[agents."task-worker"]
description = "Lean single-purpose task worker."
config_file = ".codex/agents/task-worker.toml"
`;
  const workerToml = `model_reasoning_effort = "low"
developer_instructions = """
Read and follow \`.agent/sub-agents/templates/task-worker.md\`.
"""
`;
  const workerTemplate = (projection: string): string =>
    `---
projection:
${projection}
---

# Task Worker
`;
  const workerProjection = `  class: worker
  tools:
    - Read
    - Grep
    - Glob`;
  const buildWorker = (projection: string): AgentRosterEntry => {
    const [entry] = buildAgentRoster(
      WORKER_CONFIG,
      new Map([['task-worker', workerToml]]),
      new Map([['.agent/sub-agents/templates/task-worker.md', workerTemplate(projection)]]),
    );
    if (entry === undefined) {
      throw new Error('expected a task-worker roster entry');
    }
    return entry;
  };

  it('projects canonical worker metadata without projection-only Codex keys', () => {
    const worker = buildWorker(workerProjection);

    expect(worker).toMatchObject({
      name: 'task-worker',
      agentClass: 'worker',
      tools: ['Read', 'Grep', 'Glob'],
    });

    const claude = renderAgentAdapter(worker, 'claude');
    expect(claude).toContain('model: sonnet');
    expect(claude).toContain('tools: Read, Grep, Glob');
    // Bash is a universal capability, never part of a lean grant.
    expect(claude).not.toContain('Bash');
    // A worker does the task; it never carries the reviewer's review posture.
    expect(claude).not.toContain('Review or recommend');
    expect(claude).not.toContain('permissionMode: plan');

    const cursor = renderAgentAdapter(worker, 'cursor');
    expect(cursor).toContain('tools: Read, Grep, Glob');
    expect(cursor).not.toContain('Shell');
    expect(cursor).not.toContain('WebFetch');
    expect(cursor).not.toContain('WebSearch');
  });

  it('gives a no-tools worker the probe-verified present-but-empty allowlist (no deny-all)', () => {
    const out = renderAgentAdapter(buildWorker('  class: worker'), 'claude');
    expect(out).toContain('\ntools:\n');
    expect(out).not.toContain('disallowedTools');
  });

  it('defaults templates without projection metadata to reviewer posture', () => {
    const [entry] = buildAgentRoster(
      WORKER_CONFIG,
      new Map([['task-worker', workerToml]]),
      new Map([['.agent/sub-agents/templates/task-worker.md', '# Task Worker\n']]),
    );

    expect(entry?.agentClass).toBe('reviewer');
  });

  it('fails fast when a referenced canonical template has not been supplied', () => {
    expect(() =>
      buildAgentRoster(WORKER_CONFIG, new Map([['task-worker', workerToml]]), new Map()),
    ).toThrow(/task-worker\.md.*template text was not supplied/u);
  });

  it('fails fast when canonical projection metadata contains an unsupported class', () => {
    expect(() => buildWorker('  class: supervisor')).toThrow(/projection.*class/u);
  });

  it('fails fast when canonical projection metadata contains an unsupported key', () => {
    expect(() => buildWorker(`${workerProjection}\n  permissionMode: bypassPermissions`)).toThrow(
      /projection metadata/u,
    );
  });

  it('fails fast when a worker grant is not portable across generated surfaces', () => {
    expect(() =>
      buildWorker(`  class: worker
  tools:
    - Bash`),
    ).toThrow(/projection.*tools/u);
  });

  it('fails fast when reviewer metadata declares a dead tools grant', () => {
    expect(() =>
      buildWorker(`  class: reviewer
  tools:
    - Read`),
    ).toThrow(/projection.*tools/u);
  });
});

describe('deriveRuleDescription', () => {
  it('uses the H1 title stripped of leading hashes', () => {
    expect(deriveRuleDescription('# Agent State Must Be Observable\n\nbody text\n')).toBe(
      'Agent State Must Be Observable',
    );
  });

  it('falls back to the first non-empty line when there is no H1', () => {
    expect(deriveRuleDescription('Write failing tests first.\n\nmore\n')).toBe(
      'Write failing tests first.',
    );
  });

  it('skips leading blank lines', () => {
    expect(deriveRuleDescription('\n\n# Title Here\n')).toBe('Title Here');
  });
});

describe('renderCursorRule', () => {
  it('emits frontmatter plus a single canonical-rule reference line', () => {
    const out = renderCursorRule('napkin', 'Keep the capture loop active');
    expect(out).toBe(
      '---\ndescription: Keep the capture loop active\nalwaysApply: true\n---\n\nRead and follow `.agent/rules/napkin.md`.\n',
    );
  });

  it('keeps the body within the 10-line trigger budget (one content line)', () => {
    const out = renderCursorRule('tdd', 'Write failing tests first.');
    const body = out.split('---\n')[2] ?? '';
    const contentLines = body.split('\n').filter((line) => line.trim() !== '');
    expect(contentLines).toHaveLength(1);
  });

  it('quotes descriptions containing a colon', () => {
    const out = renderCursorRule('foo', 'Do this: then that');
    expect(out).toContain("description: 'Do this: then that'");
  });
});

describe('toTitleCase', () => {
  it('humanises a kebab agent name', () => {
    expect(toTitleCase('architecture-expert-barney')).toBe('Architecture Expert Barney');
  });
});
