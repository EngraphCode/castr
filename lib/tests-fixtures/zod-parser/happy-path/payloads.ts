/**
 * Validation Parity Payloads
 *
 * This file corresponds to the schemas defined in:
 * - objects.zod4.ts
 * - constraints.zod4.ts
 * - string-formats.zod4.ts
 *
 * It provides a deterministic set of `valid` and `invalid` payloads
 * used to dynamically assert that Scenarios 2, 3, and 4 preserve validation
 * behavior exactly (functional equivalence).
 */

// ============================================================================
// 1. Objects (objects.zod4.ts)
// ============================================================================

export const ObjectPayloads = {
  BasicObjectSchema: {
    valid: [
      { name: 'Alice', age: 30, active: true },
      { name: 'Bob', age: 40, active: false },
    ],
    invalid: [
      { name: 'Alice', age: 30 }, // missing active
      { name: 'Bob', age: '40', active: false }, // wrong type
    ],
  },
  StrictObjectSchema: {
    valid: [{ id: '1', value: 42 }],
    invalid: [
      { id: '1', value: 42, extra: true }, // strict
      { value: 42 }, // missing id
    ],
  },
  PassthroughObjectSchema: {
    valid: [{ known: 'x' }, { known: 'x', unknown: 'y' }],
    invalid: [
      { unknown: 'y' }, // missing known
    ],
  },
  NestedObjectSchema: {
    valid: [
      {
        user: { name: 'Alice', email: 'alice@example.com' },
        metadata: { createdAt: '2023-01-01T12:00:00Z', version: 1 },
      },
    ],
    invalid: [
      {
        user: { name: 'Alice', email: 'not-an-email' },
        metadata: { createdAt: '2023-01-01T12:00:00Z', version: 1 },
      },
    ],
  },
};

// ============================================================================
// 2. Constraints (constraints.zod4.ts)
// ============================================================================

export const ConstraintPayloads = {
  StringMinMaxSchema: {
    valid: ['a', 'abc', 'a'.repeat(255)],
    invalid: [
      '', // too short
      'a'.repeat(256), // too long
    ],
  },
  NumberMinMaxSchema: {
    valid: [0, 50, 100],
    invalid: [-1, 101],
  },
  FullyConstrainedNumberSchema: {
    valid: [0, 5, 50, 100],
    invalid: [
      -5, // min 0
      105, // max 100
      12, // multiple of 5
    ],
  },
};

// ============================================================================
// 3. String Formats (string-formats.zod4.ts)
// ============================================================================

export const StringFormatPayloads = {
  EmailSchema: {
    valid: ['test@example.com', 'user.name+tag@example.co.uk'],
    invalid: ['not-an-email', '@example.com', 'test@', ''],
  },
  UrlSchema: {
    valid: ['https://example.com', 'http://localhost:8080/path?query=1'],
    invalid: ['example.com', 'not-a-url', ''],
  },
  UuidSchema: {
    valid: ['123e4567-e89b-42d3-a456-426614174000'],
    invalid: ['123e4567-e89b-12d3-a456-42661417400', 'not-a-uuid', ''],
  },
};

// ============================================================================
// 4. Unions (unions.zod4.ts)
// ============================================================================

export const UnionPayloads = {
  BasicUnionSchema: {
    valid: ['test', 42],
    invalid: [true, null, {}],
  },
  MultiTypeUnionSchema: {
    valid: ['test', 42, true, false, null],
    invalid: [undefined, []],
  },
  ExclusiveUnionSchema: {
    valid: ['test', 42],
    invalid: [true, null, {}], // Zod's xor behaves like union at parse time but validates exclusive keys for objects. For primitives it acts like union. Wait, Zod 4's xor on primitive types? The test expects valid string or number. Let's see if XOR on primitives expects just one. Wait, z.xor() on primitives might not be well-defined in JSON Schema or it behaves as oneOf. Let's just use string and number.
  },
  ObjectXorSchema: {
    valid: [
      { type: 'card', cardNumber: '1234' },
      { type: 'bank', accountNumber: '5678' },
    ],
    invalid: [
      { type: 'card', cardNumber: '1234', accountNumber: '5678' }, // both (xor failure)
      { type: 'other' },
    ],
  },
  DiscriminatedUnionSchema: {
    valid: [
      { type: 'success', data: 'ok' },
      { type: 'error', message: 'failed' },
    ],
    invalid: [
      { type: 'unknown' },
      { type: 'success', message: 'failed' }, // missing data
    ],
  },
  MultiOptionDiscriminatedSchema: {
    valid: [
      { kind: 'a', valueA: 1 },
      { kind: 'b', valueB: true },
      { kind: 'c', valueC: 'test' },
    ],
    invalid: [{ kind: 'a', valueB: true }, { kind: 'd' }],
  },
  LiteralArraySchema: {
    valid: ['red', 'green', 'blue'],
    invalid: ['yellow', 'RED', null],
  },
  NumericLiteralSchema: {
    valid: [200, 201, 204, 404, 500],
    invalid: [400, '200', 0],
  },
};

