/**
 * Pure detection helpers for the accidental-major-version guard. Extracted so the
 * detection logic is unit-testable; the sibling `prevent-accidental-major-version.ts`
 * is the thin IO + exit shell that reads the commit-message file and calls these.
 *
 * @packageDocumentation
 */

/** Footer/body markers that signal a breaking change (case-insensitive match). */
const BREAKING_CHANGE_INDICATORS = [
  'BREAKING CHANGE:',
  'BREAKING CHANGES:',
  'BREAKING-CHANGE:',
  'BREAKING CHANGE',
  'BREAKING CHANGES',
  'BREAKING-CHANGE',
] as const;

/** True when the message body/footer carries a BREAKING CHANGE marker. */
export function checkForBreakingChanges(message: string): boolean {
  const upperMessage = message.toUpperCase();
  for (const indicator of BREAKING_CHANGE_INDICATORS) {
    if (upperMessage.includes(indicator)) {
      return true;
    }
  }
  return false;
}

/**
 * True when the header uses the conventional-commits breaking-change bang.
 *
 * Matches both the unscoped `type!:` form and the scoped `type(scope)!:` form —
 * commitlint accepts both as breaking headers, so the guard must catch both or a
 * scoped `feat(api)!:` silently bypasses the major-bump check.
 */
export function checkForBangCommit(message: string): boolean {
  return /^(feat|fix|refactor|perf|test|build|ci|chore|docs|style|revert)(\([^)]+\))?!:/m.test(
    message,
  );
}

/**
 * True when the owner-authorised major-version override is active.
 *
 * The guard exists to stop ACCIDENTAL major-version signals; an intentional,
 * owner-approved breaking change re-runs the commit with
 * `ENGRAPH_ALLOW_MAJOR_VERSION=1` so the breaking marker is preserved for
 * semver tooling instead of being stripped to sneak past the guard. Only the
 * literal string '1' authorises — anything else stays blocking.
 */
export function majorBumpOverrideActive(
  env: Readonly<Record<string, string | undefined>>,
): boolean {
  return env.ENGRAPH_ALLOW_MAJOR_VERSION === '1';
}
