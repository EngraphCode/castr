import { renderStatusline, type StatuslineParts } from '../../src/claude/statusline-render';

const RESET = '\x1b[0m';
const GREEN = '\x1b[0;32m';
const RED = '\x1b[0;31m';
const YELLOW = '\x1b[0;33m';

/**
 * Brand-free fixture marks (castr ships no logo art until the castr mark is
 * authored; the renderer consumes already-resolved rows). The wide mark uses
 * astral Legacy Computing glyphs so the width assertions prove code-point
 * measurement, not UTF-16 units; the narrow mark gives the separator test a
 * second width.
 */
const FIXTURE_ROWS_WIDE = ['🬞🬭🬻🬮🬏🬞🬭', '🬻🬆🬀🬬🬱🬒🬺', '🬨🬀🬁🬡🬕🬨🬀', '🬊🬩🬭🬵🬆🬊🬩'] as const;
const FIXTURE_ROWS_NARROW = ['⠀⢀⣠⣞⣁⠀', '⣼⠋⠘⢧⡉⢷', '⢹⡅⠀⠀⢉⡍', '⠀⠻⣤⣤⠞⠁'] as const;

const base: StatuslineParts = {
  identity: undefined,
  dir: 'repo',
  branch: undefined,
  dirty: false,
  worktree: undefined,
  usedPercentage: undefined,
  fiveHourPercentage: undefined,
  fiveHourResetSeconds: undefined,
  sevenDayPercentage: undefined,
  sevenDayResetSeconds: undefined,
  model: undefined,
  sessionShape: undefined,
  coordinationBranch: undefined,
  coordinationPlace: undefined,
  error: undefined,
};

/** The rendered line containing a needle — the unit of behaviour, independent of row geometry. */
const lineWith = (out: string, needle: string): string =>
  out.split('\n').find((line) => line.includes(needle)) ?? '';
/** The index of the line containing a needle, for proving relative order without pinning positions. */
const lineIndexOf = (out: string, needle: string): number =>
  out.split('\n').findIndex((line) => line.includes(needle));
/** Strip ANSI colour codes to assert on the visible text, not the colouring. */
const ANSI_CODE = new RegExp(String.raw`${String.fromCharCode(27)}\[[0-9;]*m`, 'g');
const stripAnsi = (text: string): string => text.replaceAll(ANSI_CODE, '');

describe('renderStatusline — model and context placement', () => {
  // Owner layout preference (2026-07-03, deliberate castr divergence from Oak's
  // model-row placement): ctx reads on the repo-title row, AFTER the title.
  it.each([
    ['no-logo', {}],
    ['logo', { logoRows: FIXTURE_ROWS_WIDE }],
  ] as const)(
    'renders the context percentage after the repo title, not on the model line (%s layout)',
    (_label, options) => {
      const out = renderStatusline(
        { ...base, model: 'Opus 4.8', usedPercentage: 38, dir: 'castr', branch: 'main' },
        options,
      );
      const titleLine = stripAnsi(lineWith(out, 'ctx:38%'));
      expect(titleLine).toContain('castr');
      expect(titleLine.indexOf('castr')).toBeLessThan(titleLine.indexOf('ctx:38%'));
      expect(lineWith(out, 'Opus 4.8')).not.toContain('ctx:');
    },
  );

  it('renders the context gauge on its own line when no location row exists', () => {
    const out = renderStatusline({ ...base, dir: '', usedPercentage: 41 });
    expect(out).toContain('ctx:41%');
  });
});

describe('renderStatusline — primary checkout', () => {
  it('shows the checkout name on a line above its branch, with no coordination label', () => {
    const out = renderStatusline({
      ...base,
      dir: 'castr-primary-checkout',
      branch: 'docs/consolidations',
    });
    expect(lineIndexOf(out, 'castr-primary-checkout')).toBeLessThan(
      lineIndexOf(out, 'docs/consolidations'),
    );
    expect(lineWith(out, 'castr-primary-checkout')).not.toContain('docs/consolidations');
    expect(out).not.toContain('coord:');
    expect(out).not.toContain('πρ');
  });

  it('marks the branch when the working tree is dirty, and not when it is clean', () => {
    expect(lineWith(renderStatusline({ ...base, branch: 'main', dirty: true }), 'main')).toContain(
      '*',
    );
    expect(renderStatusline({ ...base, branch: 'main', dirty: false })).not.toContain('*');
  });

  it('shows just the directory outside a repository', () => {
    const out = renderStatusline({ ...base, dir: 'repo' });
    expect(out).toContain('repo');
    expect(out).not.toContain('\n');
    expect(out).not.toContain('coord:');
  });
});

