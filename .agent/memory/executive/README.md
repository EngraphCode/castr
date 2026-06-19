# Executive Memory

Stable organisational / contract memory. The surfaces here describe
_how the repo is organised and what the contracts are_ — they are
looked up when performing an action the surface governs, not
internalised before each session.

See [`.agent/memory/README.md`](../README.md) for the three-mode
memory taxonomy (active / operational / executive).

## Surfaces

The roster below names the executive surfaces and each one's current
**bring-status** in the Practice transplant. The executive catalogues
are **regenerated from castr's real estate** (not localised from Oak's
text — they enumerate concrete artefacts, reviewers, and adapters, so a
copied catalogue would assert false claims about castr); the
collaboration and substrate surfaces land with their later sub-blocks.

| Surface                                                                                                  | Purpose                                                                                                                                              | Status                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`artefact-inventory.md`](artefact-inventory.md)                                                         | Canonical-vs-adapter taxonomy + how-to create skills / rules / sub-agents                                                                            | ✅ **Landed (2026-06-18)** — regenerated to castr's estate                                                                                                                                                                                                                                                                                                                                                                |
| [`invoke-code-experts.md`](invoke-code-experts.md)                                                       | Reviewer/expert catalogue, layered triage, worked examples — the roster behind the [`invoke-reviewers`](../../rules/invoke-reviewers.md) firing rule | ✅ **Landed (2026-06-18; roster 6→15 on 2026-06-19)**                                                                                                                                                                                                                                                                                                                                                                     |
| [`cross-platform-agent-surface-matrix.md`](cross-platform-agent-surface-matrix.md)                       | Platform-adapter support matrix across Claude / Cursor / Codex / Gemini                                                                              | ✅ **Landed (2026-06-18)** — castr's real adapter topology + named gaps                                                                                                                                                                                                                                                                                                                                                   |
| `agent-collaboration-channels.md`                                                                        | At-a-glance register of communication and coordination channels                                                                                      | ✅ **Landed (Phase 6, owner-directed)** — routing contract + schema cross-refs live now; the `.agent/state/collaboration/` runtime surfaces it indexes remain Phase-8                                                                                                                                                                                                                                                     |
| [`memory-state-substrate-contracts.{md,manifest.json,schema.json}`](memory-state-substrate-contracts.md) | Human-facing host-local substrate contract + strict local manifest/schema for state, memory, and generated read models                               | ✅ **Landed (2026-06-18)** — re-authored to castr roots (22 surfaces, castr identity/PDR cites/plan roots, reviewer routes); consumer `agent-tools/src/practice-substrate/` validates it (manifest-vs-schema green; only the absent Phase-8 collaboration plane reports the expected `live-reader-failure`); portable spec is [PDR-050](../../practice-core/decision-records/PDR-050-state-memory-substrate-contracts.md) |

**Not brought:** Oak's `agent-capability-vocabulary.md` — its audience axis
(Oak developer capabilities, curriculum-assistance capabilities) is
Oak-product phenotype with no castr analogue; castr is a headless library
whose only capability axis is repo-working skills. If castr later grows a
distributable-capability axis, author a castr-shaped surface then.

## Refresh Discipline

Executive memory is not refreshed per session. It changes only when
the artefact _architecture_ itself evolves (e.g. a new platform
adapter is added, a new reviewer capability is created, the
canonical-vs-adapter pattern is amended). Each amendment is a
deliberate governance change, usually accompanying an ADR, PDR, or
Practice-Core doctrine update.

## Relationship to Doctrine

Executive memory carries _contracts_, not _principles_. The portable
doctrines behind these surfaces live in the Practice Core:

- the canonical-vs-adapter / artefact-portability pattern →
  [PDR-079](../../practice-core/decision-records/PDR-079-pdr-vs-adr-portability-distinction.md);
- the domain-specialist capability pattern (the domain experts) →
  [PDR-010](../../practice-core/decision-records/PDR-010-domain-specialist-capability-pattern.md);
- sub-agent protection of foundational docs →
  [PDR-003](../../practice-core/decision-records/PDR-003-sub-agent-protection-of-foundational-practice-docs.md);
- the layered component/template composition architecture →
  [`sub-agents/README.md`](../../sub-agents/README.md) (host-local; castr has no
  separate PDR for prompt composition);
- the state/memory substrate contract →
  [PDR-050](../../practice-core/decision-records/PDR-050-state-memory-substrate-contracts.md).

The executive-memory surfaces operationalise those doctrines with
concrete castr catalogues and step-by-step creation procedures.
(Oak's host ADR-125/114/129 cites are re-pointed to these portable
homes — PDR-079, PDR-010, and the host-local `sub-agents/README.md` —
per the transplant's per-surface reconciliation; castr authors a host
ADR only where no portable PDR can own the contract.)
