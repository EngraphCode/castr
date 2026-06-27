# Appendix A — Reproductions

**Date:** 2026-06-04 · **Commit:** `main` @ `393e476`

Everything below was run first-hand. The probe scripts are reproduced in full so any claim can be re-verified. Run them
against a built `dist` (`pnpm -C lib run build` first). Paths are absolute as used during the review; adjust the `D`
prefix as needed.

> Note on environment: the gate run was executed after `pnpm install`. Several probes import internal `dist` modules
> directly (e.g. `dist/schema-processing/index.js`) because the public sub-path `./parsers/zod` does not resolve (C1).

---

## A.1 — Quality gates (all green)

Run sequentially from repo root, capturing per-gate exit codes:

```
EXIT[pnpm build]=0          EXIT[pnpm knip]=0
EXIT[pnpm type-check]=0     EXIT[pnpm portability:check]=0
EXIT[pnpm lint]=0           EXIT[pnpm test]=0            (129 files passed)
EXIT[pnpm madge:circular]=0 EXIT[pnpm character]=0       (16 files passed)
EXIT[pnpm madge:orphans]=0  EXIT[pnpm test:snapshot]=0   (69 files passed)
EXIT[pnpm depcruise]=0      EXIT[pnpm test:gen]=0        (6 files passed)
                            EXIT[pnpm test:transforms]=0 (23 files passed)
                            EXIT[pnpm test:e2e]=0        (3 files passed)
```

## A.2 — C1: declarations + export targets

```bash
# Clean build emits zero .d.ts
cd lib && rm -rf dist tsconfig.tsbuildinfo && pnpm run build   # exit 0
find dist -name '*.d.ts' | wc -l                               # -> 0

# Cause: inherited noEmit:true. Overriding it emits 430 .d.ts, at dist/src/** (wrong path):
pnpm exec tsc --emitDeclarationOnly --noEmit false -p tsconfig.json
find dist -name '*.d.ts' | wc -l                               # -> 430
ls dist/index.d.ts                                             # No such file
ls dist/src/index.d.ts                                        # exists (wrong location vs package.json "types")
```

Export-target existence (Node reading `package.json` `exports` + `fs.existsSync`):

```
.            types  -> ./dist/index.d.ts             *** MISSING ***
.            import -> ./dist/index.js               EXISTS
./cli        types  -> ./dist/cli/index.d.ts         *** MISSING ***
./cli        import -> ./dist/cli/index.js           EXISTS
./parsers/zod types  -> ./dist/parsers/zod/index.d.ts *** MISSING ***
./parsers/zod import -> ./dist/parsers/zod/index.js   *** MISSING ***   (built at dist/schema-processing/parsers/zod/)
```

Root cause: `tsconfig.json:22` `"noEmit": true`; `lib/tsconfig.json` extends it and never overrides; `lib/tsup.config.ts`
mirrors source layout (`bundle:false`), and there is no `src/parsers/` directory.

## A.3 — Probe 1 (parser drops, IR round-trip, writer drops, security, component names)

`/tmp/castr-probe.mjs` — drives the built `dist`. Key observed output:

```
1a union([string, coerce.number()])      -> errors:0; anyOf = [string only]        (coerce member dropped)
1b tuple([string, coerce.number(), bool]) -> errors:0; prefixItems=[string,bool], minItems/maxItems=2  (arity 3->2)
1c z.nativeEnum(Color)                    -> errors:0; {type:'string'}              (enum values gone)
1d z.string().refine(pred)                -> errors:0; zodChain.validations=['.refine()']  (predicate lost)
1e z.strictObject({a}).refine(...)        -> errors:0; IR == z.strictObject({a})    (refine dropped)
2a parseJsonSchema({$ref, description, minLength, title}) -> { $ref, metadata } only
2b parseJsonSchema({type:string, contentEncoding, contentMediaType}) -> { type, contentEncoding } (contentMediaType gone)
3  buildIR({type:object, properties:{}}) -> serializeIR -> deserializeIR  ->  THREW "Invalid CastrDocument structure"
5a writeOpenApi({type:string, contentEncoding:'base64'})      -> {"type":"string"}            (contentEncoding gone)
5b writeOpenApi(3.0 {type:number, minimum:5, exclusiveMinimum:true}) -> {"type":"number","minimum":5}  (exclusivity gone)
5c buildIR({..., additionalProperties:true}) -> THREW "Non-strict object input ... is rejected"   (parser fail-fast; proves L8 latent)
6  components 'Basic.Thing' + $ref -> keys ["Basic_Thing","Ref"]; Ref.b.$ref = "#/components/schemas/Basic.Thing"  (dangling)
7  operation security [{apiKey:[], oauth2:['read']}] -> out [{"apiKey":[]},{"oauth2":["read"]}]   (AND -> OR)
8  getTypescriptFromOpenApi: enum->'string'; const->'string'; ['string','number']->'unknown'
9  isRecord({})=false; isRecord({"":1})=false; isRecord({a:1})=true
```