describe('renderStatusline — linked worktree', () => {
  const worktree: StatuslineParts = {
    ...base,
    dir: 'castr-wt-mcp',
    branch: 'feat/mcp-explore',
    dirty: true,
    worktree: 'castr-wt-mcp',
    coordinationBranch: 'coordination/worktree-pilot',
    coordinationPlace: 'castr-primary-checkout',
  };

  it('labels the primary branch coord: and shows the worktree branch and name separately', () => {
    const out = renderStatusline(worktree);
    expect(lineWith(out, 'coordination/worktree-pilot')).toContain('coord:');
    const worktreeLine = lineWith(out, 'feat/mcp-explore');
    expect(worktreeLine).toContain('castr-wt-mcp');
    expect(worktreeLine).not.toContain('coord:');
    expect(out).toContain('castr-primary-checkout');
  });

  it('orders the coordination branch before the worktree', () => {
    const out = renderStatusline(worktree);
    expect(lineIndexOf(out, 'coordination/worktree-pilot')).toBeLessThan(
      lineIndexOf(out, 'feat/mcp-explore'),
    );
  });

  it('puts the dirty mark on the worktree branch, not the coordination branch', () => {
    const out = renderStatusline(worktree);
    expect(lineWith(out, 'feat/mcp-explore')).toContain('*');
    expect(lineWith(out, 'coordination/worktree-pilot')).not.toContain('*');
  });

  it('still shows the coordination branch and worktree when the primary name is deduped away', () => {
    const out = renderStatusline({
      ...worktree,
      coordinationBranch: 'main',
      coordinationPlace: undefined,
    });
    expect(lineWith(out, 'main')).toContain('coord:');
    expect(out).toContain('feat/mcp-explore');
  });
});

describe('renderStatusline — error and context usage', () => {
  it('surfaces a loud error token as the leading line and never swallows it', () => {
    const out = renderStatusline({
      ...base,
      branch: undefined,
      error: 'branch unresolved: fatal: bad object HEAD',
    });
    expect(out.split('\n')[0]).toContain('⚠');
    expect(out.split('\n')[0]).toContain('branch unresolved: fatal: bad object HEAD');
  });

  it('colours context usage green below 50%, yellow from 50%, red from 70%', () => {
    expect(renderStatusline({ ...base, usedPercentage: 12.6 })).toContain(
      `${GREEN}ctx:13%${RESET}`,
    );
    expect(renderStatusline({ ...base, usedPercentage: 50 })).toContain(`${YELLOW}ctx:50%${RESET}`);
    expect(renderStatusline({ ...base, usedPercentage: 70 })).toContain(`${RED}ctx:70%${RESET}`);
  });

  it('omits the context segment when usage is absent', () => {
    expect(renderStatusline({ ...base, usedPercentage: undefined })).not.toContain('ctx:');
  });
});

describe('renderStatusline — Claude.ai rate-limit gauges', () => {
  // Owner layout ruling (2026-07-18): the gauges live on the repo-title row,
  // AFTER the context gauge — `castr · ctx:61% · 5h:19%(5h) · w:14%(6d)` — not
  // on the identity summary row.
  it.each([
    ['no-logo', {}],
    ['logo', { logoRows: FIXTURE_ROWS_WIDE }],
  ] as const)(
    'renders the gauges on the repo-title row after the context gauge, never on the identity row (%s layout)',
    (_label, options) => {
      const out = renderStatusline(
        {
          ...base,
          identity: 'Wyvern mends Draught',
          usedPercentage: 61,
          fiveHourPercentage: 33,
          fiveHourResetSeconds: 2 * 3600 + 14 * 60,
          sevenDayPercentage: 55,
          sevenDayResetSeconds: 3 * 86400,
          dir: 'castr',
          branch: 'main',
        },
        options,
      );
      const identityRow = stripAnsi(lineWith(out, 'Wyvern mends Draught'));
      expect(identityRow).not.toContain('5h:33%');
      expect(identityRow).not.toContain('w:55%');
      const titleRow = stripAnsi(lineWith(out, 'ctx:61%'));
      expect(titleRow).toContain('castr');
      expect(titleRow).toContain('5h:33%(2h)');
      expect(titleRow).toContain('w:55%(3d)');
      expect(titleRow.indexOf('castr')).toBeLessThan(titleRow.indexOf('ctx:61%'));
      expect(titleRow.indexOf('ctx:61%')).toBeLessThan(titleRow.indexOf('5h:33%(2h)'));
      expect(titleRow.indexOf('5h:33%(2h)')).toBeLessThan(titleRow.indexOf('w:55%(3d)'));
    },
  );

  it('renders the gauges on the title row even when the context gauge is absent', () => {
    const out = renderStatusline({ ...base, dir: 'castr', branch: 'main', fiveHourPercentage: 23 });
    const titleRow = stripAnsi(lineWith(out, '5h:23%'));
    expect(titleRow).toContain('castr');
    expect(titleRow.indexOf('castr')).toBeLessThan(titleRow.indexOf('5h:23%'));
  });

  it('renders the gauges on their own line when no location row exists', () => {
    const out = renderStatusline({ ...base, dir: '', fiveHourPercentage: 23 });
    expect(out).toContain('5h:23%');
  });

  it('colour-ramps the percentage the same way as context usage', () => {
    expect(renderStatusline({ ...base, fiveHourPercentage: 80 })).toContain(`${RED}5h:80%${RESET}`);
  });

  it('omits the countdown when a window has no reset instant', () => {
    const out = renderStatusline({ ...base, fiveHourPercentage: 33 });
    expect(out).toContain('5h:33%');
    expect(out).not.toContain('(');
  });

  it('renders only the window that is present', () => {
    const out = renderStatusline({ ...base, fiveHourPercentage: 23 });
    expect(out).toContain('5h:23%');
    expect(out).not.toContain('w:');
  });

  it('shows no gauges when both windows are absent', () => {
    expect(renderStatusline({ ...base, branch: 'main' })).not.toContain('5h:');
  });
});

