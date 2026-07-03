# ADR-050: Pin a Single Workspace TypeScript via a pnpm-workspace.yaml Override

**Status:** Accepted
**Date:** 2026-06-21
**Related:** [ADR-021](./ADR-021-legacy-dependency-removal.md) (dependency hygiene) · **Evidence:** `.agent/plans/transplant/d1-sonarjs-findings.md` §0 · **Mechanism:** [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml) `overrides`

---

## Context

`eslint-plugin-sonarjs` declares `typescript: ">=5"` as a **regular dependency**
and, under pnpm, otherwise resolves its **own bundled copy** (5.9.3) inside its
subtree. The `typescript-eslint` parser, however, builds `Type` objects with the
**workspace** TypeScript (6.0.3). Each sonarjs type-aware rule then computes
`type.flags & ts.TypeFlags.X` where `ts` is the rule's _own_ 5.9.3 — and TS 5.9
and 6.0 **renumber `ts.TypeFlags`**:

| flag         | TS 6.0.3  | TS 5.9.3  |
| ------------ | --------- | --------- |
| `Undefined`  | 4         | 32768     |
| `Union`      | 134217728 | 1048576   |
| `StringLike` | 12583968  | 402653316 |

So `Union(TS6)=0x08000000` falls _inside_ `StringLike(TS5.9.3)` → `in-operator-type-error`
(S3785) false-fired on every type-safe object-union `in` guard; and
`Undefined(TS6)=4 & Undefined(TS5.9.3)=32768 = 0` → `function-return-type` (S3800)
miscounted `X | undefined` as a second return category. This produced the **D1
126-violation arc** — 126 violations that were neither code smell nor a property
of castr's types, but a **dual-TypeScript-instance skew**. Every bit was
reproduced firsthand (both `typescript` instances loaded, flag values printed, the
collisions confirmed, lint count `126 → 0` on the fix).

The skew is a packaging gap in a dependency, not a fault in TS 6 (SonarQube Cloud,
a different product, runs TS 6 fine) and not a fault in the rules (under aligned
TypeScript they compute correctly and report **zero** violations).

## Decision

Force a **single TypeScript across the workspace** via a `pnpm-workspace.yaml`
override:

```yaml
overrides:
  typescript: 6.0.3
```

Every package — including sonarjs's nested copy — resolves the one workspace
TypeScript. (Pre-override the lockfile carried 80 `typescript@5.9.3` references
incl. sonarjs's own; post-override, zero.) With aligned TypeScript both rules were
restored from `warn` to **`error`** in `lib/eslint.config.ts`, 0 violations, full
`pnpm check` green.

The override version is kept in **lockstep** with the `typescript` devDependency
(`^6.0.3`) in the root / `lib` / `agent-tools` `package.json` on any TypeScript
bump. A pnpm `catalog` was considered as the single-source mechanism but is
heavier machinery than this one pin needs; the `$typescript` reference syntax is
deprecated in pnpm 11 (it pollutes piped tool output with a WARN).

This is a **castr-local toolchain decision** (a genuine local need → an ADR, not a
portable PDR, per PDR-079).

## This is the permanent fix, not an interim workaround

Measured firsthand 2026-06-21 (Q-002 resolution): `eslint-plugin-sonarjs@4.1.0`
(latest) **still** declares `typescript` as a regular dependency, so bumping
sonarjs does **not** retire this override. The override is the correct permanent
fix.

## Consequences

- **Positive:** type-aware lint rules read the correct `TypeFlags`; both sonarjs
  rules gate at `error` with zero false positives; the toolchain is honest.
- **Cost / drift surface:** the pin is a literal that must move in lockstep with
  every TypeScript major. The lockstep requirement is documented inline in
  `pnpm-workspace.yaml`.

## Revisit trigger

Retire the override **only** if `eslint-plugin-sonarjs` moves `typescript` to a
**peer dependency** (so it resolves the workspace TS natively) — an ~indefinite
upstream event. A TypeScript major bump does not retire it; it requires updating
the pinned version in lockstep.
