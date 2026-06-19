import { describe, expect, it } from 'vitest';

import {
  groupPatternEntries,
  parsePatternFile,
  PATTERN_INDEX_END,
  PATTERN_INDEX_START,
  renderPatternIndexBody,
  replaceIndexRegion,
  type PatternEntry,
} from './patterns-index-helpers.js';
import { reportPatternsIndex } from './patterns-index-report.js';

function patternFile(frontmatter: string): string {
  return `---\n${frontmatter}\n---\n\n# Body\n`;
}

function entry(
  overrides: Partial<PatternEntry> & Pick<PatternEntry, 'file' | 'name' | 'category'>,
): PatternEntry {
  return { polarity: 'pattern', useThisWhen: 'something happens', ...overrides };
}

describe('parsePatternFile', () => {
  it('parses a well-formed pattern into an entry with no errors', () => {
    const result = parsePatternFile(
      'additive-only-schema-decoration.md',
      patternFile(
        'name: Additive-Only Schema Decoration\npolarity: pattern\ncategory: code\nuse_this_when: a decorator modifies a third-party schema',
      ),
    );
    expect(result.errors).toEqual([]);
    expect(result.entry).toEqual({
      file: 'additive-only-schema-decoration.md',
      name: 'Additive-Only Schema Decoration',
      category: 'code',
      polarity: 'pattern',
      useThisWhen: 'a decorator modifies a third-party schema',
    });
  });

  it('handles quoted values and use_this_when containing a colon', () => {
    const result = parsePatternFile(
      'x.md',
      patternFile(
        'name: "Quoted Name"\ncategory: testing\npolarity: pattern\nuse_this_when: "One sentence: the moment it applies"',
      ),
    );
    expect(result.entry?.name).toBe('Quoted Name');
    expect(result.entry?.useThisWhen).toBe('One sentence: the moment it applies');
  });

  it('reports an error for a missing frontmatter block', () => {
    const result = parsePatternFile('x.md', '# No frontmatter\n');
    expect(result.entry).toBeNull();
    expect(result.errors.join('\n')).toContain('missing YAML frontmatter');
  });

  it('reports an error for unparseable YAML', () => {
    const result = parsePatternFile('x.md', patternFile('name: "unterminated\ncategory: code'));
    expect(result.entry).toBeNull();
    expect(result.errors.join('\n')).toContain('invalid YAML frontmatter');
  });

  it('errors (with a filename fallback) when name is missing', () => {
    const result = parsePatternFile(
      'my-pattern.md',
      patternFile('category: code\npolarity: pattern\nuse_this_when: x'),
    );
    expect(result.entry?.name).toBe('my-pattern');
    expect(result.errors).toContain("my-pattern.md: missing 'name' frontmatter");
  });

  it('errors on a non-canonical category but keeps the value', () => {
    const result = parsePatternFile(
      'x.md',
      patternFile(
        'name: X\ncategory: coordination-architecture\npolarity: pattern\nuse_this_when: x',
      ),
    );
    expect(result.entry?.category).toBe('coordination-architecture');
    expect(result.errors.join('\n')).toContain(
      "x.md: non-canonical category 'coordination-architecture'",
    );
  });

  it('errors on a non-canonical polarity and on a missing use_this_when', () => {
    const result = parsePatternFile(
      'x.md',
      patternFile('name: X\ncategory: agent\npolarity: antipattern'),
    );
    expect(result.errors.join('\n')).toContain("x.md: non-canonical polarity 'antipattern'");
    expect(result.errors).toContain("x.md: missing 'use_this_when' frontmatter");
  });
});

