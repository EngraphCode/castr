import { type UnknownRecord, isRecord } from '../../../../shared/type-utils/types.js';

/**
 * True when the record carries no keys outside the allowed set — the
 * exact-shape half of the boundary: a value with extra keys is not the
 * canonical shape and must not be certified as it (a writer would silently
 * ignore the extra data).
 */
function hasOnlyKeys(value: UnknownRecord, allowedKeys: ReadonlySet<string>): boolean {
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

const REQUIREMENT_KEYS: ReadonlySet<string> = new Set(['schemes']);
const SCHEME_MEMBER_KEYS: ReadonlySet<string> = new Set(['schemeName', 'scopes']);

/**
 * Validate one scheme member of a requirement group: a component name plus a
 * scope-string list, both required, and no other keys accepted.
 */
function isValidSecuritySchemeRequirement(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, SCHEME_MEMBER_KEYS) &&
    typeof value['schemeName'] === 'string' &&
    Array.isArray(value['scopes']) &&
    value['scopes'].every((scope) => typeof scope === 'string')
  );
}

/**
 * Validate one IR security requirement: a group of scheme references whose
 * members are ANDed. Rejects the pre-group flat shape
 * (`{ schemeName, scopes }` at the requirement level), so a stale persisted
 * IR fails fast at the deserialization boundary instead of being read as
 * groups with undefined members. Also rejects a group naming the same scheme
 * twice — a Security Requirement Object cannot carry a duplicate key, so the
 * OpenAPI writer refuses it and "valid" must coincide with "writable" — and
 * any key beyond `schemes`, so a hybrid stale value (old flat fields riding
 * beside a `schemes` array) is never certified as canonical.
 */
function isValidSecurityRequirement(value: unknown): boolean {
  return (
    isRecord(value) &&
    hasOnlyKeys(value, REQUIREMENT_KEYS) &&
    Array.isArray(value['schemes']) &&
    value['schemes'].every((member) => isValidSecuritySchemeRequirement(member)) &&
    hasUniqueSchemeNames(value['schemes'])
  );
}

/**
 * True when no two members of one validated requirement group share a
 * `schemeName` — the writable-formula invariant the writer enforces. Runs
 * after per-member validation, so every member carries a string name; a
 * member that somehow does not is simply not counted, which fails closed.
 */
function hasUniqueSchemeNames(schemes: unknown[]): boolean {
  const names = schemes.flatMap((member) =>
    isRecord(member) && typeof member['schemeName'] === 'string' ? [member['schemeName']] : [],
  );
  return new Set(names).size === schemes.length;
}

/**
 * Validate a document- or operation-level IR security array, or its absence.
 *
 * @param value - The `security` field's value (`undefined` when absent)
 * @returns True when absent or a structurally valid array of requirement groups
 *
 * @example
 * ```typescript
 * isValidOptionalSecurityArray(undefined); // true — field absent
 * isValidOptionalSecurityArray([{ schemes: [{ schemeName: 'a', scopes: [] }] }]); // true
 * isValidOptionalSecurityArray([{ schemeName: 'a', scopes: [] }]); // false — stale flat shape
 * ```
 *
 * @see `isCastrDocument` / `isCastrOperation` in `validators.document.ts` for the boundary guards that apply it
 */
export function isValidOptionalSecurityArray(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((requirement) => isValidSecurityRequirement(requirement)))
  );
}
