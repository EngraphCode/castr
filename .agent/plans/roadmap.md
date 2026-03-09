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
- **Session 3.3a / 3.3b**: Two parallel sub-tracks within Session 3.3 (strictness remediation vs strict Zod-layer transform validation with sample input).
- **Atomic plans**: Small, linear steps stored under `./current/` and linked below.
- **Active atomic plan**: The single next atomic plan lives under `./active/`.
- **Completed atomic plans (staged)**: Completed atomic plans are moved to `./current/complete/` and only archived in batches when a group of work is complete.

---

## Priority: Production-Ready Core Path

OpenAPI ↔ OpenAPI transform proof is validated. OpenAPI → Zod generation is proven. Session 3.3b achieved strict Zod-layer transform validation with sample input.

```text
OpenAPI → IR → OpenAPI (transform validation, incl. strict round-trip/idempotence assertions) ✅
OpenAPI → IR → Zod (proven) ✅
Zod → IR (Session 3.2) ✅ COMPLETE
Full Transform Validation (Session 3.3) ✅ COMPLETE
```

---

## Phase 2: Core Path to Production (COMPLETE)

| Session | Focus                         | Status      |
| ------- | ----------------------------- | ----------- |
| 2.1-2.5 | Zod parser + OpenAPI writer   | ✅ Complete |
| 2.6     | OpenAPI Compliance            | ✅ Complete |
| 2.7     | OpenAPI Transform Validation  | ✅ Complete |
| 2.8     | Zod 4 Output Compliance       | ✅ Complete |
| 2.9     | OpenAPI → Zod Pipeline Polish | ✅ Complete |

---

## Phase 3: Zod Transform Validation (COMPLETE)

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
| **3.3a** | **ADR-026 Enforcement + Strictness Remediation**                             | ✅ Complete |
|          | └ No string/regex heuristics for TS-source parsing; use semantic analysis    | ✅          |
|          | └ No escape hatches: remove `as`/`any`/`!`/`eslint-disable` in product code  | ✅          |
|          | └ Eliminate fallbacks; fail fast and hard with helpful errors                | ✅          |
| **3.3b** | **Strict Zod-Layer Transform Validation** (Strict, no weak assertions)       | ✅ Complete |
|          | └ Structural strictness closure for Scenarios 2-4                            | ✅ Complete |
|          | └ Remaining strictness/parity blockers (formats, validation parity matrix)   | ✅ Complete |

---

## Session 3.3a — ADR-026 Enforcement + Strictness Remediation

Bring the repository into strict alignment by completing two things in lockstep:

- **ADR-026 correctness:** TS-source parsing must not use string/regex heuristics. Use ts-morph AST + semantic APIs (symbol resolution) to derive meaning.
- **Repo-wide strictness:** no permissive fallbacks, no swallowed errors, no escape hatches, deterministic output proven by tests.

**Repo truth (as of 2026-02-13):**

- ESLint config is `lib/eslint.config.ts` (no repo-root `eslint.config.ts`).
- ADR-026 enforcement exists but is disabled by a schema-processing override that turns `no-restricted-syntax` off (`lib/eslint.config.ts:249`).
- ADR-026 is scoped: TS-source parsing heuristics are forbidden; data-string parsing (OpenAPI `$ref`, media types) is allowed only when centralized + validated + tested + fail-fast.
- **Scope defined (3.3a.01 complete), absolute strictness enforced:** No grey areas, no "partially enforced" tiers. TS-source heuristics banned in ALL `src/`. Data-string methods banned everywhere except designated centralized utilities. Audit found **31 violations**: 22 TS-source heuristics (Zod parser), 7 centralization violations (ad-hoc `$ref` parsing), 2 IR text-heuristic violations. See ADR-026 § "Scope Definition".

**Definition of Done (3.3a):**

