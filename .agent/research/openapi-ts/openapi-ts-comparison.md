# Castr vs OpenAPI-TS: Comparative Analysis

## Executive Summary

- Castr is a canonical IR-first transformer focused on schema building blocks, validation, and MCP tooling; OpenAPI-TS is a plugin-first SDK/codegen system optimized for client output breadth and ecosystem integrations.
- Castr accepts OpenAPI 2.0/3.0/3.1 inputs via Scalar, normalizing to 3.1 with strict spec validation and round-trip correctness; OpenAPI-TS supports 2.0/3.0/3.1 with optional, limited spec validation and pre-parse transforms/filters (OpenAPI-TS-only).
- Castr is strict-by-default and fail-fast at all times; non-compliant inputs are rejected.
- Castr’s IR now targets full OpenAPI 3.x syntax coverage (document fields + component types like headers, links, callbacks, pathItems, examples, webhooks, jsonSchemaDialect).
- Castr keeps OpenAPI semantics explicit (allOf/oneOf/anyOf, full content maps, headers/links) while OpenAPI-TS normalizes schema composition into `items` + `logicalOperator` and chooses a preferred media type for bodies/responses.
- Castr embeds rich schema metadata (nullable, zod chain, dependency info) directly in IR; OpenAPI-TS relies on a spec-wide JSON Pointer graph with scope propagation and plugin context for behavior.
- OpenAPI-TS offers a large plugin surface (clients, frameworks, validators, transformers) and output folder scaffolding; Castr offers fewer templates but deeper IR- and MCP-centric outputs (including an OpenAPI writer).
- OpenAPI-TS test fixtures are a valuable corpus for Castr input/IR validation, but third-party spec licensing must be audited before copying; MIT license applies to OpenAPI-TS codebase itself.

## Companion Docs

- `.agent/research/openapi-ts/openapi-ts-reuse-plan.md` for legal/ethical reuse guidance.
- `.agent/research/openapi-ts/openapi-ts-mcp-plugin.md` for the MCP plugin design overview.

## Scope and Sources

- Castr source root: `lib/`, `docs/`, and root README.
- OpenAPI-TS source root: [`tmp/openapi-ts`](../../../tmp/openapi-ts), especially `tmp/openapi-ts/packages/openapi-ts` and `tmp/openapi-ts/docs/openapi-ts`.
- Versions observed: Castr `lib/package.json` 1.18.3; OpenAPI-TS `tmp/openapi-ts/packages/openapi-ts/package.json` 0.90.4.

## Feature Matrix

