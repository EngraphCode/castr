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
import { hasTomlAssignment } from './validate-subagents-codex-toml.js';
import { soleTemplatePath } from './validate-subagents-template-checks.js';

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

describe('hasTomlAssignment — every legal key spelling (gate-shaped: a missed spelling is a bypass)', () => {
  it.each([
    ['bare', 'tools = ["Read"]'],
    ['basic-quoted', '"tools" = ["Read"]'],
    ['literal-quoted', "'tools' = ['Read']"],
    ['basic-quoted with a \\u escape', String.raw`"to\u006Fls" = ["Read"]`],
    ['basic-quoted with a \\U escape', String.raw`"to\U0000006Fls" = ["Read"]`],
  ])('detects the %s spelling', (_label, line) => {
    expect(hasTomlAssignment(line, 'tools')).toBe(true);
  });

  it('does not match the quoted key inside a multiline basic string', () => {
    const content = 'notes = """\n"tools" = ["Read"]\n"""\n';
    expect(hasTomlAssignment(content, 'tools')).toBe(false);
  });

  it('does not decode escapes in literal-quoted keys (TOML literal strings carry none)', () => {
    expect(hasTomlAssignment(String.raw`'to\u006Fls' = 1`, 'tools')).toBe(false);
  });

  it('does not match a basic-quoted key with an invalid escape (malformed TOML is no spelling)', () => {
    expect(hasTomlAssignment(String.raw`"to\qols" = 1`, 'tools')).toBe(false);
  });

  it('does not match a basic-quoted key that decodes to a DIFFERENT key', () => {
    expect(hasTomlAssignment(String.raw`"tools\u0021" = 1`, 'tools')).toBe(false);
  });
});

describe('soleTemplatePath — an adapter references exactly one canonical template', () => {
  const DIR = '.agent/sub-agents/templates';
  it('returns the single template with no extras', () => {
    expect(soleTemplatePath([`${DIR}/code-reviewer.md`, '.agent/rules/x.md'], DIR)).toEqual({
      templatePath: `${DIR}/code-reviewer.md`,
      extras: [],
    });
  });
  it('returns undefined with no extras when no template is referenced', () => {
    expect(soleTemplatePath(['.agent/rules/x.md'], DIR)).toEqual({
      templatePath: undefined,
      extras: [],
    });
  });
  it('surfaces every extra template so ambiguity fails loudly, never lexicographically', () => {
    const result = soleTemplatePath([`${DIR}/a.md`, `${DIR}/b.md`], DIR);
    expect(result.templatePath).toBe(`${DIR}/a.md`);
    expect(result.extras).toEqual([`${DIR}/b.md`]);
  });
});

describe('hasTomlAssignment — comments never affect multiline tracking (gate-shaped)', () => {
  it('a full-line comment containing triple quotes does not blind the gate', () => {
    const content = `# note: this mentions """ in passing\ntools = ["Read"]\n`;
    expect(hasTomlAssignment(content, 'tools')).toBe(true);
  });

  it('an inline comment containing triple quotes does not blind the gate', () => {
    const content = `agent_class = "worker" # """\ntools = ["Read"]\n`;
    expect(hasTomlAssignment(content, 'tools')).toBe(true);
  });

  it('a hash inside a string value is not a comment', () => {
    const content = `notes = "a # b"\ntools = ["Read"]\n`;
    expect(hasTomlAssignment(content, 'tools')).toBe(true);
  });
});
