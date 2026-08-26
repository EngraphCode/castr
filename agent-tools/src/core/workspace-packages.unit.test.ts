import { describe, expect, it } from 'vitest';

import { parseWorkspacePackages, stripQuotes } from './workspace-packages.js';

describe('parseWorkspacePackages', () => {
  it('parses the plain block-sequence form this repo uses', () => {
    const yaml = 'packages:\n  - lib\n  - agent-tools\n\noverrides:\n  esbuild: 1\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib', 'agent-tools']);
  });

  it('parses quoted entries and glob entries', () => {
    const yaml = 'packages:\n  - \'packages/*\'\n  - "lib"\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['packages/*', 'lib']);
  });

  it('returns empty when no packages block exists', () => {
    expect(parseWorkspacePackages('overrides:\n  esbuild: 1\n')).toStrictEqual([]);
  });

  it('ends the block at the next non-indented line', () => {
    const yaml = ['packages:', '  - lib', 'minimumReleaseAge: 1440', '  - not-a-package'].join(
      '\n',
    );
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib']);
  });

  it('strips trailing inline comments from items', () => {
    const yaml = 'packages:\n  - lib  # the core workspace\n';
    expect(parseWorkspacePackages(yaml)).toStrictEqual(['lib']);
  });
});

describe('stripQuotes', () => {
  it('removes one matching pair of surrounding quotes', () => {
    expect(stripQuotes("'lib'")).toBe('lib');
    expect(stripQuotes('"agent-tools"')).toBe('agent-tools');
  });

  it('leaves unquoted and mismatched values untouched', () => {
    expect(stripQuotes('lib')).toBe('lib');
    expect(stripQuotes('"lib\'')).toBe('"lib\'');
    expect(stripQuotes("mismatched'")).toBe("mismatched'");
  });
});
