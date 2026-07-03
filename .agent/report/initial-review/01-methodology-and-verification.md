# Methodology and Verification

**Date:** 2026-06-04

## Governing rule

> All output from the discovery agents was treated as **candidate leads only**. Every load-bearing claim that appears in
> this report as a _finding_ was verified first-hand against source. Second-hand "the agent reproduced X" was never
> accepted on its own.

This rule shaped the whole process: the workflow fanned out to _find_ candidates fast and broadly; the orchestrator
(me) then _proved or refuted_ each one — preferring execution of the real compiled code over any narrative.

## Step 1 — Ground truth from the gates (🟢 ran gate/tool)

Before any agent ran, all 14 quality gates were executed from a clean `pnpm install`. **Every gate passed.**

| Gate                  | Result    | Gate                     | Result       |
| --------------------- | --------- | ------------------------ | ------------ |
| `pnpm build`          | ✅ exit 0 | `pnpm knip`              | ✅ exit 0    |
| `pnpm type-check`     | ✅ exit 0 | `pnpm portability:check` | ✅ exit 0    |
| `pnpm lint`           | ✅ exit 0 | `pnpm test`              | ✅ 129 files |
| `pnpm madge:circular` | ✅ exit 0 | `pnpm character`         | ✅ 16 files  |
| `pnpm madge:orphans`  | ✅ exit 0 | `pnpm test:snapshot`     | ✅ 69 files  |
| `pnpm depcruise`      | ✅ exit 0 | `pnpm test:gen`          | ✅ 6 files   |
|                       |           | `pnpm test:transforms`   | ✅ 23 files  |
|                       |           | `pnpm test:e2e`          | ✅ 3 files   |

**Consequence:** real findings cannot be gate failures. They must live in what the gates do not check — which is exactly
where they were found. This is itself the central insight (see `07`).

## Step 2 — Mechanical doctrine facts gathered first-hand (🔵 / 🟢)

Escape-hatch and discipline facts were gathered by `grep`/`eslint` directly (more authoritative than any agent for
deterministic facts), and cross-checked against the _enforced_ `lib/eslint.config.ts` rather than the _declared_
`principles.md`. This is what surfaced the doctrine-vs-enforcement matrix in `06` (e.g. `Object.*`/`Reflect.*` used 148×
in product code while declared "forbidden").

## Step 3 — Discovery workflow (candidate generator)

A 14-agent workflow swept the codebase across the pipeline (OpenAPI/Zod/JSON-Schema parsers; OpenAPI/Zod/TS/JSON/MD
writers; IR/conversion/compatibility; context/endpoints/rendering; shared/CLI/validation) and four cross-cutting
dimensions (determinism, fail-fast, test quality, proof/honesty). Agents were required to return, per finding: exact
`file:line`, a **verbatim source quote**, the claim, the doctrine reference, a confidence rating, and a suggested fix.
The verbatim-quote requirement existed solely to make orchestrator verification cheap.

- **Agents returned:** 14 / 14.
- **Raw candidates:** 86.
- **After de-duplication:** the 86 collapse to **46 distinct findings** (C1–C6, H1–H7, M1–M13, L1–L19, N1) plus 9
  rejected/downgraded (e.g. the Zod-refinement no-ops were reported by 4
  agents; `isRecord`-rejects-`{}` by 3; `maybePretty` by 3; `contentEncoding` by 2). The full mapping is in `10`.

## Step 4 — Verification (the load-bearing step)

Each distinct candidate was verified by one or more of:

1. **🟢 Executing the built `dist`** — the decisive method for behavioural claims. Two probe scripts
   (`/tmp/castr-probe.mjs`, `/tmp/castr-probe2.mjs`, reproduced in `appendix-A`) drove `parseZodSource`, `buildIR`,
   `writeOpenApi`, `serializeIR`/`deserializeIR`, `parseJsonSchema`, `getZodSchema`, and `getTypescriptFromOpenApi`
   against the exact inputs each claim implicated, and the output was inspected.
2. **🟢 Running the project's own tooling** — e.g. a one-file Vitest run proved the vacuous `toContain` assertion
   (H7); the export-target existence check and a clean `tsc --emitDeclarationOnly` run proved C1.
3. **🔵 Reading the exact cited lines** and the surrounding control flow, plus reachability (`grep` for callers /
   public-API exposure) to calibrate severity.

Candidates that survived become findings (`02`–`05`); candidates that were refuted or over-stated become `08`.

## Step 5 — Severity calibration via reachability

Severity was not taken from the agents. Each finding was checked for **reachability through the public/shipped path**,
which moved several ratings:

- **Down:** `additionalProperties: true → false` writer narrowing is _latent_ — `buildIR` fail-fasts on that input
  (🟢 reproduced), so it cannot be hit today (L8, not high). The TypeScript type writer's enum/const widening is real
  but reachable only from `tests-snapshot`, not the public API (N1, not high).
- **Confirmed live:** C2–C6 were each reproduced through public exports, so they keep their high ratings.

## Verification legend

| Tag              | Meaning                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------- |
| 🟢 ran code      | executed compiled `dist`, observed behaviour                                            |
| 🟢 ran gate/tool | ran `pnpm`/`eslint`/`tsc`/`vitest`, read result                                         |
| 🔵 read source   | read the exact lines + surrounding logic                                                |
| 🟡 mechanism     | shared code path with an executed sibling; verified by reading, not separately run      |
| ⚪ reported      | from the sweep, included for completeness, not independently re-verified (low/nit only) |

## What was NOT done (honest limits)

- The review covers the repo **at this commit**. Whether the _npm-published_ 1.18.3 tarball differs from a local build
  was not inspected; C1's reasoning is from the deterministic build config, which would behave identically in CI.
- A few low/nit candidates are marked ⚪ in `10` where independent re-verification would have added cost without
  changing the picture; none of the Critical/High/Medium findings are ⚪.
- This is a correctness/doctrine review, not a performance or security-penetration audit.