| Category                 | Castr (@engraph/castr)                                                           | OpenAPI-TS (@hey-api/openapi-ts)                                    | Notes                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Primary intent           | Canonical IR for N×M schema transformation + building blocks + MCP               | Plugin-driven OpenAPI codegen for SDKs, types, schemas, frameworks  | Distinct product goals shape architecture                                     |
| Default output           | Zod schemas + endpoint metadata                                                  | TS types + SDK + client scaffolding                                 | Castr is building-blocks; OpenAPI-TS is output-first                          |
| OpenAPI output           | Yes (IR → OpenAPI writer)                                                        | Yes (serialized spec output via output.source)                      | Castr writes OpenAPI from IR; OpenAPI-TS emits source spec                    |
| Supported OAS versions   | 2.0/3.0/3.1 inputs via Scalar (auto-upgraded to 3.1)                             | 2.0, 3.0, 3.1                                                       | Castr treats 2.0 as input-only and normalizes to 3.1                          |
| JSON Schema handling     | Planned as another writer on the same IR pipeline                                | Schema outputs via plugins (format varies by plugin)                | Castr does not plan a separate JSON Schema handling path                      |
| Input sources            | File, URL, object                                                                | File, URL, registry shorthand, object; watch mode                   | OpenAPI-TS adds registry + watch                                              |
| Bundling / normalization | Scalar pipeline bundles external refs, preserves internal $refs, upgrades to 3.1 | json-schema-ref-parser bundles; patch/transform/filter before parse | Castr emphasizes $ref preservation for graphs                                 |
| Parser transforms        | Strict normalization only (e.g., 3.0 → 3.1), no patching                         | Extensive: patch, filters, transforms, hooks, pagination keywords   | OpenAPI-TS is more configurable pre-parse                                     |
| IR model                 | Canonical CastrDocument + CastrSchema with rich metadata                         | IR.Model with JSON Schema-ish objects + graph metadata              | Both have IR; depth and shape differ                                          |
| Schema metadata          | Embedded CastrSchemaNode (required, nullable, zodChain, dependency graph)        | Access scopes and graph metadata; no zod-specific chain in IR       | Castr IR is generation-aware for Zod                                          |
| Dependency graph         | Component-level dependency graph for ordering and circular refs                  | JSON-pointer graph with scope propagation                           | Different granularity and use cases                                           |
| Code generation          | ts-morph writers + templates                                                     | @hey-api/codegen-core Project/renderer + plugins                    | Both structured, different tooling                                            |
| Extensibility            | Template selection + custom template path                                        | First-class plugin system with dependency ordering, tags, hooks     | OpenAPI-TS is more extensible at output layer                                 |
| Client generation        | Optional openapi-fetch client template                                           | Client plugins (fetch, axios, angular, nuxt, etc.)                  | Castr avoids client coupling by default                                       |
| Validators               | MCP input/output guards + Zod validation; AJV for spec validation                | Validator plugins (zod/valibot; ajv planned)                        | Different scope: Castr validates specs; OpenAPI-TS validates runtime payloads |
| Spec validation          | Strict-by-default, fail-fast + AJV compliance tests                              | Optional/experimental validate_EXPERIMENTAL with limited rules      | Castr is stricter; OpenAPI-TS is lighter                                      |
| Round-trip correctness   | Explicitly targeted with tests                                                   | Not a stated goal                                                   | Castr’s IR is designed for losslessness                                       |
| Output layout            | Single file or grouped files                                                     | Generated folder tree with client/core/sdk/types                    | OpenAPI-TS scaffolds runtime                                                  |
| Registry integration     | None                                                                             | Yes (Hey API, Scalar, ReadMe)                                       | OpenAPI-TS has platform integrations                                          |
| MCP tooling              | First-class output + error formatting                                            | None                                                                | Unique to Castr                                                               |
| Test strategy            | Unit + snapshot + roundtrip + characterisation + e2e                             | Snapshot-heavy + plugin outputs + CLI tests                         | Both extensive; different emphases                                            |
| License                  | MIT (package.json)                                                               | MIT (LICENSE.md)                                                    | OpenAPI-TS includes LICENSE files                                             |

## IR Field Comparison

| Concept          | Castr IR                                                                                                                                                                           | OpenAPI-TS IR                                                                                             | Notes                                              |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Document root    | `CastrDocument` with `info`, `servers`, `components`, `operations`, `dependencyGraph`, `schemaNames`, `enums`, `security`, `tags`, `externalDocs`, `webhooks`, `jsonSchemaDialect` | `IR.Model` with `components`, `paths`, `servers`, `webhooks`                                              | Castr is richer and operation-centric              |
| Components       | `IRComponent` union (schemas, responses, parameters, requestBodies, securitySchemes, headers, links, callbacks, pathItems, examples)                                               | `components` map for schemas/parameters/requestBodies                                                     | Castr explicitly models more component types       |
| Schema shape     | `CastrSchema` with OpenAPI+JSON Schema fields plus metadata                                                                                                                        | `IR.SchemaObject` with JSON Schema 2020-12 fields + `symbolRef`, `accessScope`, `logicalOperator`, `omit` | OpenAPI-TS IR is closer to JSON Schema             |
| Schema metadata  | `CastrSchemaNode` (required, nullable, zodChain, dependency info, circular refs)                                                                                                   | Graph node scopes + dependency maps                                                                       | Castr stores generation-ready metadata in IR       |
| Composition      | `allOf` / `anyOf` / `oneOf`                                                                                                                                                        | `items` array + `logicalOperator` + `type` hints                                                          | Representation differs; mapping needed for interop |
| Operations       | `CastrOperation` with parameters, requestBody, responses, tags, servers, callbacks                                                                                                 | `IROperationObject` with `parameters` map, `body`, `responses`, `security`                                | Castr has richer response/content structure        |
| Parameters       | `CastrParameter` with schema + examples, style, explode, allowReserved                                                                                                             | `IRParameterObject` with schema, style, explode, allowReserved, pagination                                | Similar, but OpenAPI-TS stores pagination hints    |
| Request body     | `IRRequestBody` with `content` map (media types)                                                                                                                                   | `IRBodyObject` with `mediaType`, `schema`, `required`                                                     | OpenAPI-TS simplifies to one media type            |
| Responses        | `CastrResponse` supports schema, content map, headers, links                                                                                                                       | `IRResponseObject` has schema + mediaType                                                                 | Castr retains more HTTP details                    |
| Security         | `IRSecurityRequirement` (schemeName, scopes) + components                                                                                                                          | `IR.SecurityObject` aliases OAS security schemes                                                          | Castr normalizes security into requirements        |
| Enum catalog     | `IREnum` catalog with names and values                                                                                                                                             | Enums represented inline in schemas                                                                       | Castr treats enums as first-class                  |
| Dependency graph | `IRDependencyGraph` with topological order and circular cycles                                                                                                                     | Graph with JSON pointers + scope propagation                                                              | Different representations but similar intent       |

