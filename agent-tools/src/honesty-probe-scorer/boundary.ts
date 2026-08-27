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

/** Narrow to a non-empty string — whitespace-only is empty (trimmed check). */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Narrow to a readonly array of non-empty (trimmed) strings. */
export function isNonEmptyStringArray(value: unknown): value is readonly string[] {
  return isUnknownArray(value) && value.every((entry) => isNonEmptyString(entry));
}

/** The canonical instant shape: date, time, and an explicit timezone. */
const ISO_INSTANT =
  /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

/**
 * Narrow to a canonical timestamp: a timezone-bearing ISO instant whose
 * calendar date is real. `Date.parse` alone accepts timezone-less values
 * (host-dependent ordering) and normalises impossible dates like
 * `2026-02-30` — both would corrupt the chronology checks silently.
 */
export function isParseableTime(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }
  const match = ISO_INSTANT.exec(value);
  if (match === null || Number.isNaN(Date.parse(value))) {
    return false;
  }
  const [, year, month, day] = match;
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const reconstructed = new Date(Date.UTC(y, m - 1, d));
  return (
    reconstructed.getUTCFullYear() === y &&
    reconstructed.getUTCMonth() === m - 1 &&
    reconstructed.getUTCDate() === d
  );
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
