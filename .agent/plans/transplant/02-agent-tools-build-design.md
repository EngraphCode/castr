# Phase 2 sub-plan — `@engraph/agent-tools` build + gate integration

**Source:** a dedicated design pass (Plan agent) + firsthand verification. **Status:** design captured 2026-06-05;
execute in Phase 2. Items marked **⚠️verify** were asserted by the design pass and not yet independently read — verify at
execution per the firsthand rule. Items marked **✅verified** I checked against source this session.

> Why this file exists: this is the hardest, least-recoverable phase. The parent plan carries only a summary; the full
> actionable design lived only in session context. Persisted here so Phase 2 is resumable without it.

> **⚠️ Reconciled to Oak's 2026-06-05 state. Baseline advanced `06018bc3` → `2c85bc01`** (re-synced mid-Phase-2
> execution, owner-flagged; the agent-tools delta was 5 hook-policy/guard files, now folded in). The corrections are
> below. Headline changes: **(1)** `postinstall`
> is now a **`tsx` bootstrap script** (`agent-tools/src/bootstrap/bootstrap.ts`) that runs `tsc` directly — **not**
> `turbo run build` — with turbo and pnpm deliberately kept out of the install lifecycle (enforced by the new
> `validate-lifecycle-scripts` validator); **(2)** PreToolUse guards run from prebuilt **`dist`** via
> `.claude/hooks/run-pretooluse-guard.mjs`; as of `2c85bc01` (`89ec8dcf`) an **unbuilt `dist` fails OPEN** (exit 0 + loud
> warning — so a fresh/branch-switched worktree is not bricked and can still run the install/build that creates the
> guard), while a **built-but-broken guard still fails CLOSED** (exit 2); the postinstall bootstrap guarantees `dist`
> after install; **(3)** the validator set grew to **seven** (added
> `lifecycle-scripts`, `pretooluse-guard-routing`, `fitness-vocabulary`); **(4)** `tsx` is now a required devDep and
> runtime deps moved to majors (`typescript ^6`, `eslint ^10`, `uuid ^14`, `ink ^7`, `zod ^4.4`). Oak is a moving target
> — **re-read `agent-tools/` fresh at Phase-2 execution** before relying on any specific below.

---

## 1. Workspace + turbo integration

- **`pnpm-workspace.yaml`:** add `agent-tools` to `packages:` (keep `lib`; keep `allowBuilds`). Place the package at repo
  root `/agent-tools/` (so `resolveRepoRoot` walk-up + `node agent-tools/dist/...` idioms transplant unchanged). ✅verified
  castr is a turbo pnpm monorepo `packages: [lib]`.
- **`agent-tools/package.json` localise:** `name` `@oaknational/agent-tools`→`@engraph/agent-tools`; keep `private`,
  `type: module`, `version 0.1.0`. **Remove** devDep `@oaknational/eslint-plugin-standards` (no such workspace in castr).
  Keep runtime deps verbatim — **as of Oak 2026-06-05:** `ajv ^8, ink ^7, react ^19, tinyglobby ^0.2, typescript ^6,
uuid ^14, yaml ^2, zod ^4.4` — ✅verified `src/` has **0** `@oaknational` imports, so deps are generic. Keep devDep
  **`tsx ^4.22`** (NEW — required: `postinstall` and the guard/CLI scripts run via `tsx`); other devDeps `@types/node`,
  `@types/react`, `eslint ^10`, `globals`, `ink-testing-library`, `vitest ^4`. The majors (`typescript ^6`, `eslint ^10`,
  `uuid ^14`) are self-contained in agent-tools' own configs and never touch `lib`'s toolchain. Keep the `build` script
  exactly (`tsc -p tsconfig.build.json && chmod +x dist/src/bin/*.js dist/src/claude/statusline-identity.js` — the
  `chmod` makes hook bins executable).
- **tsconfig:** do **NOT** add agent-tools as a project reference of root `tsconfig.json` (root has `exclude: [".agent"]`
  and is consumed by `lib`'s depcruise — referencing would pull agent-tools into lib's graph). Oak's
  `agent-tools/tsconfig.json` extends `../tsconfig.base.json` which won't exist in castr → **inline** the needed options
  (NodeNext module/resolution, ES2022 target, strict, `jsx: react-jsx`, `types: ["node"]`, `noEmit:true`). Oak's current
  `tsconfig.build.json` **extends `./tsconfig.json`** with `rootDir: "."`, `outDir: "dist"`, `noEmit:false`,
  `declaration` + `declarationMap` + `sourceMap`, and `include: ["src/**/*.ts", "src/**/*.tsx"]` — mirror that shape.
  **⚠️verify** the exact compiler options against Oak's current tsconfig at execution.
