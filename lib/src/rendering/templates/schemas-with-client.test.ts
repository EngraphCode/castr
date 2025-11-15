import { describe, expect, it } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { generateZodClientFromOpenAPI } from '../generate-from-context.js';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';

describe('schemas-with-client template', () => {
  const minimalSpec: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Test API', version: '1.0.0' },
    paths: {
      '/pets/{id}': {
        get: {
          operationId: 'getPet',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                    required: ['id', 'name'],
                  },
                },
              },
            },
            '404': {
              description: 'Not found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/pets': {
        post: {
          operationId: 'createPet',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                  },
                  required: ['name'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  describe('Template Selection', () => {
    it('should be selectable with template option', async () => {
      const result = await generateZodClientFromOpenAPI({
        openApiDoc: minimalSpec,
        template: 'schemas-with-client',
        disableWriteToFile: true,
        options: {
          withAlias: true,
        },
      });

      assertSingleFileResult(result);
      expect(typeof result.content).toBe('string');
    });
  });

  const generateWithOptions = (openApiDoc: OpenAPIObject) => {
    return generateZodClientFromOpenAPI({
      openApiDoc,
      template: 'schemas-with-client',
      disableWriteToFile: true,
      options: {
        withAlias: true,
      },
    });
  };

  // Imports tests removed - quote-style validation is covered by generated-code-validation.gen.test.ts

  describe('Zod Schemas', () => {
    it('should generate zod schemas for request/response types', async () => {
      const result = await generateWithOptions(minimalSpec);
      assertSingleFileResult(result);

      // Should have schemas section
      expect(result.content).toContain('export const');
      expect(result.content).toContain('z.object');
    });
  });

  describe('Endpoint Metadata', () => {
    it('should export endpoints array', async () => {
      const result = await generateWithOptions(minimalSpec);
      assertSingleFileResult(result);

      expect(result.content).toContain('export const endpoints =');
      expect(result.content).toContain('] as const');
    });

    // Quote-style test removed - validation is covered by generated-code-validation.gen.test.ts
  });

  describe('Client Factory Function', () => {
    it('should export createApiClient function', async () => {
      const result = await generateWithOptions(minimalSpec);
      assertSingleFileResult(result);

      expect(result.content).toContain('export function createApiClient(');
    });

    it('should accept ApiClientConfig parameter', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('config: ApiClientConfig');
    });

    it('should define ApiClientConfig type', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('export type ApiClientConfig');
      expect(result).toContain('baseUrl: string');
    });

    it('should support validationMode configuration', async () => {
      const result = await generateWithOptions(minimalSpec);

      // Check for validationMode property (accept any quote style)
      expect(result).toMatch(/validationMode\?:\s*['"]strict['"] \| ['"]loose['"] \| ['"]none['"]/);
    });
  });

  describe('Validation Logic', () => {
    it('should include validate helper function', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('function validate<T>(');
      expect(result).toContain('.safeParse(');
    });

    it('should validate request parameters', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('validate(');
      expect(result).toMatch(/request (params|body|query)/);
    });

    it('should validate response data', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('validate(');
      expect(result).toMatch(/response/);
    });
  });

  describe('Generated API Methods', () => {
    it('should generate method for each operation', async () => {
      const result = await generateWithOptions(minimalSpec);

      // Should have methods for both operations
      expect(result).toContain('getPet(');
      expect(result).toContain('createPet(');
    });

    it('should be async functions', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('async getPet(');
      expect(result).toContain('async createPet(');
    });

    it('should call openapi-fetch with correct method', async () => {
      const result = await generateWithOptions(minimalSpec);

      // Should call client.get for GET operation (lowercase method names in openapi-fetch)
      expect(result).toContain('client.get(');
      // Should call client.post for POST operation
      expect(result).toContain('client.post(');
    });

    // Quote-style test removed - validation is covered by generated-code-validation.gen.test.ts

    it('should handle error responses', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('if (error)');
      expect(result).toContain('throw');
    });
  });

  describe('Raw Client Access', () => {
    it('should expose _raw property for direct access', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('_raw: client');
    });
  });

  describe('Documentation', () => {
    it('should include comprehensive JSDoc comments', async () => {
      const result = await generateWithOptions(minimalSpec);

      // Should have /** JSDoc */ style comments
      expect(result).toContain('/**');
      expect(result).toContain('*/');
      expect(result).toContain('@example');
    });

    it('should document peer dependencies', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('openapi-fetch');
      expect(result).toMatch(/(peer dependen(cy|cies)|Prerequisites)/i);
    });

    it('should include @operationId tags in method docs', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('@operationId getPet');
      expect(result).toContain('@operationId createPet');
    });
  });

  describe('Type Safety', () => {
    // Quote-style test removed - validation is covered by generated-code-validation.gen.test.ts

    it('should NOT use other type assertions in user code', async () => {
      const result = await generateWithOptions(minimalSpec);

      // Extract only the endpoint methods section (user-facing code)
      // Skip the validate helper which legitimately needs "as T" for type safety
      const startMarker =
        '// ============================================================\n// Endpoint Metadata';
      if (!isSingleFileResult(result)) {
        throw new Error('Expected single file result');
      }
      const userCodeStart = result.content.indexOf(startMarker);
      const userCode = userCodeStart >= 0 ? result.content.slice(userCodeStart) : result.content;

      // No "as any", "as unknown", etc. in user-facing code
      // Allow "as T" in validate function (helper code)
      const nonConstAssertions = (userCode as string).match(/ as (?!(const|T)\b)/g);
      expect(nonConstAssertions).toBeNull();
    });
  });

  describe('Generated Code Quality', () => {
    it('should create openapi-fetch client', async () => {
      const result = await generateWithOptions(minimalSpec);

      expect(result).toContain('createClient<paths>');
    });
  });
});
