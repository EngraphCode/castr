# Invoke Code Experts

The reviewer / domain-expert **catalogue** — who they are, what each owns,
and how to pick. Look this up when a non-trivial change is about to close.
The **firing rule** (when to invoke) is
[`.agent/rules/invoke-reviewers.md`](../../rules/invoke-reviewers.md); this
surface is the roster and triage behind it. Canonical templates live in
[`.agent/sub-agents/templates/`](../../sub-agents/templates/); the doctrine
is [PDR-003](../../practice-core/decision-records/PDR-003-sub-agent-protection-of-foundational-practice-docs.md)
and the domain-specialist pattern is
[PDR-010](../../practice-core/decision-records/PDR-010-domain-specialist-capability-pattern.md).

## The roster

| Reviewer             | Owns                                                                                   | Invoke when the change touches…                                   |
| -------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `code-reviewer`      | Gateway review for any non-trivial change — correctness, structure, TSDoc completeness | any non-trivial code change (invoke **first**)                    |
| `test-reviewer`      | TDD and test-quality (behaviour-not-implementation, no I/O, proves something)          | tests, fixtures, harnesses, or TDD evidence are added or changed  |
| `type-reviewer`      | Type-flow and strictness (no escape hatches, no widening, library-types-first)         | types, generics, schema flow, parser/writer contracts, assertions |
| `openapi-expert`     | OpenAPI 3.0–3.2 semantics and IR fidelity                                              | the OpenAPI parser/writer or its IR mapping                       |
| `zod-expert`         | Zod parser/writer lockstep and `ts-morph` emission                                     | the Zod parser/writer or generated Zod                            |
| `json-schema-expert` | JSON Schema Draft 07 / 2020-12 fidelity and IR mapping                                 | the JSON Schema parser/writer or its IR mapping                   |

## Triage ladder

1. **`code-reviewer` first** on any non-trivial change — it is the gateway.
2. Add **`test-reviewer`** if the change adds/changes tests, fixtures, or TDD evidence.
3. Add **`type-reviewer`** if it touches types, generics, parser/writer contracts, or assertions.
4. Add the **domain expert(s)** whose semantic surface the change crosses —
   `openapi-expert` / `zod-expert` / `json-schema-expert`. A change can need
   more than one (an OpenAPI→Zod path touches both).

## How to invoke

castr's only installed sub-agent adapter layer is **Codex** project agents
(`.codex/config.toml` + `.codex/agents/*.toml`). When direct project-agent
fan-out is unavailable or not producing useful signal (per
`invoke-reviewers.md`), do the review **in the current session**:

1. Read `.codex/agents/<agent>.toml` (the adapter).
2. Read `.agent/sub-agents/templates/<agent>.md` (the canonical workflow).
3. Review the scoped diff only, read-only unless fixes were separately asked for.
4. Record the outcome in the active session artefacts (no hidden review debt).

Claude / Cursor / Gemini have **no** sub-agent adapter yet (see
[`cross-platform-agent-surface-matrix.md`](cross-platform-agent-surface-matrix.md));
on those platforms the in-session template fallback above is the path.

## Worked examples

- **Zod writer change** (`ts-morph` emission): `code-reviewer` → `type-reviewer`
  → `zod-expert`; add `test-reviewer` if snapshot/gen tests changed.
- **JSON Schema 2020-12 keyword parser**: `code-reviewer` → `json-schema-expert`
  → `test-reviewer` (fidelity round-trip proofs) → `type-reviewer` if IR types shift.
- **Shared IR type change** crossing OpenAPI and Zod: `code-reviewer` →
  `type-reviewer` → both `openapi-expert` and `zod-expert` (lockstep).
- **Pure docs / rule / plan edit**: usually no reviewer; `code-reviewer` only
  if it changes behaviour-bearing config.
