import { expect, it } from 'vitest';
import { parseCodexProjectAgent } from '../core/codex-project-agents.js';
import { getCodexAdapterValidation } from '../validators/subagents/validate-subagents-codex-adapter-validation.js';
import { buildAgentRoster } from './generator.js';

const registration = {
  name: 'code-reviewer',
  description: 'Review the contract.',
  configFile: 'agents/code-reviewer.toml',
};
const config = `[agents.code-reviewer]
description = "Review the contract."
config_file = "agents/code-reviewer.toml"
`;
const source = `name = "code-reviewer"
description = "Review the contract."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-reviewer.md\`."
`;

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
