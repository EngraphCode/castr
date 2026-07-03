---
name: 'A Green Test Proves Only the Layer It Runs At'
polarity: anti-pattern
use_this_when: 'about to trust "X is tested" — check the test exercises X''s real production stack on its real substrate, not a proxy, a fake, or a dev loader'
category: testing
proven_in: 'agent-tools/tests/collaboration-state/claims-concurrency.integration.test.ts'
proven_date: 2026-06-21
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'reading "X is tested" as "X''s production stack is proven", when the green test ran against a proxy (bare counter), a fake (in-memory runtime), or a dev loader rather than X''s real substrate'
  stable: true
related_pattern: plain-node-built-artifact-proof
---

> **POLARITY: ANTI-PATTERN.** This entry names a _failure mode to avoid_, with the diagnostic for catching it in the moment.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern) for the polarity discipline.

# A Green Test Proves Only the Layer It Runs At

## Anti-pattern

"X is tested" is read as "X's production behaviour is proven", but the green test
ran at the **wrong layer** or against the **wrong substrate** — a proxy, a fake, or
a dev loader — so it proves the proxy, not production. The gate is green precisely
because the gap only bites the real path, which the test never exercises
(green-gates-mask-gaps).

## Worked instance

Collaboration-state concurrency was "tested", but the lock+retry was unit-tested
only on a **bare counter** (in-process `Promise.all`) and the integration tests
ran against an **in-memory fake runtime** (virtual paths, no real filesystem).
Neither exercised the full `claims open`/`close` stack under real multi-process
filesystem contention — and "a second concurrent session" means a **separate OS
process**, which no test touched. The gap was invisible until a real-fs
concurrency test (10 separate `node` processes against one `active-claims.json`)
encoded it. Sibling axis:
[`plain-node-built-artifact-proof`](plain-node-built-artifact-proof.md) (dev loader
vs shipped built artefact) — same family, different substrate.

## The diagnostic

Before trusting "X is tested", ask:

1. **Real path?** Does the assertion drive X's production code path, or a proxy
   that mirrors it (a bare counter, a stub that re-implements the logic)?
2. **Real substrate?** Does it run on the substrate production uses — real
   filesystem, real separate processes, the built artefact under plain Node — or a
   convenient in-memory fake / dev loader?
3. **Real failure mode?** Does the test reproduce the actual contention /
   cold-start / cross-process condition the claim is about?

If any answer is "a proxy / a fake / in-process / dev-loader", the green is proof
of the proxy, not of production. Encode a test at the real layer on the real
substrate.

## When to apply

- Reviewing or relying on any "X is tested / X is collision-safe / X works"
  claim, especially for concurrency, cross-process, filesystem, or
  startup behaviour.
- Choosing the layer for a new test of a production invariant.
