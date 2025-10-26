# 03: API Design & Developer Experience

**Domain**: API Design, Error Handling, Flexibility  
**Impact**: 🔴 High (affects all API consumers)  
**Effort**: 🟡 Medium  
**Priority**: P1-P2 (near to medium-term)

---

## 📋 Quick Summary

typed-openapi's API design principles:

1. **Headless Client Pattern** - Users bring their own HTTP library
2. **Discriminated Union Errors** - Type-safe status-code-based error handling
3. **Configurable Status Codes** - Different APIs, different conventions
4. **Response Mode Options** - Direct data vs union-style responses
5. **Zero Framework Lock-in** - Works with any stack

**Key benefit**: Maximum flexibility without sacrificing type safety

---

## 1. Headless Client Pattern

### 1.1 The Problem with Opinionated Clients

**openapi-zod-client's current approach**:

```typescript
import { Zodios } from '@zodios/core';
const api = new Zodios(baseUrl, endpoints);
// Locked into: Zodios wrapper + axios HTTP client
```

**Limitations**:

- Can't use fetch, ky, got, or other HTTP libraries
- Axios adds 98KB to bundle
- Can't customize auth, retries, interceptors (without Zodios patterns)
- Doesn't work in some environments (Cloudflare Workers prefer fetch)

### 1.2 typed-openapi's Solution

**Headless = Bring Your Own Fetcher**:

```typescript
// Step 1: Define what a fetcher looks like
type Fetcher = (
  method: Method,
  url: string,
  params?: {
    query?: Record<string, unknown>;
    header?: Record<string, unknown>;
    body?: unknown;
  },
) => Promise<Response>;

// Step 2: Client accepts any fetcher
export function createClient<F extends Fetcher>(baseUrl: string, fetcher: F): ApiClient {
  return {
    get: (path, params) => fetcher('GET', `${baseUrl}${path}`, params),
    post: (path, params) => fetcher('POST', `${baseUrl}${path}`, params),
    // ... fully typed based on OpenAPI spec
  };
}

// Step 3: Users provide their own implementation
const api = createClient('https://api.example.com', myCustomFetcher);
```

**See full pattern**: [examples/16-headless-client.ts](./examples/16-headless-client.ts)

### 1.3 Real-World Fetcher Examples

#### Native Fetch

```typescript
const fetchFetcher: Fetcher = async (method, url, params) => {
  const urlObj = new URL(url);

  // Add query params
  if (params?.query) {
    Object.entries(params.query).forEach(([key, value]) => {
      if (value != null) {
        urlObj.searchParams.append(key, String(value));
      }
    });
  }

  // Build request
  const headers = new Headers(params?.header as HeadersInit);
  const body = params?.body ? JSON.stringify(params.body) : undefined;

  if (body) headers.set('Content-Type', 'application/json');

  return fetch(urlObj, { method, headers, body });
};
```

#### Axios

```typescript
import axios from 'axios';

const axiosFetcher: Fetcher = async (method, url, params) => {
  const response = await axios({
    method,
    url,
    params: params?.query,
    headers: params?.header,
    data: params?.body,
  });

  // Convert axios response to fetch Response format
  return new Response(JSON.stringify(response.data), {
    status: response.status,
    headers: response.headers as any,
  });
};
```

#### With Authentication

```typescript
const authenticatedFetcher: Fetcher = async (method, url, params) => {
  const token = await getAuthToken();

  return fetch(url, {
    method,
    headers: {
      ...params?.header,
      Authorization: `Bearer ${token}`,
    },
    body: params?.body ? JSON.stringify(params.body) : undefined,
  });
};
```

#### With Retry Logic

```typescript
import { retry } from 'ts-retry-promise';

const retryingFetcher: Fetcher = async (method, url, params) => {
  return retry(
    async () => {
      const response = await baseFetcher(method, url, params);
      if (!response.ok && response.status >= 500) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response;
    },
    { retries: 3, delay: 1000 },
  );
};
```

**See all examples**: [examples/17-fetcher-implementations.ts](./examples/17-fetcher-implementations.ts)

### 1.4 Benefits

| Benefit           | Description            | Example                           |
| ----------------- | ---------------------- | --------------------------------- |
| **Choice**        | Use any HTTP library   | fetch, axios, ky, got, etc.       |
| **Environment**   | Works anywhere         | Browser, Node, Deno, Bun, Workers |
| **Bundle Size**   | No forced dependencies | Save 98KB by using fetch          |
| **Customization** | Full control           | Auth, retries, logging, metrics   |
| **Testing**       | Easy to mock           | Just pass a test fetcher          |

