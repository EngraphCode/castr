import type { SecurityRequirementObject } from '../../../shared/openapi-types.js';
import type { IRSecurityRequirement } from '../../ir/index.js';

/**
 * Write an IR security formula back to OpenAPI Security Requirement Objects.
 *
 * Shared by the document-level and operation-level writers so the two
 * surfaces cannot drift. The formula is emitted losslessly: one requirement
 * object per IR group (OR alternative), that group's schemes as the object's
 * entries (AND members), both in IR order — array order (and key order, up
 * to JS's own integer-like-key normalisation, which happens before castr
 * ever sees the document) is document content, so nothing is sorted,
 * merged, or deduplicated. A group
 * with no schemes is the spec's empty requirement and is emitted as `{}`
 * (anonymous access supported), never dropped.
 *
 * @param security - The IR security formula (document- or operation-level)
 * @returns One Security Requirement Object per IR group, order intact
 *
 * @throws `Error` when one group names the same scheme twice — a JSON object
 * cannot carry a duplicate key, so the formula would be silently collapsed;
 * failing fast preserves IR honesty instead.
 *
 * @example An AND-group of two schemes stays one requirement object
 * ```typescript
 * writeSecurityRequirements([
 *   { schemes: [{ schemeName: 'a', scopes: [] }, { schemeName: 'b', scopes: [] }] },
 * ]);
 * // [{ a: [], b: [] }]
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#security-requirement-object | OpenAPI Security Requirement Object}
 */
export function writeSecurityRequirements(
  security: IRSecurityRequirement[],
): SecurityRequirementObject[] {
  return security.map(writeSecurityRequirement);
}

function writeSecurityRequirement(requirement: IRSecurityRequirement): SecurityRequirementObject {
  const seenSchemeNames = new Set<string>();
  const entries: [string, string[]][] = requirement.schemes.map(({ schemeName, scopes }) => {
    if (seenSchemeNames.has(schemeName)) {
      throw new Error(
        `Security requirement names scheme "${schemeName}" more than once in one AND-group; ` +
          'a Security Requirement Object cannot represent a duplicate key, so writing it would ' +
          'silently lose part of the formula.',
      );
    }
    seenSchemeNames.add(schemeName);
    return [schemeName, [...scopes]];
  });
  // Object.fromEntries defines OWN properties, so a scheme legally named
  // "__proto__" becomes a real key instead of invoking the inherited
  // prototype setter (which would silently emit {} — anonymous access).
  return Object.fromEntries(entries);
}