## IR Field Mapping (Examples)

| Concept                | Castr IR example                                                                                                               | OpenAPI-TS IR example                                                                                                                                                  | Notes                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Nullable string        | `{ type: ['string', 'null'], metadata: { nullable: true } }`                                                                   | `{ items: [{ type: 'string' }, { type: 'null' }], logicalOperator: 'or' }`                                                                                             | Castr uses metadata; OpenAPI-TS models null as a union item. |
| allOf + discriminator  | `{ allOf: [{ $ref: '#/components/schemas/Base' }, { type: 'object', properties: { kind: { const: 'dog', type: 'string' }}}] }` | `{ items: [{ $ref: '#/components/schemas/Base', omit: ['kind'] }, { type: 'object', properties: { kind: { const: 'dog', type: 'string' }}}], logicalOperator: 'and' }` | OpenAPI-TS uses `omit` to avoid discriminator conflicts.     |
| Request body content   | `requestBody.content['application/json'].schema` and `requestBody.content['multipart/form-data'].schema`                       | `body: { mediaType: 'application/json', schema: ... }`                                                                                                                 | OpenAPI-TS collapses to a preferred media type.              |
| Response details       | `{ statusCode: '200', content: { 'application/json': { schema } }, headers: { 'x-rate-limit': ... } }`                         | `responses['200'] = { schema, mediaType: 'application/json' }`                                                                                                         | OpenAPI-TS does not retain headers/links yet.                |
| Read/write semantics   | `{ readOnly: true }` / `{ writeOnly: true }`                                                                                   | `{ accessScope: 'read' }` with read/write transforms                                                                                                                   | OpenAPI-TS can split schemas by scope.                       |
| Dependency ordering    | `dependencyGraph.topologicalOrder: ['#/components/schemas/A', ...]`                                                            | `graph.transitiveDependencies.get('#/components/schemas/A')`                                                                                                           | Castr uses component graph; OpenAPI-TS uses pointer graph.   |
| Vendor extensions      | No `x-` fields retained by default                                                                                             | `{ 'x-foo': 'bar' }` via `SpecificationExtensions`                                                                                                                     | OpenAPI-TS exposes extensions to plugins.                    |
| Operation ID stability | `operationId?: string`                                                                                                         | `id: 'GET /pets/{id}'` (derived if missing)                                                                                                                            | OpenAPI-TS ensures stable IDs for codegen.                   |

## Real IR Excerpts (From Tests)

Note: The normalized fixtures under `lib/tests-roundtrip/__fixtures__/normalized` include `ir.json` and `ir2.json` outputs from round-trip runs. The excerpts below include these real IR artifacts.

### Castr: Minimal document + schema metadata

Source: `lib/src/ir/serialization.unit.test.ts`

