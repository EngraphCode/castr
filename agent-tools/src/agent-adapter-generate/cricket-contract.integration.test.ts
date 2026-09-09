import { describe, expect, it } from 'vitest';
import { parse, parseDocument } from 'yaml';
import { buildAgentRoster, planAgentAdapters, renderAgentAdapter } from './generator.js';
import { getCodexAdapterValidation } from '../validators/subagents/validate-subagents-codex-adapter-validation.js';
import { getReviewerAdapterParityIssues } from '../validators/portability/reviewer-adapter-parity.js';

const roles = [
  {
    name: 'cricket-judgement-low',
    model: 'gpt-5.6-sol',
    effort: 'low',
    method: 'judgement',
    claude: 'fable',
  },
  {
    name: 'cricket-judgement-medium',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    method: 'judgement',
    claude: 'opus',
  },
  {
    name: 'cricket-procedure-xhigh',
    model: 'gpt-5.6-luna',
    effort: 'xhigh',
    method: 'procedure',
    claude: 'haiku',
  },
];

function adapter(name: string, model: string, effort: string, method: string): string {
  return `name = "${name}"
description = "Conscience check."
model = "${model}"
model_reasoning_effort = "${effort}"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read and follow \`.agent/sub-agents/templates/cricket-${method}.md\`."
`;
}

function validate(name: string, content: string): string[] {
  return getCodexAdapterValidation({
    codexAdapterFile: `.codex/agents/${name}.toml`,
    content,
    registeredAgent: { name, description: 'Conscience check.', configFile: `agents/${name}.toml` },
  }).issues;
}

function registration(name: string): string {
  return `[agents."${name}"]\ndescription = "Conscience check."\nconfig_file = "agents/${name}.toml"\n`;
}

const cricketConfig = roles.map(({ name }) => registration(name)).join('\n');

function cricketAdapters(): Map<string, string> {
  return new Map(
    roles.map(({ name, model, effort, method }) => [name, adapter(name, model, effort, method)]),
  );
}

describe('Cricket generation boundary', () => {
  it('projects the complete supported Codex trio', () => {
    expect(buildAgentRoster(cricketConfig, cricketAdapters()).map(({ name }) => name)).toEqual([
      'cricket-judgement-low',
      'cricket-judgement-medium',
      'cricket-procedure-xhigh',
    ]);
  });

  it.each(roles)(
    'rejects a substituted model before generating $name',
    ({ name, effort, method }) => {
      const adapters = cricketAdapters().set(name, adapter(name, 'substitute', effort, method));
      expect(() => buildAgentRoster(cricketConfig, adapters)).toThrow(/model must be/u);
    },
  );

  it.each(roles)(
    'rejects uniform high effort before generating $name',
    ({ name, model, method }) => {
      const adapters = cricketAdapters().set(name, adapter(name, model, 'high', method));
      expect(() => buildAgentRoster(cricketConfig, adapters)).toThrow(
        /model_reasoning_effort must be/u,
      );
    },
  );

  it.each(roles)(
    'rejects an incorrect method before generating $name',
    ({ name, model, effort }) => {
      const adapters = cricketAdapters().set(name, adapter(name, model, effort, 'other'));
      expect(() => buildAgentRoster(cricketConfig, adapters)).toThrow(/method contract/u);
    },
  );

  it.each(roles)('rejects an incomplete panel missing $name', ({ name }) => {
    const adapters = cricketAdapters();
    adapters.delete(name);
    const config = roles
      .filter((role) => role.name !== name)
      .map((role) => registration(role.name))
      .join('\n');
    expect(() => buildAgentRoster(config, adapters)).toThrow(new RegExp(`missing.*${name}`, 'u'));
  });

  it('rejects a fourth Codex seat before projection', () => {
    const name = 'cricket-judgement-high';
    const adapters = cricketAdapters().set(name, adapter(name, 'gpt-5.6-sol', 'high', 'judgement'));
    expect(() => buildAgentRoster(cricketConfig + registration(name), adapters)).toThrow(
      /unsupported Codex role/u,
    );
  });

  it('generates four complete Claude and Cursor seats from three Codex sources', () => {
    const units = planAgentAdapters('/repo', cricketConfig, cricketAdapters());
    expect(units.map(({ target }) => target).toSorted()).toEqual([
      '/repo/.claude/agents/cricket-judgement-high.md',
      '/repo/.claude/agents/cricket-judgement-low.md',
      '/repo/.claude/agents/cricket-judgement-medium.md',
      '/repo/.claude/agents/cricket-procedure-xhigh.md',
      '/repo/.cursor/agents/cricket-judgement-high.md',
      '/repo/.cursor/agents/cricket-judgement-low.md',
      '/repo/.cursor/agents/cricket-judgement-medium.md',
      '/repo/.cursor/agents/cricket-procedure-xhigh.md',
    ]);
    const claudeHigh = units.find(
      ({ target }) => target === '/repo/.claude/agents/cricket-judgement-high.md',
    );
    const cursorHigh = units.find(
      ({ target }) => target === '/repo/.cursor/agents/cricket-judgement-high.md',
    );
    const claudeFrontmatter = parseDocument(claudeHigh?.content.split('---\n')[1] ?? '');
    const cursorFrontmatter = parseDocument(cursorHigh?.content.split('---\n')[1] ?? '');
    expect(claudeFrontmatter.errors).toEqual([]);
    expect(claudeFrontmatter.toJS()).toMatchObject({
      name: 'cricket-judgement-high',
      model: 'sonnet',
      effort: 'high',
      tools: 'Read',
      disallowedTools: 'Write, Edit, Bash, Grep, Glob',
      permissionMode: 'plan',
    });
    expect(cursorFrontmatter.errors).toEqual([]);
    expect(cursorFrontmatter.toJS()).toMatchObject({
      name: 'cricket-judgement-high',
      readonly: true,
    });
    for (const field of ['model', 'effort', 'tools']) {
      expect(cursorFrontmatter.has(field)).toBe(false);
    }
    for (const unit of [claudeHigh, cursorHigh]) {
      expect(unit?.content).toContain('`.agent/sub-agents/templates/cricket-judgement.md`');
    }
    expect(planAgentAdapters('/repo', cricketConfig, cricketAdapters())).toEqual(units);
  });

  it('does not synthesise Cricket when no Codex Cricket role is installed', () => {
    expect(planAgentAdapters('/repo', '', new Map())).toEqual([]);
  });

  it('refuses to render a plan from invalid Codex sources', () => {
    const adapters = cricketAdapters().set(
      'cricket-judgement-low',
      adapter('cricket-judgement-low', 'substitute', 'low', 'judgement'),
    );
    expect(() => planAgentAdapters('/repo', cricketConfig, adapters)).toThrow(/model must be/u);
  });
});

