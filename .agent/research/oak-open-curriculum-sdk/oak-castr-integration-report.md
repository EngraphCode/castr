# Oak/Castr Integration Report

**Date:** 2026-04-02  
**Status:** Durable discovery report  
**Purpose:** Preserve the current owner input and the code-backed findings from reviewing Oak's OpenAPI toolchain, so this context is not lost between sessions.

This report complements [oak-support-plan.md](./oak-support-plan.md). That file remains useful as the earlier negotiation note. This report should be treated as the current strategy and discovery record as of Thursday, 2 April 2026.

The high-level planning homes for the three Oak use cases now live in:

- `.agent/plans/future/oak-adapter-boundary-replacement.md`
- `.agent/plans/future/oak-wider-openapi-stack-replacement.md`
- `.agent/plans/future/oak-code-first-openapi-generation-replacement.md`

---

## Scope

Reviewed code and docs in:

- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk`
- `/Users/jim/code/oak/oak-openapi`

Also reviewed existing Castr-side research and plans under:

- `.agent/research/oak-open-curriculum-sdk/*`
- `.agent/research/oak-openapi/*`
- `.agent/research/feature-parity/gap-matrix.md`
- `.agent/directives/VISION.md`
- `.agent/plans/roadmap.md`
- `.agent/plans/active/oas-3.2-version-plumbing.md`
- `.agent/plans/future/oas-3.2-full-feature-support.md`

---

## Confirmed Owner Input

The current owner input is now clear enough to lock as durable truth:

1. **Oak needs to move to OAS 3.2 shortly.**
2. **First Castr use case:** fully replace `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter`, including its dependency on `openapi-zod-client`, and remove the need to reference `Zod <4` anywhere in that repo.
3. **Second Castr use case:** replace **all OpenAPI-related third-party libraries** in the Oak Open Curriculum Ecosystem repo. It is **not yet decided** whether this should include `openapi-fetch`. If Castr grows a lightweight HTTP harness or adapter layer for this, that belongs in a separate companion workspace rather than core `@engraph/castr`.
4. **Third Castr use case:** replace the libraries currently used for **OpenAPI generation** in `/Users/jim/code/oak/oak-openapi`. The intention is for that API codebase to move into a new workspace inside the Oak Open Curriculum Ecosystem repo.
5. Oak is the **first** use case, not the entire product. Castr should not overfit to Oak's current implementation details, but Oak is now the first concrete proving ground.

---

## Executive Summary

The strategy is clearer than it was before reviewing the downstream code.

The first practical product wedge for Castr is not abstract "universal schema conversion". It is a concrete replacement for Oak's current OpenAPI build boundary: native Zod 4 generation, strict validation surfaces, deterministic outputs, endpoint metadata, and MCP/build-time friendliness, with no `openapi-zod-client`, no `Zod 3` quarantine, and no Zodios baggage.

The second use case broadens that from one adapter workspace to Oak's wider OpenAPI dependency stack. The third use case adds a separate but related code-first generation problem: replacing `trpc-to-openapi` and `zod-openapi` in `oak-openapi`, ahead of that code moving into `oak-mcp-ecosystem`.

This means Castr now has a clearer medium-term product shape:

- **Core compiler/emitter value:** OpenAPI/Zod/metadata/IR conversion and generation.
- **Optional runtime/client value:** possibly a lightweight HTTP harness or adapter layer in a companion workspace, with the `openapi-fetch` replacement question still undecided.
- **Optional code-first generation value:** likely a companion workspace or explicit second arc, rather than something forced into the same initial replacement surface.

OAS 3.2 matters more now because Oak itself expects to move there soon. The active Castr OAS 3.2 work is no longer just future-facing housekeeping; it has a real downstream consumer.

---

## What Is True In Oak Today

### 1. The first replacement target is a compatibility boundary, not just a generator

The adapter workspace at `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter` is a hard quarantine boundary around `openapi-zod-client`.

What it currently does:

- depends on `openapi-zod-client`, `openapi3-ts`, and `zod@3.25.76`
- calls `generateZodClientFromOpenAPI()` from `openapi-zod-client`
- forces strict generation settings:
  - `shouldExportAllSchemas: true`
  - `shouldExportAllTypes: true`
  - `groupStrategy: 'none'`
  - `withAlias: false`
  - `strictObjects: true`
  - `additionalPropertiesDefaultValue: false`
- rewrites the generated string from Zod 3 to Zod 4
- strips Zodios imports and dead client code from the output
- exposes endpoint definitions from `openapi-zod-client` through a second wrapper API

This means the first migration target is not merely "generate some Zod schemas". It is "replace a build-time boundary that currently provides Oak with strict Zod 4 output plus endpoint metadata, while hiding an upstream Zod 3 tool".

### 2. The adapter is the only obvious Zod 3 island in `oak-mcp-ecosystem`

Current package evidence:

- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/package.json` pins `zod: 3.25.76`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen/package.json` uses `zod: ^4.3.6`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk/package.json` uses `zod: ^4.3.6`
- other visible Oak workspaces also use Zod 4

So the first use case is concrete and measurable: deleting the adapter workspace should remove the only package-level need for Zod 3 in the repo.

### 3. Oak consumes two distinct outputs from that boundary

Oak's `sdk-codegen` workspace depends on two separate surfaces.

**Surface A: generated Zod file content**

- `zodgen-core.ts` uses `generateZodSchemasFromOpenAPI()`
- it then post-processes the generated output to:
  - export `endpoints`
  - build `OPERATION_ID_BY_METHOD_AND_PATH`
  - build `PRIMARY_RESPONSE_STATUS_BY_OPERATION_ID`
  - build `curriculumSchemas`
  - sanitise inline schema keys

**Surface B: endpoint metadata**

- `codegen-core.ts` uses `getEndpointDefinitions()`
- that endpoint metadata feeds request validator map generation and other typed artefacts

This is strategically important. The first Oak replacement is a **schema generation + metadata generation** problem, not a schema generation problem only.

### 4. Oak's current adapter still relies on fragile string surgery

The adapter's Zod 3 to Zod 4 bridge is based on string rewrites.

Current transformations include:

- `ZodSchema` -> `ZodType`
- `z.string().url()` -> `z.url()`
- removing `.passthrough()`
- removing `.strict()` around `.and()` intersections
- removing `@zodios/core`
- removing `export const api = new Zodios(...)`
- removing `createApiClient(...)`

This confirms that Oak does not merely need any OpenAPI-to-Zod tool. It needs a tool that natively emits the right semantics so these rewrites disappear entirely.

### 5. Some current Oak metadata paths are already lossy

The endpoint transformer in the adapter turns schema objects into `'z.unknown()'` when it cannot preserve them as strings.

That means the current endpoint-definition surface is already a compromise. A Castr-native replacement does **not** need to preserve this weakness. It needs to preserve the downstream use case cleanly.

### 6. `openapi-fetch` is a real runtime dependency, not just a type helper

In `oak-curriculum-sdk`, `openapi-fetch` is used for the runtime client itself:

- `BaseApiClient` creates an `openapi-fetch` client
- wraps it with auth, retry, rate limiting, and response augmentation middleware
- exposes both method-based and path-based clients

In `oak-sdk-codegen`, a generated `client-types.ts` file aliases `PathBasedClient<paths>` from `openapi-fetch`.

This is why the second use case must keep `openapi-fetch` explicitly marked as **TBD**:

- it is clearly in the OpenAPI client/tooling surface
- but replacing it is a separate product decision from replacing the schema/codegen stack
- if Castr replaces it, that probably wants either a very small adapter layer or a dedicated second workspace

### 7. Oak's wider OpenAPI dependency inventory is larger than the adapter

Current OpenAPI-related third-party libraries visible in `oak-mcp-ecosystem`:

- `openapi-zod-client`
  - currently hidden behind the adapter workspace
- `openapi3-ts`
  - used in the adapter
  - used heavily across `oak-sdk-codegen`
- `openapi-typescript`
  - used in `oak-sdk-codegen` for TypeScript API types
- `openapi-fetch`
  - used in `oak-curriculum-sdk` runtime client
  - used in `oak-sdk-codegen` generated client types

So the second use case really is broader than the first:

- **first use case:** replace the adapter boundary
- **second use case:** replace the rest of Oak's OpenAPI third-party surface, with `openapi-fetch` still open for decision

### 8. `oak-openapi` is a separate OpenAPI generation problem

`oak-openapi` currently uses:

- `trpc-to-openapi`
- `zod-openapi`
- `openapi3-ts`
- `openapi-types`
- `swagger-ui-react`

The important targets for Castr are the generation libraries, not necessarily all OpenAPI-adjacent presentation tools.

Current architecture:

- `generateDocument.ts` calls `generateOpenApiDocument(router, ...)` from `trpc-to-openapi`
- `route.ts` uses `createOpenApiFetchHandler(...)` from `trpc-to-openapi`
- generated schemas live under `src/lib/zod-openapi/generated/*`
- docs pages inspect `openApiDocument` directly and depend on stable refs, tags, and `components.schemas`
- docs code uses `zod-openapi` types and `openapi3-ts/oas31`

There is also a visible type-friction smell here:

- the OpenAPI route handler currently casts `opts as unknown as Parameters<typeof createContext>[0]`
- the code comment says `trpc-to-openapi` uses the node-http adapter internally while the exposed types claim a fetch-adapter shape

That is valuable evidence for the third use case: the current generation stack has real adapter/type awkwardness that a Castr-based replacement could simplify.

### 9. OAS 3.2 is now a near-term downstream requirement

Oak will need OAS 3.2 shortly. Today, both Oak repos still lean heavily on `openapi3-ts/oas31` types and 3.1-era assumptions.

That means Castr's OAS 3.2 work now has direct external pressure:

- Oak will need a 3.2-capable compiler/emitter path
- type dependency strategy will matter sooner
- Castr should avoid locking itself into a long-lived "3.1 now, 3.2 later" product posture

---

## Dependency Inventory By Use Case

### Use Case 1: Replace `openapi-zod-client-adapter`

Primary Oak surface:

- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter`

Libraries implicated:

- `openapi-zod-client`
- `openapi3-ts`
- `zod@3`

Minimum Castr outcome:

- native Zod 4 generation
- strict object semantics by default
- exported schemas/types
- endpoint metadata
- no Zodios/client baggage
- no string-rewrite bridge

### Use Case 2: Replace all OpenAPI-related third-party libraries in `oak-mcp-ecosystem`

Primary Oak surfaces:

- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk`

Libraries implicated:

- `openapi-zod-client`
- `openapi3-ts`
- `openapi-typescript`
- `openapi-fetch` (TBD)

Likely Castr implications:

- OpenAPI -> Zod replacement is core
- OpenAPI -> TypeScript type generation belongs to the core compiler boundary
- Runtime HTTP harness is now a companion-workspace or external-interop decision

### Use Case 3: Replace OpenAPI generation libraries in `oak-openapi`

Primary Oak surface:

- `/Users/jim/code/oak/oak-openapi`

Detailed review:

- `.agent/research/oak-openapi/oak-openapi-castr-replacement-report.md`

Libraries implicated:

- `trpc-to-openapi`
- `zod-openapi`
- `openapi3-ts`
- possibly `openapi-types` as part of the surrounding document/type surface

Likely Castr implications:

- code-first OpenAPI generation is a separate capability from Use Cases 1 and 2
- this probably wants either:
  - a separate Castr workspace, or
  - a clearly bounded second implementation arc after the first Oak replacement lands

---

## Updated Strategic Reading For Castr

This Oak review changes the strategic reading in several ways.

### 1. The long-term goal is clearer in product terms

Before this review, the architecture goal was clearer than the first product goal.

Now the first product goal is concrete:

- replace Oak's current OpenAPI -> Zod compatibility boundary
- remove the Zod 3 island
- provide build-time artefacts that support SDK generation, validation, and MCP tooling

That is a sharper and more useful near-term product definition than generic "universal schema conversion".

### 2. Oak should shape priorities, not architecture

Oak is the first proving ground, but Castr should still remain general:

- no Oak-specific parsing rules
- no permanent compatibility wrapper around Oak's current stringified schema outputs
- no overfitting to one repo's file layout

The right generalisation is:

- Castr should be able to replace "OpenAPI schema tooling boundaries" in real repos
- Oak is the first concrete acceptance suite for that claim

### 3. The product now clearly wants at least two layers

The evidence now points to a likely split between:

- **core schema/compiler functionality**
  - parse
  - IR
  - emit Zod, TypeScript, OpenAPI, metadata
- **companion runtime/client functionality**
  - lightweight HTTP harness
  - client adapters
  - possibly `openapi-fetch` replacement or interop

Trying to force both into one initial surface would blur the product boundary too early.

### 4. OAS 3.2 is now strategically important, not merely aspirational

Because Oak needs to move to OAS 3.2 shortly, Castr's OAS 3.2 support is now part of the practical adoption path.

This does **not** mean Oak-specific work should be blocked on every medium-term OAS 3.2 feature. It **does** mean:

- 3.2 version plumbing is easier to justify
- type dependency strategy matters sooner
- any claim about Oak adoption should stay honest about current 3.1/3.2 boundaries

---

## Gaps Between Current Castr And The Oak Need

### Active-plan gap

There is still no active atomic plan whose explicit goal is:

> replace Oak's adapter workspace end-to-end and prove it with a real downstream acceptance suite

The high-level planning home now exists at `.agent/plans/future/oak-adapter-boundary-replacement.md`, but the work is not yet promoted to the active execution path.

### Output-contract gap

Castr already has promising ingredients:

- `schemas-with-metadata`
- `schemas-only`
- endpoint metadata generation
- MCP tooling
- strict object semantics
- no built-in client dependency

But Oak needs a tighter, first-class migration contract around:

- schema registry exports
- endpoint registry exports
- explicit operation ID exposure
- primary response status maps
- deterministic generated output

### Naming and surface gap

Current Castr endpoint output uses `alias` where Oak really needs explicit `operationId`.

That difference is small technically but important strategically: Oak's downstream code thinks in `operationId`, not generic aliasing.

### Determinism gap

Oak CI expects byte-for-byte stable generation. Castr has some deterministic behaviour already, but the full ordering guarantees for:

- endpoints
- responses
- schema properties
- generated metadata maps

still need to be tightened and proven.

### Fail-fast honesty gap

Current Castr endpoint extraction still has some looser behaviour than Oak's desired contract:

- empty-schema fallbacks instead of hard failure in some cases
- cookie parameters collapsed into headers

Those are exactly the kinds of edge behaviours that should be settled before claiming Oak replacement readiness.

### Type-generation gap

Use Case 2 means Castr may need to replace `openapi-typescript` in Oak as well, or at minimum provide a first-party alternative good enough that Oak can stop depending on it.

That is materially broader than the current first-use-case framing.

### HTTP harness boundary gap

`openapi-fetch` is now an explicit product-boundary decision, not a hidden implementation detail.

The remaining question is no longer "core or separate workspace?". The repo boundary is now explicit. The open product question is:

- `openapi-fetch` stays external and Castr interoperates cleanly, or
- Castr ships a lightweight harness/adapter **companion workspace**

### Code-first OpenAPI generation gap

Use Case 3 is a separate capability area.

Replacing `trpc-to-openapi` and `zod-openapi` is not the same work as replacing Oak's current OpenAPI consumption stack. It will likely need:

- a companion-workspace tRPC parser or equivalent code-first ingestion layer
- better Zod metadata ingestion
- explicit OpenAPI document generation from code-authored sources

This looks like a distinct companion-workspace / product decision rather than just "Phase 2 of the same thing".

---

## Recommended Sequencing

### 1. Use the dedicated Oak adapter replacement plan as the high-level home

The future-plan home now exists at `.agent/plans/future/oak-adapter-boundary-replacement.md`.
When the repo is ready to execute it, promote it into an explicit atomic plan rather than reopening the same strategy question from scratch.

Minimum acceptance target:

- Oak can replace `@oaknational/openapi-zod-client-adapter`
- no repo changes beyond import-path and expected-surface migration work
- Oak tests/type-check/build continue to pass
- Zod 3 is fully gone from `oak-mcp-ecosystem`

### 2. Treat OAS 3.2 version plumbing as near-term supporting work

Because Oak needs OAS 3.2 shortly, Castr should keep the version-plumbing arc warm and honest.

The key caution is truthfulness:

- do not relabel output as 3.2 before the claimed behaviour is really supportable for the relevant Oak paths

### 3. Expand from the adapter to the wider Oak OpenAPI dependency surface

After the first use case is proven, the next arc should cover:

- `openapi3-ts`
- `openapi-typescript`
- the remaining OpenAPI build-time dependencies in `oak-mcp-ecosystem`

This is the point where "replace all OpenAPI-related third-party libraries" becomes the operative goal.

Its high-level planning home is now `.agent/plans/future/oak-wider-openapi-stack-replacement.md`.

### 4. Make an explicit decision about `openapi-fetch`

Do not let this stay implicit.

Decision options:

- retain `openapi-fetch` and interoperate
- replace it with a lightweight Castr companion workspace

### 5. Keep `oak-openapi` as a separate arc

The third use case should be treated as a separate, code-first/OpenAPI-generation programme.

It is connected to the Oak ecosystem strategy, but it should not be allowed to muddy the definition of the first replacement surface.

Its high-level planning home is now `.agent/plans/future/oak-code-first-openapi-generation-replacement.md`.

---

## What This Changes In The Earlier Analysis

The earlier strategic reading was:

- technically clear
- product-strategically only partly clear

That now needs refinement.

The updated reading is:

- **architecturally clear**
- **first product wedge now clear**
- **medium-term core-vs-companion split now clear**

The repo now has a real first-customer shape:

- Phase 1: replace Oak's OpenAPI -> Zod compatibility boundary
- Phase 2: replace Oak's wider OpenAPI third-party dependency stack
- Phase 3: replace Oak's code-first OpenAPI generation stack

Those three rungs now have explicit future plan homes in the Castr plan stack.

That is a much more concrete strategy ladder than the repo had before this review.

---

## Open Decisions That Are Still Open

- Should `openapi-fetch` remain external, or should Castr own a lightweight runtime harness?
- If Castr owns runtime harness concerns, what is the right companion-workspace shape for them?
- How much of Oak's current generated file shape should be preserved versus replaced with cleaner Castr-native exports?
- What is the long-term type dependency strategy for OAS 3.2 support?
- Should the `oak-openapi` replacement be built after the first Oak replacement lands, or in parallel as a separate workspace track?

---

## Evidence Index

### Oak Open Curriculum Ecosystem

- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/README.md`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/package.json`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/src/generate-zod-schemas.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/src/get-endpoint-definitions.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/src/endpoint-transformers.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/core/openapi-zod-client-adapter/src/zod-v3-to-v4-transform.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen/package.json`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen/code-generation/zodgen-core.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen/code-generation/codegen-core.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-sdk-codegen/code-generation/typegen/client-types/generate-client-types.ts`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk/package.json`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk/README.md`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk/docs/architecture.md`
- `/Users/jim/code/oak/oak-mcp-ecosystem/packages/sdks/oak-curriculum-sdk/src/client/oak-base-client.ts`

### Oak OpenAPI

- `/Users/jim/code/oak/oak-openapi/package.json`
- `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/schema/generateDocument.ts`
- `/Users/jim/code/oak/oak-openapi/src/app/api/v0/[...trpc]/route.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/trpc.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/endpoint-docs/getEndpointDocs.ts`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/openapi-generation.md`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/decision-records/0003-zod-openapi-generation.md`

### Castr

- `.agent/research/oak-open-curriculum-sdk/oak-support-plan.md`
- `.agent/research/oak-open-curriculum-sdk/castr-requests/README.md`
- `.agent/research/oak-openapi/notes.md`
- `.agent/research/feature-parity/gap-matrix.md`
- `.agent/directives/VISION.md`
- `.agent/plans/roadmap.md`
- `.agent/plans/active/oas-3.2-version-plumbing.md`
- `.agent/plans/future/oas-3.2-full-feature-support.md`