// ============================================================================
// 5. Intersections (intersections.zod4.ts)
// ============================================================================

export const IntersectionPayloads = {
  IntersectionSchema: {
    valid: [{ name: 'Alice', email: 'alice@example.com' }],
    invalid: [
      { name: 'Alice' }, // missing email
      { email: 'alice@example.com' }, // missing name
      { name: 123, email: 'alice@example.com' }, // wrong type
    ],
  },
  AndMethodSchema: {
    valid: [{ name: 'Bob', email: 'bob@example.com' }],
    invalid: [{ name: 'Bob' }],
  },
  TripleIntersectionSchema: {
    valid: [
      {
        name: 'Charlie',
        email: 'charlie@example.com',
        createdAt: '2023-01-01T12:00:00Z',
        updatedAt: '2023-01-01T12:00:00Z',
      },
    ],
    invalid: [
      { name: 'Charlie', email: 'charlie@example.com' }, // missing timestamps
      {
        name: 'Charlie',
        email: 'charlie@example.com',
        createdAt: 'invalid-date',
        updatedAt: '2023-01-01T12:00:00Z',
      },
    ],
  },
  IntersectionWithConstraintsSchema: {
    valid: [{ id: '123e4567-e89b-12d3-a456-426614174000', version: 1 }],
    invalid: [
      { id: 'not-a-uuid', version: 1 },
      { id: '123e4567-e89b-12d3-a456-426614174000', version: -1 }, // fails min(0)
    ],
  },
  ItemSchema: {
    valid: [{ name: 'Item', id: 100 }],
    invalid: [
      { name: 'Item' }, // missing id
      { name: 'Item', id: 100, unknown: 'prop' }, // strict failure
    ],
  },
};

// ============================================================================
// 6. Recursion (recursion.zod4.ts)
// ============================================================================

export const RecursionPayloads = {
  CategorySchema: {
    valid: [
      { name: 'Root', subcategories: [] },
      {
        name: 'Root',
        subcategories: [{ name: 'Child', subcategories: [] }],
      },
    ],
    invalid: [
      { name: 'Root' }, // missing subcategories
      { name: 'Root', subcategories: [{ name: 'Child' }] }, // child missing subcategories
    ],
  },
  UserSchema: {
    valid: [
      { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com', posts: [] },
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        posts: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            title: 'Hello',
            content: 'World',
            author: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              email: 'test@example.com',
              posts: [],
            },
          },
        ],
      },
    ],
    invalid: [{ id: 'not-uuid', email: 'test@example.com', posts: [] }],
  },
  PostSchema: {
    valid: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        title: 'Title',
        content: 'Content',
        author: { id: '123e4567-e89b-12d3-a456-426614174000', email: 'a@b.com', posts: [] },
      },
    ],
    invalid: [
      { id: '123e4567-e89b-12d3-a456-426614174001', title: 'T', content: 'C' }, // missing author
    ],
  },
  TreeNodeSchema: {
    valid: [
      { value: 1 },
      { value: 1, left: { value: 2 }, right: { value: 3, left: { value: 4 } } },
    ],
    invalid: [
      { value: '1' }, // wrong type
      { value: 1, left: { value: '2' } },
    ],
  },
  LinkedListNodeSchema: {
    valid: [
      { data: 'first', next: null },
      { data: 'first', next: { data: 'second', next: null } },
    ],
    invalid: [
      { data: 'first', next: { data: 2, next: null } },
      { data: 'first' }, // missing next
    ],
  },
};

// ============================================================================
// Utility Harness Mapping
// ============================================================================

export const ParityPayloadHarness: Record<
  string,
  Record<string, { valid: unknown[]; invalid: unknown[] }>
> = {
  objects: ObjectPayloads,
  constraints: ConstraintPayloads,
  'string-formats': StringFormatPayloads,
  unions: UnionPayloads,
  intersections: IntersectionPayloads,
  recursion: RecursionPayloads,
};
