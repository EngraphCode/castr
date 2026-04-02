# Oak OpenAPI / Castr Replacement Report

**Date:** 2026-04-02  
**Status:** Durable discovery report  
**Purpose:** Capture a high-level understanding of what `oak-openapi` currently provides and what Castr would need to support in order to replace it with similar value and impact, even if the replacement is not drop-in.

This report complements the older [notes.md](./notes.md) scratch file and the broader Oak integration view in `../oak-open-curriculum-sdk/oak-castr-integration-report.md`.

Its future planning home is now `.agent/plans/future/oak-code-first-openapi-generation-replacement.md`.

---

## Scope

Reviewed:

- `/Users/jim/code/oak/oak-openapi/package.json`
- `/Users/jim/code/oak/oak-openapi/src/lib/router.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/trpc.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/protect.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/schema/generateDocument.ts`
- `/Users/jim/code/oak/oak-openapi/src/app/api/v0/[...trpc]/route.ts`
- `/Users/jim/code/oak/oak-openapi/src/app/api/v0/swagger.json/route.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/endpoint-docs/getEndpointDocs.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/endpoint-docs/helpers.ts`
- `/Users/jim/code/oak/oak-openapi/src/components/documentationPages/EndpointBlock.tsx`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/README.md`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/addOpenApiMeta.mjs`
- `/Users/jim/code/oak/oak-openapi/__tests__/openapi-schema.test.ts`
- representative handlers and schemas under `/Users/jim/code/oak/oak-openapi/src/lib/handlers/*`
- representative generated artefacts under `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/generated/*`
- architecture and ADR docs under `/Users/jim/code/oak/oak-openapi/docs/architecture/*`

Inventory notes from this review:

- 28 handler procedures currently carry OpenAPI metadata
- 27 visible public operations are explicitly `GET`
- 48 handler schema source files exist under `src/lib/handlers/**/schemas`
- 46 example JSON files exist under `src/lib/handlers/**/examples`
- 46 generated `*.openapi.ts` files exist under `src/lib/zod-openapi/generated`

---

## Executive Summary

`oak-openapi` is not just "a repo that happens to generate an OpenAPI document".

Today it gets value from a combined stack:

- **authoring model**: tRPC procedures + Zod schemas + `meta.openapi`
- **OpenAPI generation**: `trpc-to-openapi`
- **schema annotation layer**: `zod-openapi`
- **custom schema/example codegen**: Babel-based AST rewrite scripts
- **runtime exposure**: a Next.js route using `createOpenApiFetchHandler(...)`
- **docs and playground**: Swagger JSON plus custom docs pages that inspect the OpenAPI document directly

So if Castr replaces this stack, it does not merely need to emit an OpenAPI document. It needs to preserve the same practical value:

1. one schema-driven source of truth for handlers and docs
2. a valid public OpenAPI document
3. examples and descriptions that stay aligned with schemas
4. predictable component refs and tags for docs tooling
5. some way to expose the API in REST/OpenAPI form
6. enough supporting metadata that Oak's docs/playground experience remains trustworthy

The good news is that a drop-in replacement is not necessary. Castr can provide similar value with a cleaner architecture than the current `trpc-to-openapi` + `zod-openapi` + custom AST rewrite stack.

---

## What `oak-openapi` Is Doing Today

### 1. It is a code-first API authoring system

Handlers are defined as tRPC procedures. Each public endpoint carries:

- Zod input/output schemas
- `meta.openapi` data such as:
  - `method`
  - `path`
  - `summary`
  - `description`
  - `tags`
  - `errorResponses`

The router is assembled from handler groups in `src/lib/router.ts`, and `src/lib/trpc.ts` defines a tRPC base with `OpenApiMeta`.

This means the current source of truth is not an OpenAPI file. It is application code plus schema metadata.

### 2. The OpenAPI document is generated from the tRPC router

`src/lib/zod-openapi/schema/generateDocument.ts` calls `generateOpenApiDocument(router, ...)` from `trpc-to-openapi`.

That generated document is then used in multiple places:

- served at `/api/v0/swagger.json`
- rendered in Swagger UI / playground
- inspected by the docs pages for grouped endpoint documentation
- validated in tests

So the OpenAPI document is a published product surface, not an incidental by-product.

### 3. Runtime route exposure also depends on the same third-party stack

`src/app/api/v0/[...trpc]/route.ts` uses `createOpenApiFetchHandler(...)` from `trpc-to-openapi`.

That matters because the current library stack is doing two jobs:

