# Session Continuation: @engraph/castr

**Last updated:** 2026-04-11

Context bridge between sessions. Start here after reading [AGENT.md](../directives/AGENT.md).

---

## Where We Are

**Library:** Schema compiler. `Any Input -> Parser -> IR -> Writers -> Any Output`. Supported: OpenAPI 3.0/3.1/3.2, Zod 4, JSON Schema 2020-12, TypeScript, MCP Tools.

**Active workstream:** [OAS 3.2 Full Feature Support](../plans/active/oas-3.2-full-feature-support.md) (parent plan)

**Current plan:** [OAS 3.2 Full Feature Support](../plans/active/oas-3.2-full-feature-support.md) <- **read this next**

**Closure record:** [Phase A2 - Type Migration](../plans/current/complete/phase-a2-type-migration.md) (completed Friday, 10 April 2026)

Phase A2, Phase B, and Phase C are complete. The earlier generated-code validation temp-directory race remains fixed, repo-root `pnpm check` is green on the Phase C close-out sweep, and the next entry point is now Phase D on the parent OAS 3.2 plan.

### Verified Session Truth

- Phase A2 closed on Friday, 10 April 2026 after the AP4 dependency-exit sweep completed with a nested raw OpenAPI input seam, restored IR/media-type fidelity, strengthened dependency-exit guards, and closed reviewer follow-ups
- the full repo-root gate chain is green on Friday, 10 April 2026
- `pnpm madge:circular` is green on Friday, 10 April 2026
- `pnpm knip` is green on Friday, 10 April 2026
- the targeted active-surface `openapi3-ts` grep across `README.md`, `docs/USAGE.md`, `docs/EXAMPLES.md`, `docs/MCP_INTEGRATION_GUIDE.md`, `docs/guides/openapi-3.1-migration.md`, `lib/src`, `lib/tests-snapshot`, `scripts`, and `lib/package.json` is clean on Friday, 10 April 2026
- the MCP no-params tool-input-schema follow-up closed on Saturday, 11 April 2026: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected by `isMcpToolInput()`, the affected snapshot suite is green, and repo-root `pnpm type-check` is green
- Phase B closed on Saturday, 11 April 2026: native OpenAPI 3.2 `query` now survives parser -> IR -> writer and downstream endpoint/MCP consumers, duplicated raw PathItem visitors no longer skip it, MCP treats `query` as read-only/non-destructive, hierarchical tags (`summary`, `parent`, `kind`) have explicit parser/writer proof, and repo-root `pnpm check` is green
- Phase C closed on Saturday, 11 April 2026: `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, valid templated paths survive shared load boundary -> IR -> writer -> endpoint/MCP consumers unchanged, malformed top-level `paths` templates fail fast before upgrade/canonicalisation, and repo-root `pnpm check` is green on the close-out sweep
- Husky is now active locally: `pre-commit` formats staged files with Prettier, `pre-push` runs `pnpm check:ci`, and the first post-install full repo-root `pnpm check:ci` sweep was green on Saturday, 11 April 2026
- a fresh generated-code validation gate issue was reproduced and closed on Saturday, 11 April 2026: the generated-suite temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, `test:gen` is green at `5` files / `26` tests, and repo-root `pnpm check` is green again
- the native proof base for the now-closed Phase C work lives at `lib/tests-transforms/__fixtures__/phase-b-native-3.2.yaml`, supported by the malformed-template rejection fixtures under `lib/tests-transforms/__fixtures__/invalid/3.2.x-malformed-path-templates/`
- the metacognitive recommendation is now Phase D next: Example Object semantics (`dataValue`, `serializedValue`) remain the smallest honest follow-on slice unless a fresh gate or runtime regression is reported first
- for future aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly
- the reviewer loop is closed with no open findings; direct project-agent fan-out was unavailable in this Codex surface, so the installed in-session fallback was used after reading the adapter and template for `code-reviewer`, `test-reviewer`, and `openapi-expert`. The gateway review surfaced and resolved two pre-close-out issues before the clean rerun: over-broad `paths` validation scope and partial `deviceAuthorization` nested-field proof

---

## What Next

1. Re-read [metacognition.md](../directives/metacognition.md), then [oas-3.2-full-feature-support.md](../plans/active/oas-3.2-full-feature-support.md).
2. Resume the OAS 3.2 parent plan at Phase D next: prove Example Object semantics (`dataValue`, `serializedValue`) across the parser -> IR -> writer seams unless a fresh regression changes the priority.
3. Keep Phases B and C closed unless a new `query`, hierarchical-tag, native `deviceAuthorization`, XML `nodeType`, or path-templating regression is actually reproduced.
4. Use [phase-a2-type-migration.md](../plans/current/complete/phase-a2-type-migration.md) as a closure record only if you need the exact seam, IR, reviewer, or verification details.
5. If a user reports a fresh gate or runtime issue, reproduce it immediately and treat that report as active session truth.

---

## Gate Status

Repo-root `pnpm check` is green on **Saturday, 11 April 2026** after the Phase C close-out sweep, and the first post-Husky-install repo-root `pnpm check:ci` sweep is also green on **Saturday, 11 April 2026**. Use `pnpm check` locally as the canonical aggregate gate, or `pnpm check:ci` for a non-mutating rerun; do not invoke `pnpm qg` directly. Husky now enforces staged-file Prettier on `pre-commit` and runs `pnpm check:ci` on `pre-push`, but explicit aggregate reruns still govern close-out.

---

## Next Session Start Statement

Read `.agent/directives/AGENT.md`, then `.agent/directives/metacognition.md`, then this prompt, then `.agent/plans/active/oas-3.2-full-feature-support.md`. Treat Friday, 10 April 2026 as the Phase A2 close-out date: the full repo-root gate chain, `pnpm madge:circular`, `pnpm knip`, and the targeted active-surface `openapi3-ts` greps are green, and the AP4 reviewer loop is closed with no open findings. Treat Saturday, 11 April 2026 as the MCP no-params follow-up close-out date, the Phase B close-out date, the Phase C close-out date, the Husky-install local-workflow alignment date, and the generated-suite gate-stability fix date: true zero-input MCP tools now emit `{ type: 'object', additionalProperties: false }`, unexpected top-level arguments are rejected, native OpenAPI 3.2 `query` now survives parser -> IR -> writer and downstream endpoint/MCP consumers, hierarchical tags have explicit parser/writer proof, `oauth2.flows.deviceAuthorization` and XML `nodeType` now have explicit parser/writer proof, malformed top-level `paths` templates are rejected before upgrade/canonicalisation, valid templated paths survive parser -> IR -> writer -> endpoint/MCP consumers unchanged, Husky `pre-commit` formats staged files with Prettier, Husky `pre-push` runs `pnpm check:ci`, the generated-code validation temp harness now allocates isolated per-suite directories under `lib/tests-generated/.tmp`, and repo-root `pnpm check` is green on the final close-out sweep. The Phase C reviewer loop is closed with no open findings after the installed in-session fallback for `code-reviewer`, `test-reviewer`, and `openapi-expert`. For aggregate verification, use `pnpm check` locally or `pnpm check:ci` when a non-mutating run is required; do not invoke `pnpm qg` directly. Hook runs reinforce the workflow but do not replace explicit aggregate reruns when closing work. Do not reopen AP4, Phase B, or Phase C unless a fresh regression is reproduced. Resume the parent OAS 3.2 plan at Phase D next (Example Object `dataValue` / `serializedValue` semantics), unless a user reports a fresh gate or runtime issue that must be reproduced first.
