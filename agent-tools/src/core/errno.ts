/**
 * Errno narrowing shared across validators and IO helpers. Lifted from the
 * private copies in `collaboration-state/state-integrity.ts` and three
 * validators at the point they multiplied (`consolidate-at-second-consumer`);
 * the `in`-operator form narrows without any type assertion.
 *
 * @packageDocumentation
 */

/**
 * True when `error` is an errno-carrying object whose `code` equals `code`.
 *
 * @param error - The caught value (typed `unknown` at every catch site).
 * @param code - The errno code to match (e.g. `ENOENT`).
 * @returns Whether the error carries exactly that code.
 */
export function isErrnoCode(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}
