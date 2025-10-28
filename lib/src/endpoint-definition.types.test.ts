import { describe, expect, it } from 'vitest';
import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
} from './endpoint-definition.types.js';

describe('EndpointDefinition Types', () => {
  describe('EndpointParameter', () => {
    it('should define parameter structure with schema as string', () => {
      const param: EndpointParameter = {
        name: 'id',
        type: 'Path',
        schema: 'z.string()',
      };

      expect(param.name).toBe('id');
      expect(param.type).toBe('Path');
      expect(param.schema).toBe('z.string()');
    });

    it('should allow optional description', () => {
      const param: EndpointParameter = {
        name: 'search',
        type: 'Query',
        schema: 'z.string().optional()',
        description: 'Search query',
      };

      expect(param.description).toBe('Search query');
    });

    it('should support all parameter types', () => {
      const pathParam: EndpointParameter = { name: 'id', type: 'Path', schema: 'z.string()' };
      const queryParam: EndpointParameter = { name: 'q', type: 'Query', schema: 'z.string()' };
      const headerParam: EndpointParameter = {
        name: 'Authorization',
        type: 'Header',
        schema: 'z.string()',
      };
      const bodyParam: EndpointParameter = {
        name: 'body',
        type: 'Body',
        schema: 'UserSchema',
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
        schema: 'z.object({ error: z.string() })',
      };

      expect(error.status).toBe(404);
      expect(error.schema).toBe('z.object({ error: z.string() })');
    });

    it('should support default status', () => {
      const error: EndpointError = {
        status: 'default',
        schema: 'z.object({ message: z.string() })',
        description: 'Default error response',
      };

      expect(error.status).toBe('default');
      expect(error.description).toBe('Default error response');
    });
  });

  describe('EndpointResponse', () => {
    it('should define response structure', () => {
      const response: EndpointResponse = {
        statusCode: '200',
        schema: 'UserSchema',
      };

      expect(response.statusCode).toBe('200');
      expect(response.schema).toBe('UserSchema');
    });

    it('should allow optional description', () => {
      const response: EndpointResponse = {
        statusCode: '201',
        schema: 'UserSchema',
        description: 'User created successfully',
      };

      expect(response.description).toBe('User created successfully');
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
        response: 'UserSchema',
      };

      expect(endpoint.method).toBe('get');
      expect(endpoint.path).toBe('/users/:id');
      expect(endpoint.response).toBe('UserSchema');
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
          response: 'z.void()',
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
        response: 'UserSchema',
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
        response: 'UserSchema',
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
          response: 'z.void()',
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
          { name: 'id', type: 'Path', schema: 'z.string()' },
          { name: 'include', type: 'Query', schema: 'z.string().optional()' },
        ],
        errors: [],
        response: 'UserSchema',
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
          { status: 404, schema: 'NotFoundError' },
          { status: 500, schema: 'InternalError' },
        ],
        response: 'UserSchema',
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
        response: 'UserSchema',
        responses: [
          { statusCode: '200', schema: 'UserSchema', description: 'Success' },
          { statusCode: '404', schema: 'NotFoundError', description: 'Not found' },
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
            schema: 'CreateUserSchema',
            description: 'User data',
          },
        ],
        errors: [
          { status: 400, schema: 'ValidationError', description: 'Invalid input' },
          { status: 409, schema: 'ConflictError', description: 'User already exists' },
        ],
        response: 'UserSchema',
      };

      // Verify all fields
      expect(endpoint.method).toBe('post');
      expect(endpoint.path).toBe('/users');
      expect(endpoint.alias).toBe('createUser');
      expect(endpoint.description).toBe('Create a new user');
      expect(endpoint.requestFormat).toBe('json');
      expect(endpoint.parameters).toHaveLength(1);
      expect(endpoint.errors).toHaveLength(2);
      expect(endpoint.response).toBe('UserSchema');
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
          response: 'z.array(UserSchema)',
        },
        {
          method: 'get',
          path: '/users/:id',
          requestFormat: 'json',
          parameters: [{ name: 'id', type: 'Path', schema: 'z.string()' }],
          errors: [{ status: 404, schema: 'NotFoundError' }],
          response: 'UserSchema',
        },
      ];

      expect(endpoints).toHaveLength(2);
      expect(endpoints[0]?.method).toBe('get');
      expect(endpoints[1]?.parameters).toHaveLength(1);
    });
  });
});