- ADR-026 lint enforcement is enabled in the correct scopes and cannot be bypassed by moving files.
- TS-source parsers do not use string/regex heuristics to infer meaning (no `getText()`-driven semantics).
- Data-string parsing is centralized and strictly validated (no scattered ad-hoc `$ref` parsing).
- No permissive fallbacks exist anywhere in product code.
- No swallowed errors exist in strict pipeline code paths.
- No product-code escape hatches exist (`as` except `as const`, `any`, `!`, `eslint-disable`).
- Determinism is proven by tests (stable ordering, byte-identical outputs where required).
- TDD is mandatory for all work (see `RULES.md` § Testing Standards).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/RULES.md`, `.agent/directives/testing-strategy.md`, `.agent/directives/requirements.md`, `.agent/directives/DEFINITION_OF_DONE.md`.

**References:** `docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md`, `lib/eslint.config.ts`.

**Progress update (2026-02-19):**

- [3.3a.04 — Repo-Wide ADR-026 Remediation](./current/complete/3.3a-04-centralize-data-string-parsing.md) remains complete (lint debt reduced from 272 to 0).
- [3.3a.05 — Remove Permissive Fallback Outputs](./current/complete/3.3a-05-remove-permissive-fallbacks.md) is complete and moved to `./current/complete/`.
- [3.3a.06 — Remove Swallowed Errors](./current/complete/3.3a-06-remove-swallowed-errors.md) is complete and moved to `./current/complete/`.
- [3.3a.07 — Remove Escape Hatches](./current/complete/3.3a-07-remove-escape-hatches.md) is complete and moved to `./current/complete/`.
- [3.3a.08 — Prove Determinism](./current/complete/3.3a-08-prove-determinism.md) is complete and moved to `./current/complete/` after TDD closure of Tranches A-D and full gate verification.
- Plan 05 established a centralized strict component-ref helper at `lib/src/schema-processing/parsers/openapi/builder.component-ref-resolution.ts` and removed permissive output degradation paths.
- Plan 06 removed swallowed-error paths in dependency extraction, Zod declaration parsing, and circular ref extraction; component-ref validation remains centralized.
- Plan 07 removed non-governed check-disabling directives and replaced escape-hatch usage with typed, rule-compliant implementations.
- [3.3b.01 — Transform Sample Suite Strictness](./current/complete/3.3b-01-transform-sample-suite-strictness.md) is complete and moved to `./current/complete/`.
- [3.3b.02 — Scenario 3 Reference Composition](./current/complete/3.3b-02-scenario3-reference-composition.md) is complete and moved to `./current/complete/`.
- [3.3b.03 — Reject `z.undefined()`](./current/complete/3.3b-03-reject-z-undefined.md) is complete and moved to `./current/complete/`.
- Current active plan is now [3.3b.04 — Format Parity (hostname, float32/64)](./active/3.3b-04-format-parity-hostname-float.md).

---

## Session 3.3b — Strict Zod-Layer Transform Validation

Prove that the Zod layer participates in strict, lossless transform validation with sample input:

- Scenarios 2–4 are strict proofs (no `<=`, no “skip on errors”).
- Writer and parser remain in lockstep: writer output must be parseable; parseable constructs must transform losslessly or be rejected upstream.

**Scenarios (target state):**

| #   | Scenario                          | Lossless | Idempotent | Status                                                  |
| --- | --------------------------------- | -------- | ---------- | ------------------------------------------------------- |
| 1   | OpenAPI → IR → OpenAPI            | ✅       | ✅         | ✅ Complete                                             |
| 2   | Zod → IR → Zod                    | ✅       | ✅         | ✅ Structural strictness and functional parity complete |
| 3   | OpenAPI → IR → Zod → IR → OpenAPI | ✅       | —          | ✅ Structural strictness and functional parity complete |
| 4   | Zod → IR → OpenAPI → IR → Zod     | ✅       | —          | ✅ Structural strictness and functional parity complete |

> **Note:** Scenario strictness checks are sample-input transform proofs, and some assertions are explicit round-trip/idempotence proofs. Functional validation-parity (data validates identically before/after transform execution) complete in [3.3b.05 — Validation-Parity Scenarios 2–4](./current/complete/3.3b-05-validation-parity-scenarios-2-4.md).

**Success criteria (3.3b):**

- `z.undefined()` strict rejection and no-degradation contract are complete (3.3b.03).
- Writer format parity for hostname/float32/float64 is lossless or fail-fast with context (3.3b.04).
- Validation-parity tests cover Scenarios 2–4 (data validates the same before/after transform execution).
- Idempotency holds where required (byte-identical normalized outputs on second pass).
- Quality gates pass (canonical: `.agent/directives/DEFINITION_OF_DONE.md`).

**Governing docs:** `.agent/directives/VISION.md`, `.agent/directives/requirements.md`, `docs/architectural_decision_records/ADR-027-round-trip-validation.md`, `docs/architectural_decision_records/ADR-031-zod-output-strategy.md`, `docs/architectural_decision_records/ADR-032-zod-input-strategy.md`.

**References:** `lib/tests-transforms/__tests__/transform-samples.integration.test.ts`, `lib/tests-transforms/__tests__/validation-parity*.integration.test.ts`, `lib/src/schema-processing/parsers/zod/zod-parser.detection.ts`.

---

## Session 3.3 Execution Flow (Atomic Plans)

Session 3.3 is tracked and executed as a linear sequence of smaller atomic plans under `./current/session-3.3a/` and `./current/session-3.3b/`.

| Step | Plan                                                                                                           | Status      |
| ---- | -------------------------------------------------------------------------------------------------------------- | ----------- |
| 1    | [3.3a.01 — ADR-026 Scope Definition](./current/complete/3.3a-01-adr026-scope.md)                               | ✅ Complete |
| 2    | [3.3a.02 — ESLint Enforcement Redesign](./current/complete/3.3a-02-eslint-enforcement-redesign.md)             | ✅ Complete |
| 3    | [3.3a.03 — Zod Parser Semantic Parsing](./current/complete/3.3a-03-zod-parser-semantic-parsing.md)             | ✅ Complete |
| 4    | [3.3a.04 — Repo-Wide ADR-026 Remediation](./current/complete/3.3a-04-centralize-data-string-parsing.md)        | ✅ Complete |
| 5    | [3.3a.05 — Remove Permissive Fallback Outputs](./current/complete/3.3a-05-remove-permissive-fallbacks.md)      | ✅ Complete |
| 6    | [3.3a.06 — Remove Swallowed Errors](./current/complete/3.3a-06-remove-swallowed-errors.md)                     | ✅ Complete |
| 7    | [3.3a.07 — Remove Escape Hatches](./current/complete/3.3a-07-remove-escape-hatches.md)                         | ✅ Complete |
| 8    | [3.3a.08 — Prove Determinism](./current/complete/3.3a-08-prove-determinism.md)                                 | ✅ Complete |
| 9    | [3.3b.01 — Transform Sample Suite Strictness](./current/complete/3.3b-01-transform-sample-suite-strictness.md) | ✅ Complete |
| 10   | [3.3b.02 — Scenario 3 Reference Composition](./current/complete/3.3b-02-scenario3-reference-composition.md)    | ✅ Complete |
| 11   | [3.3b.03 — Reject `z.undefined()`](./current/complete/3.3b-03-reject-z-undefined.md)                           | ✅ Complete |
| 12   | [3.3b.04 — Format Parity (hostname, float32/64)](./current/complete/3.3b-04-format-parity-hostname-float.md)   | ✅ Complete |
| 13   | [3.3b.05 — Validation-Parity Scenarios 2–4](./current/complete/3.3b-05-validation-parity-scenarios-2-4.md)     | ✅ Complete |
| 14   | [3.3b.06 — Expand Zod Fixtures](./current/complete/3.3b-06-expand-zod-fixtures.md)                             | ✅ Complete |
| 15   | [3.3b.07 — Nullability Chain Normalization](./current/complete/3.3b-07-nullability-chain-normalization.md)     | ✅ Complete |

---

## Phase 4: JSON Schema + Parity Track (Active)

Session 3.3 is complete. Phase 4 focuses on JSON Schema support and post-3.3 parity work.

- JSON Schema outputs where required (Draft 2020-12 semantics, strict, deterministic)
- JSON Schema input support (Draft 2020-12)
- Feature-parity alignment (tracked under `.agent/research/feature-parity/*`)
- Multi-artefact output separation where it improves strict transform validation paths (Zod schema output vs metadata outputs)
- Investigation of the remaining Zod round-trip limitations before further remediation work

**Progress:**

- ✅ Component 1: Shared JSON Schema field logic extracted from OpenAPI writer into `writers/shared/`
- ✅ Component 2: JSON Schema Writer (`writers/json-schema/`) — standalone, document, and bundled modes
- 🔲 Component 3: JSON Schema Parser (next)
- 🔲 Component 4: Multi-Cast Parity Rig

Strategic phase plan: [phase-4-json-schema-and-parity.md](./current/complete/phase-4-json-schema-and-parity.md)

Primary active atomic plan: [zod-limitations-architecture-investigation.md](./active/zod-limitations-architecture-investigation.md)

Companion active investigation plan: [transform-proof-budgeting-and-runtime-architecture-investigation.md](./active/transform-proof-budgeting-and-runtime-architecture-investigation.md)

## Phase 5: Ecosystem Expansion (Planned)

- tRPC ↔ IR parsing/writing (extract Zod from routers; emit OpenAPI and helpers)
- Optional HTTP client adapter interfaces and examples (building-blocks philosophy; see ADR-022/ADR-025)
- SDK workspace/reference implementation to demonstrate end-to-end integration (separate from the core library)

Plan: [phase-5-ecosystem-expansion.md](./future/phase-5-ecosystem-expansion.md)

Strictness note: any "best-effort" or "permissive fallback" behavior is a doctrine violation. If a feature cannot be represented losslessly, it must be rejected with a helpful error (or the IR/writers must be extended).

---

## Architectural Notes

The following architectural notes from Phase 3.3 have been formalized into ADRs:

- **Separate Writer Concerns**: Formally decoupled the generation of pure schemas from runtime metadata. See `ADR-034-writer-separation.md`.
- **Two-Pass Semantic Parsing**: Moving from single-pass regex string parsing to two-pass AST symbol-table resolution. See `ADR-033-two-pass-semantic-parsing.md`.

---

## Post‑3.3 Feature‑Parity Track (Alignment Only)

After Session 3.3 transform-validation closure, prioritize the parity workstream documented in
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
