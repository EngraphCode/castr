import { expect, it } from 'vitest';
import { parseDocument } from 'yaml';
import { planAgentAdapters } from './generator.js';
import { validateMarkdownWrapper } from '../validators/subagents/frontmatter-schema.js';

it.each(['42', 'false', '[]', '{}'])(
  'rejects a non-string ordinary model %s before generating wrappers',
  (model) => {
    const config = `[agents.code-reviewer]
description = "Review changes."
config_file = "agents/code-reviewer.toml"`;
    const adapter = `name = "code-reviewer"
description = "Review changes."
model = ${model}
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-reviewer.md\`."`;
    expect(() => planAgentAdapters('/repo', config, new Map([['code-reviewer', adapter]]))).toThrow(
      "TOML key 'model' must be a string",
    );
  },
);

it.each([
  'Review changes.\nKeep review bounded.',
  'Review changes.\n',
  'Review changes.\n\n',
  '\nReview changes.',
  'Review changes.\n---\nKeep review bounded.',
  'true',
  'null',
  '123',
])(
  'preserves description %j through TOML admission and both Markdown projections',
  (description) => {
    const config = `[agents.code-reviewer]\ndescription = ${JSON.stringify(description)}\nconfig_file = "agents/code-reviewer.toml"`;
    const adapter = `name = "code-reviewer"
description = ${JSON.stringify(description)}
model_reasoning_effort = "high"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/code-reviewer.md\`."`;
    const units = planAgentAdapters('/repo', config, new Map([['code-reviewer', adapter]]));
    expect(units).toHaveLength(2);
    for (const unit of units) {
      const platform = unit.target.includes('/.claude/') ? 'claude' : 'cursor';
      expect(validateMarkdownWrapper(platform, unit.target, unit.content).issues).toEqual([]);
      const frontmatter = /^---\n([\s\S]*?)\n---(?:\n|$)/u.exec(unit.content)?.[1] ?? '';
      expect(parseDocument(frontmatter).get('description')).toBe(description);
    }
  },
);
