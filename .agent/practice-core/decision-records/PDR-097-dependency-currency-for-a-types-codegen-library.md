---
pdr_kind: pattern
---

# PDR-097: Dependency Currency for a Types/Codegen Library — Split by Risk, Classify by Call-Site, Prove Consumer-Side

**Status**: Accepted
**Date**: 2026-06-26
**Related**:
[PDR-060](PDR-060-tooling-friction-is-first-class-user-feedback.md)
(sibling pattern — a bump that reddens a gate is the friction signal
this method reads firsthand);
[PDR-096](PDR-096-bring-the-iceberg-transplant-completeness.md)
(verify-the-supporting-context family — a dependency's _call-sites_ are
the supporting context a "tooling" label hides);
[PDR-057](PDR-057-empirical-answerability.md)
(empirical-answerability — the consumer-side test is the empirical
surface that answers "did this bump change behaviour").

## Context

A library whose product is **types and generated code** (a parser → IR
→ writer / codegen pipeline) has a dependency estate that looks
ordinary but is not: some dependencies sit on the **emission or IR
path** (a formatter that formats _emitted_ code, a bundler that feeds
the parser, a codegen engine that vendors its own compiler), while
others are genuinely gate-only dev tooling. A semver-sized,
reputation-classified bump sweep — "patch/minor are safe, majors are
risky; linters/formatters are tooling" — silently bumps an
emission-path dependency in the safe tier and risks a silent
type-fidelity or emitted-output change. The whole point of such a
library (the type-checker and the emitted output honestly describing
reality) is exactly what an un-measured bump can corrupt invisibly.

Worked evidence (castr dependency-currency lane, 2026-06-21): `prettier`
was classified "type-neutral tooling" but is a runtime dependency that
formats _emitted_ code; `@scalar/json-magic` was classified the same but
is the IR-input bundler feeding parser → IR; a codegen engine bump's
real risk vector was its _vendored_ compiler, untouched by the
workspace compiler override. Each was caught by reading call-sites or
by a baseline-captured diff, not by the semver size.

## Decision

**Keep a types/codegen library's dependency estate current by risk, not
by semver size. The method has six load-bearing moves:**

1. **Split bumps by type / emission / runtime risk, not semver size.**
   A dev-tooling tier (linters, test runners, build orchestration) can
   sweep together; every dependency that touches the emission path, the
   IR, or a product runtime is its own cycle.

2. **Classify each dependency by its actual call-sites, firsthand — not
   by its reputation as "tooling."** Grep the import and where it is
   wired; ask "does this touch emission, the IR, or a product runtime?"
   A "formatter / linter / tooling" reputation is a claim to verify, not
   a tier assignment. (This is the [PDR-096](PDR-096-bring-the-iceberg-transplant-completeness.md)
   supporting-context discipline applied to a dependency: the call-site
   is the context the label hides.)

3. **One type-affecting major per commit.** Isolation makes a
   regression bisectable and the diff readable.

4. **Capture an emitted / CLI baseline _before_ install; diff _after_.**
   A risk mitigation that compares "emitted output against a pre-bump
   baseline" is procedurally impossible unless a step captures the
   baseline before `install` regenerates it. A non-empty diff is
   STOP-and-understand, never auto-accept.

5. **For tooling whose changelog is poorly version-mapped, the
   empirical consumer-side test is the decisive proof.** Read the
   changelog to scope risk, but do not over-invest chasing it: run the
   consumer-side test (a linter → run lint and read each violation; a
   commit-message tool → assert accept-good / reject-bad; a clone tool →
   a real clone; an emission/IR dependency → a baseline-captured emitted
   diff). The consumer test answers the real question firsthand.

6. **Roll-forward only.** A bad bump is reverted with a forward commit,
   never by rewriting history (and an in-range caret bump cannot even be
   "reverted" to the committed state forward-only — install re-pulls it,
   so the choice is adopt-or-deliberately-pin, a decision to surface).

A bump whose package **embeds** a compiler or parser deserves special
care: the real risk vector is the _embedded_ engine's version, and a
workspace override does **not** reach a vendored bundle (verify the
vendored engine version firsthand).

## Scope

**Adopter scope**: every Practice-bearing repo whose product is types
or generated code (a codegen library, an SDK generator, a schema
toolchain). The method is portable; the specific dependencies and
call-sites are host-local and stay in the host's dependency-currency
plan and `memory/active/patterns/`. Repos whose product is not types /
codegen still benefit from moves 2, 4, and 5, but the emission-path
tiering (move 1) is sharpest where emitted output is the product.

## Consequences

### Required

- Tier the estate by call-site risk before a sweep; read call-sites
  firsthand for any dependency whose tier is non-obvious.
- Capture the baseline before install for any emission/IR/type-affecting
  bump; diff after; treat a non-empty diff as stop-and-understand.
- Prove tooling bumps consumer-side; isolate type-affecting majors per
  commit; roll forward.

### Forbidden

- Assigning a dependency to the gate-only tier by reputation
  ("it's a linter/formatter") without a call-site check.
- A baseline-diff mitigation with no capture-before-mutate step (it
  cannot be executed).
- Reverting a bad bump by rewriting history; chasing a poorly-mapped
  changelog instead of running the consumer-side test.

### Accepted cost

- Per-cycle baseline capture + isolated commits is slower than a single
  sweep. The cost buys bisectability and a firsthand fidelity proof on
  the exact path the library's value depends on.

## Notes

This method composes with the verify-firsthand family: a dependency's
tier, like an inherited classification, is a claim to measure against
the call-site, not a label to trust. Host-side realisation (which
dependencies sit on which path, the cycle ledger) lives in the host's
dependency-currency plan and pattern memory, not here, per the Core
portability constraint.

## Source

Graduates the `dependency-currency-discipline` candidate from
`pending-graduations.md`
(captured 2026-06-21, home pre-decided by the owner four-lenses pass;
timing brought forward to graduate-now at the 2026-06-26 dedicated
consolidation by owner direction — the method's core was proven across
the DC0–DC2 cycles, with later cycles applying the same moves). The
host-local distilled instances are the dependency-classification,
baseline-capture, and consumer-side-test entries in
`.agent/memory/active/distilled.md`.
