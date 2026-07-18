/**
 * Pure layout for the Claude Code statusline.
 *
 * @remarks
 * Assembles the statusline from already-gathered values. Holds no I/O: the
 * adapter (`statusline-identity.ts`) gathers the git facts and session shape and
 * delegates here. Segment colouring lives in `statusline-segments.ts`; this file
 * owns only the line/row layout.
 *
 * Row order puts the short, fixed-width segments first — identity (with
 * indicators) on one row, the model beside or beneath it — and the labelled
 * git-location rows last, with the usage gauges on the repo-title row after
 * the title: the context % (owner layout preference, 2026-07-03) then the
 * rate-limit gauges (owner layout ruling, 2026-07-18). A loud error token,
 * when present, leads the output in any layout so it cannot be missed.
 *
 * The git-location rows come pre-composed from `statusline-segments.ts`: the
 * checkout name then its branch when the session's checkout is the only relevant
 * location, or the primary checkout's name, its `coord:`-prefixed branch, and a
 * worktree row (name and branch) when the session sits in a linked worktree.
 * Without logo rows these render as plain lines after the summary; with logo
 * rows they sit to the right of the logo-column rows, and a location row beyond
 * the logo rows renders as a bare line so it is never dropped.
 *
 * The logo column is consumed as **already-resolved rows** (asset resolution —
 * style, frame selection — happens in the composition root against
 * `engraph-logo.ts`). This is deliberately Oak's statusline-logo-modularisation
 * target shape (WS4.1: the renderer consumes resolved rows, no by-name asset
 * import) applied at the bring, because castr ships the mechanism with no mark
 * art; recorded as an Oak back-flow candidate in the S1 bring notes.
 *
 * @packageDocumentation
 */

import { DIM, GREEN, RESET } from './statusline-ansi.js';
import {
  buildSegments,
  joinPresent,
  type Segments,
  type StatuslineParts,
} from './statusline-segments.js';

export type { StatuslineParts } from './statusline-segments.js';

const LOGO_COLOUR = GREEN;
/** Gap between the logo column and the segment text, in the multi-row layout. */
const LOGO_GAP = '  ';
/** Default rule glyph for the logo separator row, tiled to the logo width. */
const LOGO_SEPARATOR_GLYPH = '_';

/** Optional presentation controls for {@link renderStatusline}. */
export interface StatuslineRenderOptions {
  /**
   * Already-resolved mark rows for the logo column (uniform per-row display
   * width, measured in code points). `undefined` or empty renders the original
   * layout without the logo column — still one or more rows depending on the
   * error and coordination-branch lines. The adapter resolves these from the
   * configured style and per-session cycle frame via `engraph-logo.ts`.
   */
  readonly logoRows?: readonly string[];
  /**
   * Rule glyph for the horizontal separator beneath the logo block. **On by
   * default** (omit for the default glyph); tiled and trimmed to the active
   * logo's display width. Pass an empty string to suppress the rule. Only the
   * logo layout carries it.
   */
  readonly logoSeparator?: string;
}

/**
 * Assemble the statusline from gathered segment values.
 *
 * @param parts - The resolved segment values.
 * @param options - Optional presentation controls (e.g. resolved logo rows).
 * @returns The ANSI-coloured statusline (multi-line without a logo; the
 *   logo-column rows with a trailing separator with one).
 *
 * @example
 * ```ts
 * renderStatusline({
 *   identity: 'Windswept Winging Cliff',
 *   dir: 'castr',
 *   branch: 'feat/transplant-engraph-practice',
 *   dirty: true,
 *   worktree: undefined,
 *   usedPercentage: 12,
 *   model: 'Fable 5',
 *   sessionShape: undefined,
 *   coordinationBranch: undefined,
 *   coordinationPlace: undefined,
 *   error: undefined,
 * });
 * // → identity row, "Fable 5" row, then "castr · ctx:12%" and the branch row.
 * ```
 */
export function renderStatusline(
  parts: StatuslineParts,
  options: StatuslineRenderOptions = {},
): string {
  const seg = buildSegments(parts);
  const logoRows = options.logoRows;
  return logoRows === undefined || logoRows.length === 0
    ? renderNoLogo(seg)
    : renderWithLogo(seg, logoRows, options);
}

