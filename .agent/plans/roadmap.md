# Roadmap: @engraph/castr

**Date:** January 24, 2026 (Updated)  
**Status:** Active  
**Quality Gates:** Must be green at all times (see `.agent/directives/DEFINITION_OF_DONE.md`)

---

## Executive Summary

Transforms data definitions **between any supported format** via a canonical **Intermediate Representation (IR)**:

```text
Any Input Format → Parser → IR (CastrDocument) → Writers → Any Output Format
```

**Key Principle:** IR is the canonical model. ts-morph is used for TypeScript parsing and TS/Zod code generation. OpenAPI output is produced as typed objects. Zod parser and writer must remain in lockstep: the parser MUST accept all writer output patterns, and unsupported patterns MUST fail fast with helpful errors.

---

## Nomenclature (Phase vs Session)

- **Phase**: A major milestone on this roadmap (high-level product capability).
- **Session X.Y**: A unit of execution within a phase (work tracking). Historical sessions are archived under `./archive/`.
- **Session 3.3a / 3.3b**: Two parallel sub-tracks within Session 3.3 (strictness remediation vs strict Zod-layer round-trips).
- **Atomic plans**: Small, linear steps stored under `./current/` and linked below.
- **Active atomic plan**: The single next atomic plan lives under `./active/`.
- **Completed atomic plans (staged)**: Completed atomic plans are moved to `./current/complete/` and only archived in batches when a group of work is complete.

---

## Priority: Production-Ready Core Path

OpenAPI ↔ OpenAPI round-trip is validated. OpenAPI → Zod generation is proven. Full Zod-layer round-trip (OpenAPI → Zod → OpenAPI) remains incomplete and is tracked in Session 3.3b.

```text
OpenAPI → IR → OpenAPI (round-trip validation) ✅
OpenAPI → IR → Zod (proven) ✅
Zod → IR (Session 3.2) ✅ COMPLETE
Full Round-Trip Validation (Session 3.3) 🔄 IN PROGRESS
```

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                         | Status      |
| ------- | ----------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer   | ✅ Complete |
| 2.6     | OpenAPI Compliance            | ✅ Complete |
| 2.7     | OpenAPI Round-Trip            | ✅ Complete |
| 2.8     | Zod 4 Output Compliance       | ✅ Complete |
| 2.9     | OpenAPI → Zod Pipeline Polish | ✅ Complete |

---

## Phase 3: Zod Round-Trip (Active)

| Session  | Focus                                                                        | Status      |
| -------- | ---------------------------------------------------------------------------- | ----------- |
| 3.1a     | IR Semantic Audit                                                            | ✅ Complete |
|          | └ Archive: [3.1a](./archive/ir-semantic-audit-plan-3.1a-complete.md)         | ✅          |
| 3.1b     | Zod 4 IR→Zod Improvements                                                    | ✅ Complete |
|          | └ Native recursion (getter syntax)                                           | ✅ Complete |
|          | └ Codecs (deferred — not first-class APIs)                                   | ⚪ Deferred |
|          | └ .overwrite() (deferred — no real-world usage)                              | ⚪ Deferred |
|          | └ Archive: [3.1b](./archive/zod4-ir-improvements-plan-3.1b-complete.md)      | ✅          |
| **3.2**  | **Zod → IR Parser**                                                          | ✅ Complete |
|          | └ Parse Zod 4 output, reconstruct IR                                         | ✅ Complete |
|          | └ Zod 4 only (reject Zod 3 syntax)                                           | ✅ Complete |
|          | └ Documentation updated for bidirectional pipeline                           | ✅ Complete |
|          | └ Archive: [zod4-parser-plan.md](./archive/zod4-parser-plan-3.2-complete.md) |             |
| **3.3a** | **ADR-026 Enforcement + Strictness Remediation**                             | 🔄 Active   |
|          | └ No string/regex heuristics for TS-source parsing; use semantic analysis    | 🔄          |
|          | └ No escape hatches: remove `as`/`any`/`!`/`eslint-disable` in product code  | 🔄          |
|          | └ Eliminate fallbacks; fail fast and hard with helpful errors                | 🔄          |
| **3.3b** | **Strict Zod-Layer Round-Trip Validation** (Strict, no weak assertions)      | 🔄 Active   |
|          | └ Harden Scenarios 2-4 into strict, lossless proofs                          | 🔲          |
|          | └ Zod ↔ Zod, OpenAPI → Zod → OpenAPI, Zod → OpenAPI → Zod                    | 🔲          |

