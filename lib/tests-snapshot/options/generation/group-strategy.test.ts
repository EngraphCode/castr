import { type OpenAPIObject, type SchemaObject } from 'openapi3-ts/oas30';
import SwaggerParser from '@apidevtools/swagger-parser';
import { expect, test } from 'vitest';

import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';

test('group-strategy', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/pet': {
        get: {
          operationId: 'petGet',
          tags: ['pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'petPut',
          tags: ['pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
      '/pet/all': {
        get: {
          operationId: 'petAllGet',
          tags: ['pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'petAllPut',
          tags: ['pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
      '/store': {
        get: {
          operationId: 'storeGet',
          tags: ['store'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'storePut',
          tags: ['store'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
      '/user': {
        get: {
          operationId: 'userGet',
          tags: ['user'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'userPut',
          tags: ['user'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
      '/user/pets': {
        get: {
          operationId: 'userGet',
          tags: ['user', 'pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'userPut',
          tags: ['user', 'pet'],
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
      '/no-tags': {
        get: {
          operationId: 'noTagsGet',
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
        put: {
          operationId: 'noTagsPut',
          responses: {
            '200': { content: { 'application/json': { schema: { type: 'string' } } } },
          },
        },
      },
    },
  };

  const ctxByTag = getZodClientTemplateContext(openApiDoc, { groupStrategy: 'tag' });
  expect(ctxByTag.endpointsGroups).toMatchSnapshot();

  const resultGroupedByTag = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
    options: { groupStrategy: 'tag' },
  });

  expect(resultGroupedByTag).toMatchSnapshot();

  const ctxByMethod = getZodClientTemplateContext(openApiDoc, { groupStrategy: 'method' });
  expect(ctxByMethod.endpointsGroups).toMatchSnapshot();

  const resultGroupedByMethod = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
    options: { groupStrategy: 'method' },
  });

  expect(resultGroupedByMethod).toMatchSnapshot();
});

test('group-strategy: tag-file with modified petstore schema', async () => {
  const openApiDoc = (await SwaggerParser.parse(
    './examples/swagger/petstore.yaml',
  )) as OpenAPIObject;

  if (!openApiDoc.components?.schemas) {
    throw new Error('Expected openApiDoc to have components.schemas');
  }

  const orderSchema = openApiDoc.components.schemas['Order'];
  if (!orderSchema) {
    throw new Error("Expected 'Order' schema to exist in components.schemas");
  }

  const orderObject = orderSchema as SchemaObject;
  if (!orderObject.properties) {
    orderObject.properties = {};
  }
  orderObject.properties['pet'] = {
    $ref: '#/components/schemas/Pet',
  };

  const result = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
    options: { groupStrategy: 'tag-file' },
  });

  expect(result).toMatchSnapshot();
});

test('group-strategy with complex schemas + split files', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    components: {
      schemas: {
        Pet: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            nickname: { type: 'string' },
            owner: { $ref: '#/components/schemas/User' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            firstname: { type: 'string' },
            lastname: { type: 'string' },
            email: { type: 'string' },
            friends: { type: 'array', items: { $ref: '#/components/schemas/User' } },
          },
        },
        Store: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            address: { type: 'string' },
            country: { $ref: '#/components/schemas/Country' },
            owner: { $ref: '#/components/schemas/User' },
          },
        },
        Country: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            code: { type: 'string' },
            store_list: { type: 'array', items: { $ref: '#/components/schemas/Store' } },
          },
        },
      },
    },
    paths: {
      '/pet': {
        get: {
          operationId: 'petGet',
          tags: ['pet'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
            },
          },
        },
        put: {
          operationId: 'petPut',
          tags: ['pet'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
            },
          },
        },
      },
      '/pet/all': {
        get: {
          operationId: 'petAllGet',
          tags: ['pet'],
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Pet' } },
                },
              },
            },
          },
        },
        post: {
          operationId: 'petAllPost',
          tags: ['pet'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Pet' } } },
            },
          },
        },
      },
      '/user': {
        get: {
          operationId: 'userGet',
          tags: ['user'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
        put: {
          operationId: 'userPut',
          tags: ['user'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } },
            },
          },
        },
      },
      '/store': {
        get: {
          operationId: 'storeGet',
          tags: ['store'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Store' } } },
            },
          },
        },
        put: {
          operationId: 'storePut',
          tags: ['store'],
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Store' } } },
            },
          },
        },
      },
      '/countries': {
        get: {
          operationId: 'noTagsGet',
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Country' } } },
            },
          },
        },
      },
    },
  };

  const ctxByTag = getZodClientTemplateContext(openApiDoc, { groupStrategy: 'tag-file' });
  expect(ctxByTag.endpointsGroups).toMatchSnapshot();

  const resultGroupedByTagSplitByFiles = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
    options: { groupStrategy: 'tag-file' },
  });

  expect(resultGroupedByTagSplitByFiles).toMatchSnapshot();
});