describe('renderStatusline — logo column mechanism', () => {
  it('renders every logo row and drops no location fact, even past the logo height', () => {
    // A worktree has three location rows; with a four-row logo the last lands
    // beyond the mark and must still render rather than being dropped.
    const out = renderStatusline(
      {
        ...base,
        dir: 'castr-wt-mcp',
        branch: 'feat/mcp',
        worktree: 'castr-wt-mcp',
        coordinationBranch: 'coordination/pilot',
        coordinationPlace: 'castr-primary-checkout',
      },
      { logoRows: FIXTURE_ROWS_WIDE },
    );
    for (const row of FIXTURE_ROWS_WIDE) {
      expect(out).toContain(row);
    }
    expect(out).toContain('coord:');
    expect(out).toContain('feat/mcp');
  });

  it('spans the separator rule to the active logo width, on by default', () => {
    for (const rows of [FIXTURE_ROWS_WIDE, FIXTURE_ROWS_NARROW]) {
      const lines = renderStatusline({ ...base, dir: 'repo' }, { logoRows: rows }).split('\n');
      const ruleRow = (lines.at(-1) ?? '').replaceAll('\x1b[2m', '').replaceAll(RESET, '');
      expect([...ruleRow]).toHaveLength([...rows[0]].length);
    }
  });

  it('tiles a caller-supplied rule glyph across the logo width', () => {
    const probe = '=';
    const lines = renderStatusline(
      { ...base, dir: 'repo' },
      { logoRows: FIXTURE_ROWS_WIDE, logoSeparator: probe },
    ).split('\n');
    const ruleRow = (lines.at(-1) ?? '').replaceAll('\x1b[2m', '').replaceAll(RESET, '');
    expect([...ruleRow]).toEqual(
      Array.from({ length: [...FIXTURE_ROWS_WIDE[0]].length }, () => probe),
    );
  });

  it('suppresses the separator rule when given an empty glyph', () => {
    const lines = renderStatusline(
      { ...base, dir: 'repo' },
      { logoRows: FIXTURE_ROWS_WIDE, logoSeparator: '' },
    ).split('\n');
    expect(lines).toHaveLength(FIXTURE_ROWS_WIDE.length);
    expect(lines.join('\n')).toContain('repo');
  });

  it('omits the separator row in the no-logo layout', () => {
    expect(renderStatusline({ ...base, dir: 'repo' }, { logoSeparator: '<<sep>>' })).not.toContain(
      '<<sep>>',
    );
  });

  it('renders no logo glyphs when no rows are given (empty rows behave like none)', () => {
    for (const options of [{}, { logoRows: [] as const }]) {
      const out = renderStatusline({ ...base, dir: 'repo', model: 'Opus 4.8' }, options);
      expect(out).toContain('Opus 4.8');
      expect(out).toContain('repo');
      expect(out).not.toContain(FIXTURE_ROWS_WIDE[0]);
    }
  });

  it('renders exactly the rows it is given, in order (frame selection is the composition root via engraph-logo)', () => {
    const out = renderStatusline({ ...base, dir: 'repo' }, { logoRows: FIXTURE_ROWS_NARROW });
    const marks = out
      .split('\n')
      .filter((line) => line.includes(RESET))
      .map((line) => stripAnsi(line))
      .filter((line) => FIXTURE_ROWS_NARROW.some((row) => line.startsWith(row)));
    expect(
      marks.slice(0, FIXTURE_ROWS_NARROW.length).map((line) => [...line].slice(0, 6).join('')),
    ).toEqual([...FIXTURE_ROWS_NARROW]);
  });
});