/**
 * No-logo layout: a loud error first, the identity summary, then the
 * pre-composed labelled location rows. Empty lines (all their segments absent) are
 * dropped so no blank row renders.
 */
function renderNoLogo(seg: Segments): string {
  const summaryLine = joinPresent([seg.identity, seg.indicators, seg.model]);
  return [seg.error, summaryLine, ...locationRowsWithUsage(seg)]
    .filter((line): line is string => line !== undefined && line.length > 0)
    .join('\n');
}

/**
 * Location rows with the usage gauges appended to the repo-title row: the
 * context gauge after the title (owner layout preference, 2026-07-03 — a
 * deliberate castr divergence from Oak's model-row placement), then the
 * rate-limit gauges after the context gauge (owner layout ruling, 2026-07-18 —
 * `castr · ctx:61% · s:19%(5h) · w:14%(6d)`). Usage reads alongside WHERE the
 * session is working, not in the identity summary. Outside any location row
 * the gauges still render on their own line rather than being dropped.
 */
function locationRowsWithUsage(seg: Segments): readonly string[] {
  const usage = joinPresent([seg.context, seg.rateLimits]);
  if (usage === undefined || usage.length === 0) {
    return seg.locationRows;
  }
  const [titleRow, ...rest] = seg.locationRows;
  return titleRow === undefined ? [usage] : [joinPresent([titleRow, usage]), ...rest];
}

/**
 * Logo layout: one rowText per segment-bearing row, zipped with the logo rows by
 * {@link composeWithLogo}. A loud error leads the block in any layout.
 */
function renderWithLogo(
  seg: Segments,
  logoRows: readonly string[],
  options: StatuslineRenderOptions,
): string {
  const rowTexts = [
    joinPresent([seg.identity, seg.indicators]),
    joinPresent([seg.model]),
    ...locationRowsWithUsage(seg),
  ];
  const content = composeWithLogo(logoRows, rowTexts);
  const separatorRow = buildLogoSeparator(options.logoSeparator, logoRows);
  const block = separatorRow === undefined ? content : `${content}\n${separatorRow}`;
  return seg.error === undefined ? block : `${seg.error}\n${block}`;
}

/**
 * Compose the logo rows with the per-row segment text. Each logo row always
 * renders (the mark stays whole); the gap and text are appended only when that
 * row has segment text. A segment row beyond the logo block renders as a bare
 * text line below the mark so it is never dropped.
 */
function composeWithLogo(logoRows: readonly string[], rowTexts: readonly string[]): string {
  const rowCount = Math.max(logoRows.length, rowTexts.length);
  const lines: string[] = [];
  for (let index = 0; index < rowCount; index += 1) {
    const logoRow = logoRows[index];
    const text = rowTexts[index] ?? '';
    if (logoRow === undefined) {
      if (text.length > 0) {
        lines.push(text);
      }
      continue;
    }
    const mark = `${LOGO_COLOUR}${logoRow}${RESET}`;
    lines.push(text.length > 0 ? `${mark}${LOGO_GAP}${text}` : mark);
  }
  return lines.join('\n');
}

/**
 * Build the separator rule beneath the logo, tiled and trimmed to the logo's own
 * display width (code points, not UTF-16 units — astral glyphs count once).
 *
 * @param separator - Rule glyph; defaults to {@link LOGO_SEPARATOR_GLYPH} when
 *   `undefined`. An empty string suppresses the rule.
 * @param logoRows - The active logo's rows; the first row's width sets the rule width.
 * @returns The coloured separator row, or `undefined` when suppressed or no rows.
 */
function buildLogoSeparator(
  separator: string | undefined,
  logoRows: readonly string[],
): string | undefined {
  const glyph = separator ?? LOGO_SEPARATOR_GLYPH;
  const firstRow = logoRows[0];
  if (glyph.length === 0 || firstRow === undefined) {
    return undefined;
  }
  const width = [...firstRow].length;
  const rule = [...glyph.repeat(width)].slice(0, width).join('');
  return `${DIM}${rule}${RESET}`;
}
