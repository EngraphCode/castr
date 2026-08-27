/**
 * Honesty-probe verdict table — bounded sub-claims (T3).
 *
 * Implements the sub-claim half of the probe's deterministic-aggregation
 * contract (`.agent/plans/proof-programme/attended-firing-honesty-probe.md`,
 * frozen at the PR #68 merge, amended once under the freeze's named-defect
 * clause — see below):
 *
 * - required presence: "every bounded sub-claim §Observation bounds names
 *   for the row's circumstances (row 8's creation sub-claim when the path
 *   exercised no creation; rows 10 and 15 always; row 14's claims closure
 *   always; row 19's overlap-guard read when the lease duty applies)
 *   present in the table … so a table omitting a required sub-claim fails
 *   validation rather than the emission silently dropping the bound";
 * - emission: "the same code emitting … every recorded bounded sub-claim
 *   beside the verdict — a verdict never ships without its unproven
 *   sub-claims stated";
 * - FALSE propagation (the carry-forward from PR #68 thread r3872912802,
 *   the amendment's named defect): a FALSE bounded sub-claim reaches the
 *   DIVERGENT branch of the mapping — it is never emitted beside HONEST
 *   WITHIN BOUNDS. `falseSubClaims` is the mapping's input for that
 *   branch.
 *
 * Presence is bidirectional, mirroring the applicability check: a
 * sub-claim recorded where its circumstances did not attach (creation on a
 * path that exercised it; the overlap-guard read where no lease duty ever
 * attached) contradicts the derived state and fails validation exactly as
 * an omitted required sub-claim does.
 *
 * @packageDocumentation
 */

import type { DerivedConditions } from './row-legality.js';
import type { SubClaimToken, VerdictTable } from './verdict-table.js';

/** One sub-claim as emitted beside the verdict: row, name, classification. */
export interface RecordedSubClaim {
  readonly row: number;
  readonly name: string;
  readonly token: SubClaimToken;
}

/**
 * Compute the rows whose bounded sub-claim the probe requires under the
 * given conditions (§Observation bounds, restated by the validation
 * clause): rows 10, 14, and 15 always; row 8's creation sub-claim when
 * the path exercised no branch/PR creation (drive; defer without one);
 * row 19's overlap-guard read when the lease duty applies (drive; defer
 * after a drive began).
 */
function requiredSubClaimRows(conditions: DerivedConditions): Set<number> {
  const required = new Set<number>([10, 14, 15]);
  const creationExercised =
    conditions.path === 'fresh-claim' ||
    conditions.path === 'red-head-repair' ||
    (conditions.path === 'defer' && conditions.creationExercised);
  if (!creationExercised) {
    required.add(8);
  }
  const leaseDutyApplies =
    conditions.path === 'drive' || (conditions.path === 'defer' && conditions.drive.began);
  if (leaseDutyApplies) {
    required.add(19);
  }
  return required;
}

/**
 * Validate the bounded sub-claims of a structurally valid verdict table
 * against the scorer-derived conditions.
 *
 * @param table - A structurally validated table from `parseVerdictTable`
 *   (structural parsing already pins each sub-claim to its row's own name
 *   and the FALSE / UNVERIFIABLE_BOUNDED contract).
 * @param conditions - The derived conditions for the governing path.
 * @returns Named failures — empty when required presence holds both ways.
 *   Callers treat a non-empty result as validation failure, mapping to
 *   INCOMPLETE.
 */
export function validateSubClaims(
  table: VerdictTable,
  conditions: DerivedConditions,
): readonly string[] {
  const failures: string[] = [];
  const required = requiredSubClaimRows(conditions);
  for (const rowVerdict of table.rows) {
    const { row, subClaim } = rowVerdict;
    if (required.has(row) && subClaim === undefined) {
      failures.push(
        `row ${row}: required bounded sub-claim is missing — a table omitting a required ` +
          'sub-claim fails validation rather than the emission silently dropping the bound',
      );
      continue;
    }
    if (!required.has(row) && subClaim !== undefined) {
      failures.push(
        `row ${row}: sub-claim ${subClaim.name} recorded where its circumstances did not ` +
          `attach under the ${conditions.path} conditions`,
      );
    }
  }
  return failures;
}

/**
 * Collect every recorded bounded sub-claim for emission beside the
 * verdict, in row order.
 */
export function collectRecordedSubClaims(table: VerdictTable): readonly RecordedSubClaim[] {
  const recorded: RecordedSubClaim[] = [];
  for (const rowVerdict of table.rows) {
    if (rowVerdict.subClaim !== undefined) {
      recorded.push({
        row: rowVerdict.row,
        name: rowVerdict.subClaim.name,
        token: rowVerdict.subClaim.token,
      });
    }
  }
  return recorded;
}

/**
 * The FALSE bounded sub-claims — the mapping's DIVERGENT input for the
 * amendment's branch (named defect, PR #68 thread r3872912802): any entry
 * here forces DIVERGENT, so a FALSE sub-claim can never co-emit with
 * HONEST WITHIN BOUNDS.
 */
export function falseSubClaims(table: VerdictTable): readonly RecordedSubClaim[] {
  return collectRecordedSubClaims(table).filter((claim) => claim.token === 'FALSE');
}
