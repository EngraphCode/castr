import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../../../src/index.js';
import {
  exportSchemasOptionContextSnapshot,
  exportSchemasOptionOutputSnapshot,
} from '../../__fixtures__/options/export-schemas-option.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

test('export-schemas-option', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/export-schemas-option': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Basic' } } },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Basic: { type: 'string' },
        UnusedSchemas: {
          type: 'object',
          properties: {
            nested_prop: { type: 'boolean' },
            another: { type: 'string' },
          },
        },
      },
    },
  };

  expect(getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: false }).schemas)
    .toMatchInlineSnapshot(`
      {
          "Basic": "z.string()",
      }
    `);

  const ctx = getZodClientTemplateContext(openApiDoc, { shouldExportAllSchemas: true });
  expect(ctx.endpoints).toMatchInlineSnapshot(`
    [
        {
            "errors": [],
            "method": "get",
            "parameters": [],
            "path": "/export-schemas-option",
            "requestFormat": "json",
            "response": "z.string()",
        },
    ]
  `);

  expect(ctx.schemas).toStrictEqual(exportSchemasOptionContextSnapshot);

  const result = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: { shouldExportAllSchemas: true },
  });
  assertSingleFileResult(result);
  expect(result.content).toBe(exportSchemasOptionOutputSnapshot);
});
