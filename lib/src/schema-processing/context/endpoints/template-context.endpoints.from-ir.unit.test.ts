import { describe, expect, it, vi } from 'vitest';
import type {
  CastrAdditionalOperation,
  CastrSchema,
  CastrSchemaNode,
  CastrDocument,
  CastrOperation,
  CastrResponse,
} from '../../ir/index.js';
import { getEndpointDefinitionsFromIR } from './template-context.endpoints.from-ir.js';

function createSchemaNode(): CastrSchemaNode {
  return {
    required: true,
    nullable: false,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

function createSchema(type: 'string' | 'number' | 'object' = 'object'): CastrSchema {
  return {
    type,
    metadata: createSchemaNode(),
  };
}

function createOperation(overrides: Partial<CastrOperation> = {}): CastrOperation {
  return {
    method: 'get',
    path: '/users/{id}',
    parameters: [],
    parametersByLocation: {
      path: [],
      query: [],
      header: [],
      cookie: [],
    },
    responses: [],
    ...overrides,
  };
}

function createDocument(operations: CastrOperation[]): CastrDocument {
  return {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    servers: [],
    components: [],
    operations,
    additionalOperations: [],
    schemaNames: [],
    dependencyGraph: {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    },
    enums: new Map(),
  };
}

function createAdditionalOperation(
  overrides: Partial<CastrAdditionalOperation> = {},
): CastrAdditionalOperation {
  return {
    method: 'PURGE',
    path: '/users',
    parameters: [],
    parametersByLocation: {
      path: [],
      query: [],
      header: [],
      cookie: [],
    },
    responses: [],
    ...overrides,
  };
}

function createResponse(statusCode: string, schema?: CastrSchema): CastrResponse {
  return {
    statusCode,
    ...(schema ? { schema } : {}),
  };
}

describe('template-context.endpoints.from-ir', () => {
  it('maps non-2xx responses to endpoint errors and preserves default status', () => {
    const okSchema = createSchema('string');
    const badRequestSchema = createSchema('object');
    const defaultErrorSchema = createSchema('number');

    const doc = createDocument([
      createOperation({
        responses: [
          createResponse('200', okSchema),
          createResponse('400', badRequestSchema),
          createResponse('default', defaultErrorSchema),
        ],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.errors).toHaveLength(2);
    expect(endpoint?.errors).toEqual([
      { status: 400, schema: badRequestSchema },
      { status: 'default', schema: defaultErrorSchema },
    ]);
  });

  it('treats 299 as error status and 2XX as success wildcard', () => {
    const wildcardSuccessSchema = createSchema('object');
    const custom2xxSchema = createSchema('string');
    const fallbackErrorSchema = createSchema('number');

    const doc = createDocument([
      createOperation({
        responses: [
          createResponse('2XX', wildcardSuccessSchema),
          createResponse('299', custom2xxSchema),
          createResponse('default', fallbackErrorSchema),
        ],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.response).toEqual(wildcardSuccessSchema);
    expect(endpoint?.errors).toEqual([
      { status: 299, schema: custom2xxSchema },
      { status: 'default', schema: fallbackErrorSchema },
    ]);
  });

  it('preserves 4XX and 5XX wildcard status tokens on endpoint errors', () => {
    const successSchema = createSchema('string');
    const clientErrorSchema = createSchema('object');
    const serverErrorSchema = createSchema('number');

    const doc = createDocument([
      createOperation({
        responses: [
          createResponse('200', successSchema),
          createResponse('4XX', clientErrorSchema),
          createResponse('5XX', serverErrorSchema),
        ],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.errors).toEqual([
      { status: '4XX', schema: clientErrorSchema },
      { status: '5XX', schema: serverErrorSchema },
    ]);
  });

  it('fails fast with an actionable error on malformed response status tokens', () => {
    const doc = createDocument([
      createOperation({
        responses: [
          createResponse('200', createSchema('string')),
          createResponse('4xx', createSchema('object')),
        ],
      }),
    ]);

    expect(() => getEndpointDefinitionsFromIR(doc)).toThrow(
      /Unsupported response status token '4xx'/,
    );
  });

  it('selects 201 as primary success response when 200 is absent', () => {
    const createdSchema = createSchema('object');
    const errorSchema = createSchema('string');

    const doc = createDocument([
      createOperation({
        responses: [createResponse('201', createdSchema), createResponse('500', errorSchema)],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.response).toEqual(createdSchema);
  });

  it('falls back to response content schema when response.schema is omitted', () => {
    const contentSchema = createSchema('string');

    const doc = createDocument([
      createOperation({
        responses: [
          {
            statusCode: '200',
            content: {
              'application/json': {
                schema: contentSchema,
              },
            },
          },
        ],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.response).toEqual(contentSchema);
  });

  it('uses lexicographically first media type when response content has no application/json', () => {
    const xmlSchema = createSchema('object');
    const textSchema = createSchema('string');

    const doc = createDocument([
      createOperation({
        responses: [
          {
            statusCode: '200',
            content: {
              'text/plain': {
                schema: textSchema,
              },
              'application/xml': {
                schema: xmlSchema,
              },
            },
          },
        ],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.response).toEqual(xmlSchema);
  });

  it('adds body parameter and infers request format from request content type', () => {
    const bodySchema = createSchema('object');

    const doc = createDocument([
      createOperation({
        requestBody: {
          required: true,
          description: 'Upload body',
          content: {
            'multipart/form-data': {
              schema: bodySchema,
            },
          },
        },
        responses: [createResponse('204', createSchema('object'))],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);
    const bodyParameter = endpoint?.parameters.find((p) => p.type === 'Body');

    expect(endpoint?.requestFormat).toBe('form-data');
    expect(bodyParameter).toBeDefined();
    expect(bodyParameter?.name).toBe('body');
    expect(bodyParameter?.schema).toEqual(bodySchema);
    expect(bodyParameter?.description).toBe('Upload body');
  });

  it('maps additionalOperations into endpoint definitions', () => {
    const doc = {
      ...createDocument([]),
      additionalOperations: [
        createAdditionalOperation({
          operationId: 'purgeUsers',
          method: 'PuRgE',
          path: '/users',
          responses: [createResponse('202', createSchema('object'))],
        }),
      ],
    };

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.method).toBe('PuRgE');
    expect(endpoint?.path).toBe('/users');
    expect(endpoint?.alias).toBe('purgeUsers');
  });

  it('fails fast when endpoint generation encounters itemSchema', () => {
    const doc = createDocument([
      createOperation({
        requestBody: {
          required: true,
          content: {
            'application/x-ndjson': {
              schema: createSchema('object'),
              itemSchema: createSchema('string'),
            },
          },
        },
      }),
    ]);

    expect(() => getEndpointDefinitionsFromIR(doc)).toThrow(/itemSchema/i);
  });

  it('fails fast when endpoint generation encounters itemSchema in parameter content', () => {
    const doc = createDocument([
      createOperation({
        parameters: [
          {
            name: 'stream-filter',
            in: 'query',
            required: false,
            schema: createSchema('object'),
            content: {
              'application/x-ndjson': {
                itemSchema: createSchema('string'),
              },
            },
          },
        ],
        parametersByLocation: {
          path: [],
          query: [
            {
              name: 'stream-filter',
              in: 'query',
              required: false,
              schema: createSchema('object'),
              content: {
                'application/x-ndjson': {
                  itemSchema: createSchema('string'),
                },
              },
            },
          ],
          header: [],
          cookie: [],
        },
      }),
    ]);

    expect(() => getEndpointDefinitionsFromIR(doc)).toThrow(/itemSchema/i);
  });

  it('fails fast when endpoint generation encounters itemSchema in response headers', () => {
    const doc = createDocument([
      createOperation({
        responses: [
          {
            statusCode: '200',
            headers: {
              'X-Stream-Acks': {
                schema: createSchema('object'),
                content: {
                  'application/x-ndjson': {
                    itemSchema: createSchema('string'),
                  },
                },
              },
            },
          },
        ],
      }),
    ]);

    expect(() => getEndpointDefinitionsFromIR(doc)).toThrow(/itemSchema/i);
  });

  it('uses lexicographically first media type for body parameter schema fallback', () => {
    const xmlBodySchema = createSchema('object');
    const textBodySchema = createSchema('string');

    const doc = createDocument([
      createOperation({
        requestBody: {
          required: true,
          content: {
            'text/plain': {
              schema: textBodySchema,
            },
            'application/xml': {
              schema: xmlBodySchema,
            },
          },
        },
        responses: [createResponse('200', createSchema('object'))],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);
    const bodyParameter = endpoint?.parameters.find((p) => p.type === 'Body');

    expect(bodyParameter?.schema).toEqual(xmlBodySchema);
  });

  it('maps cookie parameters to Header endpoint parameter type', () => {
    const cookieSchema = createSchema('string');

    const doc = createDocument([
      createOperation({
        parameters: [
          {
            name: 'session',
            in: 'cookie',
            required: true,
            schema: cookieSchema,
          },
        ],
        parametersByLocation: {
          path: [],
          query: [],
          header: [],
          cookie: [
            {
              name: 'session',
              in: 'cookie',
              required: true,
              schema: cookieSchema,
            },
          ],
        },
        responses: [createResponse('200', createSchema('object'))],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.parameters).toHaveLength(1);
    expect(endpoint?.parameters[0]?.type).toBe('Header');
  });

  it('preserves query operations when mapping IR operations to endpoint definitions', () => {
    const doc = createDocument([
      createOperation({
        method: 'query',
        path: '/search',
        responses: [createResponse('200', createSchema('object'))],
      }),
    ]);

    const [endpoint] = getEndpointDefinitionsFromIR(doc);

    expect(endpoint?.method).toBe('query');
    expect(endpoint?.path).toBe('/search');
  });

  describe('defaultStatusBehavior', () => {
    function createDefaultOnlyDocument(defaultSchema: CastrSchema): CastrDocument {
      return createDocument([
        createOperation({
          operationId: 'logoutUser',
          path: '/logout',
          responses: [createResponse('default', defaultSchema)],
        }),
        createOperation({
          operationId: 'listUsers',
          path: '/users',
          responses: [createResponse('200', createSchema('object'))],
        }),
      ]);
    }

    it('ignores default-only operations and warns when the option is unset', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        const doc = createDefaultOnlyDocument(createSchema('string'));

        const endpoints = getEndpointDefinitionsFromIR(doc);

        expect(endpoints.map((e) => e.alias)).toEqual(['listUsers']);
        expect(warnSpy).toHaveBeenCalledOnce();
        const warning = warnSpy.mock.calls[0]?.join(' ') ?? '';
        expect(warning).toContain('defaultStatusBehavior');
        expect(warning).toContain('logoutUser');
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('ignores default-only operations when spec-compliant is explicit', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      try {
        const doc = createDefaultOnlyDocument(createSchema('string'));

        const endpoints = getEndpointDefinitionsFromIR(doc, 'spec-compliant');

        expect(endpoints.map((e) => e.alias)).toEqual(['listUsers']);
      } finally {
        warnSpy.mockRestore();
      }
    });

    it('includes default-only operations under auto-correct, promoting default to success', () => {
      const defaultSchema = createSchema('string');
      const doc = createDefaultOnlyDocument(defaultSchema);

      const endpoints = getEndpointDefinitionsFromIR(doc, 'auto-correct');
      const logout = endpoints.find((e) => e.alias === 'logoutUser');

      expect(endpoints).toHaveLength(2);
      expect(logout?.response).toEqual(defaultSchema);
      expect(logout?.errors).toEqual([]);
    });

    it('keeps default as an error fallback for operations with explicit status codes', () => {
      const fallbackSchema = createSchema('number');
      const doc = createDocument([
        createOperation({
          operationId: 'getUser',
          responses: [
            createResponse('200', createSchema('object')),
            createResponse('default', fallbackSchema),
          ],
        }),
      ]);

      const specCompliant = getEndpointDefinitionsFromIR(doc, 'spec-compliant');
      const autoCorrect = getEndpointDefinitionsFromIR(doc, 'auto-correct');

      expect(specCompliant[0]?.errors).toEqual([{ status: 'default', schema: fallbackSchema }]);
      expect(autoCorrect[0]?.errors).toEqual([{ status: 'default', schema: fallbackSchema }]);
    });
  });
});