---

## Session 3.3a — ADR-026 Enforcement + Strictness Remediation

Bring the repository into strict alignment by completing two things in lockstep:

- **ADR-026 correctness:** TS-source parsing must not use string/regex heuristics. Use ts-morph AST + semantic APIs (symbol resolution) to derive meaning.
- **Repo-wide strictness:** no permissive fallbacks, no swallowed errors, no escape hatches, deterministic output proven by tests.

**Repo truth (as of 2026-02-13):**

- ESLint config is `lib/eslint.config.ts` (no repo-root `eslint.config.ts`).
- ADR-026 enforcement exists but is disabled by a schema-processing override that turns `no-restricted-syntax` off (`lib/eslint.config.ts:249`).
- ADR-026 is scoped: TS-source parsing heuristics are forbidden; data-string parsing (OpenAPI `$ref`, media types) is allowed only when centralized + validated + tested + fail-fast.

**Definition of Done (3.3a):**

- ADR-026 lint enforcement is enabled in the correct scopes and cannot be bypassed by moving files.
- TS-source parsers do not use string/regex heuristics to infer meaning (no `getText()`-driven semantics).
- Data-string parsing is centralized and strictly validated (no scattered ad-hoc `$ref` parsing).
- No permissive fallbacks exist anywhere in product code.
- No swallowed errors exist in strict pipeline code paths.
- No product-code escape hatches exist (`as` except `as const`, `any`, `!`, `eslint-disable`).
- Determinism is proven by tests (stable ordering, byte-identical outputs where required).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/RULES.md`, `.agent/directives/testing-strategy.md`, `.agent/directives/requirements.md`, `.agent/directives/DEFINITION_OF_DONE.md`.

**References:** `docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md`, `lib/eslint.config.ts`.

---

## Session 3.3b — Strict Zod-Layer Round-Trip Validation

Prove that the Zod layer participates in strict, lossless round-trips:

- Scenarios 2–4 are strict proofs (no `<=`, no “skip on errors”).
- Writer and parser remain in lockstep: writer output must be parseable; parseable constructs must round-trip losslessly or be rejected upstream.

**Scenarios (target state):**

| #   | Scenario                          | Lossless | Idempotent | Status      |
| --- | --------------------------------- | -------- | ---------- | ----------- |
| 1   | OpenAPI → IR → OpenAPI            | ✅       | ✅         | ✅ Complete |
| 2   | Zod → IR → Zod                    | ✅       | ✅         | ✅ Complete |
| 3   | OpenAPI → IR → Zod → IR → OpenAPI | 🔴       | —          | 🔴 Blocked  |
| 4   | Zod → IR → OpenAPI → IR → Zod     | ✅       | —          | ✅ Complete |

**Success criteria (3.3b):**

- Scenario 3 passes strict losslessness assertions (no schema loss through Zod layer).
- Idempotency holds where required (byte-identical normalized outputs on second pass).
- Validation-parity tests cover Scenarios 2–4 (data validates the same before/after round-trips).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/requirements.md`, `docs/architectural_decision_records/ADR-027-round-trip-validation.md`, `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`, `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`.

**References:** `lib/tests-roundtrip/__tests__/round-trip.integration.test.ts`, `lib/tests-roundtrip/__tests__/validation-parity*.integration.test.ts`, `lib/src/schema-processing/parsers/zod/zod-parser.detection.ts`.

