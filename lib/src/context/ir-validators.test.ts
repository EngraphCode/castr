/**
 * Tests for Information Retrieval (IR) type guards and validators
 *
 * Following TDD: These tests are written FIRST (RED phase)
 * Implementation in ir-validators.ts will follow (GREEN phase)
 */

import { describe, expect, it } from 'vitest';
import type { IRComponent, IRDocument, IROperation, IRSchema, IRSchemaNode } from './ir-schema.js';
import { IRSchemaProperties } from './ir-schema.js';
import {
  isIRComponent,
  isIRDocument,
  isIROperation,
  isIRSchema,
  isIRSchemaNode,
} from './ir-validators.js';

describe('isIRDocument', () => {
  it('should return true for valid IRDocument', () => {
    const validDoc: IRDocument = {
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
      enums: new Map(),
    };

    expect(isIRDocument(validDoc)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isIRDocument(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isIRDocument(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isIRDocument('string')).toBe(false);
    expect(isIRDocument(123)).toBe(false);
    expect(isIRDocument(true)).toBe(false);
    expect(isIRDocument([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isIRDocument({})).toBe(false);
    expect(isIRDocument({ version: '1.0.0' })).toBe(false);
    expect(
      isIRDocument({
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

    expect(isIRDocument(invalidDoc)).toBe(false);
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
    const mockSchema: IRSchema = {
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

describe('isIROperation', () => {
  it('should return true for valid GET operation', () => {
    const validOperation: IROperation = {
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

    expect(isIROperation(validOperation)).toBe(true);
  });

  it('should return true for operation with all fields', () => {
    const fullOperation: IROperation = {
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

    expect(isIROperation(fullOperation)).toBe(true);
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
      const operation: IROperation = {
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

      expect(isIROperation(operation)).toBe(true);
    });
  });

  it('should return false for null and undefined', () => {
    expect(isIROperation(null)).toBe(false);
    expect(isIROperation(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isIROperation('string')).toBe(false);
    expect(isIROperation(123)).toBe(false);
    expect(isIROperation([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isIROperation({})).toBe(false);
    expect(isIROperation({ operationId: 'getUser' })).toBe(false);
    expect(isIROperation({ operationId: 'getUser', method: 'get' })).toBe(false);
  });

  it('should return false for invalid HTTP method', () => {
    const invalidOperation = {
      operationId: 'getUser',
      method: 'invalid',
      path: '/users',
      parameters: [],
      responses: [],
    };

    expect(isIROperation(invalidOperation)).toBe(false);
  });
});

describe('isIRSchema', () => {
  it('should return true for primitive schema', () => {
    const schema: IRSchema = {
      type: 'string',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
        circularReferences: [],
      },
    };

    expect(isIRSchema(schema)).toBe(true);
  });

  it('should return true for object schema', () => {
    const schema: IRSchema = {
      type: 'object',
      properties: new IRSchemaProperties({
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

    expect(isIRSchema(schema)).toBe(true);
  });

  it('should return true for array schema', () => {
    const schema: IRSchema = {
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

    expect(isIRSchema(schema)).toBe(true);
  });

  it('should return true for composition schema (allOf)', () => {
    const schema: IRSchema = {
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

    expect(isIRSchema(schema)).toBe(true);
  });

  it('should return true for reference schema', () => {
    const schema: IRSchema = {
      $ref: '#/components/schemas/User',
      metadata: {
        required: false,
        nullable: false,
        zodChain: { presence: '', validations: [], defaults: [] },
        dependencyGraph: { references: ['#/components/schemas/User'], referencedBy: [], depth: 1 },
        circularReferences: [],
      },
    };

    expect(isIRSchema(schema)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isIRSchema(null)).toBe(false);
    expect(isIRSchema(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isIRSchema('string')).toBe(false);
    expect(isIRSchema(123)).toBe(false);
    expect(isIRSchema([])).toBe(false);
  });

  it('should return false for object missing metadata field', () => {
    const schemaWithoutMetadata = {
      type: 'string',
    };

    expect(isIRSchema(schemaWithoutMetadata)).toBe(false);
  });
});

describe('isIRSchemaNode', () => {
  it('should return true for valid schema node', () => {
    const node: IRSchemaNode = {
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

    expect(isIRSchemaNode(node)).toBe(true);
  });

  it('should return true for schema node with all optional fields', () => {
    const node: IRSchemaNode = {
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

    expect(isIRSchemaNode(node)).toBe(true);
  });

  it('should return false for null and undefined', () => {
    expect(isIRSchemaNode(null)).toBe(false);
    expect(isIRSchemaNode(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isIRSchemaNode('string')).toBe(false);
    expect(isIRSchemaNode(123)).toBe(false);
    expect(isIRSchemaNode([])).toBe(false);
  });

  it('should return false for object missing required fields', () => {
    expect(isIRSchemaNode({})).toBe(false);
    expect(isIRSchemaNode({ required: true })).toBe(false);
    expect(isIRSchemaNode({ required: true, nullable: false })).toBe(false);
  });

  it('should return false for object with wrong field types', () => {
    const invalidNode = {
      required: 'yes', // Should be boolean
      nullable: false,
      zodChain: {},
      dependencyGraph: {},
      circularReferences: [],
    };

    expect(isIRSchemaNode(invalidNode)).toBe(false);
  });
});