describe('groupPatternEntries', () => {
  it('orders canonical categories first, then non-canonical alphabetically', () => {
    const groups = groupPatternEntries([
      entry({ file: 'p.md', name: 'P', category: 'process' }),
      entry({ file: 'z.md', name: 'Z', category: 'zeta' }),
      entry({ file: 'c.md', name: 'C', category: 'code' }),
      entry({ file: 'a.md', name: 'A', category: 'agent' }),
      entry({ file: 'm.md', name: 'M', category: 'mu' }),
    ]);
    expect(groups.map((g) => g.category)).toEqual(['code', 'process', 'agent', 'mu', 'zeta']);
  });

  it('sorts entries within a category by name, case-insensitively', () => {
    const groups = groupPatternEntries([
      entry({ file: 'b.md', name: 'beta', category: 'code' }),
      entry({ file: 'a.md', name: 'Alpha', category: 'code' }),
      entry({ file: 'c.md', name: 'Charlie', category: 'code' }),
    ]);
    expect(groups[0]?.entries.map((e) => e.name)).toEqual(['Alpha', 'beta', 'Charlie']);
  });

  it('title-cases hyphenated category names', () => {
    const groups = groupPatternEntries([
      entry({ file: 'x.md', name: 'X', category: 'test-architecture' }),
    ]);
    expect(groups[0]?.title).toBe('Test Architecture');
  });
});

describe('renderPatternIndexBody', () => {
  it('renders grouped sections with counts, links, and discovery text', () => {
    const groups = groupPatternEntries([
      entry({
        file: 'const-map.md',
        name: 'Const Map',
        category: 'code',
        useThisWhen: 'a runtime conversion mirrors a type transformation',
      }),
      entry({ file: 'no-when.md', name: 'No When', category: 'code', useThisWhen: '' }),
    ]);
    expect(renderPatternIndexBody(groups)).toBe(
      [
        '### Code (2)',
        '',
        '- **Const Map** -- Use this when: a runtime conversion mirrors a type transformation → [const-map.md](const-map.md)',
        '- **No When** → [no-when.md](no-when.md)',
      ].join('\n'),
    );
  });
});

describe('replaceIndexRegion', () => {
  const readme = `# Patterns\n\nIntro prose.\n\n${PATTERN_INDEX_START}\n\nstale\n\n${PATTERN_INDEX_END}\n`;

  it('replaces only the sentinel region and preserves surrounding prose', () => {
    const result = replaceIndexRegion(
      readme,
      '## Pattern Index\n\n### Code (1)\n\n- **A** → [a.md](a.md)',
    );
    expect(result.ok).toBe(true);
    expect(result.next).toBe(
      `# Patterns\n\nIntro prose.\n\n${PATTERN_INDEX_START}\n\n## Pattern Index\n\n### Code (1)\n\n- **A** → [a.md](a.md)\n\n${PATTERN_INDEX_END}\n`,
    );
  });

  it('is idempotent', () => {
    const body = '## Pattern Index\n\n### Code (0)';
    const once = replaceIndexRegion(readme, body);
    const twice = replaceIndexRegion(once.next, body);
    expect(twice.next).toBe(once.next);
  });

  it('fails when the sentinels are absent', () => {
    const result = replaceIndexRegion('# Patterns\n\nNo sentinels here.\n', 'body');
    expect(result.ok).toBe(false);
    expect(result.error).toContain('sentinels');
  });
});

describe('reportPatternsIndex', () => {
  const base = {
    patternCount: 3,
    categoryCount: 2,
    wrote: false,
    errors: [],
    drift: false,
  };

  it('returns 0 when up to date', () => {
    expect(reportPatternsIndex(base)).toBe(0);
  });

  it('returns 1 on detected drift in check mode', () => {
    expect(reportPatternsIndex({ ...base, drift: true })).toBe(1);
  });

  it('returns 1 on hard errors', () => {
    expect(reportPatternsIndex({ ...base, errors: ['x.md: invalid YAML frontmatter'] })).toBe(1);
  });

  it('returns 0 after a successful fix-mode rewrite', () => {
    expect(reportPatternsIndex({ ...base, wrote: true })).toBe(0);
  });
});
