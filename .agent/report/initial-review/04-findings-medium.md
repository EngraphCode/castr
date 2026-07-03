# Medium Findings (M1–M12)

Each entry: severity is Medium unless noted; format is condensed (location → evidence → why → fix).

---

## M1 — Doctrine bans `Object.*`/`Reflect.*` that are not lint-enforced and are used 148× in product code

- **Category:** docs-honesty · **Verification:** 🔵 read source + 🟢 ran gate
- `principles.md:924` ("Object._ methods … Reflect._ methods") and the summary `:1807` list these as categorically
  FORBIDDEN escape hatches. But `lib/eslint.config.ts` has **no** `no-restricted-syntax`/`no-restricted-properties` rule
  for them, and product code uses `Object.keys/values/entries/fromEntries` and `Reflect.get/set` **148×** (counted via
  grep over `lib/src` non-test files). Concrete examples: `validation/cli-type-guards.ts:75,99-100`;
  `compatibility/integer-target-capabilities.openapi-schemas.ts:84-92`; `operations/fields/builder.operations.fields.ts:64`
  (see M12).
- **Why:** the doctrine declares an absolute the codebase does not hold and the linter does not enforce → "docs must
  agree with code" drift.
- **Fix (normalise to the strictest = the doc):** `principles.md` is the strict party here, so raise enforcement and
  code up to it — add a `no-restricted-syntax`/`no-restricted-properties` lint rule banning `Object.*`/`Reflect.*` (at
  least the type-information-losing uses such as `Object.keys`) and refactor the 148 usages to typed alternatives, making
  the strict claim machine-enforced. Do **not** soften the doctrine. (Fixes M12 as a by-product.)

## M2 — ADR-026's "no string manipulation, lint-enforced, no exceptions" is evaded via lodash function-call form

- **Category:** docs-honesty / architecture · **Verification:** 🔵 read source (grep)
- The `no-restricted-syntax` selectors in `eslint.config.ts:311+` match only **method-call** form
  (`CallExpression[callee.property.name='startsWith']`, etc.). **20 `lib/src` files** import the same operations as
  standalone functions from `lodash-es` (`startsWith`, `endsWith`, `split`, `replace`, `slice`, `toLower`, `trim`,
  `indexOf`, `includes`) and call them as `startsWith(x, y)` — `callee.name`, which no selector matches. Examples:
  `context/mcp/template-context.mcp.naming.ts` (`endsWith, split, startsWith, trim, trimStart`),
  `context/mcp/schemas/template-context.mcp.inline-json-schema.ts:25` (`drop, join, split, startsWith` — used for
  **ad-hoc `#/definitions/` `$ref` parsing**, which ADR-026 says must be centralised),
  `parsers/json-schema/normalization/json-schema-parser.normalization.refs.ts:2` (`split, join` for ref-path rewriting).
- **Why:** ADR-026 and AGENT.md present this as a hard, lint-enforced invariant with no exceptions; in reality it is
  enforced only against one syntactic form, and the code has migrated to the unenforced form — including the very
  `$ref`-parsing centralisation the ADR mandates.
- **Fix:** add selectors/`no-restricted-imports` for the lodash function-call form (or ban importing those names from
  `lodash-es` in `src/**`), route `$ref` decomposition through the centralised utilities, then update ADR-026 to state
  the real enforcement scope honestly.

## M3 — Four divergent `isRecord` functions (single-source-of-truth violation)

- **Category:** type-discipline · **Verification:** 🔵 read source
- `type-guards.ts:53` (`value is object`, accepts `{}`; **the publicly re-exported one**), `types.ts:15`
  (`value is UnknownRecord`, **rejects `{}`** — root cause of C4; the one imported by ~19 IR files),
  `openapi/version.ts:22` (`value is UnknownKeyedObject`, **accepts arrays** — no `Array.isArray` guard),
  `load-openapi-document/additional-operations-validation/index.ts:26` (delegates to `isObject`). One conceptual
  predicate forked into ≥3 behaviours; the public API and the internal IR validators disagree on what "a record" is.
- **Why:** `principles.md` §3 "Define each type ONCE." The divergence is not cosmetic — it causes C4 and lets arrays be
  treated as records (`version.ts`).
- **Fix:** consolidate to one canonical `isRecord` with correct semantics; delete the per-file copies.

## M4 — An integration test performs filesystem IO under `pnpm test`

