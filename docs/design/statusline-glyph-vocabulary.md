# Statusline glyph vocabulary

The single-place inventory of every state the Claude Code statusline can
express, the glyph that expresses it, its verification status, and a
probe-ready set of single-cell alternatives. Owner-commissioned 2026-07-10
at the live glyph sitting; the code home for every glyph is
`agent-tools/src/claude/statusline-indicators.ts` (constants at the top of
the module) and `agent-tools/src/claude/statusline-arc-palette.ts` (colour
values).

## The glance contract

The statusline exists so that, scanning several panes, the owner instantly
and correctly reads: which ARC channels each session talks in
(colour-true badges), whether a session wants owner attention (binary,
honestly expiring), and the session's real team shape. Every glyph choice
serves glance speed and glance truth; every STATUS distinction must be
carried by shape or position, never colour alone (the estate's
non-colour-cue refusal — colour alone may carry channel _identity_, which
is redundantly covered by badge order and count).

## Why this doc exists (the system was never designed as one)

The vocabulary accreted per-cycle, and five separate rendering defects
surfaced in two days of live use: the feather rendered small inside
styled runs; the family icon renders washed/small; the cross-host U+21C4
was tofu; DIM-wrapped emoji were unverified for weeks; and the
double-width feather's art underfills its box, faking a gap beside
zero-gap neighbours. The common cause: **emoji are double-width,
font-fragile glyphs whose rendering varies per terminal and can only be
verified by the owner's eye.** This doc ratifies the vocabulary as a
system, records what is verified, and stages single-cell alternatives so
future swaps are probe-then-land, never redesign.

## Width and rendering mechanics (read before choosing any glyph)

- **East Asian Width (EAW) classes decide cell count.** Emoji
  (pictographs) are `W` — two cells. Most BMP symbols are `N`/`Na` — one
  cell. **Trap: `A` (Ambiguous) glyphs (★ ☆ ○ ● § † ‡ and many others)
  render one cell in Western-configured terminals but TWO in
  CJK-configured ones** — acceptable here (the owner's terminals are
  Western-configured) but recorded per-candidate below.
- **Emoji-variation trap**: some BMP codepoints (the U+2190–U+21FF and
  U+2600–U+27BF ranges especially) have emoji presentations; a terminal
  or font may bloom them into colour emoji. U+2194–U+2199 and U+2B05-ish
  arrows are the canonical offenders; U+21C4/U+21C5 are NOT
  emoji-variation but ARE font-coverage-fragile (U+21C4 was tofu).
- **Art underfill**: a two-cell emoji's ink rarely fills its box (the
  feather leans left ~1.5 cells), so visual gaps exist that composition
  cannot close. Single-cell block glyphs whose ink reaches their cell
  edge (U+258C half-left — itself EAW=A, single-cell only in Western-configured terminals, like most block and geometric glyphs) are the only true "hugging" carriers.
- **DIM on emoji** is a deliberate, owner-verified exception (2026-07-10:
  eyes and compass render full-size dimmed) — the module invariant bans
  COLOUR/background SGR around emoji, not intensity.
- **Probe transport**: any block the owner will paste MUST encode every
  non-ASCII character as `\uXXXX` / `\U000XXXXX` escapes — literal
  multibyte glyphs corrupt in the clipboard path, and different glyphs
  collapse to IDENTICAL mojibake (a comparison probe can silently fail
  while looking like a result). Transcripts strip ESC bytes: only the
  owner's eye verifies a rendering, never a log.

## Current vocabulary (all states, one table)

| State                    | Meaning at a glance                   | Glyph           | Codepoint       | Cells | Styling                          | Verified                                                                                     |
| ------------------------ | ------------------------------------- | --------------- | --------------- | ----- | -------------------------------- | -------------------------------------------------------------------------------------------- |
| Identity                 | who this session is                   | `name (prefix)` | text            | —     | magenta run                      | live panes 2026-07-10                                                                        |
| Director demark          | "I am the director"                   | 🧭              | U+1F9ED         | 2     | bare, after RESET                | full-colour, live pane 2026-07-10                                                            |
| Team: directed           | my team has a director                | 👪              | U+1F46A         | 2     | bare                             | **KNOWN DEFECT: renders washed/small**                                                       |
| Team: peer               | fresh peers, no director              | 🤝              | U+1F91D         | 2     | bare                             | 2026-06-13                                                                                   |
| Team: solo               | confident peerless                    | 🧍              | U+1F9CD         | 2     | bare                             | 2026-06-13                                                                                   |
| Team: observing          | others active, I hold no claim        | 👀              | U+1F440         | 2     | one DIM run                      | dim verified 2026-07-10                                                                      |
| Team: observing-directed | non-member; a directed estate is live | 👀🧭            | U+1F440 U+1F9ED | 4     | one DIM run                      | verified 2026-07-10; mutually exclusive with the demark by construction                      |
| Team: unknown            | registry unreadable                   | _nothing_       | —               | —     | —                                | absence over false signal, by design                                                         |
| ARC badge base           | one live channel                      | 🪶              | U+1FAB6         | 2     | bare (never in colour runs)      | full-size bare, 2026-07-09; art underfills box                                               |
| Badge: membership colour | WHICH channel                         | ▌               | U+258C          | 1     | palette foreground ink           | ruled 2026-07-10 (replaced centered U+25AE)                                                  |
| Badge: invalid           | channel violates schema / colour-less | ●               | U+25CF          | 1     | red 220,60,60 ink                | ruled 2026-07-09/10 — error by shape AND colour                                              |
| Badge: overflow          | more channels than the read budget    | +               | ASCII           | 1     | DIM run                          | 2026-07-09                                                                                   |
| Badge: cross-host marker | channel crosses machines              | ⇅               | U+21C5          | 1     | DIM run, between feather and bar | ruled 2026-07-10 (U+21C4 was tofu); multi-badge composition pends the next live guest window |
| Attention                | session wants the owner               | ?               | ASCII           | 1     | styled, location row             | live-fired 2026-07-10                                                                        |
| Palette (8 inks)         | channel identity hues                 | —               | RGB values      | —     | 38;2 foreground                  | ruled 2026-07-10; luminance band [0.14, 0.30] gate-enforced                                  |

