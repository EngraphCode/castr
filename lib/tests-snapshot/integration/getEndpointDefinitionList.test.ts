import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { getEndpointDefinitionList } from '../../src/getEndpointDefinitionList.js';

const baseDoc = {
  openapi: '3.0.3',
  info: {
    title: 'Swagger Petstore - OpenAPI 3.0',
    description:
      "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about\nSwagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!\nYou can now help us improve the API whether it's by making changes to the definition itself or to the code.\nThat way, with time, we can improve the API in general, and expose some of the new features in OAS3.\n\n_If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the `Edit > Load Petstore OAS 2.0` menu option!_\n\nSome useful links:\n- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)\n- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
    termsOfService: 'https://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
    license: {
      name: 'Apache 2.0',
      url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
    },
    version: '1.0.11',
  },
} as OpenAPIObject;

const schemas = {
  Order: {
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 10 },
      petId: { type: 'integer', format: 'int64', example: 198_772 },
      quantity: { type: 'integer', format: 'int32', example: 7 },
      shipDate: { type: 'string', format: 'date-time' },
      status: {
        type: 'string',
        description: 'Order Status',
        example: 'approved',
        enum: ['placed', 'approved', 'delivered'],
      },
      complete: { type: 'boolean' },
    },
    xml: { name: 'order' },
  } as SchemaObject,
  Pet: {
    required: ['name', 'photoUrls'],
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 10 },
      name: { type: 'string', example: 'doggie' },
      category: { $ref: '#/components/schemas/Category' },
      photoUrls: {
        type: 'array',
        xml: { wrapped: true },
        items: { type: 'string', xml: { name: 'photoUrl' } },
      },
      tags: { type: 'array', xml: { wrapped: true }, items: { $ref: '#/components/schemas/Tag' } },
      status: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
    },
    xml: { name: 'pet' },
  } as SchemaObject,
  ReasonDetails: {
    required: ['details'],
    type: 'object',
    properties: {
      details: { type: 'string', example: 'found an owner' },
    },
    xml: { name: 'reasonDetails' },
  } as SchemaObject,
  Reason: {
    required: ['reason'],
    type: 'object',
    properties: {
      reason: { $ref: '#/components/schemas/ReasonDetails' },
    },
    xml: { name: 'reason' },
  } as SchemaObject,
  Category: {
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 1 },
      name: { type: 'string', example: 'Dogs' },
    },
    xml: { name: 'category' },
  } as SchemaObject,
  Tag: {
    type: 'object',
    properties: { id: { type: 'integer', format: 'int64' }, name: { type: 'string' } },
    xml: { name: 'tag' },
  } as SchemaObject,
} as const;

test('getEndpointDefinitionList /store/order', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Order: schemas.Order } },
      paths: {
        '/store/order': {
          post: {
            tags: ['store'],
            summary: 'Place an order for a pet',
            description: 'Place a new order in the store',
            operationId: 'placeOrder',
            requestBody: {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Order' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Order' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Order' },
                },
              },
            },
            responses: {
              '200': {
                description: 'successful operation',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
              },
              '405': { description: 'Invalid input' },
            },
          },
        },
      },
    }),
  ).toMatchSnapshot();
});

test('getEndpointDefinitionList /pet', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
      paths: {
        '/pet': {
          put: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
            operationId: 'updatePet',
            requestBody: {
              description: 'Update an existent pet in the store',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '400': { description: 'Invalid ID supplied' },
              '404': { description: 'Pet not found' },
              '405': { description: 'Validation exception' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
          post: {
            tags: ['pet'],
            summary: 'Add a new pet to the store',
            description: 'Add a new pet to the store',
            operationId: 'addPet',
            requestBody: {
              description: 'Create a new pet in the store',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '405': { description: 'Invalid input' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
        },
      },
    }),
  ).toMatchSnapshot();
});

test('getEndpointDefinitionList /pet without schema ref', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: {
        schemas: {
          Pet: schemas.Pet,
          Category: schemas.Category,
          Tag: schemas.Tag,
          Reason: schemas.Reason,
          ReasonDetails: schemas.ReasonDetails,
        },
      },
      paths: {
        '/pet': {
          put: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
            operationId: 'updatePet',
            requestBody: {
              description: 'Update an existent pet in the store',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
                'application/xml': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
                'application/x-www-form-urlencoded': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '400': { description: 'Invalid ID supplied' },
              '404': { description: 'Pet not found' },
              '405': { description: 'Validation exception' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
        },
      },
    }),
  ).toMatchSnapshot();
});

test('getEndpointDefinitionList /pet/findXXX', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
      paths: {
        '/pet/findByStatus': {
          get: {
            tags: ['pet'],
            summary: 'Finds Pets by status',
            description: 'Multiple status values can be provided with comma separated strings',
            operationId: 'findPetsByStatus',
            parameters: [
              {
                name: 'status',
                in: 'query',
                description: 'Status values that need to be considered for filter',
                required: false,
                explode: true,
                schema: {
                  type: 'string',
                  default: 'available',
                  enum: ['available', 'pending', 'sold'],
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                  'application/xml': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid status value',
              },
            },
            security: [
              {
                petstore_auth: ['write:pets', 'read:pets'],
              },
            ],
          },
        },
        '/pet/findByTags': {
          get: {
            tags: ['pet'],
            summary: 'Finds Pets by tags',
            description:
              'Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.',
            operationId: 'findPetsByTags',
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'Tags to filter by',
                required: false,
                explode: true,
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                  'application/xml': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid tag value',
              },
            },
            security: [
              {
                petstore_auth: ['write:pets', 'read:pets'],
              },
            ],
          },
        },
      },
    }),
  ).toMatchSnapshot();
});

test('petstore.yaml', async () => {
  const openApiDoc = (await SwaggerParser.parse(
    './examples/swagger/petstore.yaml',
  )) as OpenAPIObject;
  const result = getEndpointDefinitionList(openApiDoc);
  expect(result).toMatchSnapshot();
});

test('getEndpointDefinitionList should return responses if options.withAllResponses is true', () => {
  expect(
    getEndpointDefinitionList(
      {
        ...baseDoc,
        components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
        paths: {
          '/pet/findByStatus': {
            get: {
              tags: ['pet'],
              summary: 'Finds Pets by status',
              description: 'Multiple status values can be provided with comma separated strings',
              operationId: 'findPetsByStatus',
              responses: {
                '200': {
                  description: 'successful operation',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Pet',
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Invalid status value',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                      },
                    },
                  },
                },
                '500': {
                  description: 'Network error',
                },
              },
            },
          },
          '/pet/findByTags': {
            get: {
              tags: ['pet'],
              summary: 'Finds Pets by tags',
              description:
                'Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.',
              operationId: 'findPetsByTags',
              responses: {
                '200': {
                  description: 'successful operation',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Pet',
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Invalid tag value',
                },
              },
            },
          },
        },
      },
      { withAllResponses: true },
    ),
  ).toMatchSnapshot();
});
