# Critical Findings (C1–C6)

All six were **reproduced by executing the shipped/compiled pipeline** (🟢 ran code). Each is reachable through the
public API or the published package.

---

## C1 — The build ships no type declarations, and two export targets do not exist

|                  |                                                                                 |
| ---------------- | ------------------------------------------------------------------------------- |
| **Severity**     | Critical                                                                        |
| **Category**     | packaging / developer-experience / docs-honesty                                 |
| **Verification** | 🟢 ran code (clean build, direct `tsc`, filesystem stat of every export target) |
| **Confidence**   | High                                                                            |
| **Reachability** | Every consumer of the published package                                         |

**Locations**

- `tsconfig.json:22` (repo root) — `"noEmit": true`
- `lib/tsconfig.json` — extends the root, sets `declaration: true`, but **never overrides `noEmit`**
- `lib/package.json:32` — `"build": "tsup && tsc --emitDeclarationOnly"`
- `lib/package.json` `exports` — `types` targets `./dist/index.d.ts`, `./dist/cli/index.d.ts`, `./dist/parsers/zod/index.d.ts`; import target `./dist/parsers/zod/index.js`
- `lib/tsup.config.ts` — `entry: ['src/**/*.ts', …]`, `bundle: false` (mirrors source layout)

**Evidence (reproduced)**

- A fully clean build (`rm -rf dist tsconfig.tsbuildinfo && pnpm run build`, exit 0) produced **0 `.d.ts` files**.
- `tsc --emitDeclarationOnly` run directly: exit 0, **emitted nothing**. Re-running with `--noEmit false`: **430 `.d.ts`
  appeared** — proving the inherited `noEmit:true` is the cause.
- Export-target existence check (Node reading `package.json` `exports` and `fs.existsSync` on each target):

  ```
  .            types -> ./dist/index.d.ts            *** MISSING ***
  .            import -> ./dist/index.js             EXISTS
  ./cli        types -> ./dist/cli/index.d.ts        *** MISSING ***
  ./cli        import -> ./dist/cli/index.js         EXISTS
  ./parsers/zod types -> ./dist/parsers/zod/index.d.ts *** MISSING ***
  ./parsers/zod import -> ./dist/parsers/zod/index.js  *** MISSING ***
  ```

- When emission is forced, declarations land at `dist/src/index.d.ts` (because `rootDir: "."` keeps the `src/` prefix),
  **not** the `dist/index.d.ts` the `types` field points to — so even fixing `noEmit` alone would leave the paths wrong.
- `./parsers/zod` import target is missing because tsup mirrors the source tree: the source is
  `src/schema-processing/parsers/zod/index.ts` → built to `dist/schema-processing/parsers/zod/index.js`; there is no
  `src/parsers/`, hence no `dist/parsers/zod/`.

**Three compounding defects**

1. `noEmit:true` (inherited) makes `tsc --emitDeclarationOnly` a silent no-op → **no `.d.ts` at all**.
2. Even if (1) were fixed, `rootDir:"."` would emit to `dist/src/**`, not the `types` paths.
3. `./parsers/zod` maps to a path that the source layout never produces.

**Impact** — `README.md` documents `import { parseZodSource } from '@engraph/castr/parsers/zod'`; that import would fail
module resolution for a published consumer. And a published `@engraph/castr` would ship with no type declarations at all,
so consumers get no IntelliSense or type-checking against the library — in direct conflict with the doctrine's
"Developer Experience is Priority #1" and the heavy TSDoc investment.

**Why it matters (doctrine)** — `principles.md` HONESTY ("code, proofs, and docs agree"); the README/`package.json`
advertise types and a Zod sub-path that a fresh build does not deliver.

**Suggested fix** — (a) Override `noEmit:false` in `lib/tsconfig.json` (or add `--noEmit false` to the build, or use
tsup `dts:true`); (b) set `declarationDir`/`rootDir` so `.d.ts` land at the `types` paths (or use `tsup --dts` which
mirrors the JS layout); (c) repoint `./parsers/zod` to `./dist/schema-processing/parsers/zod/index.{js,d.ts}` **or** add a
real `src/parsers/zod/index.ts` re-export entry; (d) add a packaging gate — `publint` + `@arethetypeswrong/cli` — which
would have caught all three (see `09`).

