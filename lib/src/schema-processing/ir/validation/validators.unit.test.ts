/**
 * Tests for isCastrDocument, isIRComponent, and isCastrOperation validators.
 *
 * Schema-level tests (isCastrSchema, isCastrSchemaNode) are in
 * validators.schema.unit.test.ts.
 */

import { describe, expect, it } from 'vitest';
import { createMockCastrSchema, createMockRawOpenApiComponents } from '../test-helpers.js';
import {
  isIRComponent,
  isCastrAdditionalOperation,
  isCastrDocument,
  isCastrOperation,
} from './validators.js';
import type { CastrDocument } from '../models/schema-document.js';
import type { IRComponent } from '../models/schema.components.js';
import type { CastrAdditionalOperation, CastrOperation } from '../models/schema.operations.js';

describe('isCastrDocument', () => {
  const mockSchema = createMockCastrSchema({ type: 'string' });

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
      additionalOperations: [],
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
      additionalOperations: [],
      dependencyGraph: {},
    };

    expect(isCastrDocument(invalidDoc)).toBe(false);
  });

  it('should return false when a schema component carries contradictory integer semantics', () => {
    const invalidDoc = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'schema',
          name: 'Signed64ButInt32',
          schema: {
            type: 'integer',
            format: 'int32',
            integerSemantics: 'int64',
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
        },
      ],
      operations: [],
      additionalOperations: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
      schemaNames: [],
      enums: new Map(),
    };

    expect(isCastrDocument(invalidDoc)).toBe(false);
  });

  it('should return true for valid documents containing preserved raw OpenAPI components', () => {
    const validDoc: CastrDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [],
      components: createMockRawOpenApiComponents(),
      operations: [],
      additionalOperations: [],
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

  it('should return true for valid documents containing additionalOperations', () => {
    const validDoc = {
      version: '1.0.0',
      openApiVersion: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [],
      operations: [],
      additionalOperations: [
        {
          operationId: 'purgeUsers',
          method: 'PURGE',
          path: '/users',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [],
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

    expect(isCastrDocument(validDoc)).toBe(true);
  });

  it('should return true for valid documents containing mediaType components', () => {
    const validDoc = {
      version: '1.0.0',
      openApiVersion: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'mediaType',
          name: 'NdjsonStream',
          mediaType: {
            schema: mockSchema,
            itemSchema: mockSchema,
            examples: {
              sample: { value: 'ok' },
            },
            encoding: {
              payload: { contentType: 'application/json' },
            },
          },
        },
      ],
      operations: [],
      additionalOperations: [],
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

  it('should return true for valid documents containing x-ext mediaType refs', () => {
    const validDoc = {
      version: '1.0.0',
      openApiVersion: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'mediaType',
          name: 'ExternalStream',
          mediaType: {
            $ref: '#/x-ext/abc123/components/mediaTypes/ExternalStream',
          },
        },
      ],
      operations: [],
      additionalOperations: [],
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

  it('should return false for documents containing non-media-type refs inside mediaType entries', () => {
    const invalidDoc = {
      version: '1.0.0',
      openApiVersion: '3.2.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'mediaType',
          name: 'BrokenStream',
          mediaType: {
            $ref: '#/components/schemas/User',
          },
        },
      ],
      operations: [],
      additionalOperations: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
      schemaNames: [],
      enums: new Map(),
    };

    expect(isCastrDocument(invalidDoc)).toBe(false);
  });
});

describe('isIRComponent', () => {
  const mockSchema = createMockCastrSchema({ type: 'string' });

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

    const parameterWithContentComponent: IRComponent = {
      type: 'parameter',
      name: 'StreamFilter',
      parameter: {
        name: 'stream-filter',
        in: 'query',
        required: false,
        schema: mockSchema,
        content: {
          'application/x-ndjson': {
            itemSchema: mockSchema,
          },
        },
      },
    };
    expect(isIRComponent(parameterWithContentComponent)).toBe(true);

    const mediaTypeComponent: IRComponent = {
      type: 'mediaType',
      name: 'StreamJson',
      mediaType: {
        schema: mockSchema,
        itemSchema: mockSchema,
        examples: {
          sample: { value: 'ok' },
        },
        encoding: {
          payload: { contentType: 'application/json' },
        },
      },
    };
    expect(isIRComponent(mediaTypeComponent)).toBe(true);

    const responseWithRichHeadersComponent: IRComponent = {
      type: 'response',
      name: 'StreamingResponse',
      response: {
        statusCode: '200',
        headers: {
          'X-Stream': {
            schema: mockSchema,
            content: {
              'application/x-ndjson': {
                itemSchema: mockSchema,
                examples: {
                  sample: { value: 'ok' },
                },
              },
            },
            description: 'Streaming header',
            required: true,
            deprecated: false,
            examples: {
              sample: { value: 'ok' },
            },
          },
        },
      },
    };
    expect(isIRComponent(responseWithRichHeadersComponent)).toBe(true);
  });

  it.each(createMockRawOpenApiComponents())(
    'should return true for preserved raw OpenAPI component $type',
    (component) => {
      expect(isIRComponent(component)).toBe(true);
    },
  );

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

  it('should return false for inherited object keys masquerading as component types', () => {
    const invalidComponent = {
      type: 'toString',
      name: 'User',
    };

    expect(isIRComponent(invalidComponent)).toBe(false);
  });

  it('should return false for schema components with invalid schemas', () => {
    const invalidComponent = {
      type: 'schema',
      name: 'Signed64ButInt32',
      schema: {
        type: 'integer',
        format: 'int32',
        integerSemantics: 'int64',
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

    expect(isIRComponent(invalidComponent)).toBe(false);
  });

  it('should return false for parameter components with invalid schemas', () => {
    const invalidComponent = {
      type: 'parameter',
      name: 'Signed64ButInt32Param',
      parameter: {
        name: 'count',
        in: 'query',
        required: false,
        schema: {
          type: 'integer',
          format: 'int32',
          integerSemantics: 'int64',
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: '', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      },
    };

    expect(isIRComponent(invalidComponent)).toBe(false);
  });

  it('should return false for mediaType components with invalid rich fields', () => {
    const invalidComponent = {
      type: 'mediaType',
      name: 'BrokenMediaType',
      mediaType: {
        schema: mockSchema,
        examples: 'invalid',
      },
    };

    expect(isIRComponent(invalidComponent)).toBe(false);
  });

  it('should return false for response components with invalid header examples', () => {
    const invalidComponent = {
      type: 'response',
      name: 'BrokenResponse',
      response: {
        statusCode: '200',
        headers: {
          'X-Stream': {
            schema: mockSchema,
            examples: 'invalid',
          },
        },
      },
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

  it('should return false when a request body carries contradictory integer semantics', () => {
    const invalidOperation = {
      operationId: 'createThing',
      method: 'post',
      path: '/things',
      parameters: [],
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
              type: 'integer',
              format: 'int32',
              integerSemantics: 'int64',
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
      responses: [],
    };

    expect(isCastrOperation(invalidOperation)).toBe(false);
  });
  it('should return true for trace HTTP method', () => {
    const traceOperation: CastrOperation = {
      operationId: 'traceRequest',
      method: 'trace',
      path: '/debug',
      parameters: [],
      parametersByLocation: {
        query: [],
        path: [],
        header: [],
        cookie: [],
      },
      responses: [],
    };

    expect(isCastrOperation(traceOperation)).toBe(true);
  });

  it('should return true for query HTTP method', () => {
    const queryOperation: CastrOperation = {
      operationId: 'querySearch',
      method: 'query',
      path: '/search',
      parameters: [],
      parametersByLocation: {
        query: [],
        path: [],
        header: [],
        cookie: [],
      },
      responses: [],
    };

    expect(isCastrOperation(queryOperation)).toBe(true);
  });

  it('should return true for all standard HTTP methods including trace and query', () => {
    const methods: (
      | 'get'
      | 'post'
      | 'put'
      | 'patch'
      | 'delete'
      | 'head'
      | 'options'
      | 'trace'
      | 'query'
    )[] = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace', 'query'];

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
});

describe('isCastrAdditionalOperation', () => {
  it('should return true for valid additional operations with custom methods', () => {
    const operation: CastrAdditionalOperation = {
      operationId: 'purgeUsers',
      method: 'PURGE',
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

    expect(isCastrAdditionalOperation(operation)).toBe(true);
  });

  it('should return false for fixed-field HTTP methods inside additional operations', () => {
    expect(
      isCastrAdditionalOperation({
        operationId: 'invalidPost',
        method: 'post',
        path: '/users',
        parameters: [],
        parametersByLocation: {
          query: [],
          path: [],
          header: [],
          cookie: [],
        },
        responses: [],
      }),
    ).toBe(false);
  });

  it('should return false for invalid custom method tokens', () => {
    expect(
      isCastrAdditionalOperation({
        operationId: 'invalidWhitespaceMethod',
        method: 'PUR GE',
        path: '/users',
        parameters: [],
        parametersByLocation: {
          query: [],
          path: [],
          header: [],
          cookie: [],
        },
        responses: [],
      }),
    ).toBe(false);
  });
});