- **Category:** test-quality · **Verification:** 🔵 read source
- `parsers/zod/zod-parser.runner.integration.test.ts` does `fs.readdir` (`:83`), `fs.readFile` (`:100-101`), and
  `fs.writeFile` under `UPDATE_SNAPSHOTS` (`:132`). `vitest.config.ts:18` include is `src/**/*.test.ts`, which matches
  `*.integration.test.ts`, so it runs in the primary `pnpm test` gate. It also `console.warn`-skips fixtures lacking an
  expected file (`:91-94`), a soft-skip that hides missing coverage.
- **Why:** `testing-strategy.md` ("integration tests DO NOT trigger IO") and `principles.md` #5 (no FS/network IO in
  non-E2E tests).
- **Fix:** move fixture-driven runners to the e2e/gen gate or inline fixture content as in-process data; remove the
  `writeFile`/`UPDATE_SNAPSHOTS` branch and the soft-skip from the unit/integration chain.

## M5 — `logger.test.ts` mutates global `console` and includes types-only assertions

- **Category:** test-quality · **Verification:** 🔵 read source
- `shared/utils/logger.test.ts:19-21` uses `vi.spyOn(console, 'info'|'warn'|'error').mockImplementation(...)` — global
  state mutation, which `testing-strategy.md:34` explicitly bans ("no `vi.stubGlobal`/global mutation; product code must
  accept configuration as parameters"). The file also imports `expectTypeOf` for a types-only "type safety" test, which
  the strategy says to delete.
- **Why:** the product `logger` reaches for global `console` instead of accepting an injected sink; the test compensates
  by mutating global state.
- **Fix:** inject the output sink(s) into `logger`; assert on the injected fake; delete the types-only test.

## M6 — MCP output schema dropped for `2XX`/`default`-only success responses (writer divergence)

- **Category:** correctness-bug · **Verification:** 🔵 read source
- `context/mcp/template-context.mcp.responses.ts:218` skips any response where `Number(statusCode)` is not an integer in
  `[200,300)`. `Number('2XX')` and `Number('default')` are `NaN` → skipped → no MCP `outputSchema`. But the endpoint
  builder's `isSuccessStatusCode` treats `2XX` as the primary success response and emits its schema. So for an operation
  whose only success response is `2XX`, the endpoint metadata carries the success schema while the MCP tool has none —
  two writers reading the same IR disagree.
- **Why:** undermines IR-as-single-source-of-truth for MCP outputs.
- **Fix:** align MCP success selection with `isSuccessStatusCode` (handle `2XX`/`default`), or document that MCP
  `outputSchema` requires a concrete 2xx status.

## M7 — Zod refinement writer iterates `patternProperties`/`dependentSchemas` unsorted, while the TS writer sorts

- **Category:** determinism · **Verification:** 🔵 read source
- `writers/zod/refinements/object.ts:69` (`Object.entries(schema.patternProperties)`), `:127`
  (`Object.keys(schema.dependentSchemas)`), `:142` (`Object.entries(schema.dependentRequired)`) — all **unsorted**. The
  TypeScript writer sorts the same fields: `type-writer/dependent-keywords.ts:43,77` use
  `.sort((a,b)=>a.localeCompare(b))`. So emit order depends on input key insertion order, diverging from the repo's
  "sorted keys everywhere" rule and from the sibling writer.
- **Why:** `principles.md` Deterministic Output ("stable ordering everywhere … no unsorted `Object.keys` feeding
  output").
- **Fix:** sort by key (`localeCompare`) before emitting, matching the TS writer.

## M8 — Integer-capability IR traversal omits six child-bearing keywords (latent)

- **Category:** fail-fast / completeness · **Verification:** 🔵 read source
- `compatibility/integer-target-capabilities.traversal.ts:67-89` (`visitSchemaChildren`) visits properties,
  additionalProperties, items, prefixItems, allOf, oneOf, anyOf, not, unevaluatedProperties, unevaluatedItems,
  dependentSchemas — but **not** `patternProperties`, `propertyNames`, `if`, `then`, `else`, `contains`, all of which the
  parsers populate. So the document/component-level int64/bigint guards don't descend into those positions.
- **Why:** the public guard's contract (a complete capability walk) is not met. Currently _latent_ — the actual writers
  re-assert per node as they recurse, masking the gap — but a caller trusting the document guard alone would leak.
- **Fix:** add the missing keyword visits so the IR walk matches the IR's actual child surface (and the sibling
  OpenAPI-shaped traversal, which does cover them).

## M9 — `itemSchema` capability guard uses a forbidden "does not yet support" fail-fast message

- **Category:** fail-fast / docs · **Verification:** 🔵 read source
- `compatibility/item-schema-target-capabilities.ts:21` throws `"${target} does not yet support OpenAPI 3.2 itemSchema.
itemSchema is currently supported only on the OpenAPI parser -> IR -> OpenAPI writer path."` The wording frames this as
  unimplemented work, not a genuine impossibility (an `itemSchema` element type _could_ be expressed for TypeScript).
- **Why:** `principles.md` is explicit that fail-fast "is NOT acceptable as a placeholder for not yet implemented."
- **Fix:** implement the mapping, or mark the surface explicitly paused/unsupported in docs and reword the error to state
  an actual impossibility rather than "does not yet support."

## M10 — Empty-string `description`/`summary` dropped by truthy guards (invalid Response output)

- **Category:** losslessness · **Verification:** 🔵 read source
- `parsers/openapi/operations/builder.responses.ts:181` (`if (response.description)`), and the same truthy pattern at
  `builder.operations.fields.ts` (summary/description) and `builder.request-body.ts` (description). An explicit empty
  string (a distinct valid value) is silently dropped. For `Response.description` — a _required_ field — dropping `''`
  yields a structurally invalid output Response Object.
- **Why:** empty string ≠ absent; the constraint builders elsewhere already use `!== undefined`.
- **Fix:** use `!== undefined` guards for all optional string-bearing fields.

## M11 — `maybePretty` swallows formatter errors and returns unformatted input

- **Category:** fail-fast · **Verification:** 🔵 read source
- `shared/maybe-pretty.ts:21-22` (`catch { return input; // assume it's invalid syntax and ignore }`) is the final pass
  before `fs.writeFile` on the rendering path (`rendering/templating.ts:99`, `templating-groups.ts:37/62/102`). If the
  generated code is invalid TypeScript, Prettier throws and the broken/unformatted output is written silently.
- **Why:** `principles.md` Fail-Fast ("Invalid data MUST throw — Never produce partial or invalid output; never swallow
  errors in `catch{}`"). The comment explicitly contemplates emitting invalid syntax. _Contained today_ because
  generated output is independently validated by `test:gen` — so this bites only at consumer runtime, hence Medium not
  High.
- **Fix:** rethrow on parse failure with the offending source in the message; tolerate formatter-config failures only via
  an explicit, named opt-in.

## M12 — `Reflect.get`/`Reflect.set` used on the statically-typed `deprecated` field

- **Category:** type-discipline · **Verification:** 🔵 read source
- `parsers/openapi/operations/fields/builder.operations.fields.ts:64,66` reads `operation.deprecated` via `Reflect.get`
  (returns untyped) and writes the IR via `Reflect.set`, bypassing both the source type (`deprecated?: boolean`) and the
  IR field type — where `if (operation.deprecated === true) irOperation.deprecated = true;` would be fully typed.
- **Why:** a needless escape hatch (concrete instance of M1) that erases type information for no reason.
- **Fix:** use typed property access.

## M13 — Component-level parameters/responses are resolved against an empty placeholder document

- **Category:** fail-fast (inversion) / losslessness · **Verification:** 🔵 read source (structural); end-to-end rejection not reproduced
- `parsers/openapi/components/builder.components.ts:42,60` (and `builder.request-body.ts`) construct
  `{ openapi, info:{title:'',version:''}, paths:{} }` — a document with **no `components`** — as the `IRBuildContext.doc`
  for each component-level parameter/response, then resolve nested `$ref`s against `context.doc.components`.
  `builder.schemas.ts:117-127` openly flags this as a known shortcut ("we should pass the doc down").
- **Why:** any internal `$ref` reachable from a component-level parameter/response (e.g. an OAS 3.2
  `#/components/mediaTypes/X` reference) resolves against an empty document and fails — rejecting a **valid** OpenAPI
  document, the inverse of correct fail-fast (Input-Output Rule 1: all valid input must be parseable into the IR).
- **Reachability:** narrow (component-level params/responses containing internal refs). Structurally confirmed from
  source; not reproduced end-to-end — a reproduction test is listed in `09` Phase 1.
- **Fix:** thread the real `OpenAPIDocument` through `buildParameterComponents`/`buildResponseComponents`/
  `buildRequestBodyComponents` (and `buildSchemaComponents`) instead of fabricating an empty doc.