---

## Session 3.3 Execution Flow (Atomic Plans)

Session 3.3 is tracked and executed as a linear sequence of smaller atomic plans under `./current/session-3.3a/` and `./current/session-3.3b/`.

| Step | Plan                                                                                                             | Status    |
| ---- | ---------------------------------------------------------------------------------------------------------------- | --------- |
| 1    | [3.3a.01 — ADR-026 Scope Definition](./active/3.3a-01-adr026-scope.md)                                           | 🔄 Active |
| 2    | [3.3a.02 — ESLint Enforcement Redesign](./current/session-3.3a/3.3a-02-eslint-enforcement-redesign.md)           | 🔲        |
| 3    | [3.3a.03 — Zod Parser Semantic Parsing](./current/session-3.3a/3.3a-03-zod-parser-semantic-parsing.md)           | 🔲        |
| 4    | [3.3a.04 — Centralize Data-String Parsing](./current/session-3.3a/3.3a-04-centralize-data-string-parsing.md)     | 🔲        |
| 5    | [3.3a.05 — Remove Permissive Fallbacks](./current/session-3.3a/3.3a-05-remove-permissive-fallbacks.md)           | 🔲        |
| 6    | [3.3a.06 — Remove Swallowed Errors](./current/session-3.3a/3.3a-06-remove-swallowed-errors.md)                   | 🔲        |
| 7    | [3.3a.07 — Remove Escape Hatches](./current/session-3.3a/3.3a-07-remove-escape-hatches.md)                       | 🔲        |
| 8    | [3.3a.08 — Prove Determinism](./current/session-3.3a/3.3a-08-prove-determinism.md)                               | 🔲        |
| 9    | [3.3b.01 — Round-Trip Suite Strictness](./current/session-3.3b/3.3b-01-roundtrip-suite-strictness.md)            | 🔲        |
| 10   | [3.3b.02 — Scenario 3 Reference Composition](./current/session-3.3b/3.3b-02-scenario3-reference-composition.md)  | 🔲        |
| 11   | [3.3b.03 — Reject `z.undefined()`](./current/session-3.3b/3.3b-03-reject-z-undefined.md)                         | 🔲        |
| 12   | [3.3b.04 — Format Parity (hostname, float32/64)](./current/session-3.3b/3.3b-04-format-parity-hostname-float.md) | 🔲        |
| 13   | [3.3b.05 — Validation-Parity Scenarios 2–4](./current/session-3.3b/3.3b-05-validation-parity-scenarios-2-4.md)   | 🔲        |
| 14   | [3.3b.06 — Expand Zod Fixtures](./current/session-3.3b/3.3b-06-expand-zod-fixtures.md)                           | 🔲        |
| 15   | [3.3b.07 — Nullability Chain Normalization](./current/session-3.3b/3.3b-07-nullability-chain-normalization.md)   | 🔲        |

---

## Phase 4: JSON Schema + Parity Track (Planned)

After Session 3.3 completes, priority shifts to JSON Schema support and post-3.3 parity work.

- JSON Schema outputs where required (Draft 2020-12 semantics, strict, deterministic)
- JSON Schema input support (Draft 2020-12)
- Feature-parity alignment (tracked under `.agent/research/feature-parity/*`)
- Multi-artefact output separation where it improves strict round-trips (Zod schema output vs metadata outputs)

Plan: [phase-4-json-schema-and-parity.md](./future/phase-4-json-schema-and-parity.md)

## Phase 5: Ecosystem Expansion (Planned)

- tRPC ↔ IR parsing/writing (extract Zod from routers; emit OpenAPI and helpers)
- Optional HTTP client adapter interfaces and examples (building-blocks philosophy; see ADR-022/ADR-025)
- SDK workspace/reference implementation to demonstrate end-to-end integration (separate from the core library)

