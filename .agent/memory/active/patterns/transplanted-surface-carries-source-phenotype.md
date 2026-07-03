---
name: 'Transplanted Surface Carries the Source Phenotype'
polarity: pattern
use_this_when: 'bringing a rule, skill, template, directive, catalogue, or data file from another Practice-bearing repo (a transplant or a parity sync), before honouring its classification, citations, or paths'
category: process
proven_in: '.agent/memory/active/distilled.md §Transplant method (Oak→castr transplant, phases 3–8, 2026-06-04→2026-06-21)'
proven_date: 2026-06-21
barrier:
  broadly_applicable: true
  proven_by_implementation: true
  prevents_recurring_mistake: "honouring a transplanted surface's classification, §-citations, relative paths, or catalogue contents as-is, when they encode the source repo's phenotype and silently dangle or contradict in the host"
  stable: true
related_pattern: verify-before-propagating
---

> **POLARITY: PATTERN.** This entry names a _shape to repeat_, not a failure mode to avoid.
>
> See [`patterns/README.md` § Polarity](README.md#polarity-required-every-pattern) for the polarity discipline.

# Transplanted Surface Carries the Source Phenotype

## Pattern

A surface brought from another Practice-bearing repo (a transplant or a parity
sync) carries the **source repo's phenotype** — its module names, its
`principles.md §` headings, its relative-path depths, its product coupling, its
catalogue entries. The classification or content is a **claim about the source**,
not a verdict for the host. Read the body firsthand and reconcile **per surface**
against the host's real estate before honouring it.

The repeatable moves:

1. **Read the body; do not trust the label.** A KEEP / DON'T-BRING / `thin` /
   `blocked` disposition is a claim. Re-proven every transplant phase: a
   KEEP-classed rule (`use-result-pattern`) contradicted the host's fail-fast
   principle; false `principles.md §`-section cites were pervasive (~12) in Oak
   rules; an Oak relative-path depth was wrong for the host. The index's own
   "three on-disk forms" contract is itself such a claim.
2. **"Brought" ≠ "current".** A bring can take an _older_ version of a file.
   Where a phase depends on a brought file's behaviour (e.g. flipping a gate it
   backs), diff it byte-for-byte against the pin before building on it
   (`diff <(cat host/path) <(git -C source show PIN:path)`).
3. **Reconcile data like code.** A transplanted enforcement layer's data
   (`policy.json` deny-citations, contract-tested fixtures) is contract-tested —
   change the data and its test together. A structural shape change to data a
   live in-tree hook consumes needs the artefact (`dist`) rebuilt before the next
   edit.
4. **Sweep the host's OWN estate before a DON'T-BRING verdict.** "Don't bring X,
   the host has no surface for it" is a claim about the host too. The host's own
   `invoke-*` rules already required reviewer experts whose templates did not
   exist — the real slice was _completing a half-built system_, not a free roster
   choice.
5. **Regenerate host catalogues; do not localise the source's.** Author a
   reviewer/agent template _native_ to the host (lean, pointing at the host's
   real surfaces), do not copy-and-amend the source's ~300-line product-coupled
   one. A template instructs against a real estate. (Contrast abstract _patterns_,
   where neutralising source concretions IS faithful — a pattern describes a
   shape; a template instructs against an estate.)

## Why it matters

A transplanted surface honoured as-is imports the source repo's assumptions into
the host: dangling `§`-cites, broken relative links, product coupling the host
lacks, gates that can never flip on a fresh checkout, and "blockers" that invert
on inspection. Green gates mask all of this because the gap only bites the
malformed/cold-start path. The cost compounds across phases.

## Sizing the bring across three axes

A bring is wrong-sized until measured firsthand across **scope** (what), **method**
(how), and **base** (from-where). A naive file-count diff over-counts (it re-flags
by-design omissions and conflates host localisations with upstream amendments);
drop to identifier-level comparison and a slug set-difference cross-checked against
existing dispositions. An inherited manifest is itself a stale claim — re-derive
the gap inventory firsthand against the source-of-truth rather than executing the
existing list.

## When to apply

- Any transplant phase or parity-sync bring of a rule, skill, template,
  directive, catalogue, or enforcement-data file.
- Honouring an inherited classification, `§`-citation, or relative path on a
  brought surface.
- Estimating the scope of "bring everything / reach parity" — re-derive the gap
  firsthand; do not execute a manifest.