```ts
const mockIR: CastrDocument = {
  version: '1.0.0',
  openApiVersion: '3.1.0',
  info: {
    title: 'Test API',
    version: '1.0.0',
    description: 'A test API',
  },
  servers: [],
  components: [
    {
      type: 'schema',
      name: 'TestSchema',
      schema: {
        type: 'object',
        properties: new CastrSchemaProperties({
          prop1: {
            type: 'string',
            metadata: {
              required: true,
              nullable: false,
              zodChain: { presence: 'required', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
        }),
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: 'optional', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: 'optional', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    },
  ],
  operations: [
    {
      operationId: 'getTest',
      method: 'get',
      path: '/test',
      parameters: [],
      parametersByLocation: {
        query: [],
        path: [],
        header: [],
        cookie: [],
      },
      responses: [],
      tags: ['test'],
    },
  ],
  dependencyGraph: {
    nodes: new Map(),
    topologicalOrder: [],
    circularReferences: [],
  },
  schemaNames: [],
  enums: new Map(),
};
```

### Castr: allOf composition in IR

Source: `lib/src/ir/serialization.unit.test.ts`

```ts
const complexIR: CastrDocument = {
  ...mockIR,
  components: [
    {
      type: 'schema',
      name: 'Complex',
      schema: {
        allOf: [{ $ref: '#/components/schemas/Base', metadata: baseMetadata }],
        metadata: baseMetadata,
      },
      metadata: baseMetadata,
    },
  ],
};
```

### OpenAPI-TS: Operation IR (OpenAPI 3.1)

Source: `tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/__tests__/operation.test.ts`

```ts
expect(context.ir.paths?.[path]?.[method]).toEqual({
  id: 'testOperation',
  method,
  operationId: 'testOperation',
  path,
  security: [{ in: 'header', name: 'Auth', type: 'apiKey' }, oauth2],
  summary: 'Test Operation',
});
```

### OpenAPI-TS: Operation IR (OpenAPI 2.0)

Source: `tmp/openapi-ts/packages/openapi-ts/src/openApi/2.0.x/parser/__tests__/operation.test.ts`

```ts
expect(context.ir.paths?.[path]?.[method]).toEqual({
  id: 'testOperation',
  method,
  operationId: 'testOperation',
  path,
  security: [
    { in: 'header', name: 'Auth', type: 'apiKey' },
    { description: 'Basic Auth', scheme: 'basic', type: 'http' },
    {
      description: 'OAuth2',
      flows: {
        password: {
          scopes: {
            read: 'Grants read access',
            write: 'Grants write access',
          },
          tokenUrl: 'https://example.com/oauth/token',
        },
      },
      type: 'oauth2',
    },
  ],
  summary: 'Test Operation',
});
```

### Castr: Webhooks in IR (normalized fixture)

Source: `lib/tests-roundtrip/__fixtures__/normalized/webhook-3.1/ir.json`

```json
"webhooks": {
  "newPet": {
    "post": {
      "requestBody": {
        "description": "Information about a new pet in the system",
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/Pet"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Return a 200 status to indicate that the data was received successfully"
        }
      }
    }
  }
}
```

### Castr: Callbacks in Operation IR (normalized fixture)

Source: `lib/tests-roundtrip/__fixtures__/normalized/callback-3.0/ir.json`

```json
"callbacks": {
  "onData": {
    "{$request.query.callbackUrl}/data": {
      "post": {
        "requestBody": {
          "description": "subscription payload",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "timestamp": { "type": "string", "format": "date-time" },
                  "userData": { "type": "string" }
                }
              }
            }
          }
        },
        "responses": {
          "202": { "description": "Your server implementation should return this HTTP status code\nif the data was received successfully\n" },
          "204": { "description": "Your server should return this HTTP status code if no longer interested\nin further updates\n" }
        }
      }
    }
  }
}
```

### Castr: Response Headers in IR (normalized fixture)

Source: `lib/tests-roundtrip/__fixtures__/normalized/petstore-3.0/ir.json`

```json
{
  "statusCode": "200",
  "description": "A paged array of pets",
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/Pets" }
    }
  },
  "headers": {
    "x-next": {
      "schema": { "type": "string" },
      "description": "A link to the next page of responses"
    }
  }
}
```

