# High Findings (H1–H7)

---

## H1 — Draft-07 normalisation does not recurse into `if`/`then`/`else`/`patternProperties`/etc.; deep `$ref` left dangling

|                  |                                                             |
| ---------------- | ----------------------------------------------------------- |
| **Severity**     | High                                                        |
| **Category**     | losslessness / correctness                                  |
| **Verification** | 🟢 ran code                                                 |
| **Confidence**   | High                                                        |
| **Reachability** | `parseJsonSchema` for any Draft-07 doc using these keywords |

**Locations** — `parsers/json-schema/normalization/json-schema-parser.normalization.ts` (`normalizeSubSchemas` recurses
into a fixed subset: `items, additionalProperties, not, allOf, oneOf, anyOf, prefixItems, $defs, properties,
dependentSchemas` — **not** `if/then/else, patternProperties, propertyNames, contains, unevaluated*`);
`normalization.refs.ts:28` (`segments.length !== EXPECTED_REF_SEGMENT_COUNT` — 3-segment-only `$ref` rewriter).

**Evidence (reproduced)**

- At top level, `{type:'number', minimum:10, exclusiveMinimum:true, definitions:{…}}` correctly normalises to
  `{type:'number', exclusiveMinimum:10, $defs:{…}}`.
- Nested inside `then`, the same content yields IR `then.exclusiveMinimum === true` (**boolean left unconverted** — in
  2020-12 a boolean `exclusiveMinimum` is the literal value `true`, semantically broken).
- A deep `$ref` `#/definitions/Outer/properties/inner` is left verbatim while `definitions` is lifted to `$defs`, so it
  becomes a **dangling** pointer.

**Why it matters** — Cardinal Rule (no content loss to/from IR) and Input-Output Rule 1 (all valid input must be
parseable into the IR). The module docstring advertises `patternProperties`/`if-then-else` as supported, yet Draft-07
documents using them produce corrupted/dangling 2020-12 IR.

**Suggested fix** — Drive normalisation recursion from the full set of 2020-12 sub-schema-bearing keywords via one
keyword-classification table (avoiding the two hand-maintained lists). Rewrite `$ref`s by swapping the leading
`#/definitions/` prefix for `#/$defs/` regardless of remaining depth. Add Draft-07-nested-in-each-keyword tests.

_Reported by:_ 2 candidates (JSON-Schema parser). Verified by execution.

---

## H2 — OpenAPI / JSON-Schema writer silently drops `contentEncoding` and boolean `exclusiveMinimum`

|                  |                                           |
| ---------------- | ----------------------------------------- |
| **Severity**     | High                                      |
| **Category**     | losslessness                              |
| **Verification** | 🟢 ran code                               |
| **Confidence**   | High                                      |
| **Reachability** | Public `writeOpenApi` / `writeJsonSchema` |

**Locations** — `writers/shared/json-schema-fields.ts:63` (`writeStringFields` emits format/minLength/maxLength/pattern
but never `contentEncoding`), `:89` (`if (typeof schema.exclusiveMinimum === 'number')` — boolean form discarded). The IR
carries both (`ir/models/schema.ts:230,246-251`; parser `builder.constraints.ts:35,38` copies them verbatim).

**Evidence (reproduced)**

```
contentEncoding:  writeOpenApi({type:'string', contentEncoding:'base64'})  -> {"type":"string"}     (lost)
boolean exclMin:  writeOpenApi(3.0 {type:'number', minimum:5, exclusiveMinimum:true}) -> {"type":"number","minimum":5}  (exclusivity lost)
```

**Why it matters** — OAS 3.2 (JSON Schema 2020-12 dialect) can express `contentEncoding`, so this is a supported pair
silently losing data, not a genuine impossibility. Dropping boolean `exclusiveMinimum` also _changes validation
semantics_ (5 becomes an allowed value). The output type already forbids the boolean form, so the type system itself
shows the writer cannot carry it — it should normalise (boolean+`minimum` → numeric 2020-12 form, as `builder.zod-chain`
already does) or fail-fast, not silently drop.

**Suggested fix** — Emit `contentEncoding` (and `contentMediaType` once carried, see H4) in the shared field writers;
normalise boolean `exclusiveMinimum`/`exclusiveMaximum` to numeric form using the companion `minimum`/`maximum`, or
fail-fast. Add round-trip proofs.

_Reported by:_ 2 agents (OpenAPI writer; TS/JSON/MD writers). Verified by execution.

---

## H3 — Wildcard error status codes (`4XX`/`5XX`) collapsed to a single digit by `parseInt`

|                  |                                                            |
| ---------------- | ---------------------------------------------------------- |
| **Severity**     | High                                                       |
| **Category**     | correctness-bug                                            |
| **Verification** | 🔵 read source                                             |
| **Confidence**   | High                                                       |
| **Reachability** | Endpoint metadata for any spec using wildcard error ranges |

