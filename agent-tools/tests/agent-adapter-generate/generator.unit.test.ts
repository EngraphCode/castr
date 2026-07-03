import { describe, expect, it } from 'vitest';

import {
  buildAgentRoster,
  deriveRuleDescription,
  renderAgentAdapter,
  renderCursorRule,
  toTitleCase,
} from '../../src/agent-adapter-generate/generator.js';

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

describe('buildAgentRoster', () => {
  it('derives name, description, and template path for a non-persona adapter', () => {
    const roster = buildAgentRoster(CONFIG_TEXT, new Map([['code-reviewer', CODE_REVIEWER_TOML]]));
    expect(roster).toEqual([
      {
        name: 'code-reviewer',
        description: 'Gateway reviewer for non-trivial changes.',
        templatePath: '.agent/sub-agents/templates/code-reviewer.md',
      },
    ]);
  });

  it('captures the persona path when present', () => {
    const roster = buildAgentRoster(
      CONFIG_TEXT,
      new Map([['architecture-expert-barney', BARNEY_TOML]]),
    );
    expect(roster).toEqual([
      {
        name: 'architecture-expert-barney',
        description: 'Simplification-first architecture reviewer.',
        templatePath: '.agent/sub-agents/templates/architecture-expert.md',
        personaPath: '.agent/sub-agents/components/personas/barney.md',
      },
    ]);
  });

  it('returns entries sorted by name', () => {
    const roster = buildAgentRoster(
      CONFIG_TEXT,
      new Map([
        ['code-reviewer', CODE_REVIEWER_TOML],
        ['architecture-expert-barney', BARNEY_TOML],
      ]),
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
    expect(() => buildAgentRoster(CONFIG_TEXT, new Map([['code-reviewer', badToml]]))).toThrow(
      /no canonical template/,
    );
  });

  it('throws when the config has no registration for an adapter', () => {
    expect(() =>
      buildAgentRoster(
        '[features]\nmulti_agent = true\n',
        new Map([['code-reviewer', CODE_REVIEWER_TOML]]),
      ),
    ).toThrow(/no registration/);
  });
});

describe('renderAgentAdapter', () => {
  const codeReviewer = {
    name: 'code-reviewer',
    description: 'Gateway reviewer for non-trivial changes.',
    templatePath: '.agent/sub-agents/templates/code-reviewer.md',
  };
  const barney = {
    name: 'architecture-expert-barney',
    description: 'Simplification-first architecture reviewer.',
    templatePath: '.agent/sub-agents/templates/architecture-expert.md',
    personaPath: '.agent/sub-agents/components/personas/barney.md',
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