### 1.5 Applying to openapi-zod-client

#### Current: schemas-with-metadata Template

Good start, but can be enhanced:

```typescript
// Current: endpoints metadata only
export const endpoints = [
  /* ... */
];

// Users have to write their own client
// No helper, no type inference on methods
```

#### Proposed: Enhanced Headless Client

```typescript
// Generated client with type inference
export function createApiClient<TFetcher extends Fetcher>(
  baseUrl: string,
  fetcher: TFetcher,
  options?: ClientOptions,
) {
  return {
    // Auto-generated methods from endpoints
    getPetById: async (params: GetPetByIdParams) => {
      const endpoint = endpoints.find((e) => e.operationId === 'getPetById')!;

      // Optional request validation
      if (options?.validateRequest) {
        validateRequest(endpoint, params);
      }

      // Build URL with path params
      const url = buildUrl(baseUrl, endpoint.path, params);

      // Make request
      const response = await fetcher('GET', url, {
        query: params.queryParams,
        header: params.headers,
      });

      // Optional response validation
      const data = await response.json();
      if (options?.validateResponse) {
        return validateResponse(endpoint, response.status, data);
      }

      return data as GetPetByIdResponse;
    },

    // ... all other endpoints
  };
}

// Usage
const api = createApiClient('https://api.example.com', fetch);
const pet = await api.getPetById({ pathParams: { petId: '123' } });
//    ^? Fully typed Pet response
```

**See full implementation**: [examples/18-enhanced-headless-client.ts](./examples/18-enhanced-headless-client.ts)

#### Migration Path

**Phase 1**: Keep Zodios as default

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts
# Generates Zodios client (current behavior)
```

**Phase 2**: Add headless option

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts --no-client
# Generates schemas-with-metadata (current)

pnpm openapi-zod-client ./api.yaml -o ./client.ts --headless
# Generates enhanced headless client (NEW)
```

**Phase 3**: Make headless default (breaking change, v2.0)

```bash
pnpm openapi-zod-client ./api.yaml -o ./client.ts
# Generates headless client (future default)

pnpm openapi-zod-client ./api.yaml -o ./client.ts --zodios
# Generates Zodios client (opt-in)
```

---

## 2. Discriminated Union Error Handling

### 2.1 The Problem with Traditional Error Handling

**Traditional approach** (try/catch):

```typescript
try {
  const pet = await api.getPetById({ pathParams: { petId: '123' } });
  // pet is Pet
  console.log(pet.name);
} catch (error) {
  // error is unknown or generic Error
  // No type information about error structure
  // Have to check status code manually
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    console.log('Not found');
  } else if (error.response?.status === 401) {
    console.log('Unauthorized');
  }
}
```

**Problems**:

- No type safety on error responses
- Have to use type guards or type assertions
- Error structure not clear from types
- Status codes scattered in catch blocks

### 2.2 typed-openapi's Solution: Discriminated Unions

**With `withResponse: true`**:

```typescript
const result = await api.getPetById({
  path: { petId: '123' },
  withResponse: true,
});

// result is a discriminated union
if (result.ok) {
  // result.data is Pet (from 200 response)
  // result.status is 200
  console.log(result.data.name);
} else {
  // result.data is error schema based on status
  // result.status is 400 | 401 | 404 | 500 | etc.

  switch (result.status) {
    case 404:
      // result.data is NotFoundError (from spec)
      console.log(result.data.message);
      break;
    case 401:
      // result.data is UnauthorizedError (from spec)
      console.log('Please login');
      break;
    default:
      // result.data is unknown
      console.log('Unexpected error');
  }
}
```

**Type definition**:

```typescript
type ApiResponse<TSuccess, TErrors> =
  | { ok: true; status: 200; data: TSuccess }
  | { ok: false; status: 404; data: NotFoundError }
  | { ok: false; status: 401; data: UnauthorizedError }
  | { ok: false; status: 500; data: InternalError };
```

**See full pattern**: [examples/19-discriminated-unions.ts](./examples/19-discriminated-unions.ts)

### 2.3 Benefits

