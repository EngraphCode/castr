import { describe, expect, it } from 'vitest';
import { validateMarkdownWrapper } from './frontmatter-schema.js';

const template = '.agent/sub-agents/templates/cricket-judgement.md';
const instruction = `Your first action MUST be to read and internalise \`${template}\`.`;
function wrapper(frontmatter: string, target = template): string {
  return `---\n${frontmatter}\n---\n\nYour first action MUST be to read and internalise \`${target}\`.`;
}
const claude =
  'name: cricket-judgement-low\ndescription: Review\nmodel: fable\neffort: low\ntools: Read\ndisallowedTools: Write, Edit, Bash, Grep, Glob';
const cursor = 'name: cricket-judgement-low\ndescription: Review\nreadonly: true';
const ordinaryClaude =
  'name: code-reviewer\ndescription: Review\nmodel: opus\ntools: Read, Grep, Glob, Bash, WebFetch, WebSearch\ndisallowedTools: Write, Edit, NotebookEdit\npermissionMode: plan';

describe('Markdown platform contracts', () => {
  it.each([
    ['HTML comment', `<!-- ${instruction} -->`],
    ['fenced code', `\`\`\`markdown\n${instruction}\n\`\`\``],
    ['tilde-fenced code', `~~~markdown\n${instruction}\n~~~`],
    ['indented code', `    ${instruction}`],
    ['blockquote', `> ${instruction}`],
    ['list item', `- ${instruction}`],
    ['heading', `# ${instruction}`],
    ['surrounding prose', `For example: ${instruction} This is only an example.`],
    ['inline code', `\`\`${instruction}\`\``],
    ['inline HTML', `<span>${instruction}</span>`],
    ['HTML block', `<div>\n${instruction}\n</div>`],
  ])('rejects a template-load sentence inside %s', (_context, body) => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        `---\n${cursor}\n---\n\n${body}`,
      ),
    ).toEqual({
      issues: [expect.stringContaining('required template loading line')],
      templatePaths: [],
    });
  });
  it('counts only the active instruction when comments and code repeat it', () => {
    const body = `<!-- ${instruction} -->\n\n\`\`\`markdown\n${instruction}\n\`\`\`\n\n${instruction}`;
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        `---\n${cursor}\n---\n\n${body}`,
      ),
    ).toEqual({ issues: [], templatePaths: [template] });
  });
  it('rejects multiple active instruction paragraphs', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        `${wrapper(cursor)}\n\n${instruction}`,
      ),
    ).toEqual({
      issues: [expect.stringContaining('required template loading line')],
      templatePaths: [template, template],
    });
  });
  it('does not treat a template-load sentence in metadata as an instruction', () => {
    const instruction = `Your first action MUST be to read and internalise \`${template}\`.`;
    const metadata = cursor.replace('description: Review', `description: >\n  ${instruction}`);
    const content = `---\n${metadata}\n---\n\nReview this request.`;
    expect(
      validateMarkdownWrapper('cursor', '.cursor/agents/cricket-judgement-low.md', content),
    ).toEqual({
      issues: [expect.stringContaining('required template loading line')],
      templatePaths: [],
    });
  });

  it('counts only the real instruction when metadata repeats the same sentence', () => {
    const instruction = `Your first action MUST be to read and internalise \`${template}\`.`;
    const metadata = cursor.replace('description: Review', `description: >\n  ${instruction}`);
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(metadata),
      ),
    ).toEqual({ issues: [], templatePaths: [template] });
  });
  it.each([
    ['cricket-judgement-low', 'fable', 'low', 'cricket-judgement'],
    ['cricket-judgement-medium', 'opus', 'medium', 'cricket-judgement'],
    ['cricket-judgement-high', 'sonnet', 'high', 'cricket-judgement'],
    ['cricket-procedure-xhigh', 'haiku', 'xhigh', 'cricket-procedure'],
  ])('accepts the exact Claude quartet seat %s', (name, model, effort, method) => {
    const fields = `name: ${name}\ndescription: Review\nmodel: ${model}\neffort: ${effort}\ntools: [Read]\ndisallowedTools: [Write, Edit, Bash, Grep, Glob]`;
    expect(
      validateMarkdownWrapper(
        'claude',
        `.claude/agents/${name}.md`,
        wrapper(fields, `.agent/sub-agents/templates/${method}.md`),
      ).issues,
    ).toEqual([]);
  });
  it.each([
    ['cricket-judgement-low', 'cricket-judgement'],
    ['cricket-judgement-medium', 'cricket-judgement'],
    ['cricket-judgement-high', 'cricket-judgement'],
    ['cricket-procedure-xhigh', 'cricket-procedure'],
  ])('accepts the unpinned Cursor quartet seat %s', (name, method) => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        `.cursor/agents/${name}.md`,
        wrapper(
          `name: ${name}\ndescription: Review\nreadonly: true`,
          `.agent/sub-agents/templates/${method}.md`,
        ),
      ).issues,
    ).toEqual([]);
  });
  it('parses YAML quoted names and multiline descriptions', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(
          'name: "cricket-judgement-low"\ndescription: >\n  Review the proposal\n  with care.\nreadonly: true',
        ),
      ).issues,
    ).toEqual([]);
  });
  it.each([
    ['name: cricket-judgement-low', 'name: " cricket-judgement-low "'],
    ['model: fable', 'model: " fable "'],
    ['effort: low', 'effort: " low "'],
    ['tools: Read', 'tools: [" Read "]'],
    [
      'disallowedTools: Write, Edit, Bash, Grep, Glob',
      'disallowedTools: [Write, " Edit ", Bash, Grep, Glob]',
    ],
  ])('rejects padded Claude binding tokens in %s', (from, to) => {
    expect(
      validateMarkdownWrapper(
        'claude',
        '.claude/agents/cricket-judgement-low.md',
        wrapper(claude.replace(from, to)),
      ).issues,
    ).toEqual([expect.stringContaining('frontmatter')]);
  });
  it('rejects a padded Cursor name', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(cursor.replace('name: cricket-judgement-low', 'name: " cricket-judgement-low "')),
      ).issues,
    ).toEqual([expect.stringContaining('frontmatter name')]);
  });
  it('rejects a padded ordinary Cursor model', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/code-reviewer.md',
        wrapper('name: code-reviewer\ndescription: Review\nmodel: " gpt-5.5 "\nreadonly: true'),
      ).issues,
    ).toEqual([expect.stringContaining('frontmatter model')]);
  });
  it('allows description whitespace and whitespace around CSV tool delimiters', () => {
    const fields = claude
      .replace('description: Review', 'description: " Review with care. "')
      .replace('tools: Read', 'tools: " Read "')
      .replace(
        'disallowedTools: Write, Edit, Bash, Grep, Glob',
        'disallowedTools: " Write , Edit, Bash ,Grep, Glob "',
      );
    expect(
      validateMarkdownWrapper('claude', '.claude/agents/cricket-judgement-low.md', wrapper(fields))
        .issues,
    ).toEqual([]);
  });
  it('rejects a blank description', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(cursor.replace('description: Review', 'description: "   "')),
      ).issues,
    ).toEqual([expect.stringContaining('frontmatter description')]);
  });
  it.each([
    'name: code-reviewer\ndescription: Review\ntools: Read\ndisallowedTools: Write, Edit, NotebookEdit\npermissionMode: plan',
    'name: code-reviewer\ndescription: Review\nmodel: opus\ntools: Read, Grep, Glob, Bash, WebFetch, WebSearch\ndisallowedTools: Write, Edit, NotebookEdit',
    'name: code-reviewer\ndescription: Review\nmodel: opus\ntools: Read, Write\ndisallowedTools: Edit\npermissionMode: plan',
  ])('rejects a weakened ordinary Claude contract', (fields) => {
    expect(
      validateMarkdownWrapper('claude', '.claude/agents/code-reviewer.md', wrapper(fields)).issues
        .length,
    ).toBeGreaterThan(0);
  });
  it('accepts the Claude Cricket binding and restricted tools', () => {
    expect(
      validateMarkdownWrapper('claude', '.claude/agents/cricket-judgement-low.md', wrapper(claude)),
    ).toEqual({ issues: [], templatePaths: [template] });
  });
  it('accepts an unpinned readonly Cursor Cricket seat', () => {
    expect(
      validateMarkdownWrapper('cursor', '.cursor/agents/cricket-judgement-low.md', wrapper(cursor))
        .issues,
    ).toEqual([]);
  });
  it.each(['model: gpt-5.5', 'effort: low', 'tools: Read'])(
    'rejects invalid Cursor Cricket field %s',
    (field) => {
      expect(
        validateMarkdownWrapper(
          'cursor',
          '.cursor/agents/cricket-judgement-low.md',
          wrapper(`${cursor}\n${field}`),
        ).issues.length,
      ).toBeGreaterThan(0);
    },
  );
  it('rejects readonly false without relying on a duplicate YAML key', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(cursor.replace('readonly: true', 'readonly: false')),
      ).issues,
    ).toEqual([expect.stringContaining('frontmatter readonly')]);
  });
  it.each([
    ['model: fable', 'model: opus'],
    ['effort: low', 'effort: high'],
    ['tools: Read', 'tools: Read, Bash'],
    ['disallowedTools: Write, Edit, Bash, Grep, Glob', 'disallowedTools: Write, Edit'],
  ])('rejects drift in Claude %s', (from, to) => {
    expect(
      validateMarkdownWrapper(
        'claude',
        '.claude/agents/cricket-judgement-low.md',
        wrapper(claude.replace(from, to)),
      ).issues.length,
    ).toBeGreaterThan(0);
  });
  it.each(['name: [', 'name: one\nname: two', '- list'])(
    'rejects malformed or unsupported frontmatter %s',
    (fields) => {
      expect(
        validateMarkdownWrapper('claude', '.claude/agents/x.md', wrapper(fields)).issues.length,
      ).toBeGreaterThan(0);
    },
  );
  it('rejects unknown hooks on an otherwise valid Claude wrapper', () => {
    expect(
      validateMarkdownWrapper(
        'claude',
        '.claude/agents/cricket-judgement-low.md',
        wrapper(`${claude}\nhooks: {}`),
      ).issues,
    ).toEqual([expect.stringMatching(/frontmatter.*Unrecognized key: "hooks"/u)]);
  });
  it('rejects filename mismatch', () => {
    expect(
      validateMarkdownWrapper('cursor', '.cursor/agents/other.md', wrapper(cursor)).issues.join(
        '\n',
      ),
    ).toContain('filename');
  });
  it('rejects the wrong Cricket method template', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        wrapper(cursor, '.agent/sub-agents/templates/cricket-procedure.md'),
      ).issues.join('\n'),
    ).toContain('template');
  });
  it.each(['../outside.md', '.agent/sub-agents/templates/../outside.md'])(
    'rejects unsafe template path %s',
    (target) => {
      expect(
        validateMarkdownWrapper(
          'cursor',
          '.cursor/agents/cricket-judgement-low.md',
          wrapper(cursor, target),
        ).issues.length,
      ).toBeGreaterThan(0);
    },
  );
  it('accepts ordinary Cursor model and readonly posture', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/code-reviewer.md',
        wrapper(
          'name: code-reviewer\ndescription: Review\nmodel: gpt-5.5\nreadonly: true',
          '.agent/sub-agents/templates/code-reviewer.md',
        ),
      ).issues,
    ).toEqual([]);
  });
  it.each([
    'name: code-reviewer\ndescription: Review\nreadonly: true',
    'name: code-reviewer\ndescription: Review\nmodel: gpt-5.5\nreadonly: false',
  ])('rejects weakened ordinary Cursor contract', (fields) => {
    expect(
      validateMarkdownWrapper('cursor', '.cursor/agents/code-reviewer.md', wrapper(fields)).issues
        .length,
    ).toBeGreaterThan(0);
  });
  it('accepts ordinary Claude safe posture', () => {
    expect(
      validateMarkdownWrapper(
        'claude',
        '.claude/agents/code-reviewer.md',
        wrapper(ordinaryClaude, '.agent/sub-agents/templates/code-reviewer.md'),
      ).issues,
    ).toEqual([]);
  });
  it.each([
    ['WebSearch, WebFetch, Bash, Glob, Grep, Read', 'NotebookEdit, Edit, Write'],
    ['[WebSearch, WebFetch, Bash, Glob, Grep, Read]', '[NotebookEdit, Edit, Write]'],
  ])('accepts reordered tool lists in either YAML representation', (tools, denied) => {
    const fields = ordinaryClaude
      .replace('tools: Read, Grep, Glob, Bash, WebFetch, WebSearch', `tools: ${tools}`)
      .replace('disallowedTools: Write, Edit, NotebookEdit', `disallowedTools: ${denied}`);
    expect(
      validateMarkdownWrapper('claude', '.claude/agents/code-reviewer.md', wrapper(fields)).issues,
    ).toEqual([]);
  });
  it.each([
    [
      'tools: Read, Grep, Glob, Bash, WebFetch, WebSearch',
      'tools: Read, Grep, Glob, Bash, WebFetch, Read',
    ],
    [
      'tools: Read, Grep, Glob, Bash, WebFetch, WebSearch',
      'tools: [Read, Grep, Glob, Bash, WebFetch, WebSearch, Read]',
    ],
    ['disallowedTools: Write, Edit, NotebookEdit', 'disallowedTools: Write, Edit, Edit'],
    [
      'disallowedTools: Write, Edit, NotebookEdit',
      'disallowedTools: [Write, Edit, NotebookEdit, Edit]',
    ],
  ])('rejects duplicate ordinary Claude tools in %s', (from, to) => {
    expect(
      validateMarkdownWrapper(
        'claude',
        '.claude/agents/code-reviewer.md',
        wrapper(ordinaryClaude.replace(from, to)),
      ).issues,
    ).toEqual([expect.stringContaining('must preserve the reviewer safe posture')]);
  });
  it('rejects a missing template load', () => {
    expect(
      validateMarkdownWrapper(
        'cursor',
        '.cursor/agents/cricket-judgement-low.md',
        `---\n${cursor}\n---`,
      ).issues.join('\n'),
    ).toContain('template');
  });
});
