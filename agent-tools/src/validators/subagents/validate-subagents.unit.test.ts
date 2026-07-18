import { describe, expect, it } from 'vitest';
import {
  extractCanonicalPaths,
  getCodexAdapterValidation,
  getCodexPermissionCompositionIssues,
  getCodexRegistrationValidation,
  getReadingDisciplineIssues,
  parseCodexRegistrations,
  readCodexDeveloperInstructions,
  readTomlBasicStringValue,
  requiredReadingDisciplineComponent,
  resolveCodexConfigFilePath,
} from './validate-subagents-helpers.js';

const REVIEWER_READING_DISCIPLINE =
  'Read and apply `.agent/sub-agents/components/behaviours/reading-discipline.md`.';
const WORKER_READING_DISCIPLINE =
  'Read and apply `.agent/sub-agents/components/behaviours/worker-reading-discipline.md`.';

describe('parseCodexRegistrations', () => {
  it('extracts agent names, descriptions, and adapter paths from Codex config text', () => {
    expect(
      parseCodexRegistrations(`[agents."code-reviewer"]
description = "Gateway reviewer."
config_file = "agents/code-reviewer.toml"
`),
    ).toStrictEqual([
      {
        name: 'code-reviewer',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-reviewer.toml',
      },
    ]);
  });
});

describe('Codex subagent helper coverage', () => {
  it('rejects a parent permission profile that silently overrides custom-agent sandboxes', () => {
    expect(
      getCodexPermissionCompositionIssues({
        configContent: 'default_permissions = ":workspace"\n',
        adapterContents: ['sandbox_mode = "read-only"\n'],
      }),
    ).toStrictEqual([
      '.codex/config.toml: default_permissions cannot be combined with custom-agent sandbox_mode; Codex reapplies the parent permission mode when spawning a child and silently overrides the role sandbox',
    ]);
  });

  it('accepts custom-agent sandboxes when the project does not force a parent permission profile', () => {
    expect(
      getCodexPermissionCompositionIssues({
        configContent: 'model = "fake-model"\n',
        adapterContents: ['sandbox_mode = "read-only"\n'],
      }),
    ).toStrictEqual([]);
  });

  it('resolves config_file relative to .codex/config.toml', () => {
    expect(resolveCodexConfigFilePath('agents/code-reviewer.toml')).toBe(
      '.codex/agents/code-reviewer.toml',
    );
  });

  it('accepts Codex-native relative adapter paths in registrations', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-reviewer',
          description: 'Gateway reviewer.',
          configFile: 'agents/code-reviewer.toml',
        },
      ],
      fileExists: (filePath: string) => filePath === '.codex/agents/code-reviewer.toml',
    });

    expect(issues).toStrictEqual([]);
  });

  it('rejects repo-root adapter paths that repeat .codex inside config_file', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-reviewer',
          description: 'Gateway reviewer.',
          configFile: '.codex/agents/code-reviewer.toml',
        },
      ],
      fileExists: (filePath: string) => filePath === '.codex/agents/code-reviewer.toml',
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "code-reviewer" references missing adapter .codex/.codex/agents/code-reviewer.toml',
    );
  });

  it('reports missing adapter files from Codex registrations', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-reviewer',
          description: 'Gateway reviewer.',
          configFile: 'agents/code-reviewer.toml',
        },
      ],
      fileExists: () => false,
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "code-reviewer" references missing adapter .codex/agents/code-reviewer.toml',
    );
  });

  it('reports missing required settings and missing developer instructions in Codex adapters', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-reviewer.toml',
      registeredAgent: {
        name: 'code-reviewer',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-reviewer.toml',
      },
      content: 'sandbox_mode = "read-only"\napproval_policy = "never"\n',
    });

    expect(issues).toContain('.codex/agents/code-reviewer.toml: missing required TOML key "name"');
    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: missing required TOML key "description"',
    );
    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: model_reasoning_effort must be "high" (found: missing)',
    );
    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: missing triple-quoted developer_instructions block',
    );
  });

  it('reports adapter metadata drift from the central registry', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-reviewer.toml',
      registeredAgent: {
        name: 'code-reviewer',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-reviewer.toml',
      },
      content: `name = "different-expert"
description = "Different description."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/code-reviewer.md\`.
"""`,
    });

    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: name must match filename "code-reviewer" (found: different-expert)',
    );
    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: name "different-expert" must match .codex/config.toml registration "code-reviewer"',
    );
    expect(issues).toContain(
      '.codex/agents/code-reviewer.toml: description must match .codex/config.toml registration for "code-reviewer"',
    );
  });

  it('requires a worker adapter to use low reasoning effort, not the reviewer high', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/task-worker.toml',
      agentClass: 'worker',
      registeredAgent: {
        name: 'task-worker',
        description: 'Lean worker.',
        configFile: 'agents/task-worker.toml',
      },
      content: `name = "task-worker"
description = "Lean worker."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/task-worker.md\`.
"""`,
    });

    expect(issues).toContain(
      '.codex/agents/task-worker.toml: model_reasoning_effort must be "low" (found: high)',
    );
  });

  it('passes a worker adapter that uses low reasoning effort', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/task-worker.toml',
      agentClass: 'worker',
      registeredAgent: {
        name: 'task-worker',
        description: 'Lean worker.',
        configFile: 'agents/task-worker.toml',
      },
      content: `name = "task-worker"
description = "Lean worker."
model_reasoning_effort = "low"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/task-worker.md\`.
"""`,
    });

    expect(issues.some((issue) => issue.includes('model_reasoning_effort'))).toBe(false);
  });

  it.each(['agent_class', 'tools'])(
    'rejects projection-only %s metadata in a Codex custom-agent layer',
    (foreignKey) => {
      const { issues } = getCodexAdapterValidation({
        codexAdapterFile: '.codex/agents/task-worker.toml',
        agentClass: 'worker',
        registeredAgent: {
          name: 'task-worker',
          description: 'Lean worker.',
          configFile: 'agents/task-worker.toml',
        },
        content: `name = "task-worker"
description = "Lean worker."
model_reasoning_effort = "low"
sandbox_mode = "read-only"
approval_policy = "never"
${foreignKey} = "worker"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/task-worker.md\`.
"""`,
      });

      expect(issues.some((issue) => issue.includes(foreignKey))).toBe(true);
      expect(issues.some((issue) => issue.includes('projection metadata'))).toBe(true);
    },
  );

  it('rejects an array-form projection-only tools assignment in a Codex custom-agent layer', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/task-worker.toml',
      agentClass: 'worker',
      registeredAgent: {
        name: 'task-worker',
        description: 'Lean worker.',
        configFile: 'agents/task-worker.toml',
      },
      content: `name = "task-worker"
description = "Lean worker."
model_reasoning_effort = "low"
sandbox_mode = "read-only"
approval_policy = "never"
tools = ["Read"]

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/task-worker.md\`.
"""`,
    });

    expect(issues.some((issue) => issue.includes('projection metadata key "tools"'))).toBe(true);
  });

  it('extracts canonical template paths from developer instructions', () => {
    const developerInstructions = readCodexDeveloperInstructions(`developer_instructions = """
Read and follow \`.agent/sub-agents/templates/code-reviewer.md\`.
Read and apply \`.agent/sub-agents/components/personas/fred.md\`.
"""`);

    expect(readTomlBasicStringValue('approval_policy = "never"', 'approval_policy')).toBe('never');
    expect(extractCanonicalPaths(developerInstructions)).toStrictEqual([
      '.agent/sub-agents/components/personas/fred.md',
      '.agent/sub-agents/templates/code-reviewer.md',
    ]);
  });
});

