/**
 * Security-requirement shape validators for the operations model.
 *
 * The IR carries security as requirement SETS: each entry is an AND-set
 * `{ schemes: [{ schemeName, scopes }] }`, and alternative sets express OR.
 * The pre-requirement-set IR flattened this to one `{ schemeName, scopes }`
 * entry per requirement; cached IR serialized in that era must be rejected
 * at the deserialization boundary rather than crash the writers mid-emission.
 */

import { isRecord } from '../../../../shared/type-utils/types.js';

function isValidSecuritySchemeRequirement(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value['schemeName'] === 'string' &&
    Array.isArray(value['scopes']) &&
    value['scopes'].every((scope) => typeof scope === 'string')
  );
}

function isValidSecurityRequirement(value: unknown): boolean {
  return (
    isRecord(value) &&
    Array.isArray(value['schemes']) &&
    value['schemes'].every((scheme) => isValidSecuritySchemeRequirement(scheme))
  );
}

/**
 * Validate an optional `security` field as a list of requirement sets.
 *
 * Accepts absent (`undefined`), the explicit empty override (`[]`), and
 * requirement sets with empty scheme lists (`[{ schemes: [] }]`, the
 * optional-security marker). Rejects the stale flat pre-requirement-set
 * shape and any entry whose schemes are malformed.
 *
 * @param value - The candidate `security` field value
 * @returns True when absent or a valid requirement-set list
 *
 * @internal
 */
export function isValidSecurityRequirementList(value: unknown): boolean {
  return (
    value === undefined ||
    (Array.isArray(value) && value.every((requirement) => isValidSecurityRequirement(requirement)))
  );
}
