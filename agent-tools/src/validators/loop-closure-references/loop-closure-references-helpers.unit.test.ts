import { describe, expect, it } from 'vitest';

import {
  findHollowScriptReferences,
  parseWorkspacePackages,
  stripQuotes,
} from './loop-closure-references-helpers.js';

/**
 * The resolve universe used across the cases below — a small explicit stand-in
 * for the union of every workspace `package.json` `scripts` key plus every
 * installed `node_modules/.bin` binary that the runtime injects in production.
 * `turbo` stands in for a fall-through binary (`pnpm turbo` runs the bin).
 */
const DEFINED_SCRIPTS: readonly string[] = [
  'check',
  'check:ci',
  'build',
  'agent-tools:collaboration-state',
  'turbo',
];

describe('findHollowScriptReferences', () => {
  it('returns no findings when every coded `pnpm <script>` reference resolves', () => {
    const files = [
      { path: 'docs/guide.md', content: 'Run `pnpm check:ci` then `pnpm run build`.' },
      {
        path: '.agent/rules/example.md',
        content: 'Use `pnpm --filter @engraph/agent-tools build` from root.',
      },
    ];

    expect(findHollowScriptReferences(files, { definedScripts: DEFINED_SCRIPTS })).toStrictEqual(
      [],
    );
  });

  it.each([
    {
      label: 'inline code, direct reference (markdownlint-check:root proof case)',
      content: 'Run `pnpm markdownlint-check:root` to lint.',
      script: 'markdownlint-check:root',
      match: 'pnpm markdownlint-check:root',
    },
    {
      label: 'inline code, trailing args (check:profile proof case)',
      content: 'A `pnpm check:profile --dry-run` run can reveal more.',
      script: 'check:profile',
      match: 'pnpm check:profile',
    },
    {
      label: 'inline code, behind `run` (cruise proof case)',
      content: '`pnpm run cruise` validates the dependency graph.',
      script: 'cruise',
      match: 'pnpm run cruise',
    },
  ])('flags an unresolved coded script: $label', ({ content, script, match }) => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([{ path: 'surface.md', line: 1, script, match }]);
  });

  it('flags a hollow reference inside a fenced code block', () => {
    const content = [
      'Correct shape:',
      '',
      '```bash',
      'pnpm markdownlint-check:root',
      '```',
      '',
    ].join('\n');

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      {
        path: 'surface.md',
        line: 4,
        script: 'markdownlint-check:root',
        match: 'pnpm markdownlint-check:root',
      },
    ]);
  });

  it('flags a hollow reference inside a nested fenced block (outer ````, inner ```)', () => {
    const content = [
      '````markdown',
      '```bash',
      'pnpm markdownlint-check:root',
      '```',
      '````',
      '',
    ].join('\n');

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      {
        path: 'surface.md',
        line: 3,
        script: 'markdownlint-check:root',
        match: 'pnpm markdownlint-check:root',
      },
    ]);
  });

  it('does not flag a `pnpm <word>` phrase that is bare prose, not a coded command', () => {
    const files = [
      { path: 'a.md', content: 'Prefer pnpm scripts that point at the dist artefact.' },
      { path: 'b.md', content: 'how it is realised in the pnpm script surface.' },
    ];

    expect(findHollowScriptReferences(files, { definedScripts: DEFINED_SCRIPTS })).toStrictEqual(
      [],
    );
  });

  it('resolves a coded reference carrying a trailing colon to its base script', () => {
    // `"Lane <name> pnpm check: green"` — an example status message; the base
    // `check` is a real gate, so the trailing colon must not make it hollow.
    const content = 'Report `"Lane <name> pnpm check: green"` on completion.';

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([]);
  });

  it('does not flag a fall-through binary invocation (`pnpm turbo`)', () => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: 'one agent ran `pnpm turbo`.' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([]);
  });

  it('does not flag a defined script behind `run` in code', () => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: '`pnpm run build`' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([]);
  });

  it('does not flag a defined script reached through a `--filter` flag', () => {
    expect(
      findHollowScriptReferences(
        [{ path: 'surface.md', content: '`pnpm --filter @engraph/agent-tools build`' }],
        { definedScripts: DEFINED_SCRIPTS },
      ),
    ).toStrictEqual([]);
  });

  it('does not flag a defined script invoked with `--` passthrough args', () => {
    expect(
      findHollowScriptReferences(
        [{ path: 'surface.md', content: '`pnpm agent-tools:collaboration-state -- claims open`' }],
        { definedScripts: DEFINED_SCRIPTS },
      ),
    ).toStrictEqual([]);
  });

  it.each([
    { label: 'install', content: 'Run `pnpm install` first.' },
    { label: 'exec binary', content: 'Run `pnpm exec prettier --write .`.' },
    { label: 'dlx package', content: 'Run `pnpm dlx degit user/repo target`.' },
    { label: 'add dependency', content: 'Run `pnpm add -D vitest`.' },
  ])('does not flag pnpm management subcommands: $label', ({ content }) => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([]);
  });

  it('reports the 1-based line number for a finding on a later line', () => {
    const content = 'line one\nline two\nRun `pnpm check:profile`.\nline four\n';

    expect(
      findHollowScriptReferences([{ path: 'docs/guide.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'docs/guide.md', line: 3, script: 'check:profile', match: 'pnpm check:profile' },
    ]);
  });

  it('reports each hollow reference separately, including two inline spans on one line', () => {
    const content =
      '`pnpm markdownlint-check:root` and `pnpm markdownlint:root` are the gates.\n' +
      'Then `pnpm run cruise`.\n';

    expect(
      findHollowScriptReferences([{ path: 'docs/guide.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      {
        path: 'docs/guide.md',
        line: 1,
        script: 'markdownlint-check:root',
        match: 'pnpm markdownlint-check:root',
      },
      {
        path: 'docs/guide.md',
        line: 1,
        script: 'markdownlint:root',
        match: 'pnpm markdownlint:root',
      },
      { path: 'docs/guide.md', line: 2, script: 'cruise', match: 'pnpm run cruise' },
    ]);
  });

  it('skips files whose path is in the allowlist', () => {
    const allowlistedPath = '.agent/plans/transplant/practice-loop-closure-remediation.md';

    expect(
      findHollowScriptReferences(
        [
          {
            path: allowlistedPath,
            content: 'The false claim was `pnpm check:profile`; LC4 corrects it.',
          },
        ],
        { definedScripts: DEFINED_SCRIPTS, allowlistedPaths: [allowlistedPath] },
      ),
    ).toStrictEqual([]);
  });

  it('still flags a non-allowlisted file when an allowlist is configured', () => {
    expect(
      findHollowScriptReferences(
        [{ path: '.agent/rules/other.md', content: 'A `pnpm check:profile` reference.' }],
        {
          definedScripts: DEFINED_SCRIPTS,
          allowlistedPaths: ['.agent/plans/transplant/practice-loop-closure-remediation.md'],
        },
      ),
    ).toStrictEqual([
      {
        path: '.agent/rules/other.md',
        line: 1,
        script: 'check:profile',
        match: 'pnpm check:profile',
      },
    ]);
  });

  it('flags a hollow reference inside a tilde (~~~) fenced block', () => {
    const content = ['~~~bash', 'pnpm nope:script', '~~~', ''].join('\n');

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'surface.md', line: 2, script: 'nope:script', match: 'pnpm nope:script' },
    ]);
  });

  it('does not close a tilde block on a backtick fence (and vice versa)', () => {
    // The inner ``` must NOT close the outer ~~~; the ref after it is still
    // inside the block and must be flagged.
    const content = ['~~~', '```', 'pnpm nope:script', '```', '~~~', ''].join('\n');

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'surface.md', line: 3, script: 'nope:script', match: 'pnpm nope:script' },
    ]);
  });

  it('flags a ref AFTER an inner fence but still inside the outer block (nesting discriminator)', () => {
    // Discriminates correct CommonMark nesting from a bug that treats the inner
    // ``` as a closer: the ref sits after the inner fence, still inside ````.
    const content = ['````markdown', '```', '', 'pnpm nope:script', '```', '````', ''].join('\n');

    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'surface.md', line: 4, script: 'nope:script', match: 'pnpm nope:script' },
    ]);
  });

  it('flags `pnpm run <management-word>` when no such script exists', () => {
    // `pnpm install` is a builtin (skipped), but `pnpm run install` forces
    // script interpretation, so an absent `install` script is hollow.
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: '`pnpm run install`' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'surface.md', line: 1, script: 'install', match: 'pnpm run install' },
    ]);
  });

  it('parses multiple pnpm invocations chained in one code chunk', () => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: '`pnpm build && pnpm bogus`' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([{ path: 'surface.md', line: 1, script: 'bogus', match: 'pnpm bogus' }]);
  });

  it('resolves through a value-consuming short flag `-F <pkg>`', () => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: '`pnpm -F @x bogus`' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([{ path: 'surface.md', line: 1, script: 'bogus', match: 'pnpm -F @x bogus' }]);
  });

  it('resolves through an inline `--filter=<pkg>` flag', () => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content: '`pnpm --filter=@x bogus`' }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([
      { path: 'surface.md', line: 1, script: 'bogus', match: 'pnpm --filter=@x bogus' },
    ]);
  });

  it.each([
    { label: 'bare pnpm', content: '`pnpm`' },
    { label: 'pnpm run with nothing after', content: '`pnpm run`' },
    { label: 'flag-only invocation', content: '`pnpm -r`' },
  ])('does not flag a no-script invocation: $label', ({ content }) => {
    expect(
      findHollowScriptReferences([{ path: 'surface.md', content }], {
        definedScripts: DEFINED_SCRIPTS,
      }),
    ).toStrictEqual([]);
  });

  it('reports findings across multiple files in file order', () => {
    expect(
      findHollowScriptReferences(
        [
          { path: 'a.md', content: '`pnpm bogus-a`' },
          { path: 'b.md', content: '`pnpm bogus-b`' },
        ],
        { definedScripts: DEFINED_SCRIPTS },
      ),
    ).toStrictEqual([
      { path: 'a.md', line: 1, script: 'bogus-a', match: 'pnpm bogus-a' },
      { path: 'b.md', line: 1, script: 'bogus-b', match: 'pnpm bogus-b' },
    ]);
  });
});

