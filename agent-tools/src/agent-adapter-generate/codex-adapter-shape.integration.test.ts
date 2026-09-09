import { describe, expect, it } from 'vitest';

import { parseCodexProjectAgent } from '../core/codex-project-agents.js';
import { getCodexAdapterValidation } from '../validators/subagents/validate-subagents-codex-adapter-validation.js';
import { buildAgentRoster } from './generator.js';

const config = `[agents."code-reviewer"]
description = "Gateway reviewer."
config_file = "agents/code-reviewer.toml"
`;

const registration = {
  name: 'code-reviewer',
  description: 'Gateway reviewer.',
  configFile: 'agents/code-reviewer.toml',
};

const source = `name = "code-reviewer"
description = "Gateway reviewer."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-reviewer.md\`."
`;

function sourceWithReferences(references: string): string {
  return source.replace('Read `.agent/sub-agents/templates/code-reviewer.md`.', references);
}

it.each([
  ['scalar setting', 'unreviewed_setting = true'],
  ['inline table', 'mcp_servers = { extra = { command = "unreviewed" } }'],
  ['nested table', '[profiles.extra]\nmodel = "unreviewed"'],
  ['array of tables', '[[tools]]\nname = "unreviewed"'],
])('rejects an undeclared %s through validation, generation and resolution', (_label, extra) => {
  const content = `${source}\n${extra}\n`;
  const validation = getCodexAdapterValidation({
    codexAdapterFile: '.codex/agents/code-reviewer.toml',
    registeredAgent: registration,
    content,
  });
  expect(validation.issues.join('\n')).toMatch(/unrecognized/i);
  expect(() => buildAgentRoster(config, new Map([['code-reviewer', content]]))).toThrow(
    /unrecognized/i,
  );
  expect(() => parseCodexProjectAgent(registration, content)).toThrow(/unrecognized/i);
});

it.each([undefined, 'gpt-5.6-sol'])('preserves the declared contract with model %s', (model) => {
  const content = model === undefined ? source : `${source}\nmodel = "${model}"\n`;
  expect(
    getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-reviewer.toml',
      registeredAgent: registration,
      content,
    }).issues,
  ).toEqual([]);
  expect(buildAgentRoster(config, new Map([['code-reviewer', content]]))).toHaveLength(1);
  expect(parseCodexProjectAgent(registration, content).model).toBe(model ?? null);
});

describe('shared Codex adapter shape', () => {
  it.each([
    {
      label: 'multiple templates',
      references:
        'Read `.agent/sub-agents/templates/code-reviewer.md` and `.agent/sub-agents/templates/test-reviewer.md`.',
      issue: 'must reference exactly one canonical template',
    },
    {
      label: 'multiple personas',
      references:
        'Read `.agent/sub-agents/templates/code-reviewer.md`, `.agent/sub-agents/components/personas/barney.md`, and `.agent/sub-agents/components/personas/fred.md`.',
      issue: 'must reference at most one canonical persona',
    },
    {
      label: 'a parent segment inside the template prefix',
      references: 'Read `.agent/sub-agents/templates/../rules/example.md`.',
      issue: 'must be a normalized path beneath .agent',
    },
    {
      label: 'a path escaping the canonical tree',
      references: 'Read `.agent/../../outside.md`.',
      issue: 'must be a normalized path beneath .agent',
    },
  ])('rejects $label in validation and generation', ({ references, issue }) => {
    const content = sourceWithReferences(references);
    const validation = getCodexAdapterValidation({
      codexAdapterFile: '.codex/agents/code-reviewer.toml',
      registeredAgent: registration,
      content,
    });

    expect(validation.issues.join('\n')).toContain(issue);
    expect(() => buildAgentRoster(config, new Map([['code-reviewer', content]]))).toThrow(issue);
  });
});
