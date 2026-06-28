import { describe, expect, it } from 'vitest';

import {
  checkForBangCommit,
  checkForBreakingChanges,
} from './prevent-accidental-major-version-helpers.js';

describe('checkForBangCommit', () => {
  it('detects the unscoped breaking-change bang (feat!:)', () => {
    expect(checkForBangCommit('feat!: drop the legacy API')).toBe(true);
    expect(checkForBangCommit('fix!: change the default')).toBe(true);
  });

  it('detects the SCOPED breaking-change bang (feat(api)!:) — the bypass cure', () => {
    // Before the fix the regex omitted the optional `(scope)`, so a scoped bang
    // silently bypassed the major-bump guard (Codex PR-#3 finding #8).
    expect(checkForBangCommit('feat(api)!: drop the legacy endpoint')).toBe(true);
    expect(checkForBangCommit('refactor(core)!: re-shape the IR')).toBe(true);
  });

  it('does not flag a normal (non-breaking) header, scoped or unscoped', () => {
    expect(checkForBangCommit('feat: add a field')).toBe(false);
    expect(checkForBangCommit('feat(api): add a field')).toBe(false);
    expect(checkForBangCommit('docs(readme): tidy')).toBe(false);
  });

  it('does not flag a bang that is not the conventional header position', () => {
    expect(checkForBangCommit('feat: add a thing! it is great')).toBe(false);
  });
});

describe('checkForBreakingChanges', () => {
  it('detects a BREAKING CHANGE footer (case-insensitive)', () => {
    expect(checkForBreakingChanges('feat: x\n\nBREAKING CHANGE: removed y')).toBe(true);
    expect(checkForBreakingChanges('feat: x\n\nbreaking-change: removed y')).toBe(true);
  });

  it('does not flag an ordinary message', () => {
    expect(checkForBreakingChanges('feat: add a field\n\nRoutine body.')).toBe(false);
  });
});