describe('parseWorkspacePackages', () => {
  it('extracts block-sequence entries under `packages:`', () => {
    const yaml = ['packages:', '  - lib', '  - agent-tools', '', 'overrides:', '  esbuild: 1'].join(
      '\n',
    );

    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib', 'agent-tools']);
  });

  it('strips quotes and trailing inline comments from entries', () => {
    const yaml = ['packages:', "  - 'packages/*'", '  - lib  # the core lib'].join('\n');

    expect(parseWorkspacePackages(yaml)).toStrictEqual(['packages/*', 'lib']);
  });

  it('returns empty when there is no `packages:` block', () => {
    expect(parseWorkspacePackages('overrides:\n  esbuild: 1\n')).toStrictEqual([]);
  });

  it('ends the block at the next non-indented line', () => {
    const yaml = ['packages:', '  - lib', 'minimumReleaseAge: 1440', '  - not-a-package'].join(
      '\n',
    );

    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib']);
  });
});

describe('stripQuotes', () => {
  it.each([
    { input: "'lib'", expected: 'lib' },
    { input: '"lib"', expected: 'lib' },
    { input: 'lib', expected: 'lib' },
    { input: "'packages/*'", expected: 'packages/*' },
    { input: "mismatched'", expected: "mismatched'" },
  ])('strips a matching surrounding quote pair: $input', ({ input, expected }) => {
    expect(stripQuotes(input)).toBe(expected);
  });
});
