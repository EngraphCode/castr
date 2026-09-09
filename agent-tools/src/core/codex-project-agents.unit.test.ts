import { expect, it } from 'vitest';
import { parseCodexProjectAgent } from './codex-project-agents.js';

const registration = {
  name: 'reviewer',
  description: 'Review changes.',
  configFile: 'agents/reviewer.toml',
};

const adapter = `name = "reviewer"
description = "Review changes."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = '''Read \`.agent/sub-agents/templates/reviewer.md\`.'''
`;

it('preserves an explicit configured model through runtime resolution', () => {
  expect(parseCodexProjectAgent(registration, `${adapter}model = "configured-model"`).model).toBe(
    'configured-model',
  );
});

it('represents inherited models as null without claiming an observed model', () => {
  expect(parseCodexProjectAgent(registration, adapter).model).toBeNull();
});

it('does not promote a nested model into the runtime model binding', () => {
  expect(
    parseCodexProjectAgent(registration, `${adapter}[nested]\nmodel = "decoy"`).model,
  ).toBeNull();
});

it('does not promote instruction-body model text into the runtime binding', () => {
  const proseAdapter = `name = "reviewer"
description = "Review changes."
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = '''Read \`.agent/sub-agents/templates/reviewer.md\`.
model = "decoy"
'''`;
  expect(parseCodexProjectAgent(registration, proseAdapter).model).toBeNull();
});

it('rejects a configured model with a non-string value', () => {
  expect(() => parseCodexProjectAgent(registration, `${adapter}model = 42`)).toThrow(
    /must be a string/u,
  );
});

it('retains the adapter path and canonical references in the resolved descriptor', () => {
  const resolved = parseCodexProjectAgent(registration, adapter);
  expect(resolved.adapterPath).toBe('.codex/agents/reviewer.toml');
  expect(resolved.referencedCanonicalFiles).toEqual(['.agent/sub-agents/templates/reviewer.md']);
});
