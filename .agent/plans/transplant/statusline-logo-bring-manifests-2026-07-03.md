---
title: Statusline + logo-handling bring-manifests (owner-directed, 2026-07-03)
status: current
lane: current
created: 2026-07-03
owner_directive: >-
  "I would like to bring over the in-repo enhanced statusline code and config, so I can
  see the additional information. Do not bring over the oak logo, do bring over all code
  for handling logo creation and use, we will create a new logo for this repo"
  (owner, 2026-07-03).
provenance: >-
  Produced by the delta-review plan (oak-castr-delta-review-2026-07-03.md) W2 directed
  lanes: two manifest agents (workflow run wf_929147cf-1a5) with every load-bearing
  disposition re-checked firsthand by the authoring session (Windswept Winging Cliff,
  0ceb5f). Oak read live from main via git show; castr from the working tree.
---

# Statusline + logo-handling bring-manifests (2026-07-03)

The per-file execution manifests for the owner-directed statusline and logo-handling
brings. This document is the bring-slice input; the backlog spine stays
[`oak-castr-gap-rescan-2026-06-28.md`](./oak-castr-gap-rescan-2026-06-28.md) (its
§Delta amendment names these lanes' position in the sequence).

## Naming and design determinations (authoring session, signposted)

Normalisations over the two agents' wording, plus dissolved questions — each a
determination under standing doctrine, none an owner gate:

1. **Env-var prefix is `ENGRAPH_`** (`ENGRAPH_STATUSLINE_LOGO`,
   `ENGRAPH_STATUSLINE_MOTION`), matching the established
   `ENGRAPH_AGENT_IDENTITY_OVERRIDE` rename pattern. State dir:
   `engraph-statusline-frames`. The logo manifest's `CASTR_*` wording is superseded.
2. **The castr logo-asset module is `engraph-logo.ts`** with the same export surface as
   Oak's `oak-logo.ts` (closed style union incl. `'none'`, `resolveLogoStyle`,
   `resolveLogoRows`), shipping **default `'none'` and zero art** until the castr mark
   is authored (owner-flagged follow-on). No placeholder-art debt.
