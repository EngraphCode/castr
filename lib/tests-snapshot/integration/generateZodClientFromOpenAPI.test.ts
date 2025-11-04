import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, SchemasObject } from 'openapi3-ts/oas31';
import { beforeAll, describe, expect, test } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/rendering/index.js';
import { getZodClientTemplateContext } from '../../src/context/index.js';
import { pathToVariableName } from '../../src/shared/utils/index.js';

let openApiDoc: OpenAPIObject;
beforeAll(async () => {
  openApiDoc = (await SwaggerParser.parse('./examples/swagger/petstore.yaml')) as OpenAPIObject;
});

test('getZodClientTemplateContext', () => {
  const result = getZodClientTemplateContext(openApiDoc);
  expect(result).toMatchSnapshot();
});

describe('generateZodClientFromOpenAPI - without options', () => {
  test('should generate client without options', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - withAlias as true', () => {
  test('should generate client with alias enabled', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: { withAlias: true },
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - withAlias as false', () => {
  test('should generate client with alias disabled', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: { withAlias: false },
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - withAlias as custom function', () => {
  test('should generate client with custom alias function', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        withAlias: (path: string, method: string, operation) =>
          path === '/pet'
            ? method + 'CustomPet'
            : (operation?.operationId ?? method + pathToVariableName(path || '/noPath')),
      },
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - with baseUrl', () => {
  test('should generate client with base URL', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        baseUrl: 'http://example.com',
      },
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - without default values', () => {
  test('should generate client without default values', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        withDefaultValues: false,
      },
    });
    expect(prettyOutput).toMatchSnapshot();
  });
});

describe('generateZodClientFromOpenAPI - with tag-file groupStrategy', () => {
  test('should generate client with tag-file grouping', async () => {
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: { groupStrategy: 'tag-file' },
    });
    if (typeof prettyOutput === 'object' && prettyOutput !== null) {
      expect(prettyOutput['pet']).toMatchSnapshot();
    }
  });
});

test('with optional, partial, all required objects', async () => {
  const schemas = {
    Root2: {
      type: 'object',
      properties: {
        str: { type: 'string' },
        nb: { type: 'number' },
        nested: { $ref: '#/components/schemas/Nested2' },
        partial: { $ref: '#/components/schemas/PartialObject' },
        optionalProp: { type: 'string' },
      },
      required: ['str', 'nb', 'nested'],
    },
    Nested2: {
      type: 'object',
      properties: {
        nested_prop: { type: 'boolean' },
        deeplyNested: { $ref: '#/components/schemas/DeeplyNested' },
        circularToRoot: { $ref: '#/components/schemas/Root2' },
        requiredProp: { type: 'string' },
      },
      required: ['requiredProp'],
    },
    PartialObject: {
      type: 'object',
      properties: {
        something: { type: 'string' },
        another: { type: 'number' },
      },
    },
    DeeplyNested: {
      type: 'array',
      items: { $ref: '#/components/schemas/VeryDeeplyNested' },
    },
    VeryDeeplyNested: {
      type: 'string',
      enum: ['aaa', 'bbb', 'ccc'],
    },
  } as SchemasObject;
  const openApiDoc = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/root': {
        get: {
          operationId: 'getRoot',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['Root2'] } },
            },
          },
        },
      },
      '/nested': {
        get: {
          operationId: 'getNested',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['Nested2'] } },
            },
          },
        },
      },
      '/deeplyNested': {
        get: {
          operationId: 'getDeeplyNested',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['DeeplyNested'] } },
            },
          },
        },
      },
      '/veryDeeplyNested': {
        get: {
          operationId: 'getVeryDeeplyNested',
          responses: {
            '200': {
              description: 'OK',
              content: { 'application/json': { schema: schemas['VeryDeeplyNested'] } },
            },
          },
        },
      },
    },
    components: { schemas },
  };

  const data = getZodClientTemplateContext(openApiDoc);

  expect(data).toMatchSnapshot();

  const prettyOutput = await generateZodClientFromOpenAPI({ openApiDoc, disableWriteToFile: true });
  expect(prettyOutput).toMatchSnapshot();
});

test('getZodClientTemplateContext with allReadonly', () => {
  const result = getZodClientTemplateContext(openApiDoc, {
    allReadonly: true,
  });
  expect(result).toMatchSnapshot();
});
