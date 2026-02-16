import { describe, expect, it } from 'vitest';
import type {
  CastrDocument,
  CastrOperation,
  CastrResponse,
  CastrSchema,
  CastrSchemaNode,
} from '../ir/schema.js';
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
    schemaNames: [],
    dependencyGraph: {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    },
    enums: new Map(),
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
});
