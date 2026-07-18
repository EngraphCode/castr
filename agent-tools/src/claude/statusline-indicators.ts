/**
 * Coordination-indicator formatting for the Claude Code statusline.
 *
 * @remarks
 * Owns the glanceable coordination vocabulary — the Director demark on the
 * identity, the team-shape icon, and the ArcAngel wing — separated from the
 * layout composition in `statusline-render.ts` so each file holds one concern
 * and the glyph set can grow without pressing the renderer's size budget.
 * Holds no I/O: it formats from an already-resolved {@link SessionShape}.
 *
 * Module invariant: **emoji never render inside COLOUR or background SGR
 * runs.** Badged feathers wrapped in a background SGR rendered small and
 * washed against the bare feather in the owner's terminals (screenshots
 * 2026-07-09; the in-run rendering mechanism varies by terminal and is
 * deliberately not relied on). Colour and emphasis travel in ADJACENT styled
 * BMP glyphs — the zero-gap membership bar, the red invalid dot, a styled
 * `+` — whose shapes and adjacency the owner ruled first-hand from live
 * terminal probes (2026-07-10 sitting: half-left bar U+258C carrier — its ink starts at its cell edge beside the double-width feather whose art underfills its box
 * zero-gap; red dot U+25CF invalid, error by shape as well as colour). The
 * one deliberate exception class: DIM-intensity runs around the QUIET glyphs
 * (the observing eyes, the observing-directed eyes+compass) — an unproven
 * presentation carried as PENDING owner terminal verification, never as
 * settled precedent. Any new glyph work preserves this invariant.
 *
 * @packageDocumentation
 */

import { DIM, MAGENTA, RESET } from './statusline-ansi.js';
import { ARC_ERROR_FOREGROUND, arcBadgeForeground } from './statusline-arc-palette.js';
import { type ArcBadgeColour, type SessionShape } from './statusline-session-shape.js';

/**
 * Session-shape indicator glyphs — five verified in the owner's terminals
 * (2026-06-13): DIRECTOR_MARK, TEAM_DIRECTED_ICON, TEAM_PEER_ICON, TEAM_SOLO_ICON,
 * ARC_WING. The original peer glyph U+1F465 (busts) tofu'd and was replaced by
 * U+1F91D. TEAM_OBSERVING_ICON (U+1F440, eyes) was added 2026-06-14 for the
 * non-member "others are active here" shape and is PENDING owner terminal
 * verification. DIRECTOR_MARK carries two meanings that are MUTUALLY
 * EXCLUSIVE per render (the demark requires a fresh OWN director claim,
 * which forces teamShape to `directed`; `observing-directed` requires
 * non-membership, under which no demark can resolve — a future change
 * surfacing directorship to MEMBERS as a trailing compass would break this
 * exclusivity and must re-derive the disambiguation): suffixing the identity
 * full-colour = "I am the director"; trailing the dim eyes inside the DIM
 * run = a non-member "observing a DIRECTED estate" (Director ruling
 * 2026-07-10) — same fact (a directorship is present), read from two seats,
 * separated by position AND colour-vs-dim. The dimmed composed state
 * (eyes+compass in one DIM run) is PENDING owner terminal verification,
 * same batch as the sl-6 owner-eye items. ASCII fallbacks if a
 * font regresses: `[D]` `[T]` `[P]` `[S]` `[A]` `[o]` `[od]`.
 */
const DIRECTOR_MARK = '\u{1F9ED}';
const TEAM_DIRECTED_ICON = '\u{1F46A}';
const TEAM_PEER_ICON = '\u{1F91D}';
const TEAM_SOLO_ICON = '\u{1F9CD}';
const TEAM_OBSERVING_ICON = '\u{1F440}';
const ARC_WING = '\u{1FAB6}';
const MEMBERSHIP_BAR = '\u{258C}';
const INVALID_DOT = '\u{25CF}';

/**
 * Format the identity segment, suffixing the Director demark when this session's
 * fresh claim carries the director role. The bare identity doubles as the
 * registry-matching key (exact agent_name equality — the dual-use guard), so no
 * decoration is ever added to the name inside the styled run. Undefined identity
 * drops the segment (and the demark with it — a directorship needs an identity
 * to resolve).
 */
export function formatIdentity(
  identity: string | undefined,
  ownRole: string | undefined,
): string | undefined {
  if (identity === undefined) {
    return undefined;
  }
  const demark = ownRole === 'director' ? ` ${DIRECTOR_MARK}` : '';
  return `${MAGENTA}${identity}${RESET}${demark}`;
}

/**
 * Format the team-shape icon and the ArcAngel feathers as one segment, or
 * undefined when there is nothing to show — only an unknown shape (or no
 * resolved shape) with no live channel renders blank; a confident solo
 * carries its own marker. One feather renders PER live channel this session
 * participates in (badge order is the resolver's stable name order), so a
 * seat in two channels wears two feathers.
 */