- **`turbo.json`:** no new task _types_ needed — agent-tools inherits `build` (`dependsOn ^build`, `outputs dist/**`,
  `cache:false`) as a workspace member, so `dist/` builds in the `^build` wave. Only ensure agent-tools' package scripts
  name-match existing turbo tasks (`build/type-check/lint/test/test:e2e`).
- **eslint:** castr has **no root eslint config** (`lib` has its own ADR-036 boundary config). Give agent-tools its own
  `agent-tools/eslint.config.ts` from castr's installed devDeps (`@eslint/js`, `typescript-eslint`,
  `eslint-plugin-import-x`, `eslint-plugin-prettier`, `eslint-plugin-sonarjs`, `eslint-config-prettier`) — NOT Oak's
  `@oaknational/eslint-plugin-standards`. Scope `**/*.{ts,tsx}`; ignore `dist/`; `no-console: off` for `src/bin/**`.
- **knip / depcruise / madge are lib-scoped** (✅verified: `lib/knip.ts`, `lib/.dependency-cruiser.cjs`,
  `lib/scripts/run-madge.mjs`) → they do NOT see agent-tools. (Oak registers agent-tools entry points — incl. the new
  validators, per commit `2ae88e6a` — in a **root `knip.config.ts`**; castr's knip is lib-scoped, so castr instead adds a
  dedicated **`agent-tools/knip.json`**.) Entries must include `src/bin/**`, every `src/validators/*/validate-*.ts` (all
  seven), `src/hook-policy/check-*.ts`, `src/bootstrap/bootstrap.ts`, `src/**/*.test.ts`, plus a minimal
  `agent-tools/.dependency-cruiser.cjs` (no-circular + no-orphans, same entry roots) so the package has parity coverage
  without false dead-code/orphan flags.

## 2. Install / build ordering (hook-artefact freshness)

- **`postinstall: tsx agent-tools/src/bootstrap/bootstrap.ts`** in root `package.json` (Oak 2026-06-05 — **not** the
  earlier `turbo run build`). The bootstrap script builds **only** agent-tools `dist` by invoking `tsc -p
tsconfig.build.json` directly (+ the chmod), deliberately keeping **turbo and pnpm out of the install lifecycle** — a
  purity the new **`validate-lifecycle-scripts`** validator enforces. `typescript` is a direct (non-dev) dependency so the
  compiler is present even on `--prod`/`--frozen-lockfile` installs; a missing compiler fails loud rather than leaving the
  guards without `dist`. `OAK_SKIP_AGENT_TOOLS_BOOTSTRAP=1` opts out. → bring the `bootstrap/` module (`bootstrap.ts` +
  `bootstrap-helpers.ts`) and localise the `tsx` postinstall.
- **PreToolUse guards run from prebuilt `dist`, not source:** `.claude/settings.json` routes them through
  `.claude/hooks/run-pretooluse-guard.mjs agent-tools/dist/src/hook-policy/check-blocked-patterns.js` (and
  `check-blocked-content.js`). As of Oak `2c85bc01` the runner **fails OPEN** (warns) when the guard artefact is
  **unbuilt** — so a fresh / branch-switched worktree is not bricked — and **fails closed** only when a _built_ artefact
  is broken; the postinstall bootstrap still guarantees `dist`. The freshness mechanism is the
  **postinstall bootstrap**, not a pre-commit guard.