**Location** — `context/endpoints/template-context.endpoints.from-ir.ts:135`
(`status: r.statusCode === STATUS_DEFAULT ? STATUS_DEFAULT : parseInt(r.statusCode, 10)`).

**What's wrong** — OpenAPI permits `1XX`–`5XX` wildcard response keys; the IR stores them verbatim. `isSuccessStatusCode`
treats only `2XX` as success, so `4XX`/`5XX` flow into `mapErrors`, where `parseInt('4XX',10) === 4` and
`parseInt('5XX',10) === 5`. `EndpointError.status` becomes the meaningless integer `4`/`5`, colliding across all
4xx/5xx responses. Existing tests cover `2XX`, `299`, `400`, `default` — never a non-2xx wildcard.

**Why it matters** — Generated error metadata is silently wrong for any spec using wildcard error ranges, defeating
consumers that key error handling on `status`. Content loss in a claimed-supported surface, no fail-fast.

**Suggested fix** — Preserve wildcard tokens (widen `EndpointError.status` to allow the range strings, mirroring
`CastrResponse.statusCode`) or fail-fast on unsupported tokens. Add `4XX`/`5XX` tests.

_Reported by:_ 1 agent (context/endpoints). Verified by reading.

---

## H4 — JSON-Schema parser silently drops `$ref` siblings and `contentMediaType`/`contentSchema`

|                  |                          |
| ---------------- | ------------------------ |
| **Severity**     | High                     |
| **Category**     | losslessness / fail-fast |
| **Verification** | 🟢 ran code              |
| **Confidence**   | High                     |
| **Reachability** | `parseJsonSchema`        |

**Locations** — `parsers/json-schema/json-schema-parser.core.ts:57` (`return { $ref: input.$ref, metadata: … }` — drops
all siblings); `json-schema-parser.helpers.ts:85` (handles `contentEncoding`, but nothing handles `contentMediaType`/
`contentSchema`).

**Evidence (reproduced)**

```
parseJsonSchema({$ref:'#/$defs/Base', description:'hi', minLength:5, title:'T'})
  -> { $ref:'#/$defs/Base', metadata } only   (description / minLength / title gone)

parseJsonSchema({type:'string', contentEncoding:'base64', contentMediaType:'image/png'})
  -> { type:'string', contentEncoding:'base64' }   (contentMediaType gone)
```

**What's wrong** — JSON Schema 2020-12 applies `$ref` siblings (unlike Draft-07), so dropping them loses meaning. The
parser _does_ fail-fast on `int64`/`bigint` siblings but silently drops every other sibling — an inconsistent fail-fast
posture. `contentMediaType` (Draft-07 & 2020-12) and `contentSchema` (2020-12) are valid input keywords.

**Why it matters** — Cardinal Rule (no content loss) and Fail-Fast (unsupported input must throw, never silently
degrade).

**Suggested fix** — Carry `$ref` siblings and `contentMediaType`/`contentSchema` into the IR (preferred), or fail-fast
with an actionable "unsupported keyword/sibling" error. Do not silently discard.

_Reported by:_ 2 agents (JSON-Schema parser). `$ref`-siblings and `contentMediaType` cases verified by execution.

---

## H5 — A cluster of documented, CLI-plumbed options is never consumed by generation

|                  |                                             |
| ---------------- | ------------------------------------------- |
| **Severity**     | High                                        |
| **Category**     | docs-honesty / dead-code                    |
| **Verification** | 🔵 read source (grep: zero consumers)       |
| **Confidence**   | High                                        |
| **Reachability** | Public CLI flags & `TemplateContextOptions` |

**Locations (representative)** — `context/template-context.ts:78` (`defaultStatusBehavior`), `:106`
(`complexityThreshold`), plus the larger set the sweep enumerated (`withImplicitRequiredProps`, `withDeprecatedEndpoints`,
`withDefaultValues`, `withAllResponses`, `allReadonly`, …). Each is declared on `TemplateContextOptions`, parsed in
`cli/helpers.ts`, and assigned into `generationOptions` (`cli/helpers.options.ts:110-113`).

**Evidence** — grepping all of `lib/src` (excluding the declaration, CLI parsing, and JSDoc examples) finds **zero reads**
of `defaultStatusBehavior` or `complexityThreshold` in the generation logic. The endpoint builder
(`template-context.endpoints.from-ir.ts`) never consults options, so default-only endpoints are always produced, and the
documented default — _"`spec-compliant` (default): Ignores endpoints with only default responses"_ (`template-context.ts:57`)
— describes behaviour the code does not implement.