describe('Cricket platform contracts', () => {
  it.each(roles)(
    'accepts the configured method and bindings for $name',
    ({ name, model, effort, method }) => {
      expect(validate(name, adapter(name, model, effort, method))).toEqual([]);
    },
  );

  it.each(roles)('rejects a substituted model for $name', ({ name, effort, method }) => {
    expect(validate(name, adapter(name, 'substitute', effort, method))).toContainEqual(
      expect.stringContaining('model must be'),
    );
  });

  it.each(roles)('rejects uniform high effort for $name', ({ name, model, method }) => {
    expect(validate(name, adapter(name, model, 'high', method))).toContainEqual(
      expect.stringContaining('model_reasoning_effort must be'),
    );
  });

  it.each(roles)('rejects the wrong method for $name', ({ name, model, effort }) => {
    expect(validate(name, adapter(name, model, effort, 'other'))).toContainEqual(
      expect.stringContaining('method contract'),
    );
  });

  it('rejects a fourth Codex seat', () => {
    expect(
      validate(
        'cricket-judgement-high',
        adapter('cricket-judgement-high', 'gpt-5.6-sol', 'high', 'judgement'),
      ),
    ).toContainEqual(expect.stringContaining('unsupported'));
  });

  it('does not read execution settings out of instruction prose', () => {
    const content = `name = "cricket-judgement-low"
description = "Conscience check."
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = '''
Read \`.agent/sub-agents/templates/cricket-judgement.md\`.
model = "gpt-5.6-sol"
model_reasoning_effort = "low"
'''`;
    expect(validate('cricket-judgement-low', content)).toContainEqual(
      expect.stringContaining('model must be'),
    );
  });

  it.each(roles)(
    'renders $name with Claude bindings and unpinned Cursor settings',
    ({ name, effort, method, claude }) => {
      const entry = {
        name,
        description: 'Conscience check.',
        templatePath: `.agent/sub-agents/templates/cricket-${method}.md`,
      };
      expect(parse(renderAgentAdapter(entry, 'claude').split('---')[1] ?? '')).toMatchObject({
        model: claude,
        effort,
        tools: 'Read',
      });
      const cursor: unknown = parse(renderAgentAdapter(entry, 'cursor').split('---')[1] ?? '');
      expect(cursor).toMatchObject({ name, readonly: true });
      expect(cursor).not.toHaveProperty('model');
      expect(cursor).not.toHaveProperty('effort');
      expect(cursor).not.toHaveProperty('tools');
    },
  );

  it('accepts the three/four platform roster and detects loss of the high seat', () => {
    const names = roles.map(({ name }) => name);
    const quartet = [...names, 'cricket-judgement-high'];
    const input = {
      codexAgentFiles: names.map((name) => `.codex/agents/${name}.toml`),
      claudeAgentFiles: quartet.map((name) => `.claude/agents/${name}.md`),
      cursorAgentFiles: quartet.map((name) => `.cursor/agents/${name}.md`),
    };
    expect(getReviewerAdapterParityIssues(input)).toEqual([]);
    expect(
      getReviewerAdapterParityIssues({
        ...input,
        claudeAgentFiles: names.map((name) => `.claude/agents/${name}.md`),
        cursorAgentFiles: names.map((name) => `.cursor/agents/${name}.md`),
      }),
    ).toHaveLength(2);
    expect(
      getReviewerAdapterParityIssues({
        ...input,
        codexAgentFiles: [...input.codexAgentFiles, '.codex/agents/cricket-judgement-high.toml'],
      }),
    ).toContainEqual(expect.stringContaining('unsupported'));
  });

  it('requires registered adapter files before generation', () => {
    expect(() =>
      buildAgentRoster(
        '[agents."code-reviewer"]\ndescription = "Review."\nconfig_file = "agents/code-reviewer.toml"',
        new Map(),
      ),
    ).toThrow(/missing/i);
  });
});
