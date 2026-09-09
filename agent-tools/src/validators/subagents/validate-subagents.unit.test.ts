import { describe, expect, it } from 'vitest';
import {
  extractCanonicalPaths,
  getCodexAdapterValidation,
  getCodexRegistrationValidation,
  parseCodexRegistrations,
  readCodexDeveloperInstructions,
  readTomlBasicStringValue,
  resolveCodexConfigFilePath,
} from './validate-subagents-helpers.js';

describe('parseCodexRegistrations', () => {
  it('extracts agent names, descriptions, and adapter paths from Codex config text', () => {
    expect(
      parseCodexRegistrations(`[agents."code-expert"]
description = "Gateway reviewer."
config_file = "agents/code-expert.toml"
`),
    ).toStrictEqual([
      {
        name: 'code-expert',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-expert.toml',
      },
    ]);
  });
});

describe('Codex subagent helper coverage', () => {
  it('resolves config_file relative to .codex/config.toml', () => {
    expect(resolveCodexConfigFilePath('agents/code-expert.toml')).toBe(
      '.codex/agents/code-expert.toml',
    );
  });

  it('accepts Codex-native relative adapter paths in registrations', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-expert',
          description: 'Gateway reviewer.',
          configFile: 'agents/code-expert.toml',
        },
      ],
      fileExists: (filePath: string) => filePath === '.codex/agents/code-expert.toml',
    });

    expect(issues).toStrictEqual([]);
  });

  it('rejects a registration whose name does not own its adapter path', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'alias-reviewer',
          description: 'Gateway reviewer.',
          configFile: 'agents/code-expert.toml',
        },
      ],
      fileExists: () => true,
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "alias-reviewer" config_file must be "agents/alias-reviewer.toml" (found "agents/code-expert.toml")',
    );
  });

  it('rejects a noncanonical raw config_file that normalizes to the owned adapter', () => {
    const { issues, registrationsByName } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-expert',
          description: 'Gateway reviewer.',
          configFile: 'agents/./code-expert.toml',
        },
      ],
      fileExists: () => {
        throw new Error('invalid registration must not reach filesystem checks');
      },
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "code-expert" config_file must be "agents/code-expert.toml" (found "agents/./code-expert.toml")',
    );
    expect(registrationsByName.size).toBe(0);
  });

  it('rejects a whitespace-only registration description', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-expert',
          description: '   ',
          configFile: 'agents/code-expert.toml',
        },
      ],
    });

    expect(issues).toContain('.codex/config.toml: agent "code-expert" is missing a description');
  });

  it('rejects a padded registration name when validation is called directly', () => {
    const { issues, registrationsByName } = getCodexRegistrationValidation({
      registrations: [
        {
          name: ' code-expert',
          description: 'Gateway reviewer.',
          configFile: 'agents/ code-expert.toml',
        },
      ],
    });

    expect(issues).toContain(
      '.codex/config.toml: agent registration name " code-expert" must be a lowercase, hyphen-delimited token',
    );
    expect(registrationsByName.size).toBe(0);
  });

  it('rejects repo-root adapter paths that repeat .codex inside config_file', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-expert',
          description: 'Gateway reviewer.',
          configFile: '.codex/agents/code-expert.toml',
        },
      ],
      fileExists: (filePath: string) => filePath === '.codex/agents/code-expert.toml',
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "code-expert" config_file must be "agents/code-expert.toml" (found ".codex/agents/code-expert.toml")',
    );
  });

  it('reports missing adapter files from Codex registrations', () => {
    const { issues } = getCodexRegistrationValidation({
      registrations: [
        {
          name: 'code-expert',
          description: 'Gateway reviewer.',
          configFile: 'agents/code-expert.toml',
        },
      ],
      fileExists: () => false,
    });

    expect(issues).toContain(
      '.codex/config.toml: agent "code-expert" references missing adapter .codex/agents/code-expert.toml',
    );
  });

  it('reports missing required settings and missing developer instructions in Codex adapters', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-expert.toml',
      registeredAgent: {
        name: 'code-expert',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-expert.toml',
      },
      content: 'sandbox_mode = "read-only"\napproval_policy = "never"\n',
    });

    expect(issues).toContain('.codex/agents/code-expert.toml: missing required TOML key "name"');
    expect(issues).toContain(
      '.codex/agents/code-expert.toml: missing required TOML key "description"',
    );
    expect(issues).toContain(
      '.codex/agents/code-expert.toml: model_reasoning_effort must be "high" (found: missing)',
    );
    expect(issues).toContain(
      '.codex/agents/code-expert.toml: missing non-empty developer_instructions string',
    );
  });

  it('reports adapter metadata drift from the central registry', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-expert.toml',
      registeredAgent: {
        name: 'code-expert',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-expert.toml',
      },
      content: `name = "different-expert"
description = "Different description."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"

developer_instructions = """
Read and follow \`.agent/sub-agents/templates/code-expert.md\`.
"""`,
    });

    expect(issues).toContain(
      '.codex/agents/code-expert.toml: name must match filename "code-expert" (found: different-expert)',
    );
    expect(issues).toContain(
      '.codex/agents/code-expert.toml: name "different-expert" must match .codex/config.toml registration "code-expert"',
    );
    expect(issues).toContain(
      '.codex/agents/code-expert.toml: description must match .codex/config.toml registration for "code-expert"',
    );
  });

  it('rejects a non-canonical registration when the default template directory is explicit', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/ reviewer.toml',
      registeredAgent: {
        name: ' reviewer',
        description: 'Gateway reviewer.',
        configFile: 'agents/ reviewer.toml',
      },
      templateDir: '.agent/sub-agents/templates',
      content: `name = " reviewer"
description = "Gateway reviewer."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-expert.md\`."
`,
    });

    expect(issues.join('\n')).toContain('must be a lowercase, hyphen-delimited token');
  });

  it('rejects a raw config_file alias when the default config path is explicit', () => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-expert.toml',
      registeredAgent: {
        name: 'code-expert',
        description: 'Gateway reviewer.',
        configFile: 'agents/./code-expert.toml',
      },
      configPath: '.codex/config.toml',
      content: `name = "code-expert"
description = "Gateway reviewer."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-expert.md\`."
`,
    });

    expect(issues.join('\n')).toContain(
      "config_file must be 'agents/code-expert.toml' (found 'agents/./code-expert.toml')",
    );
  });

  it.each([
    '.agent/sub-agents/templates/nested/code-expert.md',
    '.agent/sub-agents/templates/code-expert.txt',
  ])('rejects a template path outside the canonical template-file contract: %s', (templatePath) => {
    const { issues } = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-expert.toml',
      registeredAgent: {
        name: 'code-expert',
        description: 'Gateway reviewer.',
        configFile: 'agents/code-expert.toml',
      },
      content: `name = "code-expert"
description = "Gateway reviewer."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`${templatePath}\`."
`,
    });

    expect(issues).toContain(
      '.codex/agents/code-expert.toml: developer_instructions must reference exactly one canonical template inside .agent/sub-agents/templates',
    );
  });

  it('extracts canonical template paths from developer instructions', () => {
    const developerInstructions = readCodexDeveloperInstructions(`developer_instructions = """
Read and follow \`.agent/sub-agents/templates/code-expert.md\`.
Read and apply \`.agent/sub-agents/components/personas/fred.md\`.
"""`);

    expect(readTomlBasicStringValue('approval_policy = "never"', 'approval_policy')).toBe('never');
    expect(extractCanonicalPaths(developerInstructions)).toStrictEqual([
      '.agent/sub-agents/components/personas/fred.md',
      '.agent/sub-agents/templates/code-expert.md',
    ]);
  });
});
