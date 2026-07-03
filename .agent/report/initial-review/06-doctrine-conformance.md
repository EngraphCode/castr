# Doctrine Conformance — Declared vs Enforced vs Reality

**Date:** 2026-06-04

This document synthesises the cross-cutting gap between what `principles.md`/ADRs _declare_, what `lib/eslint.config.ts`

- the gates _enforce_, and what the code _does_. It references finding IDs rather than re-describing them. The pattern
  matters as much as the individual items: **the doctrine is, in several places, stricter or more permissive than the
  tooling that is supposed to guarantee it** — which is itself the "code, proofs, and docs must agree" honesty rule
  turned on the doctrine.

## Governing remediation principle (user directive, 2026-06-04)

> **Where code, proofs, and docs disagree, normalise to the _strictest_ of the three.**

This removes the "tighten _or_ soften" choice: the answer is always to **raise the other two up to the strictest
contract**, never to relax the strict one. In practice it resolves to three moves:

1. **Doc is strictest (the common case)** — fix the code and add the proofs to meet it. The losslessness/fail-fast/
   determinism/single-source claims are correct and strict; the code/proofs are lax → bring them up (C2–C6, H1–H4, H7,
   M2, M7, M8, M10, M11, L12, L13, …), and **add the missing lint rules** so the strict claim becomes machine-enforced
   (M1, M2, L2, L5).
2. **Enforcement/code is strictest** — tighten the _doc_ to match. The linter bans test-`as` while the doc permits it
   (L1); the validator/parser enforce closed-world while the type/TSDoc permit `boolean | CastrSchema` (H6/L8). Strict
   resolution: remove the doc's permission / narrow the type to the enforced reality.
3. **Docs claim a capability that is absent** — implement the documented (stricter) behaviour _and prove it_; removal is
   only the fallback when the behaviour is genuinely unwanted (H5 default-response filtering, L7 `expected`/`received`,
   L10/M9 fail-fast messages). Under "strictest", prefer implementing the stricter contract over deleting the claim.

> ⚠️ Moves (1)'s lint additions touch `eslint.config.ts` (allowed). Moves (2)/(3) that edit `principles.md` or ADR-026
> require explicit user approval, per the note at the top of `principles.md`. Those doc edits are _tightenings_ (removing
> a permission, narrowing a type claim), consistent with the strictest-normalisation rule.

## The conformance matrix

| Doctrine claim                                                              | Declared in                               | Enforced?                                                | Reality                                                             | Finding                                      |
| --------------------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| No `as` (except `as const`) in product                                      | `principles.md` §Type Discipline          | ✅ `consistent-type-assertions:{assertionStyle:'never'}` | Holds in `src/**` (lint green)                                      | — (strong)                                   |
| No `any` / `!` in product                                                   | `principles.md`                           | ✅ `no-explicit-any`, `no-non-null-assertion`            | Holds                                                               | — (strong)                                   |
| `as` **is OK in tests** for mocks                                           | `principles.md:970`                       | ❌ rule bans it in tests too                             | Doc is _more permissive_ than enforcement                           | **L1**                                       |
| No `Record<string,unknown>` **and** `{[k:string]:unknown}`                  | `principles.md:923`                       | ⚠️ only `Record<string,unknown>` restricted              | Index-signature sibling unrestricted; re-introduced behind disables | **L2, L5**                                   |
| No `Object.*` / `Reflect.*` (escape hatches)                                | `principles.md:924,1807`                  | ❌ no lint rule                                          | Used **148×** in product code                                       | **M1, M12**                                  |
| ADR-026: no string heuristics / `$ref` parsing centralised, "no exceptions" | ADR-026, AGENT.md                         | ⚠️ only method-call form banned                          | 20 files use lodash function-call form, incl. ad-hoc `$ref` parsing | **M2**                                       |
| `eslint-disable` forbidden unless governed                                  | `principles.md:1260`                      | partial (manual)                                         | 4 governed (`-- JC:`), **2 ungoverned**, 1 glib                     | **L3, L17**                                  |
| Lossless to/from IR (no content loss)                                       | `principles.md` Cardinal Rule; ADR-032    | ❌ no round-trip/property gate                           | Silent drops in parsers & writers                                   | **C2, C3, C4, C5, H1, H2, H4, M10**          |
| Fail-fast, never silent fallback / "not yet implemented"                    | `principles.md` Fail-Fast                 | ❌ not provable by gates                                 | No-op refinements, swallows, "does not yet support"                 | **C6, M9, M11, L9, L10**                     |
| Deterministic, sorted keys everywhere                                       | `principles.md` Deterministic Output      | partial (OpenAPI writer sorts)                           | Zod refinement writer unsorted; latent clock in bundle              | **M7, L15**                                  |
| Strict-by-default closed-world objects                                      | `principles.md`, IDENTITY.md              | partial                                                  | `patternProperties`-only objects stay open                          | **L12**                                      |
| "Support claims only honest when code+proofs+docs agree"                    | `principles.md` HONESTY                   | ❌ (the meta-rule itself)                                | Many docstrings/options/types overstate reality                     | **C1, H5, H6, L7, L8, L9, L10, L11**, M1, M2 |
| Single source of truth for types                                            | `principles.md` §3                        | ❌                                                       | 4 `isRecord`s, 2 `isCastrSchema`s                                   | **M3**                                       |
| Types-first DX (TSDoc, "DX is Priority #1")                                 | `principles.md` TSDoc                     | ❌ no `publint`/types gate                               | Build emits **0 `.d.ts`**                                           | **C1**                                       |
| No IO / global-state mutation in unit/integration tests                     | `testing-strategy.md`, `principles.md` #5 | ❌ not gated                                             | FS IO + `console` mutation present                                  | **M4, M5**                                   |
| No partial proof posture                                                    | `testing-strategy.md`                     | ❌ not gated                                             | Substring/boundary-only proofs hide bugs                            | **H7, L13**, and see `07`                    |

## Reading the matrix

Two distinct kinds of drift:

1. **Doctrine stricter than tooling** (M1, M2, L1, L2) — the doctrine forbids things the code freely does because the
   linter never checked. Low correctness risk, high _honesty_ cost: a reader trusting `principles.md`/ADR-026 is misled
   about what is actually guaranteed.
2. **Doctrine correct, tooling absent** (the losslessness/fail-fast/proof rows) — the doctrine states the right
   invariant, but nothing _proves_ it, so the code violates it silently. This is where the real bugs (C2–C6, H1–H4)
   live.

Under the strictest-normalisation rule both resolve the same way — _upward_: for (1) tighten the doc only where the
enforcement is already the stricter party (L1, H6/L8); otherwise add the lint rule that makes the strict doc enforceable
and refactor the code to comply. For (2) do the proof/gate work in `09` and fix the code to the strict invariant. The
strict claim is never relaxed.

## What is genuinely conformant (so the matrix isn't read as wholesale failure)

- The `as`/`any`/`!` bans are real and lint-green across `src/**` — the headline type discipline holds.
- Structural limits (`complexity ≤ 8`, `max-lines 220/45`, `max-files-per-dir 6`, import cycles, orphans, domain
  encapsulation via `depcruise` ADR-036) are all enforced and green.
- The OpenAPI writer's determinism (sorted entries) and IR-only sourcing are real; int64/bigint fail-fast is correct.