### Castr: Petstore Expanded (schema + operation + dependency graph)

Source: `lib/tests-roundtrip/__fixtures__/normalized/petstore-expanded-3.0/ir.json`

Schema (allOf composition with component ref):

```json
{
  "type": "schema",
  "name": "Pet",
  "schema": {
    "allOf": [
      {
        "$ref": "#/components/schemas/NewPet",
        "metadata": {
          "required": true,
          "nullable": false,
          "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
          "zodChain": { "presence": "", "validations": [], "defaults": [] },
          "circularReferences": []
        }
      },
      {
        "metadata": {
          "required": true,
          "nullable": false,
          "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
          "zodChain": { "presence": "", "validations": [], "defaults": [] },
          "circularReferences": []
        },
        "type": "object",
        "properties": {
          "dataType": "CastrSchemaProperties",
          "value": {
            "id": {
              "metadata": {
                "required": true,
                "nullable": false,
                "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
                "zodChain": { "presence": "", "validations": [".int()"], "defaults": [] },
                "circularReferences": []
              },
              "type": "integer",
              "format": "int64"
            }
          }
        },
        "required": ["id"]
      }
    ]
  }
}
```

Operation (query params + array response):

```json
{
  "operationId": "findPets",
  "method": "get",
  "path": "/pets",
  "parameters": [
    {
      "name": "tags",
      "in": "query",
      "required": false,
      "schema": {
        "metadata": {
          "required": false,
          "nullable": false,
          "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
          "zodChain": { "presence": ".optional()", "validations": [], "defaults": [] },
          "circularReferences": []
        },
        "type": "array",
        "items": {
          "metadata": {
            "required": false,
            "nullable": false,
            "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
            "zodChain": { "presence": ".optional()", "validations": [], "defaults": [] },
            "circularReferences": []
          },
          "type": "string"
        }
      },
      "metadata": {
        "required": false,
        "nullable": false,
        "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
        "zodChain": { "presence": ".optional()", "validations": [], "defaults": [] },
        "circularReferences": []
      },
      "description": "tags to filter by",
      "style": "form"
    },
    {
      "name": "limit",
      "in": "query",
      "required": false,
      "schema": {
        "metadata": {
          "required": false,
          "nullable": false,
          "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
          "zodChain": { "presence": ".optional()", "validations": [".int()"], "defaults": [] },
          "circularReferences": []
        },
        "type": "integer",
        "format": "int32"
      },
      "metadata": {
        "required": false,
        "nullable": false,
        "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
        "zodChain": { "presence": ".optional()", "validations": [".int()"], "defaults": [] },
        "circularReferences": []
      },
      "description": "maximum number of results to return"
    }
  ],
  "responses": [
    {
      "statusCode": "200",
      "description": "pet response",
      "content": {
        "application/json": {
          "schema": {
            "metadata": {
              "required": false,
              "nullable": false,
              "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
              "zodChain": { "presence": ".optional()", "validations": [], "defaults": [] },
              "circularReferences": []
            },
            "type": "array",
            "items": {
              "$ref": "#/components/schemas/Pet",
              "metadata": {
                "required": false,
                "nullable": false,
                "dependencyGraph": { "references": [], "referencedBy": [], "depth": 0 },
                "zodChain": { "presence": ".optional()", "validations": [], "defaults": [] },
                "circularReferences": []
              }
            }
          }
        }
      }
    }
  ]
}
```

Dependency graph (component ordering + direct dependencies):

```json
{
  "topologicalOrder": [
    "#/components/schemas/NewPet",
    "#/components/schemas/Pet",
    "#/components/schemas/Error"
  ],
  "nodes": {
    "#/components/schemas/Pet": {
      "ref": "#/components/schemas/Pet",
      "dependencies": ["#/components/schemas/NewPet"],
      "dependents": [],
      "depth": 1,
      "isCircular": false
    },
    "#/components/schemas/NewPet": {
      "ref": "#/components/schemas/NewPet",
      "dependencies": [],
      "dependents": ["#/components/schemas/Pet"],
      "depth": 0,
      "isCircular": false
    }
  }
}
```

## IR Deep Dive: Structures and Processing