export function formatSessionIndicators(shape: SessionShape | undefined): string | undefined {
  if (shape === undefined) {
    return undefined;
  }
  const team = teamIcon(shape.teamShape);
  const feathers = shape.arcChannels.map((badge) => featherBadge(badge.colour, badge.crossHost));
  const indicators = [team, ...feathers].filter((glyph) => glyph !== undefined).join(' ');
  return indicators.length === 0 ? undefined : indicators;
}

/**
 * One feather badge per channel: a full-size bare feather followed, with zero
 * gap, by a foreground-coloured BMP glyph carrying the channel's recorded
 * palette index, so the same conversation wears the same colour in every
 * participating seat's statusline and the feather renders identically to the
 * bare glyph (module invariant: emoji never sit inside colour or background
 * SGR runs). The
 * three states are all deliberate and owner-ruled (live terminal probes,
 * 2026-07-10): `indexed` hugs its membership bar U+258C (half-left, ruled at the 2026-07-10 sitting
 * — the zero intra-badge gap is strictly tighter than the one-space
 * inter-badge join, so the eye pairs each colour with ITS feather);
 * `invalid` hugs the loud red dot U+25CF — error by SHAPE as well as colour,
 * a colour-less or violating channel is never quiet, and the cure is one
 * append-only `Channel-colour` line; `overflow` (beyond the bounded read
 * budget) trails a dimmed `+` so a hidden channel is visible as "more than
 * shown", never silently dropped. A cross-host guest window (PDR-138)
 * additionally wears a dim U+21C5 marker between the feather and the colour (U+21C4 was tofu in the owner terminal, re-ruled 2026-07-10)
 * glyph — a BMP text glyph, so styling it does not breach the emoji
 * invariant. Membership-hue ink values and the cross-host-window adjacency
 * (the bar hugs the marker there, not the feather) are pinned pending the
 * batched owner-eye verification (the PENDING pattern above).
 */
function featherBadge(colour: ArcBadgeColour, crossHost: boolean): string {
  // The dim U+21C5 cross-host marker sits immediately after the feather and
  // before the colour glyph. For indexed/invalid it is its own DIM run ahead
  // of the bar/dot; for overflow it folds into the single DIM run that also
  // carries the `+`.
  const marker = crossHost ? `${DIM}\u{21C5}${RESET}` : '';
  if (colour.kind === 'indexed') {
    return `${ARC_WING}${marker}${arcBadgeForeground(colour.index)}${MEMBERSHIP_BAR}${RESET}`;
  }
  if (colour.kind === 'invalid') {
    return `${ARC_WING}${marker}${ARC_ERROR_FOREGROUND}${INVALID_DOT}${RESET}`;
  }
  if (colour.kind === 'overflow') {
    return crossHost ? `${ARC_WING}${DIM}\u{21C5}+${RESET}` : `${ARC_WING}${DIM}+${RESET}`;
  }
  return assertNever(colour);
}

/** Compile-time exhaustiveness sink: a new variant must be handled above. */
function assertNever(value: never): never {
  throw new Error(`unhandled variant: ${JSON.stringify(value)}`);
}

/**
 * Map a resolved team shape to its glyph: `solo` shows its own marker;
 * `observing` (others active, this session not registered) shows a dimmed eyes
 * glyph — distinct from membership and deliberately quieter, so the glance
 * reads as "be collision-aware" rather than "you are on a team";
 * `observing-directed` (a fresh director claim positively read while this
 * session is a non-member — Director ruling 2026-07-10) trails the dim eyes
 * with the compass in the same DIM run, "observing a DIRECTED estate": route
 * via the Director, expect claims discipline; `unknown` shows nothing (an
 * unreadable surface reads as absence, never a false solo). The dim-compass
 * presentation and the eyes/compass adjacency are PENDING owner terminal
 * verification (the batched owner-eye moment), like the dim eyes themselves.
 */
function teamIcon(teamShape: SessionShape['teamShape']): string | undefined {
  if (teamShape === 'directed') {
    return TEAM_DIRECTED_ICON;
  }
  if (teamShape === 'peer') {
    return TEAM_PEER_ICON;
  }
  if (teamShape === 'solo') {
    return TEAM_SOLO_ICON;
  }
  if (teamShape === 'observing') {
    return `${DIM}${TEAM_OBSERVING_ICON}${RESET}`;
  }
  if (teamShape === 'observing-directed') {
    // One DIM run for the one glance-unit — extending the sibling `observing`
    // eyes above, the module's one DIM-on-quiet-glyphs exception state (NOT
    // the overflow badge, whose emoji stays outside its DIM run).
    return `${DIM}${TEAM_OBSERVING_ICON}${DIRECTOR_MARK}${RESET}`;
  }
  if (teamShape === 'unknown') {
    // An unreadable surface reads as absence, never a false glyph.
    return undefined;
  }
  return assertNever(teamShape);
}
