/**
 * Tests for Information Retrieval (IR) type guards and validators
 *
 * Following TDD: These tests are written FIRST (RED phase)
 * Implementation in ir-validators.ts will follow (GREEN phase)
 */

import { describe, expect, it } from 'vitest';
import type {
  IRComponent,
  CastrDocument,
  CastrOperation,
  CastrSchema,
  CastrSchemaNode,
} from './ir-schema.js';
import { CastrSchemaProperties } from './ir-schema.js';
import {
  isIRComponent,
  isCastrDocument,
  isCastrOperation,
  isCastrSchema,
  isCastrSchemaNode,
} from './ir-validators.js';

describe('isCastrDocument', () => {
  it('should return true for valid CastrDocument', () => {
    const validDoc: CastrDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [],
      components: [],
      operations: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
      schemaNames: [],
      enums: new Map(),
    };

    expect(isCastrDocument(validDoc)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isCastrDocument(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isCastrDocument(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrDocument('string')).toBe(false);
    expect(isCastrDocument(123)).toBe(false);
    expect(isCastrDocument(true)).toBe(false);
    expect(isCastrDocument([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isCastrDocument({})).toBe(false);
    expect(isCastrDocument({ version: '1.0.0' })).toBe(false);
    expect(
      isCastrDocument({
        version: '1.0.0',
        openApiVersion: '3.1.0',
      }),
    ).toBe(false);
  });

  it('should return false for object with wrong field types', () => {
    const invalidDoc = {
      version: 123, // Should be string
      openApiVersion: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      components: [],
      operations: [],
      dependencyGraph: {},
    };

    expect(isCastrDocument(invalidDoc)).toBe(false);
  });
});

describe('isIRComponent', () => {
  it('should return true for valid schema component', () => {
    const validComponent: IRComponent = {
      type: 'schema',
      name: 'User',
      schema: {
        type: 'object',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isIRComponent(validComponent)).toBe(true);
  });

  it('should return true for all component types', () => {
    const mockSchema: CastrSchema = {
      type: 'string',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    const schemaComponent: IRComponent = {
      type: 'schema',
      name: 'TestSchema',
      schema: mockSchema,
      metadata: mockSchema.metadata,
    };
    expect(isIRComponent(schemaComponent)).toBe(true);

    const parameterComponent: IRComponent = {
      type: 'parameter',
      name: 'TestParameter',
      parameter: {
        name: 'param',
        in: 'query',
        required: true,
        schema: mockSchema,
      },
    };
    expect(isIRComponent(parameterComponent)).toBe(true);

    const responseComponent: IRComponent = {
      type: 'response',
      name: 'TestResponse',
      response: {
        statusCode: '200',
        description: 'OK',
      },
    };
    expect(isIRComponent(responseComponent)).toBe(true);

    const requestBodyComponent: IRComponent = {
      type: 'requestBody',
      name: 'TestRequestBody',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: mockSchema,
          },
        },
      },
    };
    expect(isIRComponent(requestBodyComponent)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isIRComponent(null)).toBe(false);
    expect(isIRComponent(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isIRComponent('string')).toBe(false);
    expect(isIRComponent(123)).toBe(false);
    expect(isIRComponent([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isIRComponent({})).toBe(false);
    expect(isIRComponent({ type: 'schema' })).toBe(false);
    expect(isIRComponent({ type: 'schema', name: 'User' })).toBe(false);
  });

  it('should return false for invalid component type', () => {
    const invalidComponent = {
      type: 'invalid',
      name: 'User',
      schema: {},
      metadata: {},
    };

    expect(isIRComponent(invalidComponent)).toBe(false);
  });
});

describe('isCastrOperation', () => {
  it('should return true for valid GET operation', () => {
    const validOperation: CastrOperation = {
      operationId: 'getUser',
      method: 'get',
      path: '/users/{id}',
      parameters: [],
      parametersByLocation: {
        query: [],
        path: [],
        header: [],
        cookie: [],
      },
      responses: [],
    };

    expect(isCastrOperation(validOperation)).toBe(true);
  });

  it('should return true for operation with all fields', () => {
    const fullOperation: CastrOperation = {
      operationId: 'createUser',
      method: 'post',
      path: '/users',
      description: 'Create a new user',
      summary: 'Create user',
      parameters: [
        {
          name: 'userId',
          in: 'path',
          required: true,
          schema: {
            type: 'string',
            metadata: {
              required: true,
              nullable: false,
              zodChain: { presence: '', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
        },
      ],

      parametersByLocation: {
        query: [],
        path: [],
        header: [],
        cookie: [],
      },
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              metadata: {
                required: true,
                nullable: false,
                zodChain: { presence: '', validations: [], defaults: [] },
                dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                circularReferences: [],
              },
            },
          },
        },
      },
      responses: [
        {
          statusCode: '201',
          description: 'Created',
        },
      ],
      security: [
        {
          schemeName: 'bearerAuth',
          scopes: [],
        },
      ],
      tags: ['users'],
      deprecated: false,
    };

    expect(isCastrOperation(fullOperation)).toBe(true);
  });

  it('should return true for all HTTP methods', () => {
    const methods: ('get' | 'post' | 'put' | 'patch' | 'delete' | 'head' | 'options')[] = [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'head',
      'options',
    ];

    methods.forEach((method) => {
      const operation: CastrOperation = {
        operationId: `${method}User`,
        method,
        path: '/users',
        parameters: [],
        parametersByLocation: {
          query: [],
          path: [],
          header: [],
          cookie: [],
        },
        responses: [],
      };

      expect(isCastrOperation(operation)).toBe(true);
    });
  });

  it('should return false for null and undefined', () => {
    expect(isCastrOperation(null)).toBe(false);
    expect(isCastrOperation(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrOperation('string')).toBe(false);
    expect(isCastrOperation(123)).toBe(false);
    expect(isCastrOperation([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isCastrOperation({})).toBe(false);
    expect(isCastrOperation({ operationId: 'getUser' })).toBe(false);
    expect(isCastrOperation({ operationId: 'getUser', method: 'get' })).toBe(false);
  });

  it('should return false for invalid HTTP method', () => {
    const invalidOperation = {
      operationId: 'getUser',
      method: 'invalid',
      path: '/users',
      parameters: [],
      responses: [],
    };

    expect(isCastrOperation(invalidOperation)).toBe(false);
  });
});

describe('isCastrSchema', () => {
  it('should return true for primitive schema', () => {
    const schema: CastrSchema = {
      type: 'string',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for object schema', () => {
    const schema: CastrSchema = {
      type: 'object',
      properties: new CastrSchemaProperties({
        name: {
          type: 'string',
          metadata: {
            required: true,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      }),
      required: ['name'],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for array schema', () => {
    const schema: CastrSchema = {
      type: 'array',
      items: {
        type: 'string',
        metadata: {
          required: false,
          nullable: false,
          zodChain: { presence: '', validations: [], defaults: [] },
          dependencyGraph: { references: [], referencedBy: [], depth: 0 },
          circularReferences: [],
        },
      },
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for composition schema (allOf)', () => {
    const schema: CastrSchema = {
      allOf: [
        {
          type: 'object',
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      ],
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return true for reference schema', () => {
    const schema: CastrSchema = {
      $ref: '#/components/schemas/User',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: ['#/components/schemas/User'], referencedBy: [], depth: 1 },
        circularReferences: [],
      },
    };

    expect(isCastrSchema(schema)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isCastrSchema(null)).toBe(false);
    expect(isCastrSchema(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrSchema('string')).toBe(false);
    expect(isCastrSchema(123)).toBe(false);
    expect(isCastrSchema([])).toBe(false);
  });

  it('should return false for object missing metadata field', () => {
    const schemaWithoutMetadata = {
      type: 'string',
    };

    expect(isCastrSchema(schemaWithoutMetadata)).toBe(false);
  });
});

describe('isCastrSchemaNode', () => {
  it('should return true for valid schema node', () => {
    const node: CastrSchemaNode = {
      required: true,
      nullable: false,
      zodChain: {
        presence: '.optional()',
        validations: ['.min(1)'],
        defaults: [],
      },
      dependencyGraph: {
        references: [],
        referencedBy: [],
        depth: 0,
      },
      circularReferences: [],
    };

    expect(isCastrSchemaNode(node)).toBe(true);
  });

  it('should return true for schema node with all optional fields', () => {
    const node: CastrSchemaNode = {
      required: false,
      nullable: true,
      description: 'User ID',
      default: 'unknown',
      zodChain: {
        presence: '.optional().nullable()',
        validations: ['.uuid()'],
        defaults: ['.default("unknown")'],
      },
      dependencyGraph: {
        references: ['#/components/schemas/Address'],
        referencedBy: ['#/components/schemas/User'],
        depth: 1,
      },
      inheritance: {
        parent: '#/components/schemas/Base',
        compositionType: 'allOf',
        siblings: ['#/components/schemas/Base', '#/components/schemas/Mixin'],
      },
      circularReferences: ['#/components/schemas/Node'],
    };

    expect(isCastrSchemaNode(node)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isCastrSchemaNode(null)).toBe(false);
    expect(isCastrSchemaNode(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isCastrSchemaNode('string')).toBe(false);
    expect(isCastrSchemaNode(123)).toBe(false);
    expect(isCastrSchemaNode([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isCastrSchemaNode({})).toBe(false);
    expect(isCastrSchemaNode({ required: true })).toBe(false);
    expect(isCastrSchemaNode({ required: true, nullable: false })).toBe(false);
  });

  it('should return false for object with wrong field types', () => {
    const invalidNode = {
      required: 'yes', // Should be boolean
      nullable: false,
      zodChain: {},
      dependencyGraph: {},
      circularReferences: [],
    };

    expect(isCastrSchemaNode(invalidNode)).toBe(false);
  });
});