- generating the OpenAPI document
- exposing REST-style HTTP handlers from the same tRPC definitions

If Castr only replaces document generation, Oak will still need some other runtime exposure layer.

### 4. The repo has a custom schema/example generation pipeline

This is one of the most important findings.

`bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs`:

- walks handler schema files
- matches them with example JSON files
- parses the schema source with Babel
- injects `zod-openapi/extend`
- rewrites exports from `*Schema` to `*OpenAPISchema`
- attaches OpenAPI metadata and examples
- rewrites imports for the generated file layout
- emits new files under `src/lib/zod-openapi/generated/*`

The helper `addOpenApiMeta.mjs` recursively injects `.openapi(...)` and example metadata into nested schema structures.

This means the current OpenAPI generation path is not purely declarative. It depends on a custom code transformation layer.

### 5. Generated schemas are imported back into handlers

Representative handlers, such as `src/lib/handlers/lesson/lesson.ts`, import generated request/response schemas from `@/lib/zod-openapi/generated/...` and use them directly in:

- `.input(...)`
- `.output(...)`
- runtime `.parse(...)`

So the generated artefacts are not just for documentation. They feed real handler typing and runtime validation.

### 6. Docs pages inspect the OpenAPI document directly

`src/lib/endpoint-docs/getEndpointDocs.ts`:

- imports the shared `openApiDocument`
- groups endpoints using a curated grouping map
- traverses `paths`
- resolves `$ref`s in `components.schemas`
- extracts field descriptions and example data
- builds the docs-page payload rendered by `EndpointBlock.tsx`

So the docs experience depends on:

- stable component naming
- stable refs
- predictable tags
- JSON example availability
- field descriptions being preserved in the generated document

### 7. The repo validates the generated OpenAPI document as part of trust

`__tests__/openapi-schema.test.ts`:

- imports the generated `openApiDocument`
- casts it to `openapi-types` document types
- walks every path/response
- checks descriptions exist
- checks `application/json` response schemas exist
- checks examples exist
- validates examples against schemas with AJV

This is part of the current value proposition. Similar value from Castr means not just generation, but trustworthy output with testable example/schema alignment.

---

## Current Third-Party Surface

Visible OpenAPI-related third-party libraries in `oak-openapi`:

- `trpc-to-openapi`
- `zod-openapi`
- `openapi3-ts`
- `openapi-types`
- `swagger-ui-react`

For Castr replacement purposes, the key libraries are:

- `trpc-to-openapi`
- `zod-openapi`
- `openapi3-ts`

`swagger-ui-react` is a consumer of the document, not the core generation problem.

---

## Pain Points And Constraints In The Current Stack

These are the places where Castr does not need to copy the current mechanism, but does need to preserve or improve the resulting value.

### 1. Request-schema authoring is constrained by generator quirks

The generator README explicitly says request schemas should be explicitly declared rather than exported through imported objects, because `trpc-to-openapi` does not generate them consistently otherwise.

That is a clear sign of fragile tooling. A Castr replacement should not require this kind of authoring superstition.

### 2. OpenAPI metadata is attached via a custom AST rewrite step

The repo currently needs a Babel pipeline to merge examples and schema metadata into generated OpenAPI-facing Zod schemas.

That is maintenance-heavy and brittle. A Castr replacement should ideally support:

- structured metadata ingestion
- structured example attachment
- deterministic component naming

without a bespoke AST surgery layer.

### 3. The runtime route adapter has type friction

In `src/app/api/v0/[...trpc]/route.ts`, the context passed into the handler is cast via `unknown` because the exposed types do not match the actual runtime adapter shape.

That is a concrete pain point that a replacement could improve, whether by:

- offering a cleaner adapter, or
- separating document generation from route exposure more honestly

### 4. The shared OpenAPI document is mutated at runtime for Swagger output

`/api/v0/swagger.json` mutates the shared `openApiDocument` to strip internal grouping tags before returning it.

That works today, but it is a smell:

- docs and playground want different views of the same document
- the system is mutating a shared singleton to achieve that

A Castr-based approach should prefer:

- build-time variants, or
- immutable transforms at the response boundary, or
- dedicated docs metadata outputs instead of overloading tags

### 5. Docs depend on parsing raw OpenAPI internals

The docs layer currently traverses raw `paths`, resolves `$ref`s manually, and walks schemas to extract descriptions/examples.

That is workable, but it means any replacement must preserve equivalent access to:

- endpoint grouping metadata
- field descriptions
- component refs/examples

The replacement does **not** need to keep this exact raw-document traversal model if it can emit a better docs-friendly metadata surface.