_Reported by:_ the sweep flagged the `./parsers/zod` mismatch obliquely; the `noEmit` root cause and the missing-`.d.ts`
result were found during orchestrator verification.

---

## C2 — Operation security "A AND B" round-trips as "A OR B"

|                  |                                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| **Severity**     | Critical                                                                |
| **Category**     | correctness-bug / losslessness / security                               |
| **Verification** | 🟢 ran code                                                             |
| **Confidence**   | High                                                                    |
| **Reachability** | Public `buildIR` + `writeOpenApi`; endpoint metadata; MCP tool security |

**Location** — `lib/src/schema-processing/parsers/openapi/operations/fields/builder.operations.fields.ts:113`
(`return security.flatMap((securityRequirement): IRSecurityRequirement[] => {`); `IRSecurityRequirement`
(`ir/models/schema.operations.ts`) carries a single `schemeName`; writer `openapi-writer.operations.fields.ts` (`writeSecurity`).

**Evidence (reproduced)** — input operation `security: [{ apiKey: [], oauth2: ['read'] }]` (one requirement object =
"apiKey **AND** oauth2"); after `buildIR` → `writeOpenApi`:

```
out security: [{"apiKey":[]},{"oauth2":["read"]}]
```

i.e. two separate requirement objects = "apiKey **OR** oauth2".

**What's wrong** — A `SecurityRequirementObject` with multiple schemes means logical AND. `buildIRSecurity` flattens
both the outer OR-array and the inner AND-object into a flat `IRSecurityRequirement[]`, and the IR type cannot represent
AND-grouping at all. The writer then emits each flat entry as its own requirement object, collapsing AND → OR.

**Why it matters** — An endpoint that required _both_ schemes is reported as requiring _either_ — a real security
weakening in generated specs and MCP metadata, and a losslessness violation (the IR must be able to carry every valid
input feature; AND-grouped security is valid and common). There are no tests for `buildIRSecurity`.

**Suggested fix** — Model `IRSecurityRequirement` as a requirement **set** (`{ schemeName, scopes }[]`), build it without
flattening the inner object, and reconstruct one `SecurityRequirementObject` per AND-set in `writeSecurity` and in the
MCP `resolveOperationSecurityFromIR`. Add a multi-scheme round-trip test.

_Reported by:_ 1 agent (context/endpoints). Verified independently.

---

## C3 — Component-name sanitisation breaks `$ref` round-trips (dangling references)

|                  |                                                                                 |
| ---------------- | ------------------------------------------------------------------------------- |
| **Severity**     | Critical                                                                        |
| **Category**     | losslessness                                                                    |
| **Verification** | 🟢 ran code                                                                     |
| **Confidence**   | High                                                                            |
| **Reachability** | Public `buildIR` + `writeOpenApi`; any spec with non-identifier component names |

**Locations** — `lib/src/schema-processing/parsers/openapi/schemas/builder.schemas.ts:108` (`name: toIdentifier(name),`);
writer `openapi-writer.components.ts` emits `result.schemas[component.name]`; `$ref` strings are stored and re-emitted
verbatim.

**Evidence (reproduced)** — input with `components.schemas['Basic.Thing']` and another schema referencing
`#/components/schemas/Basic.Thing`; after `buildIR` → `writeOpenApi`:

```
output schema keys: ["Basic_Thing","Ref"]
Ref.b $ref: {"$ref":"#/components/schemas/Basic.Thing"}
```

The component key was sanitised to `Basic_Thing`, but the `$ref` still points at `Basic.Thing` → **dangling**.

**What's wrong** — `Basic.Thing` is a valid OpenAPI component key (`^[a-zA-Z0-9.\-_]+$`). The parser mangles the
_identity_ of the component (a codegen/variable-naming concern) while `$ref`s are preserved verbatim, so the output spec's
internal references no longer resolve and the original name is unrecoverable from the IR.

**Why it matters** — Cardinal Rule: "NO CONTENT LOSS is ever acceptable"; parse → IR → write must round-trip faithfully.
Here it produces a structurally broken OpenAPI document.

**Suggested fix** — Keep the original component name as the IR identity (the round-trip key) and apply `toIdentifier`
only when generating code symbols; or rewrite every emitted `$ref` to the sanitised name consistently.

