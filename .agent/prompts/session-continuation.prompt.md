# Session Continuation: @engraph/castr

**Last updated:** 2026-04-11

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Where We Are

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**Active workstream:** [OAS 3.2 Full Feature Support](../plans/active/oas-3.2-full-feature-support.md) (parent plan)

**Current plan:** [OAS 3.2 Full Feature Support](../plans/active/oas-3.2-full-feature-support.md) <- **read this next**

**Closure record:** [Phase A2 - Type Migration](../plans/current/complete/phase-a2-type-migration.md) (completed Friday, 10 April 2026)

Phase A2 and Phase B are complete. `QUERY` now round-trips honestly through IR/parser/writer/downstream MCP consumers, hierarchical tags have explicit native 3.2 parser/writer proof, and repo-root `pnpm check` is green, so the next entry point is Phase C on the parent OAS 3.2 plan.

### Verified Session Truth

- Phase A2 closed on Friday, 10 April 2026 after the AP4 dependency-exit sweep completed with a nested raw OpenAPI input seam, restored IR/media-type fidelity, strengthened dependency-exit guards, and closed reviewer follow-ups
- the full repo-root gate chain is green on Friday, 10 April 2026
- `pnpm madge:circular` is green on Friday, 10 April 2026
- `pnpm knip` is green on Friday, 10 April 2026
- the targeted active-surface `openapi3-ts` grep across `README.md`, `docs/USAGE.md`, `docs/EXAMPLES.md`, `docs/MCP_INTEGRATION_GUIDE.md`, `docs/guides/openapi-3.1-migration.md`, `lib/src`, `lib/tests-snapshot`, `scripts`, and `lib/package.json` is clean on Friday, 10 April 2026
- the MCP no-params tool-input-schema follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected by `isMcpToolInput()`, the affected snapshot suite is green, and repo-root `pnpm type-check` is green
- Phase B closed on Saturday, 11 April 2026: native OpenAPI 3.2 `query` now survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof, and repo-root `pnpm check` is green
- the native proof base for this work now lives at `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`; Phase C should extend that fixture first unless a reproduced regression requires a separate proof shape
- the metacognitive recommendation is now Phase C next: `deviceAuthorization`, XML `nodeType`, and path-templating proofs remain the smallest honest follow-on slice unless a fresh gate or runtime regression is reported first
- for future aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly
- the reviewer loop is closed with no open findings; direct project-agent fan-out was unavailable in this Codex surface, so the installed in-session fallback was used after reading the adapter and template for `code-reviewer`, `type-reviewer`, `test-reviewer`, and `openapi-expert`

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md).
2. Resume the OAS 3.2 parent plan at Phase C next: extend `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml` to prove `deviceAuthorization`, XML `nodeType`, and path templating unless a fresh regression changes the priority.
3. Keep Phase B closed unless a new `query`/hierarchical-tag regression is actually reproduced.
4. Use [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) as a closure record only if you need the exact seam, IR, reviewer, or verification details.
5. If a user reports a fresh gate or runtime issue, reproduce it immediately and treat that report as active session truth.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the Phase B `QUERY` + hierarchical-tag slice. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly.

---

## Next Session Start Statement

Read `.agent/directives/AGENT.md`, then `.agent/directives/metacognition.md`, then this prompt, then `.agent/plans/active/oas-3.2-full-feature-support.md`. Treat Friday, 10 April 2026 as the Phase A2 close-out date: the full repo-root gate chain, `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps are green, and the AP4 reviewer loop is closed with no open findings. Treat Saturday, 11 April 2026 as both the MCP no-params follow-up close-out date and the Phase B close-out date: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected, native OpenAPI 3.2 `query` now survives parser -> IR -> writer and downstream endpoint/MCP consumers, hierarchical tags have explicit parser/writer proof, and repo-root `pnpm check` is green. The current proof base for the parent OAS 3.2 plan is `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`; extend it for Phase C unless a reproduced regression requires a separate fixture. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly. Do not reopen AP4 or Phase B unless a fresh regression is reproduced. Resume the parent OAS 3.2 plan at Phase C next (`deviceAuthorization`, XML `nodeType`, path templating), unless a user reports a fresh gate or runtime issue that must be reproduced first.