describe('requiredReadingDisciplineComponent', () => {
  it('requires the full reading-discipline for a reviewer', () => {
    expect(requiredReadingDisciplineComponent('reviewer')).toBe(
      '.agent/sub-agents/components/behaviours/reading-discipline.md',
    );
  });

  it('requires the lean worker-reading-discipline for a worker', () => {
    expect(requiredReadingDisciplineComponent('worker')).toBe(
      '.agent/sub-agents/components/behaviours/worker-reading-discipline.md',
    );
  });
});

describe('getReadingDisciplineIssues', () => {
  it('passes a reviewer template referencing the full reading-discipline', () => {
    expect(
      getReadingDisciplineIssues(
        't/reviewer.md',
        `body\n${REVIEWER_READING_DISCIPLINE}\n`,
        'reviewer',
      ),
    ).toStrictEqual([]);
  });

  it('passes a worker template referencing the worker-reading-discipline', () => {
    expect(
      getReadingDisciplineIssues('t/worker.md', `body\n${WORKER_READING_DISCIPLINE}\n`, 'worker'),
    ).toStrictEqual([]);
  });

  it('flags a worker template referencing only the reviewer reading-discipline (missing the lean one AND loading doctrine)', () => {
    const issues = getReadingDisciplineIssues(
      't/worker.md',
      `body\n${REVIEWER_READING_DISCIPLINE}\n`,
      'worker',
    );
    expect(issues).toHaveLength(2);
    expect(issues.some((issue) => issue.includes('missing worker-reading-discipline'))).toBe(true);
    expect(issues.some((issue) => issue.includes('must not reference the reviewer'))).toBe(true);
  });

  it('flags a worker template that ALSO references the reviewer reading-discipline (it would load principles.md)', () => {
    const issues = getReadingDisciplineIssues(
      't/worker.md',
      `body\n${WORKER_READING_DISCIPLINE}\n${REVIEWER_READING_DISCIPLINE}\n`,
      'worker',
    );
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('must not reference the reviewer');
  });

  it('flags a reviewer template missing the reading-discipline reference', () => {
    const issues = getReadingDisciplineIssues('t/reviewer.md', 'body only\n', 'reviewer');
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain('reading-discipline');
  });
});
