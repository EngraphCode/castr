/**
 * Pure aggregation layer for the ARC channel-file structural gate. The exact
 * grammar is owned by `src/arc/arc-channel-grammar.ts` (single source — the
 * doc describes, the code enforces); this layer maps it over a corpus of
 * already-read surfaces and attaches the remediation pointer every finding
 * carries (the fitness-vocabulary soft-binding precedent: validator output
 * cites the canonical prose home).
 *
 * IO lives in the runtime entry (`validate-arc-channels.ts`), which feeds this
 * layer TRACKED files only — a peer's in-flight live-append on an untracked
 * or modified channel must never red another seat's gate.
 *
 * @packageDocumentation
 */

import {
  ARC_PALETTE_SIZE,
  ARC_SCHEMA_ADOPTION_DATE,
  evaluateArcChannelStrictness,
  parseArcChannel,
  type ArcFinding,
} from '../../arc/arc-channel-grammar.js';

/** One channel surface: repo-relative name + full content. */
export interface ArcChannelSurface {
  readonly name: string;
  readonly content: string;
}

/** An {@link ArcFinding} carrying its remediation pointer. */
export interface ArcValidationFinding extends ArcFinding {
  /** Where the convention is stated in prose — the citation gate output shows. */
  readonly remediation: string;
}

const REMEDIATION =
  'ARC channel structure convention: .agent/reference/arc-rapid-communication.md §Conventions ' +
  '(grammar authoritative in agent-tools/src/arc/arc-channel-grammar.ts)';

/**
 * Evaluate the tiered structural contract over every surface. Order is
 * per-file, file order preserved — deterministic output for gate logs.
 */
export function validateArcChannelSurfaces(
  surfaces: readonly ArcChannelSurface[],
): readonly ArcValidationFinding[] {
  return surfaces.flatMap((surface) =>
    evaluateArcChannelStrictness(parseArcChannel(surface.name, surface.content), {
      adoptionDate: ARC_SCHEMA_ADOPTION_DATE,
      paletteSize: ARC_PALETTE_SIZE,
    }).map((finding) => ({ ...finding, remediation: REMEDIATION })),
  );
}
