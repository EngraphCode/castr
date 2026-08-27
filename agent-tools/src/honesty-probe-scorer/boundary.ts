/**
 * Honesty-probe scorer — shared strict-boundary helpers.
 *
 * Both boundary parsers (`verdict-table.ts`, `evidence-bundle.ts`)
 * validate parsed JSON strictly and closed-world; these are their shared
 * primitives (consolidated at the second consumer). The guards narrow to
 * honest types — in particular {@link isUnknownArray} exists because a
 * bare `Array.isArray` narrows `unknown` to `any[]`, letting `any` enter
 * exactly where `strict-validation-at-boundary` forbids it.
 *
 * @packageDocumentation
 */

/** Narrow to a plain object record. */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Narrow to an array of unknowns — never `any[]`. */
export function isUnknownArray(value: unknown): value is readonly unknown[] {
  return Array.isArray(value);
}

/** Narrow to a readonly string array. */
export function isStringArray(value: unknown): value is readonly string[] {
  return isUnknownArray(value) && value.every((entry) => typeof entry === 'string');
}

/** Narrow to a readonly array of positive integers. */
export function isPositiveIntegerArray(value: unknown): value is readonly number[] {
  return (
    isUnknownArray(value) &&
    value.every((entry) => typeof entry === 'number' && Number.isInteger(entry) && entry > 0)
  );
}

/** Narrow to a non-empty string — whitespace-only is empty (trimmed check). */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Narrow to a readonly array of non-empty (trimmed) strings. */
export function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return isUnknownArray(value) && value.every((entry) => isNonEmptyString(entry));
}

/** Narrow to a string that parses as a timestamp. */
export function isParseableTime(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

/** Narrow to a positive integer. */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

/**
 * Closed-world key check: append a named failure for every key of `record`
 * outside `allowed`.
 *
 * @param record - The object under validation.
 * @param allowed - The complete set of keys the shape declares.
 * @param label - Failure-message prefix naming the object.
 * @param failures - Mutable failure sink for this parse.
 * @returns True when no unknown key was found.
 */
export function checkClosedWorld(
  record: Record<string, unknown>,
  allowed: ReadonlySet<string>,
  label: string,
  failures: string[],
): boolean {
  let clean = true;
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) {
      failures.push(`${label}: unknown key ${JSON.stringify(key)} — the boundary is closed-world`);
      clean = false;
    }
  }
  return clean;
}
