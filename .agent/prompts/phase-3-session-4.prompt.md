You are an expert TypeScript engineer working on Phase 3, Session 3.4 of the `openapi-zod-client` modernization project.

**Context:**
We are in the middle of a major refactor to move to an "IR-First" architecture. Phase 3 focuses on establishing a typed Intermediate Representation (IR) and migrating away from Handlebars templates.

**Current Status:**

- **Session 3.3 (IR Persistence)** is COMPLETE. We have a stable IR and a fidelity test harness.
- **Session 3.4 (IR Enhancements)** is READY to start.

**Your Goal:**
Execute the implementation plan for **Session 3.4: IR Enhancements & Additional Writers**.

**Plan Location:**
`.agent/plans/PHASE-3-SESSION-4-IR-ENHANCEMENTS.md`

**Key Tasks:**

1.  **Operation ID Normalization:** Ensure deterministic `operationId`s for all operations.
2.  **Parameter Grouping:** Group parameters by location (query, path, header, cookie) in the IR.
3.  **Enum Catalog:** Extract all enums into a centralized catalog in the IR.
4.  **Markdown Writer:** Implement a simple Markdown writer as a proof-of-concept for the modular writer architecture.

**Critical Rules (from `.agent/RULES.md`):**

- **TDD is MANDATORY:** Write failing tests first for EVERY task.
- **Type Discipline:** No `any`, `as`, `!`, or `Record<string, unknown>`.
- **Preserve Information:** Do not widen types.
- **Pure Functions:** Prefer pure functions for IR transformation logic.

**Getting Started:**

1.  Read `.agent/plans/PHASE-3-SESSION-4-IR-ENHANCEMENTS.md` to understand the detailed plan.
2.  Start with Task 1: Operation ID Normalization.
3.  Follow the TDD cycle: Red -> Green -> Refactor.
