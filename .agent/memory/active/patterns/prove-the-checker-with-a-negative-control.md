---
name: 'Prove the Checker With an In-Repo Deliberate-RED Negative Control'
polarity: pattern
use_this_when: 'Trusting any targeted checker run — a lint over specific paths, an advisory commit-message check, a one-off validator invocation — especially when the result is green.'
category: process
proven_in: imported
proven_date: 2026-06-12
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: 'Trusting a green checker run that checked nothing — four instances across two checker classes in one capture window.'
  stable: true
---

> **POLARITY: PATTERN.** This is a shape to repeat: before trusting any
> targeted checker run, prove detection with a deliberately bad input
> through the same invocation.

## The failure shape

A green targeted check that never echoed your input checked NOTHING.
Worked instances:

- `markdownlint` without `--dot` matches ZERO files under any dot
  directory — it prints usage and exits 0, a structural false-green.
  Every targeted "markdownlint OK" on `.agent/**` paths run without
  `--dot` was void. The root script passes `--dot .`; targeted runs on
  dot-directory paths must too.
- markdownlint rejects absolute paths outside the repo (its ignore
  module requires relative paths), so a `/tmp` negative-control file
  cannot prove the runner — negative controls live INSIDE the repo
  (delete after).
- Two seats observed an argless advisory commit-message check exit 0
  (the false-green was environment-dependent — not reproducible from
  repo root on re-test — which is itself the point: you cannot know
  without the control).

## The shape

1. Run the checker over a deliberately bad input **through the same
   invocation shape** you intend to trust (same wrapper, same cwd, same
   flags).
2. Demand RED. A checker that stays green on the bad input is checking
   nothing — fix the invocation before reading any result from it.
3. Confirm the real run echoes/enumerates its inputs (a count, the
   linted file list, the message body) — a result with no evidence of
   inputs is not a result.

Sibling families: the green-verifier-without-count lesson and the
zero-hit-absence-claims-need-a-positive-control register candidate.