Plan: [phase-5-ecosystem-expansion.md](./future/phase-5-ecosystem-expansion.md)

Strictness note: any "best-effort" or "permissive fallback" behavior is a doctrine violation. If a feature cannot be represented losslessly, it must be rejected with a helpful error (or the IR/writers must be extended).

---

## Architectural Note: Writer Separation (Identified Session 3.3)

> [!IMPORTANT]  
> The current Zod "writer" produces a combined output containing:
>
> - Zod schema declarations
> - TypeScript type definitions
> - `endpoints` array (runtime metadata)
> - `mcpTools` array (MCP tool definitions)
>
> The Zod **parser** only handles schema declarations. For true round-trip validation,
> consider separating into distinct writers:
>
> - **Zod Schema Writer** — Pure schema output (parseable by Zod parser)
> - **Endpoint/MCP Writer** — Runtime metadata (separate concern)
>
> This is future work, not blocking Session 3.3.

---

## Architectural Note: Two-Pass Parsing with Symbol Table (Identified Session 3.3)

> [!IMPORTANT]
> The current Zod parser uses single-pass parsing with naming convention heuristics
> (e.g., stripping `Schema` suffix) to resolve schema references. For a more robust
> and idiomatic solution, implement two-pass parsing:
>
> **Pass 1:** Collect all schema declarations into a symbol table  
> **Pass 2:** Resolve identifier references by looking up symbols
>
> This decouples naming conventions from semantics and enables:
>
> - Complex patterns like `SchemaA.and(SchemaB)`
> - Cross-file reference resolution
> - Circular reference detection
>
> This is future work on the roadmap for Phase 4+.

---

## Post‑3.3 Feature‑Parity Track (Alignment Only)

After Zod round‑trip (3.3), prioritize the parity workstream documented in
`.agent/research/feature-parity/*`. This is **alignment**, not a prescriptive API commitment:

- IR‑first metadata outputs (maps/helpers), optional path formatting, and bundle manifest
- JSON Schema outputs for response/parameter validation where needed
- Zod metadata ingestion for OpenAPI generation
- tRPC → IR parsing for OpenAPI emission (Oak integration target)

---

## Supported Formats (Current)

| Format          | Input | Output | Status / Notes                                     |
| --------------- | :---: | :----: | -------------------------------------------------- |
| **OpenAPI**     |  ✅   |   ✅   | 2.0 input-only; 3.x input → 3.1 output (proven)    |
| **Zod**         |  ✅   |   ✅   | Input: Session 3.2 complete; output is Zod 4       |
| **TypeScript**  |   —   |   ✅   | Writer available (types + helpers)                 |
| **JSON Schema** |  🔲   |   🔲   | Deferred (internal conversions exist for MCP only) |
| **tRPC**        |  🔲   |   🔲   | Planned                                            |

---

## Engineering Standards

- **Zod 4 Only:** No Zod 3 support — reject with clear errors
- **Strict-by-Default:** `.strict()`, throw on unknown
- **Fail-Fast:** Informative errors, never silent fallbacks
- **No Escape Hatches:** No `as`, `any`, `!`, or `eslint-disable` workarounds in product code
- **TDD:** Failing tests first
- **Quality Gates:** Canonical definition is `.agent/directives/DEFINITION_OF_DONE.md`

```bash
pnpm check:ci
```

Local convenience (may auto-fix formatting/lint where safe):

```bash
pnpm check
```

---

## Key Documents

| Category    | Document                                                      | Purpose           |
| ----------- | ------------------------------------------------------------- | ----------------- |
| **Entry**   | [session-entry.prompt.md](../prompts/session-entry.prompt.md) | Session start     |
| **Plan**    | [roadmap.md](./roadmap.md)                                    | Single plan truth |
| **Archive** | [archive/](./archive/)                                        | Completed plans   |

---

**This document is the authoritative roadmap. Update when strategic decisions are made.**
