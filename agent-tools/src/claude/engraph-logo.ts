/**
 * castr/engraph mark asset contract for the Claude Code statusline.
 *
 * @remarks
 * The castr sibling of Oak's brand-asset module, brought with the statusline
 * S1 slice (2026-07-03) **without any mark art**: the owner directive is that
 * castr authors its own logo later and never carries the Oak acorn. Until the
 * castr mark exists this module's style union is the single member `'none'`
 * (the single-line statusline layout), so the logo mechanism (cycle engine,
 * frame store, logo-column renderer) is live and tested while the asset slot
 * stays empty.
 *
 * Adding the castr mark later is additive: extend {@link EngraphLogoStyle}
 * with the new style names, hold the frame rows here as verified constants
 * (regenerated from the castr SVG via the brought pipeline under
 * `.agent/research/developer-experience/statusline-logos/`), accept them in
 * {@link resolveLogoStyle}, and return them from {@link resolveLogoRows} —
 * selecting a cycle frame with `frameIndex` from `statusline-logo-cycle`.
 * Every style's rows must keep a uniform per-row display width measured in
 * code points (the renderer tiles its separator to the first row's width).
 *
 * @packageDocumentation
 */

/** Glyph style used to draw the castr mark, or `none` to suppress it. */
export type EngraphLogoStyle = 'none';

/**
 * Resolve an {@link EngraphLogoStyle} from a raw configuration string, such as
 * the `ENGRAPH_STATUSLINE_LOGO` environment variable. Every value resolves to
 * `'none'` until the castr mark lands; the function keeps Oak's
 * unrecognised-value-falls-back contract so future styles slot in without
 * changing callers.
 *
 * @param raw - The raw configuration value, or `undefined` when unset.
 * @returns The resolved logo style.
 */
export function resolveLogoStyle(raw: string | undefined): EngraphLogoStyle {
  if (raw === 'none') {
    return raw;
  }
  return 'none';
}

/**
 * Resolve the rows to render for a logo style and cycle frame.
 *
 * `'none'` renders no logo, so it resolves to `undefined` and the renderer
 * keeps the single-line layout. When castr mark styles exist they return
 * their frame rows here (cycling styles reduce `frame` modulo their frame
 * count via `frameIndex`).
 *
 * @param style - The resolved logo style.
 * @param frame - The per-session render counter (unused until a cycling
 *   castr mark exists; kept so the composition-root call shape is stable).
 * @returns The mark rows to render, or `undefined` for `'none'`.
 */
export function resolveLogoRows(
  style: EngraphLogoStyle,
  frame: number,
): readonly string[] | undefined {
  void style;
  void frame;
  return undefined;
}