_Reported by:_ 1 agent (OpenAPI parser). Verified independently.

---

## C4 — IR `serialize → deserialize` throws for an object schema with empty `properties`

|                  |                                                                      |
| ---------------- | -------------------------------------------------------------------- |
| **Severity**     | Critical                                                             |
| **Category**     | losslessness                                                         |
| **Verification** | 🟢 ran code                                                          |
| **Confidence**   | High                                                                 |
| **Reachability** | Public `buildIR`/`serializeIR`/`deserializeIR` (persistence surface) |

**Locations** — `lib/src/shared/type-utils/types.ts:24` (`return isProbablyObject && hasKeys && hasValues && hasStringKey;`),
consumed by `lib/src/schema-processing/ir/serialization.ts:63` (`isRecord(record['value'])`); `CastrSchemaProperties.toJSON`
serialises an empty map to `{ dataType: 'CastrSchemaProperties', value: {} }`.

**Evidence (reproduced)**

```
3 buildIR({type:object, properties:{}}) -> serializeIR -> deserializeIR
   THREW: Invalid CastrDocument structure

9 isRecord({}): false   isRecord({"":1}): false   isRecord({a:1}): true
```

**What's wrong** — `isRecord` requires at least one key (`hasKeys`) and a non-empty first string key, so `isRecord({})`
is `false`. On deserialize, `isSerializedCastrSchemaProperties` gates on `isRecord(record['value'])`; with an empty
properties map `value` is `{}` → guard fails → the schema is not revived → `isCastrDocument` returns false → throw.

**Why it matters** — An empty `properties: {}` object is valid OpenAPI/JSON-Schema (and a valid `z.object({})`).
`serializeIR`/`deserializeIR` are public exports and the documented persistence/round-trip surface (DoD E2E:
"IR fidelity, OpenAPI round-trip, persistence"). The fidelity fixtures never cover the empty case.

**Suggested fix** — Make `isRecord` a plain non-null, non-array object check
(`typeof v === 'object' && v !== null && !Array.isArray(v)`); drop `hasKeys`/`hasValues`/`hasStringKey`. Consolidate to a
single `isRecord` (see M3). Add a round-trip fixture for `{type:'object',properties:{}}`.

_Reported by:_ 3 agents (shared/CLI; IR-serialization; Zod-writer). Verified independently. Root cause shared with M3.

---

## C5 — The Zod source parser silently drops content (`errors:[]`)

|                  |                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Severity**     | Critical                                                                                                             |
| **Category**     | losslessness / fail-fast                                                                                             |
| **Verification** | 🟢 ran code (each case below); 🟡 mechanism for `.transform`/`.brand`/`.pipe`, `.readonly`, non-literal enum members |
| **Confidence**   | High                                                                                                                 |
| **Reachability** | Public `parseZodSource` (`@engraph/castr/parsers/zod`)                                                               |

**Locations** — `composition/zod-parser.union.ts:52`; `composition/zod-parser.composition.ts:148` (tuple), `:175`
(`z.nativeEnum`), `:190` (enum members); `types/zod-parser.primitives.chain.ts:41` (chain capture);
`types/zod-parser.object.ts:166` (object modifiers).

**Evidence (reproduced — all returned `errors: 0`)**

| Input                                                   | Result                                                                                             |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `z.union([z.string(), z.coerce.number()])`              | `anyOf` contains only the string member; the `coerce.number()` member is gone                      |
| `z.tuple([z.string(), z.coerce.number(), z.boolean()])` | `prefixItems: [string, boolean]`, `minItems/maxItems: 2` — middle element dropped, **arity 3 → 2** |
| `z.nativeEnum(Color)`                                   | `{ type: 'string' }` — **all enum values gone**, type widened to any string                        |
| `z.string().refine((s) => s.length > 3)`                | `zodChain.validations: ['.refine()']` — **predicate lost**                                         |
| `z.strictObject({a}).refine((o) => true)`               | IR identical to `z.strictObject({a})` — **refine silently dropped**                                |