| Benefit             | Description                         |
| ------------------- | ----------------------------------- |
| **Type Safety**     | Compiler knows error structure      |
| **Exhaustiveness**  | Switch must handle all cases        |
| **Discoverability** | IDE shows all possible status codes |
| **Clarity**         | Error handling explicit in code     |
| **No Exceptions**   | Errors are values, not thrown       |

### 2.4 Configurable Success/Error Status Codes

typed-openapi allows configuration:

```bash
--success-status-codes "200,201,202,204"
--error-status-codes "400,401,403,404,500,502,503"
```

**Why configurable?**

- Different APIs use different conventions
- Some use 3xx as success, others as redirects
- Custom status codes (207 Multi-Status, 418 I'm a teapot)
- Internal APIs may have different standards

**Default ranges**:

```typescript
const DEFAULT_SUCCESS = [
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  226, // 2xx
  300,
  301,
  302,
  303,
  304,
  305,
  306,
  307,
  308, // 3xx
];

const DEFAULT_ERROR = [
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409, // 4xx
  410,
  411,
  412,
  413,
  414,
  415,
  416,
  417,
  418,
  421,
  422,
  423,
  424,
  425,
  426,
  428,
  429,
  431,
  451,
  500,
  501,
  502,
  503,
  504,
  505,
  506,
  507,
  508,
  510,
  511, // 5xx
];
```

### 2.5 Applying to openapi-zod-client

#### Current State

```typescript
// Hardcoded in isMainResponseStatus and isErrorStatus
export function isMainResponseStatus(status: string): boolean {
  return status === '200' || status === '201' || status === 'default';
}

export function isErrorStatus(status: string): boolean {
  const code = parseInt(status);
  return code >= 400 && code < 600;
}
```

#### Proposed Enhancement

**1. CLI configuration**:

```bash
--success-status-codes "200-299,304"      # Ranges supported
--error-status-codes "400-499,500-599"
--default-status-code "200"               # When no status defined
```

**2. Config file**:

```typescript
// openapi-zod-client.config.ts
export default {
  statusCodes: {
    success: [200, 201, 202, 204, 304],
    error: [400, 401, 403, 404, 500, 502, 503],
    default: 200,
  },
};
```

**3. Generated discriminated unions**:

```typescript
// Generate response type
export type GetPetByIdResponse =
  | { ok: true; status: 200; data: Pet }
  | { ok: true; status: 304; data: null } // Not modified
  | { ok: false; status: 400; data: BadRequest }
  | { ok: false; status: 404; data: NotFound }
  | { ok: false; status: 500; data: ServerError };

// Helper function
export async function safeGetPetById(params: GetPetByIdParams): Promise<GetPetByIdResponse> {
  try {
    const response = await fetch(/* ... */);
    const data = await response.json();

    if (isSuccessStatus(response.status)) {
      return { ok: true, status: response.status, data };
    } else {
      return { ok: false, status: response.status, data };
    }
  } catch (error) {
    return {
      ok: false,
      status: 500,
      data: { message: 'Network error', error },
    };
  }
}
```

**See full implementation**: [examples/20-configurable-status-codes.ts](./examples/20-configurable-status-codes.ts)

---

## 3. Generic Request Method

### 3.1 typed-openapi's Generic Request

For dynamic endpoint calls:

```typescript
// Generic request method with full type inference
const response = await api.request('GET', '/users/{id}', {
  path: { id: '123' },
  query: { include: ['profile', 'settings'] },
  headers: { authorization: 'Bearer token' },
});

// response is fully typed based on endpoint definition
const user = await response.json();
//    ^? User type (inferred from OpenAPI spec)
```

**Benefits**:

- Dynamic endpoint selection
- Programmatic API calls
- Still fully type-safe
- Useful for generic utilities

### 3.2 Applying to openapi-zod-client

**Add generic request method**:

```typescript
export interface ApiClient {
  // Specific methods (existing)
  getPetById(params: GetPetByIdParams): Promise<Pet>;

  // Generic request method (NEW)
  request<TEndpoint extends keyof EndpointMap>(
    method: EndpointMap[TEndpoint]['method'],
    path: TEndpoint,
    params?: EndpointMap[TEndpoint]['params'],
  ): Promise<EndpointMap[TEndpoint]['response']>;
}

// Usage
const api = createApiClient(/* ... */);

// Dynamic endpoint
const endpoint = '/pets/{petId}' as const;
const pet = await api.request('GET', endpoint, {
  pathParams: { petId: '123' },
});
//    ^? Pet (fully typed)

// Programmatic
function callEndpoint<T extends keyof EndpointMap>(endpoint: T, params: EndpointMap[T]['params']) {
  return api.request(EndpointMap[endpoint].method, endpoint, params);
}
```

**See implementation**: [examples/21-generic-request.ts](./examples/21-generic-request.ts)

---

## 4. TanStack Query Integration

### 4.1 typed-openapi's TanStack Support

```bash
npx typed-openapi api.yaml --tanstack
```

Generates:

```typescript
// Queries
export const tanstackApi = {
  get: (path, params) => ({
    queryKey: [path, params],
    queryFn: () => api.get(path, params),
    queryOptions: {
      /* ... */
    },
  }),
};

// Usage
const query = useQuery(tanstackApi.get('/pets/{petId}', { path: { petId: '123' } }).queryOptions);

// Mutations
const mutation = useMutation(tanstackApi.mutation('post', '/pets').mutationOptions);
```

**Features**:

- Auto-generated query keys
- Type-safe query options
- Mutation helpers
- Works with `withResponse` for error handling

**See full pattern**: [examples/22-tanstack-integration.ts](./examples/22-tanstack-integration.ts)

### 4.2 Applying to openapi-zod-client

**Proposed**:

```bash
pnpm openapi-zod-client ./api.yaml -o ./api-client.ts --tanstack ./tanstack-api.ts
```

Generate separate file with React Query helpers:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { endpoints, createApiClient } from './api-client';

export function createTanstackApi(api: ReturnType<typeof createApiClient>) {
  return {
    // Queries
    getPetById: (params: GetPetByIdParams) => ({
      queryKey: ['getPetById', params] as const,
      queryFn: () => api.getPetById(params),
    }),

    // Mutations
    createPet: () => ({
      mutationFn: (data: CreatePetParams) => api.createPet(data),
    }),

    // ... all other endpoints
  };
}

// Hooks
export function useGetPetById(params: GetPetByIdParams) {
  const api = useApiClient(); // From context
  const tanstack = createTanstackApi(api);
  return useQuery(tanstack.getPetById(params));
}

export function useCreatePet() {
  const api = useApiClient();
  const tanstack = createTanstackApi(api);
  return useMutation(tanstack.createPet());
}
```

**See implementation**: [examples/23-tanstack-generation.ts](./examples/23-tanstack-generation.ts)

---

## 5. Best Practices Summary

### 5.1 Design Principles

- ✅ **Flexibility over convenience** - Let users choose their tools
- ✅ **Type safety first** - Leverage TypeScript's type system
- ✅ **Errors are values** - Use discriminated unions over exceptions
- ✅ **Configuration over convention** - Make it adaptable
- ✅ **Framework agnostic** - Works with any stack

### 5.2 API Design Checklist

- [ ] Headless client option available?
- [ ] Discriminated union error handling?
- [ ] Configurable status codes?
- [ ] Generic request method?
- [ ] Framework integration support (React Query, SWR)?
- [ ] Easy to mock for testing?
- [ ] Clear documentation with examples?
- [ ] Migration guide from existing API?

---

## 6. References

### Code Examples

- [16-headless-client.ts](./examples/16-headless-client.ts)
- [17-fetcher-implementations.ts](./examples/17-fetcher-implementations.ts)
- [18-enhanced-headless-client.ts](./examples/18-enhanced-headless-client.ts)
- [19-discriminated-unions.ts](./examples/19-discriminated-unions.ts)
- [20-configurable-status-codes.ts](./examples/20-configurable-status-codes.ts)
- [21-generic-request.ts](./examples/21-generic-request.ts)
- [22-tanstack-integration.ts](./examples/22-tanstack-integration.ts)
- [23-tanstack-generation.ts](./examples/23-tanstack-generation.ts)

### External Resources

- [typed-openapi API examples](https://github.com/astahmer/typed-openapi/blob/main/packages/typed-openapi/API_CLIENT_EXAMPLES.md)
- [TanStack Query integration](https://github.com/astahmer/typed-openapi/blob/main/packages/typed-openapi/TANSTACK_QUERY_EXAMPLES.md)
- [Discriminated unions in TypeScript](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions)

---

**Next**: Read [04-TESTING.md](./04-TESTING.md) for testing strategies and quality assurance.
