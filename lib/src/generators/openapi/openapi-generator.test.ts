import { describe, it, expect } from 'vitest';
import { generateOpenAPI } from './index.js';
import type { IRDocument } from '../../context/ir-schema.js';
import { IRSchemaProperties } from '../../context/ir-schema-properties.js';
import { validateOpenAPI } from './validator.js';

describe('generateOpenAPI', () => {
  it('should generate a minimal valid OpenAPI object from an empty IR', () => {
    const ir: IRDocument = {
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

    const openApi = generateOpenAPI(ir);

    expect(openApi).toEqual({
      openapi: '3.1.0',
      info: {
        title: 'Test API',
        version: '1.0.0',
      },
      servers: [],
      paths: {},
      components: {
        schemas: {},
      },
    });
  });
  it('should correctly map info and servers', () => {
    const ir: IRDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: {
        title: 'Complex API',
        version: '2.0.0',
        description: 'A complex API',
      },
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
      components: [],
      operations: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
      enums: new Map(),
    };

    const openApi = generateOpenAPI(ir);

    expect(openApi.info).toEqual(ir.info);
    expect(openApi.servers).toEqual(ir.servers);
  });

  it('should correctly map schemas', () => {
    const ir: IRDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'schema',
          name: 'User',
          schema: {
            type: 'object',
            properties: new IRSchemaProperties({
              id: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  zodChain: { presence: 'required', validations: [], defaults: [] },
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  circularReferences: [],
                },
              },
              name: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  zodChain: { presence: 'required', validations: [], defaults: [] },
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  circularReferences: [],
                },
              },
            }),
            required: ['id', 'name'],
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: 'optional', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: 'optional', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      ],
      operations: [],
      dependencyGraph: { nodes: new Map(), topologicalOrder: [], circularReferences: [] },
      enums: new Map(),
    };

    const openApi = generateOpenAPI(ir);

    expect(openApi.components?.schemas).toEqual({
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['id', 'name'],
      },
    });
  });

  it('should correctly map composition schemas', () => {
    const ir: IRDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [
        {
          type: 'schema',
          name: 'Composite',
          schema: {
            allOf: [
              {
                $ref: '#/components/schemas/Base',
                metadata: {
                  required: false,
                  nullable: false,
                  zodChain: { presence: 'optional', validations: [], defaults: [] },
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  circularReferences: [],
                },
              },
              {
                type: 'object',
                properties: new IRSchemaProperties({
                  extra: {
                    type: 'string',
                    metadata: {
                      required: false,
                      nullable: false,
                      zodChain: { presence: 'optional', validations: [], defaults: [] },
                      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                      circularReferences: [],
                    },
                  },
                }),
                metadata: {
                  required: false,
                  nullable: false,
                  zodChain: { presence: 'optional', validations: [], defaults: [] },
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  circularReferences: [],
                },
              },
            ],
            metadata: {
              required: false,
              nullable: false,
              zodChain: { presence: 'optional', validations: [], defaults: [] },
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              circularReferences: [],
            },
          },
          metadata: {
            required: false,
            nullable: false,
            zodChain: { presence: 'optional', validations: [], defaults: [] },
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            circularReferences: [],
          },
        },
      ],
      operations: [],
      dependencyGraph: { nodes: new Map(), topologicalOrder: [], circularReferences: [] },
      enums: new Map(),
    };

    const openApi = generateOpenAPI(ir);

    expect(openApi.components?.schemas).toEqual({
      Composite: {
        allOf: [
          { $ref: '#/components/schemas/Base' },
          { type: 'object', properties: { extra: { type: 'string' } } },
        ],
      },
    });
  });

  it('should correctly map operations and paths', () => {
    const ir: IRDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      servers: [],
      components: [],
      operations: [
        {
          operationId: 'getUsers',
          method: 'get',
          path: '/users',
          summary: 'Get users',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [
            {
              statusCode: '200',
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'string',
                      metadata: {
                        required: true,
                        nullable: false,
                        zodChain: { presence: 'required', validations: [], defaults: [] },
                        dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                        circularReferences: [],
                      },
                    },
                    metadata: {
                      required: true,
                      nullable: false,
                      zodChain: { presence: 'required', validations: [], defaults: [] },
                      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                      circularReferences: [],
                    },
                  },
                },
              },
            },
          ],
        },
      ],
      dependencyGraph: { nodes: new Map(), topologicalOrder: [], circularReferences: [] },
      enums: new Map(),
    };

    const openApi = generateOpenAPI(ir);

    expect(openApi.paths).toEqual({
      '/users': {
        get: {
          operationId: 'getUsers',
          summary: 'Get users',
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    });
  });

  it('should generate valid OpenAPI spec', async () => {
    const ir: IRDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Valid API', version: '1.0.0' },
      servers: [],
      components: [],
      operations: [],
      dependencyGraph: { nodes: new Map(), topologicalOrder: [], circularReferences: [] },
      enums: new Map(),
    };

    const openApi = generateOpenAPI(ir);
    await expect(validateOpenAPI(openApi)).resolves.not.toThrow();
  });
});
