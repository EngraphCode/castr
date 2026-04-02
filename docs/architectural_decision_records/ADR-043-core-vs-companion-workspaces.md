# ADR-043: Core Compiler Boundary and Companion Workspace Model

**Status:** Accepted  
**Date:** 2026-04-02  
**Related:** [ADR-022](./ADR-022-building-blocks-no-http-client.md), [ADR-023](./ADR-023-ir-based-architecture.md), [ADR-025](./ADR-025-http-client-di-integration.md)

---

## Context

ADR-022 established that Castr should generate building blocks rather than bundle an HTTP client. ADR-025 later explored whether a typed client factory and adapter interface should live in core `@engraph/castr`. Since then, two things have become clearer:

1. the repo's core value is the schema/compiler/IR pipeline
2. real downstream use cases, especially in Oak, will likely need additional operational capabilities such as typed fetch harnesses, runtime handlers, framework bindings, and code-first ingestion

Without an explicit boundary, those downstream needs could blur the core package into a mixed compiler/runtime/framework product. That would make the public surface harder to reason about, increase coupling, and make the documentation and roadmap drift again.

The repo therefore needs one explicit product boundary that all plans, ADRs, and public docs can follow.

## Decision

### 1. Core `@engraph/castr` / `lib` stays narrow

Core `@engraph/castr` is the compiler package. Its responsibilities are:

- document loading and parsing
- canonical IR types and runtime validation
- writers / emitters
- metadata outputs needed to consume generated artefacts honestly
- proofs and verification tied to those schema/compiler surfaces

Core `@engraph/castr` does **not** own:

- typed HTTP clients
- request execution or retry logic
- framework-specific handlers or middleware
- runtime transport configuration
- framework-specific or code-first authoring abstractions as core format promises

### 2. Operational and framework integrations belong in companion workspaces

Capabilities that consume Castr output but add transport, runtime, framework, or code-first concerns belong in separate companion workspaces.

Examples include:

- typed fetch harnesses
- runtime exposure packages
- framework adapters for Hono, Express, Next, or similar targets
- code-first / framework ingestion layers such as tRPC integrations
- reference implementations and migration aids for specific adoption targets

These workspaces may be first-party and strategically important, but they are **not** part of the core `@engraph/castr` package surface.

### 3. Public package truth must follow the boundary

Public documentation for `@engraph/castr` must describe only the core compiler package.

If companion workspaces are created:

- they get their own package surfaces and documentation
- they are referenced as companions, not folded into core wording
- they are described at the category level until names and release order are real

Core docs must not imply that `@engraph/castr` exports runtime client factories, HTTP adapters, or framework handlers.

### 4. Planning and roadmap language must stay explicit

Roadmaps and future plans may include companion-workspace directions, but they must label them as companion workspaces, reference implementations, or ecosystem layers. They must not present those directions as core `lib` format commitments.

In particular:

- tRPC and similar code-first integrations are companion-workspace directions
- typed fetch/runtime helpers are companion-workspace directions
- Oak-style adoption proofs may drive priorities, but they do not redefine the core package boundary

### 5. Oak remains the first proving ladder, not the whole product

The near-term proving ladder is:

1. replace the Oak `openapi-zod-client` adapter boundary
2. replace the wider Oak OpenAPI third-party stack where that aligns with the boundary above
3. replace Oak's code-first OpenAPI generation stack through companion-workspace or equivalent layering

Oak is the first concrete proving ground, but the architecture remains general rather than Oak-specific.

## Consequences

### Positive

- the core package stays conceptually clean and easier to trust
- downstream operational features can evolve without swelling the compiler surface
- Oak and similar adoption targets can still be served through first-party companion workspaces
- public docs and future plans have one explicit rule for where new capabilities belong

### Negative

- the repo may grow more packages or workspaces over time
- some users may prefer an all-in-one surface and need clearer guidance
- roadmap discipline matters more because cross-workspace boundaries can drift if left implicit

### Mitigation

- keep public docs explicit about the core-vs-companion split
- create companion workspaces only when a concrete use case justifies them
- preserve historical ADRs with update banners rather than rewriting them invisibly
- keep durable architecture truth in ADRs and core docs, not only in plans