ASCII fallbacks if a font regresses: `[D]` `[T]` `[P]` `[S]` `[A]` `[o]`
`[od]` (comment-recorded in the indicators module; no code path consumes
them yet).

## Single-cell alternatives (staged, UNVERIFIED until owner-eye)

The five emoji are the double-width, font-fragile population. Candidates
below are one cell, chosen for semantic fit and font coverage; EAW class
and emoji-variation risk are marked (classes are best-effort from Unicode data — re-verify EAW per candidate at adoption time). Nothing here is ruled — each row is
probe-ready material for a future sitting. The family icon (the one
KNOWN-DEFECT glyph) is the natural first swap.

| State                    | Current        | Single-cell candidates (codepoint, EAW, risk)                                                                                                     |
| ------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Director demark          | 🧭             | `✦` U+2726 N; `‡` U+2021 A (CJK 2-cell risk); `†` U+2020 A                                                                                        |
| Team: directed           | 👪 (defective) | `⌂` U+2302 N (house = directed household); `≡` U+2261 A (ranked lines); `∆` U+2206 N                                                              |
| Team: peer               | 🤝             | `∥` U+2225 A (parallel peers); `=` ASCII; `≈` U+2248 A                                                                                            |
| Team: solo               | 🧍             | `○` U+25CB A; `·` U+00B7 A; the ASCII vertical bar U+007C                                                                                         |
| Team: observing          | 👀             | `◉` U+25C9 N (eye-like); `◎` U+25CE A; `%` ASCII                                                                                                  |
| Team: observing-directed | 👀🧭           | observing candidate + demark candidate in one DIM run, e.g. `◉⌂`                                                                                  |
| ARC badge base           | 🪶             | `❯` U+276F N; `»` U+00BB A; `♪` U+266A N — semantic fit weakest here; the feather is also the best-verified emoji, so swapping it is lowest-value |

Notes: (1) an all-text vocabulary would also dissolve the DIM-on-emoji
exception and the art-underfill gap class entirely — the trade is
distinctiveness (emoji are faster to tell apart peripherally than thin
symbols); (2) mixed vocabularies are legitimate — each state swaps
independently; (3) any candidate adoption follows the change protocol
below, including the owner-eye probe, because EVERY rendering claim in
this table below the "Verified" column is per-terminal.

Probe block for the leading candidates (paste-proof, every glyph escaped):

```bash
D='\x1b[2m'; X='\x1b[0m'
printf "directed: \u2302 | peer: \u2225 | solo: \u25CB | observing: ${D}\u25C9${X} | obs-dir: ${D}\u25C9\u2302${X} | demark: \u2726\n"
```

## The swap architecture (how a glyph change lands)

Current shape — a swap is three small edits plus one honest probe:

1. **Product constant** — every glyph is a named module-level constant in
   `statusline-indicators.ts` (`DIRECTOR_MARK`, `TEAM_*_ICON`, `ARC_WING`,
   `MEMBERSHIP_BAR`, `INVALID_DOT`) or an inline literal in `featherBadge`
   (the cross-host marker — extraction candidate). Colour values live only
   in `statusline-arc-palette.ts`; no other module or test hardcodes them.
2. **Test constant, re-pinned deliberately** — the exact-ANSI test file
   keeps its OWN copy of each glyph (`statusline-render-session-shape.unit.test.ts`).
   This duplication is **load-bearing, never DRY it away**: a pin that
   imported the product constant would follow any accidental change and
   catch nothing. The red-first shape: re-pin the test constant, watch the
   composed pins fail, then flip the product constant.
3. **Docs** — this table, and any doc-comment naming the old glyph.
4. **Owner-eye probe** — required whenever the change enters a new
   rendering class (new codepoint, new styling interaction); skippable for
   pure value retunes inside an already-gated property (e.g. palette
   values inside the luminance band, which a recomputing unit invariant
   enforces).

Recommended hardening (small follow-up, not yet landed): extract the
glyph constants into a dedicated `statusline-glyphs.ts` vocabulary module
— one importable home matching this doc one-to-one, making the inventory
mechanically checkable and giving the cross-host marker a named constant.
The test-side duplicates stay exactly as they are.

## Change log

- 2026-07-10 — doc created at the owner sitting. Carrier U+258C, marker
  U+21C5, dark palette landed the same day; two-tone palette recorded
  not-now (revisit only if hues prove hard to distinguish in daily use;
  the light-half-saturates-on-attention variant idea is conserved in the
  lane plan checklist §item 5).