**What's wrong** — Parsing is built on an ad-hoc allow-list/blacklist rather than a strict whitelist. Members/methods
the dispatcher does not recognise are skipped (union/tuple/enum), widened (`nativeEnum`), or text-captured with their
arguments destroyed (`.refine()` → `.refine()` with no body; the Zod writer at `writers/zod/index.ts:274` re-emits these
verbatim, producing semantically empty Zod). All present as successful parses with no diagnostics.

**Why it matters** — `principles.md` Fail-Fast: "Unsupported patterns MUST throw — Never silently fall back."
ADR-032 declares Zod ingestion lossless and union semantics "preserved exactly." A consumer regenerating from this IR
gets a schema that validates inputs the original would have rejected.

**Suggested fix** — Replace the per-kind blacklists with explicit whitelists; any unrecognised union/tuple/enum member or
chained method must `throw` a `PARSE_ERROR` naming the offending construct and location, rather than being skipped or
text-captured.

_Reported by:_ 7 candidates (Zod parser) + the ADR-032 honesty corollary. Verified the five cases above by execution; the
remaining same-mechanism cases (`.transform`/`.brand`/`.pipe`, `.readonly`, non-literal enum members) by reading the shared
dispatcher.

---

## C6 — The Zod writer emits broken or no-op runtime validators

|                  |                                                                  |
| ---------------- | ---------------------------------------------------------------- |
| **Severity**     | Critical                                                         |
| **Category**     | correctness-bug / losslessness                                   |
| **Verification** | 🟢 ran code (extracted the emitted `.code`); 🔵 read source      |
| **Confidence**   | High                                                             |
| **Reachability** | Public Zod generation for any schema with these 2020-12 keywords |

**Location** — `lib/src/schema-processing/writers/zod/refinements/object.ts` (`:131` dependentSchemas, `:187` conditional,
`:71`/`:76` patternProperties), `refinements/array.ts:46` (contains), `:89` (unevaluatedItems).

**Evidence (reproduced — emitted `.code` from `getZodSchema`)**

```js
// dependentSchemas { role: { required: ['team'] } }  -> NO-OP (always true):
.refine((obj) => !('role' in obj) || (() => { /* … */ return true; })(),
        { message: 'dependentSchemas: when "role" is present, additional schema constraints apply' })

// contains: { type: 'integer' }, minContains: 2  -> ALWAYS FALSE (rejects every integer array):
z.array(z.unknown()).refine((arr) => arr.filter(item => typeof item === 'integer').length >= 2, …)

// if/then/else  -> emitted as a plain object, NO conditional validation at all:
z.strictObject({ a: z.string().optional(), b: z.string().optional() })

// patternProperties (source confirms): typeof obj[k] === '${patternSchema.type ?? 'unknown'}'
//   - typeless sub-schema -> typeof === 'unknown' (never true -> rejects all matching keys)
//   - drops every nested sub-schema constraint regardless
```

**What's wrong** — `dependentSchemas` and `if/then/else` enforce nothing; `contains`/`patternProperties`/
`unevaluatedItems`/`unevaluatedProperties` reduce a sub-schema to a single `typeof` test, and JSON-Schema type names
(`integer`, `array`, `null`, the `unknown` default) are values `typeof` never returns — so the generated validators
_reject valid data_. (Note the contrast: `dependentRequired` at `object.ts:147` _is_ correctly implemented.)

**Why it matters** — `principles.md` §"What Supported Means" cites `if/then/else` and `patternProperties` → Zod
`.refine()` as the _canonical_ examples of correct semantic preservation, and the parser advertises them as "now
supported." The implementation produces validators that either accept everything or reject everything — silently. This is
exactly the "permissive/fake-success path" the doctrine forbids, and it is the opposite of the runtime-safety the tool
sells. It survived because the only tests are substring checks (see H7).

**Suggested fix** — Recurse the sub-schema through the Zod writer and validate via `<subSchema>.safeParse(x).success`
(map types correctly: `integer → Number.isInteger`, `array → Array.isArray`, `null → === null`); implement real
`if/then/else` and `dependentSchemas` validation, or **fail-fast** for any keyword that cannot yet be expressed. Never
emit `return true` or `typeof x === '<jsonSchemaType>'`. Replace the substring tests with behavioural ones (H7).

_Reported by:_ 4 agents (Zod writer / refinements). Verified by extracting and reading the emitted code.