### Castr IR: Canonical and Lossless

- IR is a canonical AST; after `buildIR()` the OpenAPI document is not consulted (ADR-023).
- Input preparation uses Scalar bundling and OpenAPI 3.1 upgrades while preserving internal $refs for graphs and circular detection.
- `CastrSchema` keeps OpenAPI/JSON Schema fields explicit (composition arrays, JSON Schema 2020-12 keywords like `prefixItems`, `unevaluated*`, `dependent*`, `minContains/maxContains`) and attaches `CastrSchemaNode` metadata for required/nullable, zod chains, and dependency info.
- Schema context types (`component`, `property`, `arrayItems`, `compositionMember`, `parameter`) separate optionality semantics and prevent category errors.
- Operations preserve full request/response content maps, headers, links, callbacks, and pathItem-level metadata.
- Document-level coverage now includes `tags`, `externalDocs`, `webhooks`, and `jsonSchemaDialect`, with component coverage for headers/links/callbacks/pathItems/examples.
- Dependency tracking is component-centric: `IRDependencyGraph` provides topological order and cycles; circular refs are also stamped on component schema metadata.
- IR serialization supports `Map` and `CastrSchemaProperties` for debugging and artifacts.

### OpenAPI-TS IR: Normalized for Codegen and Plugins

- OpenAPI-TS pre-parse transforms can mutate specs (enums, required-by-default, read/write splitting) before IR is built; Castr rejects non-compliant inputs.
- Schema parsing flattens composition into `items` + `logicalOperator`, deduplicates unions, injects discriminator properties, and uses `omit` to resolve conflicts.
- `additionalProperties` is normalized to `unknown`/`never` for type output; `accessScope` is derived from readOnly/writeOnly.
- Operations select a preferred media type and collapse bodies/responses to a single `IRBodyObject` and `IRResponseObject`; `id` is generated even when operationId is missing.
- A spec-wide JSON Pointer graph tracks nodes, dependencies, transitive deps, and scope propagation for read/write transforms.
- Plugins consume IR via events; `symbolRef` can bypass `$ref` lookups for direct type symbol usage.

### Conceptual Model Differences (Intent-Driven)

- Castr prioritizes lossless fidelity and round-trip correctness; OpenAPI-TS prioritizes predictable codegen output and plugin ergonomics.
- Castr’s metadata is writer-specific (Zod/MCP); OpenAPI-TS relies on graph scopes and plugin context for behavior.
- Castr retains multiple media types; OpenAPI-TS reduces to a preferred media type for simpler SDK output.
- Castr is strict on unresolved $refs (fail fast); OpenAPI-TS offers pre-parse patch/transform hooks, but Castr does not accept non-compliant inputs.

## Architectural Differences and Implications

### Normalization and Reference Handling

- Castr normalizes all inputs to OpenAPI 3.1 via Scalar and preserves internal $refs for dependency graphs and circular detection (`docs/architecture/scalar-pipeline.md`, `lib/src/shared/prepare-openapi-document.ts`).
- OpenAPI-TS bundles via `@hey-api/json-schema-ref-parser`, then applies pre-parse transforms before parsing (`tmp/openapi-ts/packages/openapi-ts/src/createClient.ts`, `tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`).
- Implication: Castr favors lossless reference tracking and round-trip fidelity; OpenAPI-TS favors mutable pre-processing to fit plugin outputs.

### Graphs and Scopes

- Castr builds a component-level dependency graph for ordering and circular detection; it does not maintain a spec-wide pointer graph.
- OpenAPI-TS builds a JSON Pointer graph with transitive dependencies and scope propagation to support read/write transforms.
- Implication: OpenAPI-TS can scope-split at graph level; Castr focuses on schema ordering for writers.

### Output Strategy

- Castr outputs are template-driven and can be single file or grouped; it can emit OpenAPI from IR (`lib/src/rendering/templating.ts`, `lib/src/writers/openapi/index.ts`).
- OpenAPI-TS outputs are plugin-scaffolded directory trees with runtime clients and core helpers (`tmp/openapi-ts/docs/openapi-ts/output.md`).
- Implication: Castr is ideal for building-block outputs; OpenAPI-TS is ideal for turnkey SDK generation.