**Why it matters** — `principles.md` "Strict And Complete Everywhere" + HONESTY: a claimed capability must be
implemented, validated, documented and proven, or stated as unsupported. These are user-facing, CLI-exposed options whose
behaviour is entirely absent.

**Suggested fix** — Implement the behaviour (e.g. the `spec-compliant`/`auto-correct` default-response filtering) or
remove the options and CLI flags and document that the behaviour is not configurable. (Note: this also neutralises the
`complexityThreshold` "no NaN guard" concern — see L-series — because nothing consumes the value.)

_Reported by:_ 2 agents (context/endpoints). Verified by grep; `complexityThreshold`'s non-consumption cross-checked
against the `schema-complexity` module.

---

## H6 — The IR model advertises schema-valued `additionalProperties` that the whole pipeline rejects

|                  |                                                                             |
| ---------------- | --------------------------------------------------------------------------- |
| **Severity**     | High                                                                        |
| **Category**     | docs-honesty / dead type branches                                           |
| **Verification** | 🔵 read source + 🟢 ran code (parser fail-fast)                             |
| **Confidence**   | High                                                                        |
| **Reachability** | Type surface + dead branches; the schema-valued runtime path is unreachable |

**Locations** — `ir/models/schema.ts:186` (`additionalProperties?: boolean | CastrSchema;`) with TSDoc (`:180-185`)
documenting "schema: additional properties must match schema"; `ir/validation/validators.schema.ts:109`
(`typeof value['additionalProperties'] === 'boolean'` — rejects schema-valued); both parsers fail-fast on non-strict
input; the writer only ever emits `false` or omits it.

**Evidence** — The type + TSDoc promise three forms (`true`, `false`, schema); the validator accepts only `boolean`; the
unit test asserts schema-valued is rejected; `buildIR({…, additionalProperties:true})` throws
(`"Non-strict object input 'additionalProperties: true' is rejected"`, 🟢 reproduced); the writer never emits a
schema-valued form. So the type and docs advertise a capability that is rejected at the boundary and never produced —
and create dead `typeof additionalProperties === 'object'` branches that can never execute.

**Why it matters** — HONESTY ("code, proofs, docs agree") and the closed-world IDENTITY doctrine. A model field whose
type/TSDoc promise a form the pipeline forbids is a dishonest capability claim and a type-safety hole (the type permits
states the IR forbids).

**Suggested fix** — Narrow the IR type to match the enforced closed-world reality (`additionalProperties?: false` or
`boolean`), delete the TSDoc schema bullet and the dead object-valued branches; or implement and prove schema-valued
catchall end-to-end. (Directly related to L8, which is the latent writer-narrowing of this same field.)

_Reported by:_ 1 agent (IR/conversion). Verified by reading + reproducing the parser fail-fast.

---

## H7 — The proof gap that hid C6: vacuous and substring-only tests

|                  |                                                                |
| ---------------- | -------------------------------------------------------------- |
| **Severity**     | High                                                           |
| **Category**     | test-quality / proof-completeness                              |
| **Verification** | 🟢 ran code (Vitest) + 🔵 read source                          |
| **Confidence**   | High                                                           |
| **Reachability** | The test suite itself (these are the proofs the gates rely on) |

**Locations** — `rendering/templates/schemas-with-metadata.test.ts:544-545` (and `:621`); `writers/zod/fail-fast.unit.test.ts`
(`:4` "PROVES … semantic .refine() output", `:246-247`, `:377` etc.).

**Evidence (reproduced)**

- `generateZodClientFromOpenAPI({disableWriteToFile:true})` returns a `GenerationResult` **object**; the positive tests
  correctly use `result.content`, but the negative ones assert `expect(result).not.toContain('export function
validateRequest')` on the _object_. A one-file Vitest run proved `expect({content:'…validateRequest…'}).not.toContain
('export function validateRequest')` **passes** — so the assertion is vacuous and would pass even if suppression broke.
- The 2020-12 refinement tests only assert `expect(output).toContain('.refine(')` plus a keyword substring — never
  building or executing the generated Zod. This is exactly how the C6 no-op/broken refinements shipped behind a
  "PROVES semantic output" banner.

**Why it matters** — `testing-strategy.md`: tests must prove _behaviour_, not the presence of a string; "No partial proof
posture" for claimed-supported surfaces. These tests manufacture false confidence.

**Suggested fix** — Negative assertions: `assertSingleFileResult(result)` then assert on `result.content`. Refinement
tests: build/execute the generated Zod and assert valid data is accepted and invalid data rejected (these would go red,
exposing C6). See `07` and `09`.

_Reported by:_ 3 agents (context/endpoints; Zod writer ×2). The vacuous-`toContain` mechanism verified by execution.