3. **Landing shape: as-built `claude/` layout** (the statusline manifest's verdict),
   with the logo-asset seam cut exactly as Oak's pending modularisation plan designs it
   at the one file where it matters (`engraph-logo.ts` as pure asset + mechanism
   modules brand-free). Full three-layer `statusline/` neutral relayering stays a
   future shared improvement (Oak back-flow compatible) — do not fork the layout while
   Oak's own refactor is unlanded.
4. **The session-shape known defect comes over FIXED in the same slice** (absent
   active-claims registry → teamShape `'unknown'` → no icon; the solo-floor cure Oak's
   pending icons plan names). castr doctrine: known issues are blocking and fixed in
   the same work item, never parked. Oak-faithful divergence recorded with an Oak
   back-flow note (LC1-family precedent: parity-or-better + back-flow, never silent
   divergence).
5. **Bring `refreshInterval: 10` and the worktree-safe `${CLAUDE_PROJECT_DIR}` command
   form** (the owner asked for the config). The WCAG 2.2.2 motion tension Oak documents
   is moot while the logo defaults to `'none'`; re-decide the motion posture in the
   castr-mark follow-on slice (recorded there, not silently dropped).
6. **The Cursor installer's user-global `~/.cursor/cli-config.json` absolute-path write
   is acceptable**: run-time generated user-machine state, not repo-committed content —
   outside `no-machine-local-paths`' scope (repo content). Noted, not a violation.
7. **Copyright guard (logo lane):** `statusline-logos.md` embeds the Oak acorn SVG under
   an explicit Oak National Academy copyright notice — that SVG and every acorn
   render/payload MUST NOT enter castr. The method/recipe/generators come; the mark
   does not.
8. **Iceberg additions the manifests surfaced:** export castr's private `isClaimStale`
   (verify the two bodies agree — a divergence silently changes claim-staleness
   semantics repo-wide); `statusline-usage` needs no session-metadata dependency
   (gauges read the vendor stdin `rate_limits` fields via `statusline-identity-input`),
   but the separate `session-metadata` module is its own delta-backlog item;
   `session-identity-hook.unit.test.ts` presence-verified but not full-diffed —
   spot-check at bring time.

## Bring-slice shape (sequencing)

- **Slice S1 — statusline enhancement (owner-visible):** the module set + tests +
  wiring below, logo default `'none'`, session-shape defect fixed, `ENGRAPH_` renames,
  settings block (`refreshInterval` + worktree-safe command). TDD per module family;
  full gates green; proof = the rendered multi-row statusline in a live session.
- **Slice S2 — Cursor wing:** the two `.cursor/scripts` files + the pnpm proxy
  (TC1b item, expanded below).
- **Slice S3 — logo-creation pipeline:** the research/toolkit brings below (docs +
  generators, art excluded), landing the pipeline castr's future mark regenerates from.
- **Follow-on (owner-shaped): castr mark authoring** — new SVG → frames via the brought
  pipeline → populate `engraph-logo.ts` + its test literals + motion-posture decision.

## Statusline manifest

**castr current state (verified firsthand):** castr carries the Q-003-era minimal
statusline: 4 modules (`session-identity-hook.ts` byte-identical to Oak bar the
deliberate `ENGRAPH_AGENT_IDENTITY_OVERRIDE` rename; `statusline-identity.ts` 135-line
adapter already routed through `core/trusted-git`; `statusline-identity-input.ts`
(older ancestor — no `rate_limits` parsing); `statusline-render.ts` 89-line single-line
renderer), 3 test files, the `.claude/scripts/statusline-identity.mjs` shim
(near-identical to Oak's), a `statusLine` settings block (command only, no
`refreshInterval`), and the build/bootstrap chmod plumbing (identical to Oak's).
Absent vs Oak main: 11 src modules, 7 test files, the entire Cursor statusline wing,
`refreshInterval`, and all statusline research docs. Transitive deps verified present:
`core/trusted-git.ts`, `core/json-narrowing.ts`, `core/agent-identity/`,
`collaboration-state/state-parsers.ts` + `types.ts`, and the identical
active-claims read path. Verified gaps: `isClaimStale` private in castr
(`claims.ts:46`) vs exported in Oak (`claims.ts:56`); `.agent/collaboration/rapid-comms/`
absent (ArcAngel is its own Tier-1 backlog item — the wing indicator degrades
gracefully until it lands). Oak plan states: worktree-rows arc DELIVERED 2026-06-29
(location rows, model+context row, s:/w: rate-limit gauges with countdowns,
`refreshInterval: 10`); icons plan PENDING (its interim resolver carries the
session-shape defect fixed per determination 4); logo-modularisation plan PENDING.

**Seam:** the logo/art seam cuts through four src + two test files; the cut line is
mechanism-vs-brand-bytes, not file boundaries. `statusline-logo-cycle.ts` and
`statusline-frame-store.ts` are pure brand-free mechanism (clean brings).
`oak-logo.ts` is the only art-bearing module: its export surface is the generic asset
contract (recreate as `engraph-logo.ts`); its frame constants are excluded acorn art.
`statusline-render.ts` / `statusline-identity.ts` adapt by repointing one import. Two
live behaviours ride the mechanism side and must not be dropped as "logo stuff":
per-render frame cycling (event-driven, WCAG-self-limiting) and the motion kill-switch
(renamed `ENGRAPH_STATUSLINE_MOTION`) — both are the identity operation over a
one-frame or `'none'` asset.

| oak_path                                                           | disposition         | castr target                                          | notes (deps abridged — full import lists verified by the manifest agent)                                                                                                                                                                                                  |
| ------------------------------------------------------------------ | ------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent-tools/src/claude/statusline-ansi.ts`                        | **bring**           | same path                                             | 26-line brand-neutral ANSI SGR palette; zero imports; foundation for indicators/segments/usage/render. Verbatim.                                                                                                                                                          |
| `agent-tools/src/claude/statusline-countdown.ts`                   | **bring**           | same path                                             | 40-line pure `formatCountdown` for rate-limit reset countdowns; zero imports. Post-rescan NEW (worktree-rows arc). Verbatim.                                                                                                                                              |
| `agent-tools/src/claude/statusline-usage.ts`                       | **bring**           | same path                                             | 62-line context-percentage + rate-limit gauges (`s:NN%(2h)` / `w:NN%(3d)`, green→yellow→red ramp, DIM countdown). Deps: ansi, countdown. Post-rescan NEW. Verbatim.                                                                                                       |
| `agent-tools/src/claude/statusline-git-location.ts`                | **bring**           | same path                                             | 218-line pure fail-loud git-location classification (working branch + coordination branch from `git worktree list --porcelain`); zero imports. Verbatim.                                                                                                                  |
| `agent-tools/src/claude/statusline-git-io.ts`                      | **adapt**           | same path                                             | 236-line single impure git boundary via `core/trusted-git` (castr HAS). REPLACES castr's inline `gatherGitState` (replace-dont-bridge).                                                                                                                                   |
| `agent-tools/src/claude/statusline-session-shape.ts`               | **adapt**           | same path                                             | 202-line pure solo/peer/directed/observing resolver + ArcAngel wing. Adapt: export castr's private `isClaimStale` (verify bodies agree); rapid-comms absent → wing dark until ArcAngel (graceful). Fix the absent-registry→no-icon defect in-slice (determination 4).     |
| `agent-tools/src/claude/statusline-indicators.ts`                  | **bring**           | same path                                             | 85-line identity + session-shape icon formatting. Deps: ansi, session-shape. Verbatim.                                                                                                                                                                                    |
| `agent-tools/src/claude/statusline-segments.ts`                    | **bring**           | same path                                             | 217-line segment builder incl. DELIVERED labelled location rows + model+context row. Deps: ansi, indicators, session-shape, usage. Verbatim.                                                                                                                              |
| `agent-tools/src/claude/statusline-logo-cycle.ts`                  | **bring**           | same path                                             | 115-line pure brand-free frame-cycle engine (`frameIndex`, `parseFrameCounter`, `isMotionDisabled`, `frameCounterPath`, `FrameCounterStore` port). Rename motion env var to `ENGRAPH_STATUSLINE_MOTION`.                                                                  |
| `agent-tools/src/claude/statusline-frame-store.ts`                 | **adapt**           | same path                                             | 98-line brand-free FS `FrameCounterStore` (XDG state dir, owner-only modes 0o700/0o600, injectable fs). One adapt: state-dir constant `oak-statusline-frames` → `engraph-statusline-frames`.                                                                              |
| `agent-tools/src/claude/oak-logo.ts`                               | **exclude-art**     | `agent-tools/src/claude/engraph-logo.ts` (new)        | The one art-bearing module. EXCLUDE the acorn frame/row constants; RECREATE the export surface (closed style union incl. `'none'`, `resolveLogoStyle`, `resolveLogoRows` via `frameIndex`) as a castr asset file, default `'none'`, zero art until the castr mark exists. |
| `agent-tools/src/claude/statusline-render.ts`                      | **adapt**           | same path (replaces castr's 89-line renderer)         | 186-line pure multi-row renderer (logo column + segments, width-matched separator). Repoint logo import to `engraph-logo.ts`. Known Oak GREEN-paint hardcode brought as-built (modularisation is future shared work).                                                     |
| `agent-tools/src/claude/statusline-identity.ts`                    | **adapt**           | same path (replaces castr's 135-line adapter)         | 217-line composition root: git-io facts, active-claims + rapid-comms reads, logo style/frame resolution (`ENGRAPH_` renames), renders. Reconcile castr's agent-identity-CLI identity-seed derivation at bring time.                                                       |
| `agent-tools/src/claude/statusline-identity-input.ts`              | **adapt**           | same path (extend existing)                           | Oak adds `rate_limits` parsing (five_hour/seven_day used_percentage + resets_at) feeding the gauges. Bring the delta.                                                                                                                                                     |
| `agent-tools/src/claude/session-identity-hook.ts`                  | **already-present** | —                                                     | Verified by full diff: byte-identical bar the deliberate override-env rename.                                                                                                                                                                                             |
| `agent-tools/tests/claude/statusline-session-shape.test.ts`        | **bring**           | same path                                             | 431-line resolver spec (staleness, membership relativity, ArcAngel window). Verbatim; extend for the defect fix.                                                                                                                                                          |
| `agent-tools/tests/claude/statusline-render-session-shape.test.ts` | **adapt**           | same path                                             | 211-line render+shape integration; repoint acorn-pinning assertions to fixture/castr asset.                                                                                                                                                                               |
| `agent-tools/tests/claude/statusline-render.unit.test.ts`          | **adapt**           | same path (replaces castr's old renderer test)        | 273 lines, behaviour-shaped (ANSI-stripped relationships, no row-index pins). Adapt acorn pins only.                                                                                                                                                                      |
| `agent-tools/tests/claude/statusline-git-location.unit.test.ts`    | **bring**           | same path                                             | 273-line fail-loud classification matrix. Verbatim.                                                                                                                                                                                                                       |
| `agent-tools/tests/claude/statusline-countdown.unit.test.ts`       | **bring**           | same path                                             | Verbatim.                                                                                                                                                                                                                                                                 |
| `agent-tools/tests/claude/statusline-frame-store.unit.test.ts`     | **bring**           | same path                                             | Verbatim modulo state-dir rename.                                                                                                                                                                                                                                         |
| `agent-tools/tests/claude/statusline-logo-cycle.test.ts`           | **bring**           | same path                                             | Brand-free (fixture frames, in-memory store). Verbatim modulo motion env rename.                                                                                                                                                                                          |
| `agent-tools/tests/claude/statusline-identity-input.test.ts`       | **adapt**           | same path (extend existing)                           | Bring the rate_limits parsing cases with the src delta.                                                                                                                                                                                                                   |
| `agent-tools/tests/claude/oak-logo.test.ts`                        | **exclude-art**     | `agent-tools/tests/claude/engraph-logo.test.ts` (new) | Acorn byte-pins excluded; recreate the MECHANISM assertions (fallback matrix, frame-count/width-uniformity/distinctness — code-point width, astral-aware) around the castr asset.                                                                                         |
| `agent-tools/tests/claude/session-identity-hook.unit.test.ts`      | **already-present** | —                                                     | Same path/lines both sides; spot-diff at bring time (presence-verified only).                                                                                                                                                                                             |
| `.claude/scripts/statusline-identity.mjs`                          | **already-present** | —                                                     | Verified by full diff (one comment-word difference).                                                                                                                                                                                                                      |
| `.claude/settings.json` (statusLine block)                         | **adapt**           | same block                                            | Add `"refreshInterval": 10`; switch command to `node ${CLAUDE_PROJECT_DIR}/.claude/scripts/statusline-identity.mjs` (worktree-robust). Determination 5.                                                                                                                   |
| `.cursor/scripts/statusline-identity.mjs`                          | **bring**           | same path                                             | Cursor shim spawning the built Claude adapter. castr has no `.cursor/scripts`. = TC1b `install-cursor-statusline` expansion.                                                                                                                                              |
| `.cursor/scripts/install-statusline-cli-config.mjs`                | **bring**           | same path                                             | Idempotent merger into user-global Cursor CLI config (determination 6). Localise header wording.                                                                                                                                                                          |
| `package.json` (script)                                            | **adapt**           | add one line                                          | `"agent-tools:install-cursor-statusline": "node .cursor/scripts/install-statusline-cli-config.mjs"` (verified absent in castr).                                                                                                                                           |
| `agent-tools/package.json` build chmod + `bootstrap.ts` chmod      | **already-present** | —                                                     | Verified identical both sides.                                                                                                                                                                                                                                            |
| `.agent/research/statusline-inputs-research.md`                    | **bring**           | same path                                             | The grounded vendor-contract doc (stdin fields incl. rate_limits, env vars, re-run triggers, terminal-theme-unknowable constraint). Load-bearing for every module; not art.                                                                                               |

## Logo-handling manifest

**Scope note (verified):** every logo-estate file predates the 2026-06-28 rescan window
— this manifest is the owner-directed precision redraw of the rescan's coarse
"(oak-logo art = OUT-OF-SCOPE)" parenthesis: bring ALL handling/creation code and
pipeline; exclude ONLY the acorn art, frame data, payloads, and renders.

**Seam (from full reads of the three modules + importer graph):** the only art in the
whole agent-tools estate is the row-string literals inside `oak-logo.ts` (and their
byte-pins in its test). Cycle engine, frame store, style resolution, column
composition, motion gating, and XDG/security handling are all brand-free mechanism.
The creation pipeline splits the same way: `statusline-logos.md` holds the method AND
the copyrighted acorn SVG (bring method, exclude SVG — determination 7); the python
generators are pipeline code with the acorn as an embedded input constant (bring,
swap input); the `statusline/*.sh` payloads and all `renders/*` are verified generator
OUTPUT (excluded as regenerable art — their reduce-motion scaffold pattern survives in
the generators that emit it and the techniques doc).

| oak_path                                                                           | disposition           | castr target                                      | notes                                                                                                                                                                                                                                                                                                                |
| ---------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent-tools/src/claude/statusline-logo-cycle.ts` (+test)                          | **bring**             | same paths                                        | Pure engine — owned by the statusline manifest above; listed for seam completeness.                                                                                                                                                                                                                                  |
| `agent-tools/src/claude/statusline-frame-store.ts` (+test)                         | **adapt**             | same paths                                        | FS adapter — owned above; state-dir rename.                                                                                                                                                                                                                                                                          |
| `agent-tools/src/claude/oak-logo.ts` (+test)                                       | **adapt/exclude-art** | `engraph-logo.ts` (+test)                         | Seam file — owned above (determination 2).                                                                                                                                                                                                                                                                           |
| `agent-tools/src/claude/statusline-render.ts`, `statusline-identity.ts`            | **adapt**             | —                                                 | Seam files owned by the statusline manifest (logo-column mechanism + composition-root wiring ride there); listed so the manifests join without a gap.                                                                                                                                                                |
| `.agent/plans/agent-tooling/current/statusline-logo-modularisation.plan.md`        | **adapt**             | castr-scheme plan (with the castr-mark follow-on) | Oak's pending three-layer design (generic LogoAsset/ResolvedLogo/composeLogoColumn + asset-as-data) + the load-bearing colour findings (terminal theme not knowable; OSC 11 unreadable; use theme foreground + DIM). Bring as the design blueprint; drop Oak-execution specifics.                                    |
| `.agent/research/developer-experience/statusline-logos/statusline-logos.md`        | **adapt**             | same path                                         | BRING the creation method (rasterise → dot-grid → area-coverage → threshold → glyph-pack; regeneration recipe; render-back verification; braille/quad/sextant portability findings). EXCLUDE the embedded Oak acorn SVG (explicit Oak copyright). Re-author with the source-SVG slot pointed at castr's future mark. |
| `…/generate-braille-sharp-variants.py`                                             | **adapt**             | same path                                         | The seeded frame-variant generator (sub-cell phase offset + threshold jitter + contact-sheet verification). Bring pipeline; adapt art constants (FRAME0, DEFAULT_SEEDS, 7×5 grid → parameterise for castr's mark).                                                                                                   |
| `…/braille-sharp-variants.png`                                                     | **exclude-art**       | —                                                 | Regenerable acorn contact sheet.                                                                                                                                                                                                                                                                                     |
| `…/terminal-animation-without-redraw/README.md`                                    | **adapt**             | same path                                         | Toolkit map; note renders as "regenerate for the castr mark".                                                                                                                                                                                                                                                        |
| `…/terminal-animation-techniques.md`                                               | **bring**             | same path                                         | Generalised ANSI/VT animation techniques reference (event-driven static-payload animation, SGR-5 two-frame model, braille sub-cell halftone, delta-L* contrast, reduce-motion). Near-verbatim.                                                                                                                       |
| `…/terminal-animation-toolkit/generators/01–05_*.py` (5 files)                     | **adapt**             | same paths (05 rename to `05_final_mark.py`)      | Creation-pipeline generators (two-frame swap, glow halo, polychrome spokes, mono shimmer, full composition with sRGB↔linear + L* palette + flood-fill masks + umbra + halftone). All generic; each embeds the acorn as its input constant — bring, swap input for castr's mark.                                      |
| `…/terminal-animation-toolkit/statusline/*.sh` (5 files)                           | **exclude-art**       | —                                                 | Verified generator OUTPUT: reduce-motion shell scaffold wrapping pre-rendered acorn ANSI payloads. Regenerate from the brought generators.                                                                                                                                                                           |
| `…/terminal-animation-toolkit/renders/**` (14 files incl. progression/)            | **exclude-art**       | —                                                 | Rendered acorn previews/stills/design-history. Regenerable; excluded per directive.                                                                                                                                                                                                                                  |
| `apps/oak-curriculum-mcp-streamable-http/public/oak-national-academy-logo-512.png` | **exclude-art**       | —                                                 | Oak brand PNG in an already-OUT-OF-SCOPE product app. Doubly excluded; not handling code.                                                                                                                                                                                                                            |

## Completeness proof

The logo manifest was checked against the full `git -C <oak> ls-tree -r main | grep -i
logo` inventory (40 hits): every hit is dispositioned above (statusline-manifest seam
entries included by name). The statusline manifest covers the full
`agent-tools/src/claude/` + `tests/claude/` estate plus all wiring surfaces named by
the rescan's Tier-2 statusline entry and TC1b.
