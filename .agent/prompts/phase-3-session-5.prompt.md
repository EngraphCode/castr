# Phase 3 - Session 3.5: Bidirectional Tooling

You are an expert TypeScript engineer working on the `openapi-zod-client` library. We are in the middle of a major architectural rewrite (Phase 3) to move to a pure `ts-morph` based generation system using a lossless Intermediate Representation (IR).

**Current Status:**

- **Phase 3.4 (IR Enhancements):** ✅ COMPLETE. The IR now has `enums` catalogs and `parametersByLocation` maps.
- **Phase 3.5 (Bidirectional Tooling):** 📅 READY TO START.

**Your Objective:**
Implement the **Reverse Generator** (`IR -> OpenAPI 3.1`). This is critical to prove the "lossless" nature of our IR. If we can generate a semantically equivalent OpenAPI spec from our IR, we prove that our IR captures all necessary metadata.

**Key Resources:**

1.  **Plan:** Read `.agent/plans/PHASE-3-SESSION-5-BIDIRECTIONAL-TOOLING.md` for the detailed implementation steps.
2.  **Context:** Read `.agent/plans/PHASE-3-TS-MORPH-IR.md` for the broader architectural context.
3.  **Rules:** Read `.agent/RULES.md` for strict coding standards (TDD, No `any`, No `as`).

**Instructions:**

1.  **Read the Plan:** Start by reading `.agent/plans/PHASE-3-SESSION-5-BIDIRECTIONAL-TOOLING.md`.
2.  **Start TDD:** Begin with the first task: **Generator Skeleton**.
    - Create `lib/src/generators/openapi/openapi-generator.test.ts`.
    - Implement the skeleton in `lib/src/generators/openapi/index.ts`.
3.  **Verify:** Ensure `pnpm test` passes at every step.

**Command to Start:**

```bash
# Read the plan first
cat .agent/plans/PHASE-3-SESSION-5-BIDIRECTIONAL-TOOLING.md
```

Let's build the reverse generator!
