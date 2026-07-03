/**
 * Detect drift between the transplant's handoff/contract surfaces and the repo
 * they describe — the structural form of the §6 "continuity is substrate" rule
 * (if a behaviour must be automatic, it needs a rule, not just a skill).
 *
 * This pure helper handles the load-bearing, fragile-by-nature check: total
 * PDR-estate count claims in prose. The runtime (`validate-drift.ts`) supplies
 * the surface contents and the actual on-disk PDR file count, and separately
 * checks that load-bearing anchor paths resolve.
 *
 * Design rule: a drift-validator must be MORE conservative than the drift it
 * catches, or it becomes drift. So it matches only DEFINITE whole-estate
 * phrasings and skips approximate ("~90") claims — it errs toward false
 * negatives (an unrecognised phrasing is unchecked) over false positives (a
 * false positive would falsely red-gate the build, i.e. become the rot).
 *
 * @packageDocumentation
 */

/** A single drift finding: a surface that disagrees with the repo. */
export interface DriftViolation {
  /** The surface (file) carrying the drifted claim, or the unresolved anchor path. */
  readonly surface: string;
  /** Human-readable description of the disagreement. */
  readonly detail: string;
}

/**
 * Patterns that denote a DEFINITE claim about the total PDR-estate size. Curated
 * narrowly so legitimate sub-counts ("8 cites across 10 PDRs") and approximate
 * claims ("~90 PDRs", handled by the prefix guard below) are never matched.
 */
const TOTAL_PDR_CLAIM_PATTERNS: readonly RegExp[] = [
  /\b(\d+)-PDR\b/g, // "the 91-PDR estate"
  /\ball (\d+) PDRs?\b/g, // "all 91 PDR files transplanted"
];

/** Characters/words that, immediately before a number, mark it as approximate. */
function isApproximate(content: string, matchIndex: number): boolean {
  const before = content.slice(Math.max(0, matchIndex - 16), matchIndex).toLowerCase();
  return /(~|≈|approx\.?|approximately|about|around|circa|roughly)\s*$/.test(before);
}

/**
 * Find total-PDR-estate count claims that disagree with the actual file count.
 *
 * @param surfaces - Named handoff/contract surfaces and their text content.
 * @param actualCount - The true number of `PDR-*.md` decision-record files.
 * @returns One violation per drifted definite claim. Empty when every recognised
 *   claim equals `actualCount`.
 *
 * @example
 *
 * ```ts
 * findPdrCountDrift([{ name: 'README.md', content: 'the 92-PDR estate' }], 91);
 * // [{ surface: 'README.md', detail: 'claims "92-PDR" but 91 PDR files exist' }]
 * ```
 */
export function findPdrCountDrift(
  surfaces: ReadonlyArray<{ readonly name: string; readonly content: string }>,
  actualCount: number,
): readonly DriftViolation[] {
  const violations: DriftViolation[] = [];
  for (const { name, content } of surfaces) {
    for (const pattern of TOTAL_PDR_CLAIM_PATTERNS) {
      for (const match of content.matchAll(pattern)) {
        if (match.index !== undefined && isApproximate(content, match.index)) {
          continue;
        }
        const claimed = Number(match[1]);
        if (Number.isFinite(claimed) && claimed !== actualCount) {
          violations.push({
            surface: name,
            detail: `claims "${match[0].trim()}" but ${actualCount} PDR files exist`,
          });
        }
      }
    }
  }
  return violations;
}