## A.4 — Probe 2 (Draft-07 normalisation + deep $ref)

`/tmp/castr-probe2.mjs`:

```
1) then-branch IR: {... "type":"number","minimum":10,"exclusiveMinimum":true}   exclusiveMinimum still boolean true? true
2) refs present in IR: [ '#/definitions/Outer/properties/inner' ]               (deep ref NOT rewritten -> dangling)
3) normalizeDraft07 top-level: {"type":"number","exclusiveMinimum":10,"$defs":{"Inner":{...}}}   (top level correct)
```

## A.5 — C6: Zod writer refinement output (`getZodSchema(...).code`)

```js
// dependentSchemas { role: { required: ['team'] } }:
z.strictObject({ role: z.string().optional() }).refine(
  (obj) => !('role' in obj) || (() => { /* dependentSchemas: additional validation when 'role' present */ return true; })(),
  { message: 'dependentSchemas: when "role" is present, additional schema constraints apply' })          // NO-OP

// contains: { type: 'integer' }, minContains: 2:
z.array(z.unknown()).refine((arr) => arr.filter(item => typeof item === 'integer').length >= 2, { ... })  // always false

// if/then/else:
z.strictObject({ a: z.string().optional(), b: z.string().optional() })                                    // conditional dropped entirely

// patternProperties (source object.ts:71,76):  typeof obj[k] === '${patternSchema.type ?? 'unknown'}'    // typeless -> 'unknown' (never true)
```

(`dependentRequired` at `object.ts:147`, by contrast, correctly emits `[...].every(k => k in obj)`.)

## A.6 — H7: the vacuous `toContain` assertion (real Vitest run)

A one-file test placed under `src/` (matching `vitest.config.ts` include) and run with `pnpm exec vitest run`:

```ts
const result = { content: 'export function validateRequest() {}' };
expect(result).not.toContain('export function validateRequest'); // mirrors schemas-with-metadata.test.ts:544
```

Result: **`Test Files 1 passed`** — the assertion passes even though `result.content` contains the string, proving the
negative tests are vacuous. (Temp file removed after the run.)

## A.7 — Doctrine/enforcement greps (M1, M2, M3, H5)

```
Object.* / Reflect.* in product code (lib/src non-test):           148 occurrences
lodash string-fn imports (startsWith/split/replace/... ) in src:    20 files
isRecord definitions:  version.ts:22 | type-guards.ts:53 | types.ts:15 | additional-operations-validation/index.ts:26
complexityThreshold / defaultStatusBehavior reads in generation:    0 (declaration + CLI plumbing only)
eslint.config.ts: no no-restricted-syntax/-properties rule for Object.*/Reflect.*  (confirmed by reading the config)
```

## A.8 — Probe script source (Probe 1, abbreviated)

The full scripts used were `/tmp/castr-probe.mjs` and `/tmp/castr-probe2.mjs`. They import from the built dist
(`lib/dist/schema-processing/index.js` for `parseZodSource`/`buildIR`/`writeOpenApi`/
`serializeIR`/`deserializeIR`; `.../conversion/zod/index.js` for `getZodSchema`; `.../parsers/json-schema/index.js` for
`parseJsonSchema`; `.../conversion/typescript/index.js` for `getTypescriptFromOpenApi`) and exercise each input listed in
A.3–A.5, printing the resulting IR / emitted code / thrown error. They are reproducible verbatim against any clean build
of this commit.
