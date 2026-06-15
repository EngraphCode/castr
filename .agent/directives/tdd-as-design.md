---
fitness_line_target: 180
fitness_line_limit: 240
fitness_char_limit: 14000
fitness_line_length: 100
split_strategy: >-
  Grow the methodology depth (cycle worked examples, atomic-landing
  scenarios, refactoring TDD detail) into testing-strategy.md; this
  directive holds only the foundational definition and load-bearing
  invariants.
---

# TDD as Design

**Status**: Foundational directive (load-bearing for the entire validation arc).
**Authority order**: this directive sits above `testing-strategy.md` for any
question about _why_ tests exist and _how_ they relate to product code; it
sits below `principles.md` for any question about repository-wide rules.

## Foundational Definition

> A test does not verify code. A test **describes a system state**, and
> product code is the path that **guides the system into that state**.
> Test and product code are two halves of one act of design. Writing
> them separately, in either order, is a category error.

This is the load-bearing definition. Every other rule in this directive,
and every check the test-expert applies, derives from it.

## Three Corollaries

1. **TDD's primary output is good interfaces, not green tests.** The
   discipline of having to describe a behaviour in a test forces the
   designer to choose a clean unit boundary. Quality validation is the
   by-product of that act, not its goal. A test that ratifies an
   already-built interface has produced no design value, even if it
   passes; it is an audit, not a description.
2. **Test and product code are co-defined.** You cannot cleanly write
   the test without already understanding the shape of the product
   code; you cannot cleanly write the product code without understanding
   what observable behaviour is being instantiated. The atomic landing
   is therefore a TDD _invariant_, not a process step — landing them
   in separate commits treats one act as two outputs.
3. **A unit test is never enough on its own to show that value is
   delivered.** Scales (unit / integration / E2E / UI / a11y / visual)
   are complementary and run in parallel. The higher-scale tests
   describe value flow that lower-scale tests cannot reach. Different
   scales have different greening costs, and that is intentional, not a
   flaw to optimise away.

## The Atomic Landing Invariant

**Every TDD cycle is one landing unit (one commit): the failing test,
the product code that greens it, and any refactor land together. Test
and product code never travel in separate commits.**

If a test cannot be greened in a single landing, the slice is too big.
Break the test+code pair into smaller pairs and land each as its own
cycle. If the higher-level test (integration, E2E) requires several
lower-level cycles before it can be greened, sequence the lower-level
cycles first and finish with the commit that adds the final piece
that makes the higher-level test green. Every commit ends with all
tests passing at every level.

**Forbidden shapes** (each is a TDD violation, not merely a process
slip):

- A commit containing a failing or skipped test, intended to be
  greened by a future commit. The slicing is wrong.
- A commit adding product code with no paired test, intended to be
  covered by a future commit. The product code has been written
  without a description; the description will arrive after the fact
  (an audit, not a design).
- A batch of failing tests committed ahead of the product code that
  greens them. This is the same shape as above, in reverse: the test
  has been written without a path, and the path will be designed to
  match.

**Refactoring TDD**: when refactoring does not change public API
(runtime behaviour unchanged), the RED phase is compiler errors from
signature changes, not runtime test failures. Update the test call
sites first. Existing tests _are_ the safety net; no new tests are
needed for internal restructuring.

## One State, One Describing Surface

A multi-cycle plan moves the system toward a system state. That state
has **one place where it is observable from a test, in the form the
code actually runs** — the workflow seam, the persisted record, the
rendered output, or the effect on an external surface. Every cycle's
tests in the plan describe that surface, even when the cycles'
internal mechanics differ.

Cycles that produce tests below the describing surface are
**scaffolding tests**. They exist for the implementer's confidence
in an internal seam, not for the system's durable description.
Scaffolding tests are coupled to implementation choices — a refactor
that changes the internal seam without changing observable state
breaks the scaffolding without removing user-observable behaviour.

The cure fires at plan-author time, not at test-review time: state
the describing surface in one sentence before the cycle decomposition
is settled, and tag each cycle's test boundary against it. Cycles
that "need to describe an internal seam" are asking for scaffolding
unless the seam genuinely produces new observable state; the default
is scaffolding.

See the [`where-system-state-is-observable-at-plan-author-time`][observable-pattern]
pattern for the diagnostic question, the worked instance, and how to
apply the constraint during cycle decomposition.