### Processing Model

- Both systems are designed for offline generation of static files, not on-the-fly runtime transformation.
- Implication: optimization focus should favor correctness and maintainability over runtime latency; runtime cost is not a primary constraint here.

### Extensibility Model

- Castr: template selection + custom template paths; writers are ts-morph based.
- OpenAPI-TS: plugin graph with dependencies, tags, hooks, and custom plugins (`tmp/openapi-ts/packages/openapi-ts/src/config/plugins.ts`, `tmp/openapi-ts/docs/openapi-ts/core.md`).
- Implication: OpenAPI-TS is more extensible at the output layer; Castr is more rigid but provides a stable IR core.

### Transformation Philosophy

- Castr: fail-fast and minimize heuristics; encourage spec compliance (`docs/architectural_decision_records/ADR-001-fail-fast-spec-violations.md`).
- OpenAPI-TS: supports patch/transform steps for plugin outputs (`tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`).
- Implication: Castr provides stricter correctness guarantees; OpenAPI-TS provides more customization.

## Validation and Quality

### Spec Validation

- Castr uses AJV to validate OpenAPI compliance and enforce fail-fast behavior (`docs/architectural_decision_records/ADR-011-ajv-runtime-validation.md`).
- OpenAPI-TS validation is optional and limited (unique operationId, server checks) with `validate_EXPERIMENTAL` (`tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/validate.ts`).

### Runtime Validation

- Castr: Zod schemas with MCP-specific guards and error formatting (`lib/src/validation/mcp-type-guards.ts`, `lib/src/validation/mcp-error-formatting.ts`).
- OpenAPI-TS: validator plugins (Zod, Valibot; Ajv planned) (`tmp/openapi-ts/docs/openapi-ts/validators.md`).

### Testing Strategy

- Castr: unit + snapshot + roundtrip + generated + characterisation + e2e (multiple Vitest configs).
- OpenAPI-TS: extensive snapshot fixtures and plugin outputs, plus CLI/unit tests (`tmp/openapi-ts/packages/openapi-ts-tests`, `tmp/openapi-ts/packages/openapi-ts/src/__tests__`).

## How Each Library Could Benefit the Other

### Castr -> OpenAPI-TS

- **MCP tooling**: OpenAPI-TS could add MCP tool manifest output and validation utilities inspired by Castr.
- **Round-trip validation**: Adopt Castr’s round-trip invariants to validate IR correctness for plugins.
- **Strict spec validation**: Incorporate AJV-backed compliance (or similar) as a non-experimental mode.
- **OpenAPI writer from IR**: Use Castr-style IR-to-OpenAPI writer to support normalization workflows.

### OpenAPI-TS -> Castr

- **Plugin ecosystem**: Castr could adopt a light plugin interface for optional outputs (SDKs, framework hooks).
- **Pointer graph + scopes**: Add a spec-wide JSON Pointer graph to enable transitive dependency analysis and read/write scope propagation.
- **Registry + watch mode**: Provide registry shorthand input and watch-based regeneration for dev flows.
- **Transformers**: Add a “transformers” output (dates/bigint) or hook into output metadata to enable this.

### Shared/Interop Opportunities

- Define a shared IR interchange or adapter between `CastrDocument` and OpenAPI-TS `IR.Model` to reuse outputs.
- Use OpenAPI-TS client plugins to consume Castr endpoint metadata and Zod schemas.
- Create a compatibility test suite that feeds the same spec corpus through both IRs and compares semantic output.

## Deep Dive Opportunities for Castr

- Add a spec-wide JSON Pointer graph sidecar to enable scopes and transitive dependencies.
- Introduce an optional normalized IR view for writers (composition flattening, union dedupe, discriminator conflict handling, preferred media type hints).
- Model read/write scopes explicitly (graph-driven or metadata) to support distinct input/output schema generation.
- Expand remaining JSON Schema keyword coverage (patternProperties, propertyNames, contains, if/then/else) for parity with real-world specs.
- Add opt-in `x-` extension passthrough and stable operation IDs for plugin-friendly outputs.
- Populate per-node dependency metadata from the document graph (or remove it) to avoid ambiguity.

