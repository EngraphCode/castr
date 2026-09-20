import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { SEMANTIC_MERGE_DRIVER_NAME } from '../semantic-merge/semantic-merge-driver.js';

import {
  deriveSemanticMergeDriverConfig,
  SEMANTIC_MERGE_DRIVER_ENTRY,
  SEMANTIC_MERGE_DRIVER_KEY,
} from './semantic-merge-driver-registration.js';

// The exact-equality assertion below is the automated guard against a
// machine-local path re-entering the shared git config: `.git/config` is
// untracked, so the repository's machine-local-paths validator (which walks
// `git ls-files`) can never see it. The E2E re-asserts the same value after a
// real git round-trip; keep both.

const top = '/srv/checkouts/castr';
const nameKey = `merge.${SEMANTIC_MERGE_DRIVER_NAME}.name`;

describe('SEMANTIC_MERGE_DRIVER_ENTRY', () => {
  it('names the built driver by a path within the checkout, never an absolute one', () => {
    expect(path.isAbsolute(SEMANTIC_MERGE_DRIVER_ENTRY)).toBe(false);
  });
});

describe('deriveSemanticMergeDriverConfig', () => {
  it('binds the driver to its checkout-relative command, driver entry first, placeholders last', () => {
    const derived = deriveSemanticMergeDriverConfig({ worktreeTopLevel: top, repoRoot: top });

    expect(derived).toStrictEqual({
      ok: true,
      entries: [
        [SEMANTIC_MERGE_DRIVER_KEY, `node ${SEMANTIC_MERGE_DRIVER_ENTRY} %O %A %B %P`],
        [nameKey, expect.any(String)],
      ],
    });
  });

  it('derives the same entries whether or not either path carries a trailing separator', () => {
    const plain = deriveSemanticMergeDriverConfig({ worktreeTopLevel: top, repoRoot: top });
    const trailing = deriveSemanticMergeDriverConfig({
      worktreeTopLevel: `${top}${path.sep}`,
      repoRoot: `${top}${path.sep}${path.sep}`,
    });

    expect(trailing).toStrictEqual(plain);
  });

  it('refuses a repository root that is not the checkout git will merge in, naming both', () => {
    const derived = deriveSemanticMergeDriverConfig({
      worktreeTopLevel: top,
      repoRoot: '/srv/checkouts/other',
    });

    expect(derived).toStrictEqual({
      ok: false,
      reason: expect.stringContaining('/srv/checkouts/other'),
    });
    expect(derived).toStrictEqual({ ok: false, reason: expect.stringContaining(top) });
  });

  it('refuses a relative path on either side instead of resolving it against the process', () => {
    const relativeTop = deriveSemanticMergeDriverConfig({
      worktreeTopLevel: 'checkouts/castr',
      repoRoot: top,
    });
    const relativeRoot = deriveSemanticMergeDriverConfig({
      worktreeTopLevel: top,
      repoRoot: 'checkouts/castr',
    });

    expect(relativeTop).toStrictEqual({
      ok: false,
      reason: expect.stringContaining('checkouts/castr'),
    });
    expect(relativeRoot).toStrictEqual({
      ok: false,
      reason: expect.stringContaining('checkouts/castr'),
    });
  });
});
