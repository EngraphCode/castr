import { describe, expect, it } from 'vitest';
import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
  SchemaConstraints,
} from './definition.types.js';
import type { CastrSchema } from '../ir/schema.js';

import type { SchemaObjectType } from 'openapi3-ts/oas31';

// Helper to create valid mock CastrSchema
function mockSchema(type: SchemaObjectType, optional = false): CastrSchema {
  return {
    type,
    metadata: {
      required: !optional,
      nullable: false,
      zodChain: { presence: optional ? '.optional()' : '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };
}

describe('EndpointDefinition Types', () => {
  describe('EndpointParameter', () => {
    it('should define parameter structure with schema', () => {
      const param: EndpointParameter = {
        name: 'id',
        type: 'Path',
        schema: mockSchema('string'),
      };

      expect(param.name).toBe('id');
      expect(param.type).toBe('Path');
      expect(param.schema).toEqual(mockSchema('string'));
    });

    it('should allow optional description', () => {
      const param: EndpointParameter = {
        name: 'search',
        type: 'Query',
        schema: mockSchema('string', true),
        description: 'Search query',
      };

      expect(param.description).toBe('Search query');
    });

    it('should allow creating a valid EndpointParameter', () => {
      const param: EndpointParameter = {
        name: 'userId',
        type: 'Path',
        schema: mockSchema('string'),
      };
      expect(param).toBeDefined();
    });

    it('should allow creating a valid EndpointParameter with optional schema', () => {
      const param: EndpointParameter = {
        name: 'userId',
        type: 'Path',
        schema: mockSchema('string', true),
      };
      expect(param).toBeDefined();
    });

    it('should allow creating a valid EndpointParameter with description', () => {
      const param: EndpointParameter = {
        name: 'userId',
        type: 'Path',
        schema: mockSchema('string'),
        description: 'The user ID',
      };
      expect(param).toBeDefined();
    });

    it('should support all parameter types', () => {
      const pathParam: EndpointParameter = {
        name: 'id',
        type: 'Path',
        schema: mockSchema('string'),
      };
      const queryParam: EndpointParameter = {
        name: 'q',
        type: 'Query',
        schema: mockSchema('string'),
      };
      const headerParam: EndpointParameter = {
        name: 'Authorization',
        type: 'Header',
        schema: mockSchema('string'),
      };
      const bodyParam: EndpointParameter = {
        name: 'body',
        type: 'Body',
        schema: mockSchema('object'),
      };

      expect(pathParam.type).toBe('Path');
      expect(queryParam.type).toBe('Query');
      expect(headerParam.type).toBe('Header');
      expect(bodyParam.type).toBe('Body');
    });
  });

  describe('EndpointError', () => {
    it('should define error structure with numeric status', () => {
      const error: EndpointError = {
        status: 404,
        schema: mockSchema('object'),
      };

      expect(error.status).toBe(404);
      expect(error.schema).toEqual(mockSchema('object'));
    });

    it('should support default status', () => {
      const error: EndpointError = {
        status: 'default',
        schema: mockSchema('object'),
        description: 'Default error response',
      };

      expect(error.status).toBe('default');
      expect(error.description).toBe('Default error response');
    });

    it('should allow creating a valid EndpointError', () => {
      const error: EndpointError = {
        status: 404,
        schema: mockSchema('object'),
      };
      expect(error).toBeDefined();
    });

    it('should allow creating a valid EndpointError with description', () => {
      const error: EndpointError = {
        status: 404,
        schema: mockSchema('object'),
        description: 'Not Found',
      };
      expect(error).toBeDefined();
    });
  });

  describe('EndpointResponse', () => {
    it('should define response structure', () => {
      const response: EndpointResponse = {
        statusCode: '200',
        schema: mockSchema('object'),
      };

      expect(response.statusCode).toBe('200');
      expect(response.schema).toEqual(mockSchema('object'));
    });

    it('should allow optional description', () => {
      const response: EndpointResponse = {
        statusCode: '201',
        schema: mockSchema('object'),
        description: 'User created successfully',
      };

      expect(response.description).toBe('User created successfully');
    });

    it('should allow creating a valid EndpointResponse', () => {
      const response: EndpointResponse = {
        statusCode: '200',
        schema: mockSchema('object'),
        description: 'OK',
      };
      expect(response).toBeDefined();
    });
  });

  describe('EndpointDefinition', () => {
    it('should define minimal endpoint structure', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        requestFormat: 'json',
        parameters: [],
        errors: [],
        response: mockSchema('object'),
      };

      expect(endpoint.method).toBe('get');
      expect(endpoint.path).toBe('/users/:id');
      expect(endpoint.response).toEqual(mockSchema('object'));
    });

    it('should support all HTTP methods', () => {
      const methods: EndpointDefinition['method'][] = [
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'head',
        'options',
      ];

      methods.forEach((method) => {
        const endpoint: EndpointDefinition = {
          method,
          path: '/test',
          requestFormat: 'json',
          parameters: [],
          errors: [],
          response: mockSchema('object'),
        };
        expect(endpoint.method).toBe(method);
      });
    });

    it('should support optional alias (operationId)', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        alias: 'getUser',
        requestFormat: 'json',
        parameters: [],
        errors: [],
        response: mockSchema('object'),
      };

      expect(endpoint.alias).toBe('getUser');
    });

    it('should support optional description', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        description: 'Get user by ID',
        requestFormat: 'json',
        parameters: [],
        errors: [],
        response: mockSchema('object'),
      };

      expect(endpoint.description).toBe('Get user by ID');
    });

    it('should support all request formats', () => {
      const formats: EndpointDefinition['requestFormat'][] = [
        'json',
        'form-data',
        'form-url',
        'binary',
        'text',
      ];

      formats.forEach((requestFormat) => {
        const endpoint: EndpointDefinition = {
          method: 'post',
          path: '/upload',
          requestFormat,
          parameters: [],
          errors: [],
          response: mockSchema('object'),
        };
        expect(endpoint.requestFormat).toBe(requestFormat);
      });
    });

    it('should support parameters array', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        requestFormat: 'json',
        parameters: [
          { name: 'id', type: 'Path', schema: mockSchema('string') },
          { name: 'include', type: 'Query', schema: mockSchema('string', true) },
        ],
        errors: [],
        response: mockSchema('object'),
      };

      expect(endpoint.parameters).toHaveLength(2);
      expect(endpoint.parameters[0]?.name).toBe('id');
      expect(endpoint.parameters[1]?.name).toBe('include');
    });

    it('should support errors array', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        requestFormat: 'json',
        parameters: [],
        errors: [
          { status: 404, schema: mockSchema('object') },
          { status: 500, schema: mockSchema('object') },
        ],
        response: mockSchema('object'),
      };

      expect(endpoint.errors).toHaveLength(2);
      expect(endpoint.errors[0]?.status).toBe(404);
      expect(endpoint.errors[1]?.status).toBe(500);
    });

    it('should support optional responses array (for --with-all-responses)', () => {
      const endpoint: EndpointDefinition = {
        method: 'get',
        path: '/users/:id',
        requestFormat: 'json',
        parameters: [],
        errors: [],
        response: mockSchema('object'),
        responses: [
          { statusCode: '200', schema: mockSchema('object'), description: 'Success' },
          { statusCode: '404', schema: mockSchema('object'), description: 'Not found' },
        ],
      };

      expect(endpoint.responses).toHaveLength(2);
      expect(endpoint.responses?.[0]?.statusCode).toBe('200');
      expect(endpoint.responses?.[1]?.statusCode).toBe('404');
    });

    it('should create complete realistic endpoint definition', () => {
      const endpoint: EndpointDefinition = {
        method: 'post',
        path: '/users',
        alias: 'createUser',
        description: 'Create a new user',
        requestFormat: 'json',
        parameters: [
          {
            name: 'body',
            type: 'Body',
            schema: mockSchema('object'),
            description: 'User data',
          },
        ],
        errors: [
          { status: 400, schema: mockSchema('object'), description: 'Invalid input' },
          { status: 409, schema: mockSchema('object'), description: 'User already exists' },
        ],
        response: mockSchema('object'),
      };

      // Verify all fields
      expect(endpoint.method).toBe('post');
      expect(endpoint.path).toBe('/users');
      expect(endpoint.alias).toBe('createUser');
      expect(endpoint.description).toBe('Create a new user');
      expect(endpoint.requestFormat).toBe('json');
      expect(endpoint.parameters).toHaveLength(1);
      expect(endpoint.errors).toHaveLength(2);
      expect(endpoint.response).toEqual(mockSchema('object'));
    });
  });

  describe('Type compatibility', () => {
    it('should be compatible with template context usage', () => {
      // Simulates how it's used in template-context.ts
      const endpoints: EndpointDefinition[] = [
        {
          method: 'get',
          path: '/users',
          requestFormat: 'json',
          parameters: [],
          errors: [],
          response: mockSchema('array'),
        },
        {
          method: 'get',
          path: '/users/:id',
          requestFormat: 'json',
          parameters: [{ name: 'id', type: 'Path', schema: mockSchema('string') }],
          errors: [{ status: 404, schema: mockSchema('object') }],
          response: mockSchema('object'),
        },
      ];

      expect(endpoints).toHaveLength(2);
      expect(endpoints[0]?.method).toBe('get');
      expect(endpoints[1]?.parameters).toHaveLength(1);
    });
  });

  describe('Enhanced parameter metadata (Session 6)', () => {
    it('should support new optional metadata fields on EndpointParameter', () => {
      // Verify backward compatibility - all new fields are optional
      const paramWithMetadata: EndpointParameter = {
        name: 'age',
        type: 'Query',
        schema: mockSchema('number'),
        description: 'User age',
        deprecated: true,
        example: 25,
        default: 18,
        constraints: {
          minimum: 0,
          maximum: 120,
        },
      };

      expect(paramWithMetadata.name).toBe('age');
      expect(paramWithMetadata.description).toBe('User age');
      expect(paramWithMetadata.deprecated).toBe(true);
      expect(paramWithMetadata.example).toBe(25);
      expect(paramWithMetadata.default).toBe(18);
      expect(paramWithMetadata.constraints?.minimum).toBe(0);
      expect(paramWithMetadata.constraints?.maximum).toBe(120);
    });

    it('should support SchemaConstraints type', () => {
      const constraints: SchemaConstraints = {
        minimum: 0,
        maximum: 100,
        exclusiveMinimum: 0,
        exclusiveMaximum: 100,
        minLength: 3,
        maxLength: 50,
        pattern: '^[a-z]+$',
        enum: ['draft', 'published'],
        format: 'email',
        minItems: 1,
        maxItems: 10,
        uniqueItems: true,
      };

      expect(constraints.minimum).toBe(0);
      expect(constraints.maximum).toBe(100);
      expect(constraints.minLength).toBe(3);
      expect(constraints.maxLength).toBe(50);
      expect(constraints.pattern).toBe('^[a-z]+$');
      expect(constraints.enum).toEqual(['draft', 'published']);
      expect(constraints.format).toBe('email');
    });

    it('should support examples object', () => {
      const param: EndpointParameter = {
        name: 'format',
        type: 'Query',
        schema: mockSchema('string'),
        examples: {
          json: {
            value: 'json',
            summary: 'JSON format',
          },
          xml: {
            value: 'xml',
            summary: 'XML format',
            description: 'Legacy XML format',
          },
        },
      };

      const jsonExample = param.examples?.['json'];
      const xmlExample = param.examples?.['xml'];

      // Type guard for testing - in bundled specs examples should be resolved
      expect(jsonExample).toBeDefined();
      expect(xmlExample).toBeDefined();
      if (jsonExample && !('$ref' in jsonExample)) {
        expect(jsonExample.value).toBe('json');
        expect(jsonExample.summary).toBe('JSON format');
      }
      if (xmlExample && !('$ref' in xmlExample)) {
        expect(xmlExample.description).toBe('Legacy XML format');
      }
    });
  });
});