### 6. Type bridges are already messy

The test suite and docs code both cast between different OpenAPI document types, and the stack mixes:

- `openapi-types`
- `openapi3-ts`
- `zod-openapi` types

This is another opportunity for Castr to simplify the surface rather than emulate the current mess.

---

## What Castr Would Need To Support

The replacement target is best described as **similar role and impact**, not API-level compatibility.

### Must-have capability 1: Code-first OpenAPI generation

Castr would need some way to ingest code-authored API definitions and generate an OpenAPI document from them.

That could mean:

- direct tRPC ingestion
- a more general route/operation definition DSL
- Zod schema ingestion plus operation metadata ingestion

But the essential value is:

> developers author schemas and operation metadata once, and Castr emits the public OpenAPI document from that source of truth.

### Must-have capability 2: Zod-aware schema ingestion

The current repo is Zod-first. Castr would need to preserve the ability to derive public OpenAPI from Zod-authored schemas, including:

- nested object structure
- arrays/unions/nullability
- descriptions
- examples
- component naming
- refs/reuse

If Castr cannot consume the Zod-authored schema layer or an equivalent structured schema layer, it cannot replace the current workflow with similar value.

### Must-have capability 3: Operation metadata capture

The current stack relies on per-procedure metadata for:

- method
- path
- summary
- description
- tags
- error responses
- security-related context

Castr would need a first-class way to capture and emit this operation metadata into the OpenAPI document.

### Must-have capability 4: Example and description support

Examples and descriptions are not optional in this repo; they are part of the trust contract.

Castr would need to support either:

- metadata read directly from authored schemas, or
- an explicit examples/descriptions sidecar workflow

and then ensure those values flow into:

- the emitted OpenAPI document
- the docs surface
- test validation

### Must-have capability 5: Stable refs and component naming

The docs pages and tests expect:

- usable `components.schemas`
- stable `$ref` targets
- predictable response schema references

Castr does not need to mirror the exact names from `zod-openapi`, but it does need a stable, documented naming strategy.

### Must-have capability 6: Docs-facing metadata value

Even if Oak stops parsing raw OpenAPI in the same way, Castr must preserve equivalent docs value:

- grouped endpoint navigation
- descriptions
- input/output field tables
- sample responses

This could come from:

- the raw OpenAPI document, if stable enough
- a dedicated metadata bundle
- a docs emitter

But some docs-facing surface is required.

### Must-have capability 7: OAS 3.2-ready output

Oak has already signalled that it will need OAS 3.2 shortly.

So any serious replacement path should assume:

- OAS 3.2 output target
- honest treatment of features and compatibility
- a clear type dependency strategy on the Castr side

### Must-have capability 8: Trustworthy verification story

The current repo validates the generated document and example/schema alignment in tests.

Castr should support a similar trust loop by making it easy to verify:

- OpenAPI document validity
- example/schema alignment
- deterministic output
- docs metadata consistency

---

## What Castr Might Need, But Should Not Own In Core

### Optional capability A: A runtime HTTP harness or adapter companion workspace

Today `trpc-to-openapi` is also providing route exposure through `createOpenApiFetchHandler(...)`.

If Castr is to replace similar value end-to-end, Oak will need **some** answer for this. That answer should live in a companion workspace or another runtime layer, not in core `@engraph/castr`.

Options:

- Castr emits operation definitions and Oak uses another runtime adapter
- Castr ships a lightweight fetch/Next companion workspace
- Castr has a second workspace dedicated to runtime exposure

This is probably the biggest boundary decision in the whole `oak-openapi` replacement story.

### Optional capability B: Docs-specific emitter outputs

Instead of making docs parse raw OpenAPI, Castr could emit:

- endpoint index data
- grouped docs metadata
- sample response bundles
- field-description maps

This is not strictly required if the raw document is sufficient, but it could be a cleaner replacement.

### Optional capability C: Direct tRPC support as a companion-workspace direction

If the API codebase keeps tRPC as its authoring/runtime model, direct tRPC support becomes more valuable.

If Oak is willing to move to a more general operation-definition model inside `oak-mcp-ecosystem`, then Castr may not need to be specifically tRPC-shaped.

So direct tRPC support is strategically important, but it should be treated as a companion-workspace direction rather than a core `@engraph/castr` format promise.

---

## What Castr Does Not Need To Copy

The replacement does **not** need to preserve these exact implementation details:

