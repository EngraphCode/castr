# Examples

Extensive real-world examples for using `@engraph/castr`.

This library uses an **Caster Model architecture** for schema conversion. See `.agent/directives/VISION.md` for the strategic vision.

## Table of Contents

- [Basic CRUD Operations](#basic-crud-operations)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [File Operations](#file-operations)
- [Query Parameters](#query-parameters)
- [Path Parameters](#path-parameters)
- [Request Bodies](#request-bodies)
- [Multiple Content Types](#multiple-content-types)
- [Retry Logic](#retry-logic)
- [React Integration](#react-integration)
- [Testing](#testing)

---

## Basic CRUD Operations

### Create (POST)

```typescript
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Create a new pet
const newPet = await api.createPet({
  name: 'Fluffy',
  species: 'cat',
  age: 3,
});

console.log('Created pet:', newPet.id);
```

### Read (GET)

```typescript
// Get a single pet by ID
const pet = await api.getPet({ id: '123' });
console.log('Pet name:', pet.name);

// List all pets
const pets = await api.listPets();
console.log(`Found ${pets.length} pets`);

// List with pagination
const page1 = await api.listPets({ limit: 10, offset: 0 });
const page2 = await api.listPets({ limit: 10, offset: 10 });
```

### Update (PUT/PATCH)

```typescript
// Full update (PUT)
const updated = await api.updatePet({
  id: '123',
  body: {
    name: 'Fluffy Jr.',
    species: 'cat',
    age: 4,
  },
});

// Partial update (PATCH)
const patched = await api.patchPet({
  id: '123',
  body: {
    age: 5, // Only update age
  },
});
```

### Delete (DELETE)

```typescript
// Delete a pet
await api.deletePet({ id: '123' });
console.log('Pet deleted');
```

---

## Authentication

### Bearer Token

```typescript
import { createApiClient } from './api-client';

const token = await login('user@example.com', 'password');

const api = createApiClient({
  baseUrl: 'https://api.example.com',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
});

// All requests now include the Authorization header
const pets = await api.listPets();
```

### API Key

```typescript
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  fetchOptions: {
    headers: {
      'X-API-Key': process.env.API_KEY,
    },
  },
});
```

### Dynamic Token Refresh

```typescript
let token = await getInitialToken();

function createClient() {
  return createApiClient({
    baseUrl: 'https://api.example.com',
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

let api = createClient();

// Refresh token and recreate client
async function refreshAuth() {
  token = await refreshToken();
  api = createClient();
}

// Use interceptor for automatic refresh
api._raw.use({
  onResponse({ response }) {
    if (response.status === 401) {
      // Token expired, refresh and retry
      return refreshAuth().then(() => {
        // Retry the request with new token
        return fetch(response.url, {
          ...response,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      });
    }
    return response;
  },
});
```

### OAuth 2.0

```typescript
import { createApiClient } from './api-client';

// Step 1: Get OAuth token
const oauth = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
  }),
});

const { access_token } = await oauth.json();

// Step 2: Create API client with token
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  },
});

// Step 3: Make authenticated requests
const pets = await api.listPets();
```

---

## Error Handling

### Validation Errors

```typescript
import { z } from 'zod';
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

try {
  const pet = await api.createPet({
    name: 123, // Invalid: should be string
    age: -5, // Invalid: should be positive
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation failed:');
    error.issues.forEach((issue) => {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    });
    // Output:
    //   name: Expected string, received number
    //   age: Number must be greater than 0
  }
}
```

### API Errors

```typescript
try {
  const pet = await api.getPet({ id: 'nonexistent' });
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('404')) {
      console.error('Pet not found');
    } else if (error.message.includes('500')) {
      console.error('Server error');
    } else {
      console.error('Unknown error:', error.message);
    }
  }
}
```

### Graceful Degradation

```typescript
// Use loose validation mode to continue on errors
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  validationMode: 'loose',
});

// This will log a warning but not throw
const pet = await api.getPet({ id: '123' });
// Warning: Validation failed for getPet response: ...
// Returns data anyway
```

### Custom Error Handling

```typescript
async function safeFetch<T>(
  fn: () => Promise<T>,
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

// Usage
const { data, error } = await safeFetch(() => api.getPet({ id: '123' }));

if (error) {
  console.error('Failed to fetch pet:', error.message);
} else {
  console.log('Pet:', data);
}
```

---

## File Operations

### File Upload

```typescript
// Using raw client for file uploads
const api = createApiClient({ baseUrl: 'https://api.example.com' });

const formData = new FormData();
formData.append('file', file); // file is a File object
formData.append('name', 'Profile picture');

const { data } = await api._raw.post('/uploads', {
  body: formData,
});

console.log('Uploaded file ID:', data.id);
```

### File Download

```typescript
// Download a file
const { data } = await api._raw.get('/files/{id}', {
  params: { path: { id: '123' } },
  parseAs: 'blob', // Get response as Blob
});

// Create download link
const url = URL.createObjectURL(data);
const a = document.createElement('a');
a.href = url;
a.download = 'file.pdf';
a.click();
URL.revokeObjectURL(url);
```

### Streaming Upload with Progress

```typescript
const file = document.querySelector('input[type="file"]').files[0];

const xhr = new XMLHttpRequest();

xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) {
    const percent = (e.loaded / e.total) * 100;
    console.log(`Upload progress: ${percent}%`);
  }
});

xhr.open('POST', 'https://api.example.com/uploads');
xhr.setRequestHeader('Authorization', `Bearer ${token}`);

const formData = new FormData();
formData.append('file', file);

xhr.send(formData);
```

---

## Query Parameters

### Simple Query Parameters

```typescript
// List pets with filters
const pets = await api.listPets({
  species: 'cat',
  minAge: 2,
  maxAge: 5,
});
```

### Array Query Parameters

```typescript
// Filter by multiple species
const pets = await api.listPets({
  species: ['cat', 'dog', 'bird'],
});
// GET /pets?species=cat&species=dog&species=bird
```

### Pagination

```typescript
async function fetchAllPets() {
  const allPets = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await api.listPets({ limit, offset });

    allPets.push(...page.items);

    if (page.items.length < limit) {
      break; // Last page
    }

    offset += limit;
  }

  return allPets;
}

const pets = await fetchAllPets();
console.log(`Fetched ${pets.length} pets total`);
```

### Search with Debounce

```typescript
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (query: string) => {
  const results = await api.searchPets({ query });
  displayResults(results);
}, 300);

// In your search input handler:
searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});
```

---

## Path Parameters

### Simple Path Parameters

```typescript
// Get specific pet
const pet = await api.getPet({ id: '123' });

// Update specific pet
await api.updatePet({
  id: '123',
  body: { name: 'Updated name' },
});
```

### Nested Path Parameters

```typescript
// Get a specific comment on a specific pet
const comment = await api.getPetComment({
  petId: '123',
  commentId: '456',
});
// GET /pets/123/comments/456

// Create a comment on a pet
await api.createPetComment({
  petId: '123',
  body: {
    text: 'What a cute pet!',
    author: 'user@example.com',
  },
});
// POST /pets/123/comments
```

---

## Request Bodies

### JSON Body

```typescript
const pet = await api.createPet({
  name: 'Fluffy',
  species: 'cat',
  age: 3,
  metadata: {
    color: 'orange',
    vaccinated: true,
  },
});
```

### Form Data

```typescript
const formData = new FormData();
formData.append('name', 'Fluffy');
formData.append('age', '3');
formData.append('photo', fileInput.files[0]);

const { data } = await api._raw.post('/pets', {
  body: formData,
});
```

### URL-Encoded

```typescript
const params = new URLSearchParams();
params.append('name', 'Fluffy');
params.append('age', '3');

const { data } = await api._raw.post('/pets', {
  body: params,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});
```

---

## Multiple Content Types

### Accept JSON or XML

```typescript
// Accept JSON (default)
const { data: json } = await api._raw.get('/pets/{id}', {
  params: { path: { id: '123' } },
  headers: {
    Accept: 'application/json',
  },
});

// Accept XML
const { data: xml } = await api._raw.get('/pets/{id}', {
  params: { path: { id: '123' } },
  headers: {
    Accept: 'application/xml',
  },
  parseAs: 'text',
});
```

---

## Retry Logic

### Simple Retry

```typescript
async function fetchWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw lastError;
}

// Usage
const pet = await fetchWithRetry(() => api.getPet({ id: '123' }));
```

### Retry with Middleware

```typescript
const api = createApiClient({ baseUrl: 'https://api.example.com' });

api._raw.use({
  async onResponse({ response, request }) {
    // Retry on 5xx errors
    if (response.status >= 500 && response.status < 600) {
      const retries = (request as any).__retries || 0;

      if (retries < 3) {
        console.log(`Retrying request (attempt ${retries + 1}/3)`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retries)));

        (request as any).__retries = retries + 1;
        return fetch(request);
      }
    }

    return response;
  },
});
```

---

## React Integration

### Basic Hook

```typescript
import { useState, useEffect } from 'react';
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

function usePet(id: string) {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getPet({ id })
      .then(setPet)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [id]);

  return { pet, loading, error };
}

// In component:
function PetProfile({ id }: { id: string }) {
  const { pet, loading, error } = usePet(id);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!pet) return <div>Pet not found</div>;

  return (
    <div>
      <h1>{pet.name}</h1>
      <p>Species: {pet.species}</p>
      <p>Age: {pet.age}</p>
    </div>
  );
}
```

### React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createApiClient } from './api-client';

const api = createApiClient({ baseUrl: 'https://api.example.com' });

// Fetch single pet
function usePet(id: string) {
  return useQuery({
    queryKey: ['pet', id],
    queryFn: () => api.getPet({ id }),
  });
}

// Fetch list of pets
function usePets(filters?: { species?: string }) {
  return useQuery({
    queryKey: ['pets', filters],
    queryFn: () => api.listPets(filters),
  });
}

// Create pet mutation
function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPet: { name: string; species: string; age: number }) =>
      api.createPet(newPet),
    onSuccess: () => {
      // Invalidate and refetch pets list
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
}

// In component:
function PetList() {
  const { data: pets, isLoading } = usePets();
  const createPet = useCreatePet();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Pets</h1>
      <ul>
        {pets.map(pet => (
          <li key={pet.id}>{pet.name}</li>
        ))}
      </ul>

      <button
        onClick={() => {
          createPet.mutate({
            name: 'New Pet',
            species: 'cat',
            age: 2,
          });
        }}
      >
        Add Pet
      </button>
    </div>
  );
}
```

---

## Testing

### Mock API Client

```typescript
import { vi } from 'vitest';
import type { ApiClient } from './api-client';

export function createMockApiClient(): ApiClient {
  return {
    getPet: vi.fn().mockResolvedValue({
      id: '123',
      name: 'Test Pet',
      species: 'cat',
      age: 3,
    }),
    listPets: vi.fn().mockResolvedValue([]),
    createPet: vi.fn().mockImplementation(async (pet) => ({
      id: 'new-id',
      ...pet,
    })),
    updatePet: vi.fn().mockResolvedValue(undefined),
    deletePet: vi.fn().mockResolvedValue(undefined),
    _raw: {} as any,
  } as unknown as ApiClient;
}

// In tests:
import { createMockApiClient } from './test-utils';

test('renders pet name', async () => {
  const mockApi = createMockApiClient();

  render(<PetProfile id="123" api={mockApi} />);

  await waitFor(() => {
    expect(screen.getByText('Test Pet')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { createApiClient } from './api-client';

const server = setupServer(
  http.get('https://api.example.com/pets/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Test Pet',
      species: 'cat',
      age: 3,
    });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('fetches pet from API', async () => {
  const api = createApiClient({ baseUrl: 'https://api.example.com' });

  const pet = await api.getPet({ id: '123' });

  expect(pet.name).toBe('Test Pet');
  expect(pet.species).toBe('cat');
});
```

---

**More examples?** Check out the [Usage Guide](./USAGE.md) and [API Reference](./API-REFERENCE.md).