- **`.husky/pre-commit`:** Oak's now routes formatting/markdownlint through `agent-tools:repo-check
prettier-staged`/`markdownlint-staged` and runs `repo-validators:check`. castr keeps its simpler staged-prettier pass
  (markdownlint is DON'T-BRING — castr has no markdownlint; seam E) and no longer needs the old `[ ! -f … ]` build guard
  now that postinstall bootstraps `dist`. Do NOT wire blocked-patterns/blocked-content as commit-blocking until the hook
  estate is proven (Phase 6/8).
- **`.husky/pre-push`** (`pnpm check:ci`) already `clean && install --frozen-lockfile` → postinstall rebuilds `dist`; no
  edit needed for freshness. ✅verified `check:ci` does NOT run `fix` — so transplanted docs must be pre-formatted/committed
  (seam A).
- **Phase 2 commit MUST include the regenerated `pnpm-lock.yaml`** (new agent-tools deps incl. `tsx`) or
  `--frozen-lockfile` pre-push fails.

## 3. Gate adoption schedule (blocking day-one vs informational-first)

New scripts in root `package.json`: `subagents:check`, `repo-validators:check`, `skills:check` (`--prefix=engraph-`),
`practice:substrate:check`, `practice:vocabulary`, `practice:fitness:informational`, `practice:fitness` (strict, **never**
in blocking `qg`). **Oak 2026-06-05:** `repo-validators:check` now aggregates `validate-no-stale-script-invocations`,
`validate-collaboration-state`, `validate-lifecycle-scripts`, and `validate-pretooluse-guard-routing` (drop Oak's
`@oaknational/eslint-plugin-standards` boundary check — no such workspace in castr), plus a standalone
`validate-fitness-vocabulary`. The full validator set is now **seven**: `collaboration-state`, `fitness-vocabulary`,
`lifecycle-scripts`, `portability`, `pretooluse-guard-routing`, `stale-script-invocations`, `subagents`.

| Gate                                               | Day-one                    | Flips blocking                      | Note                                                               |
| -------------------------------------------------- | -------------------------- | ----------------------------------- | ------------------------------------------------------------------ |
| agent-tools `build` / `type-check` / `lint`        | **blocking**               | —                                   | self-contained; own configs                                        |
| agent-tools `test`                                 | **informational**          | after **seam F** fixtures localised | tests assert Oak paths — see seam F                                |
| `practice:fitness:informational`                   | **blocking-but-inert**     | stays informational                 | ✅verified always exits 0 — never red-gates SACRED `principles.md` |
| `practice:substrate:check` / `practice:vocabulary` | informational @1           | blocking @9                         | meaningful once Core carries frontmatter                           |
| `repo-validators` (stale-script)                   | informational              | blocking @4                         | needs `SCANNED_ROOTS`/`ALLOWLISTED_PATHS` localised (drop `apps`)  |
| `repo-validators` (collaboration-state)            | informational              | blocking @8                         | empty state validates trivially                                    |
| `subagents:check`                                  | informational @2           | blocking @6/7                       | needs `.cursor`/`.codex` agent wrappers                            |
| `skills:check --prefix=engraph-`                   | informational @3           | blocking @3 end                     | needs `SKILL-CANONICAL.md` + regenerated adapters                  |
| Oak `validate-portability`                         | introduce informational @7 | blocking @7 end                     | needs RULES_INDEX/.claude rules/hooks/skills-lock to exist         |

> **New validators (Oak 2026-06-05) — proposed schedule:** `lifecycle-scripts` informational @2 → blocking @2-end
> (enforces turbo/pnpm out of the install lifecycle); `pretooluse-guard-routing` informational @2 → blocking @6/8 (needs
> the hook estate to exist); `validate-fitness-vocabulary` informational @1 → blocking @9.

**Portability reconciliation (✅verified `scripts/validate-portability.mjs` is a subagents/Codex validator, misnamed):**
keep it as the live `portability:check` through Phases 1–6; at Phase 7 flip `portability:check`→Oak `validate-portability`
and `subagents:check`→blocking, **only after porting its 5 Codex assertions** (`model_reasoning_effort`, `sandbox_mode`,
`approval_policy`, thin-adapter banner, canonical-template pointer) into `validate-subagents` or a kept
`codex-adapter:check`; then retire the bespoke script. Do not silently drop coverage.

**`qg` end-state (after Phase 9):** `build → format:check → type-check → lint → madge:circular/orphans → depcruise → knip →
subagents:check → portability:check → skills:check → repo-validators:check → practice:substrate:check →
practice:vocabulary → practice:fitness:informational → test:all`. Strict `practice:fitness` stays a separate advisory.

## 4. Per-phase verification harness

```
pnpm clean && pnpm install                 # postinstall rebuilds agent-tools/dist
test -f agent-tools/dist/src/bin/agent-tools.js && test -x agent-tools/dist/src/bin/agent-tools.js
pnpm format <new files> && commit          # .agent is NOT prettier-ignored (seam A)
pnpm format:check && pnpm type-check && pnpm lint
pnpm madge:circular && pnpm madge:orphans && pnpm depcruise && pnpm knip
<phase-appropriate practice/agent gates per the schedule above>
pnpm test:all && pnpm test:e2e
node agent-tools/dist/src/bin/<reference-closure>.js --roots .agent/rules,.agent/skills,.agent/sub-agents/templates,.agent/practice-core
git diff --stat <prev-phase-tag> HEAD && git status --porcelain   # empty
# tag transplant/phase-N
```

"Green per phase" = `pnpm check` passes + 0 `rewrite`-class reference-closure findings in touched files + every
`placeholder` maps to a later phase + clean tree.

## 5. Risk seams (where castr's existing green gates break) + mitigations

- **A — `format:check` on `.agent` docs (HIGHEST).** ✅verified `.prettierignore` excludes `**/reference/**` but NOT
  `.agent`. `check:ci` (pre-push) doesn't run `fix`. → every phase `pnpm format`s new docs and commits the formatted result.
  (Oak patterns staged under `.agent/reference/**` would be prettier-exempt.)
- **B — `knip`.** lib-scoped → agent-tools invisible (won't fail it, but unchecked). → add `agent-tools/knip.json` with
  bin/validators as entries.
- **C — `depcruise`.** lib-scoped (runs `depcruise src` in lib). → add minimal `agent-tools/.dependency-cruiser.cjs`.
- **D — `madge:orphans`.** lib-scoped → declare agent-tools bin/validator/hook entry roots in the agent-tools config to
  avoid false orphans.
- **E — `lint` / markdownlint.** castr has no markdownlint (Oak does) → Oak markdownlint findings irrelevant; the real risk
  is prettier reflow (seam A). agent-tools TS lint uses its own config (§1).
- **F — agent-tools' own tests assert Oak paths. ⚠️verify.** As of Oak 2026-06-05 there are **seven** validators, each
  with unit tests, plus hook-policy tests (`check-blocked-patterns.unit/.integration.test.ts`,
  `guard-runner-decisions.unit.test.ts`) and `bootstrap/bootstrap-helpers.unit.test.ts`. The Oak-path-encoding ones to
  localise: `validators/portability`, `validators/stale-script-invocations`, `validators/subagents`,
  `validators/lifecycle-scripts`, `validators/pretooluse-guard-routing` → `pnpm --filter @engraph/agent-tools test` fails
  until localised. Localise `SCANNED_ROOTS` (drop `apps`, keep `.agent/...`, `docs`, `.github/workflows`) +
  `ALLOWLISTED_PATHS` (castr plan paths) + any `@oak/*`/`oak-` fixture strings, THEN make `test` blocking. **Read these
  test files first at execution.**
- **G — bespoke-validator coverage gap.** see §3 portability reconciliation — port the 5 Codex assertions before retiring.

## 6. Safety / rollback

- New branch off `main`… **corrected to off `docs/initial-deep-review`** (see parent plan). Tag each phase
  `transplant/phase-N` (rollback anchors + regression-diff baselines).
- One atomic commit per phase; explicit pathspecs (never `git add -A`); `Co-Authored-By` trailer.
- Roll back **forward** only: before commit → `git restore`/`stash`; after commit pre-push → `git revert`; after push →
  revert-forward. Never `reset --hard`/force-push (and once the hook policy lands in Phase 2+, those are blocked anyway).
- `dist/` and `.agent/state/collaboration/*` runtime are gitignored → aborting never strands build/state artefacts.

## Flagged assumptions to verify at execution (⚠️)

1. agent-tools test fixtures that assert Oak paths (seam F) — read the three test files before making `test` blocking.
2. Whether `skills-adapter-generate` emits `.gemini`/`.windsurf` adapter forms (Phase 7) — if not, those adapters are
   deferred-pending-generator-support (recorded in the relevance ledger).
3. Exact Oak `agent-tools/tsconfig*.json` options to inline (§1).
4. Whether any of the 7 generic directives (Phase 5) cite dropped Oak ADRs (reference-closure).
