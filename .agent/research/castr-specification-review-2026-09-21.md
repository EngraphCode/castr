# Specification review evidence, 21 September 2026

Six reviewers read draft 0.1.0 of [the specification](../../docs/SPECIFICATION.md) on 21
September 2026: `json-schema-expert`, `openapi-expert`, `zod-expert`,
`architecture-expert-wilma`, `assumptions-expert` and `docs-adr-expert`. All six ran on one
model from one brief, so their agreement is dependent evidence. This record keeps the facts
they measured, because the full reports lived only in a session's context. Draft 0.2.0
folded the findings in; the owner's decisions are in the specification itself. The session
that wrote this record did not re-run the reviewers' measurements; treat each as a
reviewer's report to re-measure before building on it.

"The consumer" is the Engraph Open Curriculum Ecosystem repository
([`EngraphCode/open-curriculum-ecosystem`](https://github.com/EngraphCode/open-curriculum-ecosystem)); its paths below are relative to that
repository.

## The finding four reviewers shared

Draft 0.1.0's coherence proof compared Castr's outputs only with each other. A model that
drops every constraint emits `z.unknown()`, an `unknown` type and an empty JSON Schema,
which agree perfectly. The cure in 0.2.0 is SPEC-G-4 to SPEC-G-7: an independent reference
validator run against the source document, a corpus pinned by commit and SHA-256, a sample
standard under which deleting any constraint flips a decision, and no vendor conversion as
oracle.

## Measured on the Oak API specification

File: `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json` (OpenAPI 3.1.0,
no `jsonSchemaDialect`, last written 17 August 2026).

- 34 paths, 34 `operationId`s, 33 component schemas, 129 `$ref` (all
  `#/components/schemas/...`, none with sibling keywords), 73 parameters (43 query, 30
  path), 133 `application/json` media types, 1 server, 9 tags, `externalDocs`, one
  `bearerAuth` security scheme applied to all 34 operations, no links, callbacks or
  webhooks.
- Keywords: `additionalProperties: false` 253, schema-valued `additionalProperties` 2 (each
  with `propertyNames`, at the two `check-restricted` 200 responses), `allOf` 8, `anyOf` 17,
  `oneOf` 16, `const` 81, `enum` 44, `default` 14, `example` 187, `description` 854,
  `title` 63, `format: uri` 4, `maximum` 7, `minItems` 1. Responses 200, 400, 401, 404 only.
- One reviewer counted 17 of 272 object nodes silent on `additionalProperties` (including
  the `POST /lessons/check-restricted` request body and quiz `answers` items); SPEC-P-1
  reads those as closed, which is how the consumer already runs
  (`packages/core/openapi-zod-client-adapter/src/generate-zod-schemas.ts`, `strictObjects:
true`, `additionalPropertiesDefaultValue: false`).
- **Eight `allOf` sites accept no value.** Example:
  `QuestionForLessonsResponseSchema.properties.starterQuiz.items.oneOf[3].properties.answers.items`
  is `allOf` of two objects that each state `additionalProperties: false`. Run through Ajv
  8.20.0 in 2020-12 mode, `{order, type, content}`, `{order}` and `{type, content}` all
  fail: `additionalProperties` sees only the `properties` of its own schema object
  (2020-12 core §10.3.2.3). SPEC-PR-7 says Castr reports this; the owner decides whether
  the document is corrected at source.

## Measured in the consumer's code generation

- `packages/sdks/oak-sdk-codegen/src/api-schema.ts` re-exports five generated types:
  `paths`, `webhooks`, `components`, `$defs`, `operations`; `paths` depends on `operations`.
- The `paths` type the typed client needs: keyed by path template; every HTTP method
  declared, absent ones as `?: never`; per operation four parameter locations, `requestBody`
  keyed by media type, `responses` keyed by status then media type.
- `openapi-typescript-helpers` resolves response bodies through `keyof` intersection with
  numeric literal statuses. Checked with `tsc` 6.0.3: `{ "200": T }` resolves to `never`,
  `{ 200: T }` resolves to `T`. Its success set is 200–204, 206, 207 and `"2XX"`; a 205,
  208, 226 or any 3xx response resolves to `never`.
- Endpoint definitions (`packages/core/openapi-zod-client-adapter/src/endpoint-types.ts`):
  `method`, `path` in colon form (`/lessons/:lesson/transcript`), `description`,
  `requestFormat`, `response`, `errors[{status, description, schema}]`,
  `parameters[{name, type, schema}]`, each schema a Zod 4 code string.
- The Zod registry is keyed by component name and by `${operationId}_${status}`
  (`code-generation/zodgen-core.ts`); component names are sanitised with a non-injective
  replace (`typegen/response-map/shared.ts`).
- About seventeen text rewrites of generated output: eight `replaceAll` passes in
  `codegen-core.ts` `postProcessTypesSource`, one of which turns "undeclared response
  headers are unconstrained" into `headers?: never`; nine string and regex rewrites in
  `zodgen-core.ts`; and `zod-v3-to-v4-transform.ts`, a string rewriter end to end.
- The consumer generates from a derived in-memory document (`schema-separation-core.ts`:
  URL decoration, added 404 responses, deferred paths), so Castr's input must accept a
  document value; it also republishes the document, version string included, as
  `schemaBase`.

## Measured on Zod 4.5.4 (the installed version) and TypeScript 6.0.3

- Every schema exposes its definition as data at `_zod.def`; `z.toJSONSchema` and
  `z.fromJSONSchema` exist.
- Unknown keys: `z.object()` strips (def `catchall` undefined), `z.strictObject` has
  catchall `never`, `z.looseObject` catchall `unknown`. `z.toJSONSchema` writes
  `additionalProperties: false` for a plain object only on its default `io: "output"` side.
  `z.fromJSONSchema` reads an omitted `additionalProperties` as loose, the opposite of
  SPEC-P-1.
- Annotations are not on the schema: `.meta()` and `.describe()` write a process-global
  registry keyed by instance; `.meta({ id })` changes the emitted JSON Schema structure.
- `.brand()` leaves the definition byte-identical; it exists only in types.
- `z.coerce.*` holds no author code (a `coerce: true` flag) but widens the accepted set.
- `z.toJSONSchema` drops `.refine`, `.superRefine`, `.check` and `.overwrite` without
  error, rewrites `.catch(v)` as `default: v`, and calls the author's `.catch` and `z.lazy`
  functions during conversion.
- `z.date`, `z.bigint`, `z.undefined`, `z.void`, `z.map`, `z.set`, `z.symbol`, `z.nan` make
  `z.toJSONSchema` throw; `z.file` does not, and emits an OpenAPI 3.0 convention.
- Two executed counterexamples to draft 0.1.0's proof wording: a stripped object accepts
  `{a, b}` while a closed JSON Schema rejects it; a `.default` makes `{}` valid on the input
  side and invalid on the output side. `z.input` and `z.output` differ for defaults, and
  `z.infer` is the output side. Hence the accepted and produced sets in the specification.

## Measured on JSON Schema

- 2020-12 core §10.3.2.3 and Draft-07 validation §6.5.6: omitting `additionalProperties`
  behaves as an empty schema (open). SPEC-P-1's reading rule is a declared profile
  exception to that.
- 2020-12 validation §7.2.1: `format` assertion is off by default; Ajv 8.20.0 accepts
  `"not a uri"` against `format: uri`. SPEC-P-3 makes `format` assert.
- `additionalProperties: false` beside `allOf` or `$ref` rejects the composed branch's
  properties; closing across composition needs `unevaluatedProperties`, which Draft-07
  lacks.
- JSON Schema numbers are arbitrary-precision; JavaScript turns `9223372036854775807` into
  `9223372036854776000`. `{"type":"integer","minimum":…,"maximum":…}` states int64 exactly,
  so the `principles.md` claim that JSON Schema has no carrier for int64 is wrong about the
  format; the limit is the JavaScript number.

## Measured on this repository

- `lib/src/schema-processing/ir/models/schema.ts` imports its vocabulary from the OpenAPI
  types and requires `metadata.zodChain` on every node; about 47 source files reference
  `zodChain`. The Zod writer (`lib/src/schema-processing/writers/zod/`) writes code as text
  through a code writer.
- Documents that state a destination, fidelity contract or capability list and disagree
  with the specification: `README.md` (opening paragraphs; "Strictness does not authorise
  closing an object whose source permits additional properties"), `lib/README.md`
  (format list), `.agent/directives/VISION.md` (progress table, format table),
  `.agent/IDENTITY.md` (the 16 April 2026 additional-properties ruling),
  `.agent/directives/principles.md` (pair-model rules 1, 3 and 4; "Objects: always
  strict"), `.agent/directives/requirements.md` (universal claims, canonical-version text),
  `.agent/rules/input-output-pair-compatibility.md`, `.agent/directives/orientation.md`
  (authority order), `.agent/directives/AGENT.md` (project context), `.agent/README.md`,
  `.agent/practice-index.md`, `.agent/plans/roadmap.md`,
  `.agent/memory/operational/repo-continuity.md`,
  `.agent/prompts/session-continuation.prompt.md`, the ADR index, ADR-038 to ADR-042,
  `docs/architecture/native-capability-matrix.md`,
  `docs/architecture/zod-round-trip-limitations.md`,
  `docs/architecture/recursive-unknown-key-semantics.md`, and six copies of "no published
  package is planned". The owner's ruling is that these are removed or corrected once,
  with no tombstones, in the repository Castr moves to.
- Static analysis on 21 September 2026: quality gate Passed on new code; overall 5 bugs, 25
  vulnerabilities, 350 code smells, reliability C, security C, duplication 9.9%; 7
  dependency alerts on `main`; 8 lint suppression comments in source.