## OpenAPI-TS Test Cases: Value and Reuse for Castr

### What’s Valuable

- **Spec corpus** across 2.0, 3.0, 3.1, with many edge cases: discriminators, refs, nullable, enums, defaults, etc. (`tmp/openapi-ts/specs`).
- **Plugin snapshots** show real-world output expectations and naming edge cases (`tmp/openapi-ts/packages/openapi-ts-tests/main/test/__snapshots__`).
- **Parser transforms cases** (read/write, required-by-default, enum lifting) provide behavioral tests.

### How They Could Improve Castr

- Use OpenAPI-TS spec fixtures as **input validation** tests for parsing/IR stability.
- Convert select fixtures into **round-trip validation** for Castr’s OpenAPI writer.
- Extract edge-case specs to extend Castr’s **characterisation tests** and regression suite.
- Use fixture groups to validate **dependency graph correctness** and **circular handling**.

### Licensing and Adaptation Considerations

- OpenAPI-TS code and fixtures are under MIT (`tmp/openapi-ts/LICENSE.md`, `tmp/openapi-ts/packages/openapi-ts/LICENSE.md`), so reuse is allowed with attribution and inclusion of the MIT license text.
- Some spec fixtures are likely sourced from third parties (e.g., `tmp/openapi-ts/specs/3.1.x/openai.yaml`, `tmp/openapi-ts/specs/3.1.x/zoom-video-sdk.json`). These may carry their own licenses or terms. Audit each file’s provenance and license before copying or redistributing.
- Safer approach: **reference** the fixtures in-place for internal testing, or recreate minimal synthetic equivalents inspired by the edge cases to avoid third-party licensing ambiguity.
- If copying: include license notices in the destination test folder and preserve any file-level license metadata. (Not legal advice.)

## Recommendations

- Build a shared spec corpus index mapping OpenAPI-TS fixtures to Castr test categories (parsing, IR, roundtrip, schema validation).
- Prototype a pointer-level graph sidecar with scope propagation for transitive dependency analysis.
- Add an optional normalized writer view (composition flattening, union dedupe, discriminator handling, media type preference).
- Preserve strict-by-default and fail-fast at all times; no tolerant modes.
- Expand JSON Schema keyword coverage and add opt-in `x-` extension passthrough for plugins.
- Consider an interop adapter: `CastrDocument -> OpenAPI-TS IR.Model` for selected plugins.

## Open Questions

- Should per-schema `metadata.dependencyGraph` be populated from the document graph, or removed to avoid confusion?
- Should normalized writer views live inside IR or remain writer-level transforms?
- Which JSON Schema keywords are required for parity with OpenAPI-TS behavior, and which can be deferred?
- Should Castr expose `x-` extensions and stable operation IDs by default or only via opt-in flags?

## References

- Castr architecture: `docs/architecture/scalar-pipeline.md`, `docs/architectural_decision_records/ADR-023-ir-based-architecture.md`
- Castr validation: `docs/architectural_decision_records/ADR-001-fail-fast-spec-violations.md`, `docs/architectural_decision_records/ADR-011-ajv-runtime-validation.md`
- Castr IR: `lib/src/ir/schema.ts`, `lib/src/ir/context.ts`
- OpenAPI-TS core: `tmp/openapi-ts/packages/openapi-ts/src/index.ts`, `tmp/openapi-ts/packages/openapi-ts/src/createClient.ts`
- OpenAPI-TS parser/IR: `tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/index.ts`, `tmp/openapi-ts/packages/openapi-ts/src/ir/types.d.ts`
- OpenAPI-TS plugins/config: `tmp/openapi-ts/packages/openapi-ts/src/config/plugins.ts`, `tmp/openapi-ts/docs/openapi-ts/core.md`
- OpenAPI-TS validation/transform: `tmp/openapi-ts/packages/openapi-ts/src/openApi/3.1.x/parser/validate.ts`, `tmp/openapi-ts/docs/openapi-ts/configuration/parser.md`
- OpenAPI-TS fixtures: `tmp/openapi-ts/specs`
