---
name: dependency-currency
classification: active
description: >-
  Run a full dependency-currency pass — survey with pnpm -r outdated and pnpm
  audit, triage every bump by measured risk tier, execute one type-affecting
  major at a time with baseline-capture proof, drive pnpm audit to zero via
  annotated override floors, and refresh SHA-pinned GitHub Actions against
  verified stable tags. Use when the owner asks to bring dependencies to
  latest, clear audit or Dependabot findings, or reopen a
  dependency-currency lane.
---

# Dependency Currency

Bring the dependency estate to latest with the repository's core capability
**provably unchanged** across every bump. Currency is the outcome; zero
behaviour regression is the constraint. The method was proven on the
2026-06-21 dependency-currency lane (graduated as PDR-097) and its
2026-08-26 reopening; this skill is the reusable form.

## Ground rules

- **One type-affecting or behaviour-affecting major per commit.** Dev-only,
  type-neutral tooling may sweep in one commit; anything on an emission, IR,
  build-output, or product-runtime path gets its own cycle with its own
  proof.
- **Classify by actual call sites, never by reputation.** Before assigning a
  dependency to the low-risk tier, grep its imports and ask: does this touch
  emission, generated output, a data pipeline, or a product runtime? (Worked
  instance: prettier looked like dev tooling but formats emitted code at
  runtime.)
- **Respect the supply-chain cooldown.** `minimumReleaseAge` governs; a
  version held back by the cooldown is recorded and picked up next pass,
  never forced.
- **Read the pinned-version doctrine before bumping pinned surfaces.** Some
  pins are deliberate holds with their own decision records; a currency pass
  honours them (see Holds below).

## Workflow

### 1. Survey

```bash
pnpm install --frozen-lockfile   # fresh container: also activates hooks
pnpm -r outdated                 # honours minimumReleaseAge
pnpm audit                       # security findings incl. transitives
```

Also enumerate the workspace `overrides` block (existing security floors and
their removal conditions) and the CI workflow's `uses:` pins.

### 2. Holds — resolve before triage

- **Node and @types/node**: read the supported Node major from the root
  `package.json` `engines.node` field — never hardcode it:

  ```bash
  node -p "require('./package.json').engines.node"
  ```

  `@types/node` stays on that same major even when newer majors exist: the
  type surface must describe the shipped runtime, never one ahead of it
  (castr: ADR-049). In-range refreshes within the major are fine. Raising
  the Node major is a deliberate, decision-record-amending act that bumps
  `engines`, `@types/node`, any `.nvmrc`, and CI together — out of scope
  for a currency pass.

- **Embedded-compiler alignment**: for any dependency that vendors its own
  compiler or parser (ts-morph vendors TypeScript inside
  `@ts-morph/common`), check what the latest release vendors before bumping
  the workspace counterpart. A workspace TypeScript major ahead of the
  vendored emission engine reintroduces dual-compiler skew on the emission
  path — hold the workspace tool at the vendored engine's major and record
  the hold with its reopen condition (a vendor release that aligns).

### 3. Triage into tiers

| Tier                        | Examples                                              | Proof                                                                 |
| --------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| Type-neutral dev tooling    | eslint core, typescript-eslint, vitest, turbo, knip   | one in-range sweep commit; lint + knip + type-check + tests firsthand |
| Typed / preset lint plugins | sonarjs, boundaries                                   | own micro-cycle; the empirical lint diff is the proof                 |
| Emission / output formatter | prettier (runtime formatter), codegen engines         | baseline-capture, then committed-fixture oracle byte-identical        |
| Data-pipeline vendors       | parser/bundler trios feeding the IR or data model     | pipeline + fixture + drift-test surfaces green; coupled deps together |
| Product runtime             | SDK/server deps, CLI parsing, TUI stacks              | that surface's own test suite, not another workspace's oracle         |
| Held pins                   | Node-major-coupled types, vendored-compiler alignment | documented hold with reopen condition                                 |

### 4. Execute cycles

For each cycle: bump → run that tier's proof → one commit with the proof
stated in the body. For emission/output cycles the committed fixtures are
the baseline — the suites failing loud on drift IS the byte-identical
proof; never regenerate-and-accept a fixture without reading the diff.

A new lint rule enabled by a plugin bump is adopted by fixing the sites
(precedent: adopt-now) **unless it contradicts a standing decision record**
— then the repo's own doctrine governs: configure the rule off with the
decision record cited in the config comment, and keep source churn at zero.
Never silence a rule merely to get green, and never author
`eslint-disable` lines in product code.

When a bump forces a config migration (renamed options), migrate to the new
vocabulary until the run is warning-free, then **prove the gate still
fires**: plant a violation the gate must catch, watch it go red, restore
byte-exact. A gate that never fired before the bump is a finding to route,
not to fix silently inside the lane.

### 5. Audit to zero

Bump direct dependencies first (their transitive refresh clears findings for
free), then floor the remaining transitives in the workspace `overrides`
block. Every floor carries an annotation naming the advisory family, the
path it arrives through, and its **removal condition** (the direct
dependency's own range clearing the floor). Keep a forced transitive on its
consumer's supported major (`^3.x` rather than `>=3.x`) when the latest
major would jump past what consumers declare. Re-run the consumers of every
forced transitive firsthand. Finish at `pnpm audit` reporting zero.

### 6. GitHub Actions pins

For every SHA-pinned `uses:` in workflows and composite actions:

```bash
git ls-remote --tags https://github.com/<owner>/<action>
```

Read the tag→SHA mapping firsthand: annotated tags dereference via the
`^{}` rows (pin the **commit** SHA, not the tag object); stable
semver-tagged releases only, no pre-releases. Verify the existing pin's SHA
actually matches its comment's claimed tag before touching it, update pin
and comment together, and read a major bump's release notes before taking
it.

### 7. Close the lane

- Update the controlling plan's progress section with per-cycle SHAs and
  proofs.
- Route findings surfaced but out of scope (a blind gate, a stale include,
  an architecture question) to the napkin and the plan — never widen the
  lane.
- Run the full aggregate gate (`pnpm check` / `pnpm check:ci`), push, and
  land via PR. Work is not safe until pushed and on a PR.

## Failure handling

A bump that regresses its proof and cannot be fixed forward within the
cycle is reverted with a forward commit (`git revert`) — never patched
around to keep the version. A cooldown-refused version is recorded, not
forced. A finding that needs an architecture or owner decision is routed
with its evidence, not decided inside the lane.
