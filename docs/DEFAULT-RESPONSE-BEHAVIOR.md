# Default Response Behavior Documentation

**Status:** Documented  
**Date:** November 2025  
**Related:** `TemplateContextOptions.defaultStatusBehavior`

---

## Overview

This document explains the `defaultStatusBehavior` option and the warning message you may encounter:

```text
[WARN] The following endpoints have no status code other than `default` and were ignored
as the OpenAPI spec recommends. However they could be added by setting
`defaultStatusBehavior` to `auto-correct`: createUser, logoutUser, updateUser
```

This is **not an error** in your API or in this library. It's an informational warning about how the tool handles OpenAPI endpoints that only define a `default` response status code.

---

## Table of Contents

1. [What is the `default` Status Code?](#what-is-the-default-status-code)
2. [The Problem](#the-problem)
3. [The Solution: `defaultStatusBehavior`](#the-solution-defaultstatusbehavior)
4. [How to Fix the Warning](#how-to-fix-the-warning)
5. [Test Fixtures Affected](#test-fixtures-affected)
6. [References](#references)

---

## What is the `default` Status Code?

In OpenAPI, the `default` response is a special status code that matches **any** HTTP status code not explicitly defined:

```yaml
paths:
  /users:
    post:
      responses:
        default:
          description: Any response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

According to the OpenAPI specification:

> The `default` keyword is used to define a response for any HTTP status code that is not covered by the responses object.

**Problem:** If an endpoint only defines `default` and no explicit status codes (like `200`, `201`, `400`, etc.), it's unclear what status code the client should expect for a successful response.

---

## The Problem

Consider this endpoint:

```yaml
paths:
  /users:
    post:
      responses:
        default:
          description: User response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

**Questions:**

1. What status code represents success? `200`? `201`? `204`?
2. What status code represents an error? `400`? `500`?
3. How should a client library handle this?

The OpenAPI spec recommends **defining explicit status codes** instead of relying solely on `default`. This is why `@engraph/castr` issues a warning and, by default, **ignores** endpoints with only `default` responses.

---

## The Solution: `defaultStatusBehavior`

The `defaultStatusBehavior` option controls how `@engraph/castr` handles endpoints with only `default` status codes.

### Option 1: `spec-compliant` (Default)

**Behavior:** Ignore endpoints with only `default` status codes and issue a warning.

**When to use:**

- You have control over the OpenAPI spec
- You want to encourage explicit status codes
- You follow OpenAPI best practices

**Example:**

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: 'https://api.example.com/openapi.json',
  options: {
    defaultStatusBehavior: 'spec-compliant', // Default
  },
});
```

**Output:**

```text
[WARN] The following endpoints have no status code other than `default` and were ignored
as the OpenAPI spec recommends. However they could be added by setting
`defaultStatusBehavior` to `auto-correct`: createUser, logoutUser, updateUser
```

**Result:** These endpoints are **not included** in the generated client.

### Option 2: `auto-correct`

**Behavior:** Treat `default` as `200` for successful responses.

**When to use:**

- You don't control the OpenAPI spec (third-party API)
- You need to work with a spec that only uses `default`
- You understand the risks (assuming success = 200)

**Example:**

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: 'https://api.example.com/openapi.json',
  options: {
    defaultStatusBehavior: 'auto-correct',
  },
});
```

**Output:** No warning, endpoints are included in the generated client.

**Result:** These endpoints **are included** in the generated client, with `default` treated as `200`.

---

## How to Fix the Warning

### Best Solution: Update Your OpenAPI Spec

The best solution is to **update your OpenAPI spec** to use explicit status codes:

```yaml
# ❌ Before (only default)
paths:
  /users:
    post:
      responses:
        default:
          description: User response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

# ✅ After (explicit status codes)
paths:
  /users:
    post:
      responses:
        201:
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        400:
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
        default:
          description: Unexpected error
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'
```

This provides:

- **Clarity** for API consumers
- **Type safety** for generated clients
- **Better documentation**
- **Compliance** with OpenAPI best practices

### Alternative: Use `auto-correct` Option

If you can't update the spec (e.g., it's a third-party API), use `auto-correct`:

```typescript
const result = await generateZodClientFromOpenAPI({
  openApiDoc: thirdPartySpec,
  options: {
    defaultStatusBehavior: 'auto-correct',
  },
});
```

**Trade-off:** You assume that `default` means `200`, which may not always be correct.

---

## Test Fixtures Affected

The following test fixtures in this codebase trigger the warning because they only define `default` responses:

### 1. `lib/examples/openapi/v3.0/default-status-only.yaml`

**Endpoint:** `POST /users` (`createUser`)

```yaml
paths:
  /users:
    post:
      operationId: createUser
      responses:
        default:
          description: User response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

**Status:** Intentional test fixture to verify warning behavior.

### 2. `lib/examples/openapi/v3.0/logout-endpoint.yaml`

**Endpoint:** `POST /logout` (`logoutUser`)

```yaml
paths:
  /logout:
    post:
      operationId: logoutUser
      responses:
        default:
          description: Logout response
```

**Status:** Intentional test fixture to verify warning behavior.

### 3. `lib/examples/openapi/v3.1/update-user.yaml`

**Endpoint:** `PUT /users/{userId}` (`updateUser`)

```yaml
paths:
  /users/{userId}:
    put:
      operationId: updateUser
      responses:
        default:
          description: User update response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

**Status:** Intentional test fixture to verify warning behavior.

### Why Are These Fixtures Like This?

These fixtures are **intentional test cases** to ensure that:

1. `@engraph/castr` correctly detects endpoints with only `default` responses
2. The warning message is displayed correctly
3. The `auto-correct` option works as expected
4. The `spec-compliant` option (default) correctly ignores these endpoints

**These are NOT production examples to follow.** They demonstrate what **not** to do in a real API.

---

## API Surface

### Type Definition

```typescript
/**
 * Controls how endpoints with only `default` status codes are handled
 *
 * @default 'spec-compliant'
 */
export type DefaultStatusBehavior = 'spec-compliant' | 'auto-correct';
```

### Option Location

**File:** `lib/src/context/template-context.types.ts`

**Usage:**

````typescript
interface TemplateContextOptions {
  /**
   * Controls how to handle endpoints that only define a `default` response status code.
   *
   * The OpenAPI specification recommends defining explicit status codes (200, 201, 400, etc.)
   * rather than relying solely on `default`. However, some APIs only use `default`.
   *
   * @default 'spec-compliant'
   *
   * @example
   * ```typescript
   * // Ignore endpoints with only `default` (recommended)
   * defaultStatusBehavior: 'spec-compliant'
   *
   * // Treat `default` as `200` (for third-party APIs)
   * defaultStatusBehavior: 'auto-correct'
   * ```
   */
  defaultStatusBehavior?: DefaultStatusBehavior;
}
````

### Implementation

**File:** `lib/src/endpoints/status-codes.ts` (hypothetical location)

The warning is emitted when:

1. An endpoint has a `responses` object
2. The only key in `responses` is `default`
3. The `defaultStatusBehavior` option is set to `spec-compliant`

Example logic:

```typescript
const statusCodes = Object.keys(operation.responses ?? {});
const hasOnlyDefault = statusCodes.length === 1 && statusCodes[0] === 'default';

if (hasOnlyDefault && options.defaultStatusBehavior === 'spec-compliant') {
  warnings.push(`Endpoint ${operationId} has only 'default' status code and was ignored`);
  return null; // Skip this endpoint
}

if (hasOnlyDefault && options.defaultStatusBehavior === 'auto-correct') {
  // Treat 'default' as '200'
  return handleResponse(operation.responses.default, '200');
}
```

---

## Programmatic Usage

### Example 1: Default Behavior (Spec-Compliant)

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: './openapi.yaml',
  // defaultStatusBehavior is 'spec-compliant' by default
});

// Endpoints with only `default` are not included
// A warning is logged to console
```

### Example 2: Auto-Correct (For Third-Party APIs)

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';

const result = await generateZodClientFromOpenAPI({
  openApiDoc: 'https://third-party-api.com/openapi.json',
  options: {
    defaultStatusBehavior: 'auto-correct',
  },
});

// Endpoints with only `default` are included
// `default` is treated as `200`
// No warning is logged
```

### Example 3: Using with openapi-fetch

```typescript
import { generateZodClientFromOpenAPI } from '@engraph/castr';
import createClient from 'openapi-fetch';

// Generate schemas
const { schemas } = await generateZodClientFromOpenAPI({
  openApiDoc: './openapi.yaml',
  options: {
    defaultStatusBehavior: 'auto-correct', // Include default-only endpoints
  },
});

// Use with openapi-fetch
const client = createClient({
  baseUrl: 'https://api.example.com',
});

const { data } = await client.POST('/users', {
  body: { name: 'John' },
});

// Validate response
schemas.User.parse(data);
```

---

## CLI Usage

### Default Behavior

```bash
npx @engraph/castr ./openapi.yaml -o ./generated.ts
# [WARN] The following endpoints have no status code other than `default`...
```

### With Auto-Correct

```bash
npx @engraph/castr ./openapi.yaml -o ./generated.ts --default-status-behavior auto-correct
# No warning, default-only endpoints are included
```

---

## References

### OpenAPI Specification

- [OpenAPI 3.1 Responses Object](https://spec.openapis.org/oas/v3.1.0#responses-object)
- [OpenAPI 3.1 Response Object](https://spec.openapis.org/oas/v3.1.0#response-object)

**From the spec:**

> A container for the expected responses of an operation. The container maps a HTTP response code to the expected response.
>
> The documentation is not necessarily expected to cover all possible HTTP response codes because they may not be known in advance. However, documentation is expected to cover a successful operation response and any known errors.
>
> The `default` MAY be used as a default response object for all HTTP codes that are not covered individually by the specification.

### Related Documentation

- [TSDoc for `defaultStatusBehavior`](../lib/src/context/template-context.types.ts)
- [TSDoc for `generateZodClientFromOpenAPI`](../lib/src/rendering/generate-from-context.ts)

### Related Issues

- **Intentional test fixtures:** These fixtures are designed to test the warning behavior, not to serve as production examples.

---

## Summary

1. **What's the warning?** Endpoints with only `default` status codes are ambiguous.
2. **Why does it happen?** The OpenAPI spec recommends explicit status codes.
3. **Is it bad?** It's not an error, but it's not a best practice.
4. **How do I fix it?** Either update your spec with explicit status codes (recommended) or use `defaultStatusBehavior: 'auto-correct'` (workaround).
5. **Is it affecting my tests?** If you see this warning in tests, it's likely from intentional test fixtures designed to verify this behavior.

**Best practice:** Always define explicit status codes in your OpenAPI spec for clarity and type safety.

---

**Last Updated:** January 2026  
**Architecture:** See `.agent/directives/VISION.md` for details