- `trpc-to-openapi` API signatures
- `zod-openapi/extend`
- generated shadow schemas under `src/lib/zod-openapi/generated/*`
- the Babel AST rewrite pipeline
- the request-schema "must be explicit" workaround
- mutable shared-document filtering in `/swagger.json`
- raw OpenAPI traversal in docs code, if a better docs surface exists

Those are implementation choices, not the underlying user value.

---

## A Plausible Castr-Shaped Replacement

At a high level, a Castr-based replacement could look like this:

1. **Authoring input**
   - Zod schemas plus operation metadata
   - possibly via tRPC ingestion, or via a Castr-native operation-definition layer

2. **Castr code-first ingestion**
   - parse the authored schema/operation layer into IR

3. **Primary outputs**
   - OAS 3.2 document
   - stable component refs
   - docs/playground-friendly metadata
   - optional route registry / runtime adapter artefacts

4. **Validation loop**
   - OpenAPI validity checks
   - example/schema checks
   - deterministic snapshot checks

This would preserve the current value while simplifying the architecture:

- no shadow Zod schemas
- no AST mutation layer
- no type-cast-heavy cross-library bridges
- cleaner separation between generation, docs metadata, and runtime exposure

---

## Recommended Sequencing

### 1. Keep `oak-openapi` as a distinct programme from the first Oak adapter replacement

This review confirms that Use Case 3 is real, but it is a different kind of work from replacing `openapi-zod-client-adapter`.

It should remain a separate arc, even if the repos eventually converge. The high-level plan home for that arc is `.agent/plans/future/oak-code-first-openapi-generation-replacement.md`.

### 2. Decide the runtime boundary early

The biggest architectural question is:

> Is Castr only the code-first OpenAPI compiler, or does a companion workspace also own the lightweight runtime adapter/harness story?

This decision will shape whether the `oak-openapi` replacement is:

- a core Castr generation feature plus a companion runtime workspace,
- a second Castr workspace,
- or a composition story with another Oak-side runtime layer.

### 3. Prove the code-first generation path on a subset first

A sensible first proof would be:

- pick one or two handler groups
- generate equivalent OAS 3.2 output
- preserve examples and refs
- demonstrate docs-friendly metadata extraction

This would de-risk the generation problem before tackling the runtime route exposure question.

### 4. Prefer cleaner public artefacts over drop-in compatibility

Because drop-in compatibility is not required, the replacement should optimise for:

- one source of truth
- deterministic outputs
- honest docs surfaces
- fewer toolchain hacks

not for emulating the current generated file layout.

---

## Bottom Line

To replace `oak-openapi` with similar value and impact, Castr would need to be able to function as a **code-first OpenAPI publishing system**, not just a schema converter.

At minimum, that means:

- ingest code-authored schemas plus operation metadata
- emit a trustworthy OAS 3.2 document
- preserve examples, descriptions, refs, and tags
- support a docs/playground-friendly downstream surface
- provide or clearly compose with a runtime exposure story, most likely through a companion workspace rather than core `@engraph/castr`

The current stack's value is real, but its implementation is fragile enough that Castr has room to replace it with a cleaner model rather than a drop-in clone.

---

## Evidence Index

- `/Users/jim/code/oak/oak-openapi/package.json`
- `/Users/jim/code/oak/oak-openapi/src/lib/router.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/trpc.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/protect.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/schema/generateDocument.ts`
- `/Users/jim/code/oak/oak-openapi/src/app/api/v0/[...trpc]/route.ts`
- `/Users/jim/code/oak/oak-openapi/src/app/api/v0/swagger.json/route.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/endpoint-docs/getEndpointDocs.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/endpoint-docs/helpers.ts`
- `/Users/jim/code/oak/oak-openapi/src/components/documentationPages/EndpointBlock.tsx`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/README.md`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs`
- `/Users/jim/code/oak/oak-openapi/bin/zod-openapi-schema-gen/addOpenApiMeta.mjs`
- `/Users/jim/code/oak/oak-openapi/src/lib/handlers/lesson/lesson.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/handlers/lesson/schemas/lessonSummaryResponse.schema.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/generated/lesson/lessonSummaryRequest.openapi.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/zod-openapi/generated/lesson/lessonSummaryResponse.openapi.ts`
- `/Users/jim/code/oak/oak-openapi/src/lib/errorResponses.ts`
- `/Users/jim/code/oak/oak-openapi/__tests__/openapi-schema.test.ts`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/overview.md`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/openapi-generation.md`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/decision-records/0002-trpc-openapi.md`
- `/Users/jim/code/oak/oak-openapi/docs/architecture/decision-records/0003-zod-openapi-generation.md`