[observable-pattern]: ../memory/active/patterns/where-system-state-is-observable-at-plan-author-time.md

## Why Scales Are Complementary

Each test scale describes a different swathe of behaviour:

| Scale             | What it describes                                         | What it cannot describe                                 |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------- |
| Unit              | A single pure function's behaviour from inputs to outputs | How units compose into a feature                        |
| Integration       | Several units composed at a boundary                      | Whether the system delivers value end to end            |
| E2E (system)      | A whole-system behaviour through its protocol/transport   | Visual presentation, accessibility, runtime performance |
| UI                | A component's rendered behaviour                          | Whole-system flow                                       |
| a11y              | Emergent accessibility properties                         | Functional correctness                                  |
| Visual regression | Appearance stability                                      | Behaviour                                               |

A unit test proves _that the unit works in isolation_; it never proves
that _value reaches a user_. You always need at least one higher-scale
test to prove value flow, even when the unit tests are exhaustive.
Conversely, a high-scale test alone leaves the lower scales unspecified
and the implementation under-described.

The doctrine is therefore: **all the scales, all the time, in
parallel cycles**. The cost difference between scales is intentional —
a unit test is fast to green because it specifies narrow behaviour; an
E2E test is slower to green because it specifies whole-system
behaviour and requires many lower-level pieces to be in place first.
Collapsing scales toward the cheapest one is _not_ an optimisation; it
is a description gap that future failure will exploit.

For castr's headless `lib` (a schema-transform library, no UI), the
applicable scales are **unit / integration / E2E** plus **smoke** per
`testing-strategy.md`; the **UI / a11y / visual-regression** scales in the
table above apply to companion workspaces that render a UI, not to `lib`
itself.

## Describe vs. Audit

The single most useful reviewer question for any test:

> Does this test **describe** an interface, or does it **audit** one?

A test that describes:

- Could plausibly have been written before the product code existed.
- Names a behaviour in user/domain terms, not in implementation terms.
- Would still hold for any reasonable alternative implementation of
  the same behaviour.
- Constrains _what_ the system does, not _how_ it does it.

A test that audits:

- Could be derived mechanically from the product code (rename a
  variable in the code, the test still passes; rename a test
  assertion, the code is unaffected — the test mirrors the code's
  shape rather than its behaviour).
- Names methods, fields, or branches rather than behaviours.
- Breaks under any reasonable refactor that preserves behaviour.
- Constrains _how_ the system does what it does.

Audit-shaped tests have zero design value and produce friction during
refactoring. They should be deleted or rewritten as descriptions.

## Cross-References

- `principles.md` §Testing Standards — TDD is named there as a non-negotiable
  (the **MANDATORY: Test-Driven Development** block); this directive is the
  foundational definition that "TDD" expands to.
- `testing-strategy.md` — defines the test-type taxonomy (unit /
  integration / E2E / smoke); this directive defines _why_ tests
  exist and _how_ they relate to product code. The two are
  complementary; in cases of conflict, this directive's
  foundational definition is authoritative on intent and the
  testing-strategy taxonomy is authoritative on shape. It also carries
  castr's recipe-level worked examples (TDD at all levels, common
  violations and fixes).
- `.agent/rules/tdd.md`, `tdd-for-refactoring.md`, `no-skipped-tests.md`,
  `no-conditional-tests.md`, `no-global-state-in-tests.md`,
  `test-immediate-fails.md` — the rule surface operationalising this directive.

## What This Directive Is Not

- **It is not the full TDD playbook.** Methodology depth (worked
  examples of the cycle at each scale, atomic-landing scenarios,
  parallel-cycle sequencing for multi-level deliveries, refactoring
  TDD edge cases) lives in `testing-strategy.md` and grows over time.
- **It is not a process checklist.** It is a description of what TDD
  _is_. The atomic landing invariant has process consequences, but
  the invariant exists because of the foundational definition, not
  because process discipline is intrinsically valuable.
- **It is not negotiable per session.** Foundational definitions do
  not bend under closure pressure, deadline pressure, or "this case
  is special" reasoning. The first question — _could it be simpler
  without compromising quality?_ — applies to _the work_, not to
  _the discipline that produced the work_.
