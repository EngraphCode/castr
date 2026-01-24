import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

/**
 * Tests that hyphenated parameters are correctly handled in path parameter naming.
 * https://github.com/astahmer/@engraph/castr/issues/78
 *
 * The valuable behavior being proven:
 * - Hyphens in parameter names are converted to camelCase
 * - Underscores in parameter names are preserved
 * - Mixed hyphen/underscore names are handled correctly
 */
test('hyphenated-parameters', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
    paths: {
      '/pet/{pet-id}/uploadImage': {
        post: {
          parameters: [{ name: 'pet-id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'boolean' } } },
            },
          },
        },
      },
      '/pet/{owner_name}': {
        post: {
          parameters: [
            { name: 'owner_name', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'boolean' } } },
            },
          },
        },
      },
      '/pet/{owner_name-id}': {
        post: {
          parameters: [
            { name: 'owner_name-id', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'Successful operation',
              content: { 'application/json': { schema: { type: 'boolean' } } },
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);

  // Test the valuable behavior: hyphenated parameters are correctly converted
  // pet-id -> petId (hyphen to camelCase)
  expect(output.content).toContain('petId: { type: "string" }');
  expect(output.content).toContain('required: ["petId"]');

  // owner_name stays owner_name (underscores preserved)
  expect(output.content).toContain('ownerName: { type: "string" }');
  expect(output.content).toContain('required: ["ownerName"]');

  // owner_name-id -> ownerNameId (mixed: underscore + hyphen)
  expect(output.content).toContain('ownerNameId: { type: "string" }');
  expect(output.content).toContain('required: ["ownerNameId"]');

  // All three endpoints should be generated
  expect(output.content).toContain('path: "/pet/{pet-id}/uploadImage"');
  expect(output.content).toContain('path: "/pet/{owner_name}"');
  expect(output.content).toContain('path: "/pet/{owner_name-id}"');

  // MCP tool names should use snake_case with underscores
  expect(output.content).toContain('name: "post_pet_pet_id_upload_image"');
  expect(output.content).toContain('name: "post_pet_owner_name"');
  expect(output.content).toContain('name: "post_pet_owner_name_id"');
});
