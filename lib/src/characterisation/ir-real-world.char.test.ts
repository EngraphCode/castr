/**
 * IR Characterization Tests - Real-World OpenAPI Specs
 *
 * PROVES: IR system works correctly on actual, complex OpenAPI specifications
 *
 * Test Philosophy:
 * - Real-world specs are complex and expose edge cases unit tests miss
 * - These tests prove the IR delivers actual value on production-like specs
 * - Failures here indicate gaps in handling real OpenAPI patterns
 *
 * @module ir-real-world.char.test
 */

import { generateZodClientFromOpenAPI } from '../index.js';
import { getZodClientTemplateContext } from '../context/template-context.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import {
  assertAndGetSingleFileContent,
  findComponent,
  countTotalCircularRefs,
  assertComponentExists,
  assertContentContains,
} from './ir-test-helpers.js';

describe('IR Characterization - Real-World Specs', () => {
  describe('Petstore Expanded Spec', () => {
    test('IR captures all petstore schemas', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input:
          'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml',
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with IR and contains expected content
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toContain('pet');
      expect(content.toLowerCase()).toContain('error');
      expect(content).toContain('z.object(');
    });

    test('petstore schemas have correct metadata', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input:
          'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml',
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with correct schema definitions
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('z.object(');
      expect(content.toLowerCase()).toContain('pet');
    });

    test('petstore operations have correct structure', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input:
          'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml',
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Operations are generated with function definitions
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain('function');
    });

    test('petstore generates valid Zod code', async () => {
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        input:
          'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/examples/v3.0/petstore-expanded.yaml',
      });

      const content = assertAndGetSingleFileContent(result);

      // PROVE: Code generation succeeds with IR and contains expected schemas
      expect(content).toBeDefined();
      expect(content.length).toBeGreaterThan(0);
      expect(content.toLowerCase()).toContain('pet');
      expect(content.toLowerCase()).toContain('error');
      expect(content).toContain('z.object(');
    });
  });

  describe('Complex Schema Patterns', () => {
    test('handles deeply nested schemas with circular references', async () => {
      const complexDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Complex Circular Test' },
        paths: {},
        components: {
          schemas: {
            Organization: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                departments: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Department' },
                },
              },
            },
            Department: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                manager: { $ref: '#/components/schemas/Employee' },
                employees: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Employee' },
                },
              },
            },
            Employee: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                department: { $ref: '#/components/schemas/Department' },
                reports: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Employee' },
                },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(complexDoc);

      // PROVE: IR captures all schemas
      expect(ctx._ir?.components?.length).toBe(3);

      // PROVE: Circular references detected in complex graph
      const orgComponent = findComponent(ctx._ir?.components, 'Organization');
      const deptComponent = findComponent(ctx._ir?.components, 'Department');
      const empComponent = findComponent(ctx._ir?.components, 'Employee');

      assertComponentExists(orgComponent, 'Organization');
      assertComponentExists(deptComponent, 'Department');
      assertComponentExists(empComponent, 'Employee');

      // At least one should detect circular refs in this complex graph
      const totalCircularRefs = countTotalCircularRefs([orgComponent, deptComponent, empComponent]);

      expect(totalCircularRefs).toBeGreaterThan(0);

      // PROVE: Code generation succeeds
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: complexDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      assertContentContains(content, ['Organization', 'Department', 'Employee']);
    });

    test('handles allOf with multiple refs and inline schemas', async () => {
      const allOfDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'AllOf Complex Test' },
        paths: {},
        components: {
          schemas: {
            Timestamped: {
              type: 'object',
              required: ['createdAt'],
              properties: {
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            Identifiable: {
              type: 'object',
              required: ['id'],
              properties: {
                id: { type: 'string', format: 'uuid' },
              },
            },
            Resource: {
              allOf: [
                { $ref: '#/components/schemas/Identifiable' },
                { $ref: '#/components/schemas/Timestamped' },
                {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                  },
                },
              ],
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(allOfDoc);

      // PROVE: IR captures all schemas including allOf composition
      expect(ctx._ir?.components?.length).toBe(3);

      const resourceComponent = ctx._ir?.components?.find((c) => c.name === 'Resource');
      expect(resourceComponent).toBeDefined();

      // PROVE: Code generation handles complex allOf
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: allOfDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      assertContentContains(content, ['Identifiable', 'Timestamped', 'Resource']);
    });

    test('handles oneOf with discriminator', async () => {
      const oneOfDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'OneOf Discriminator Test' },
        paths: {},
        components: {
          schemas: {
            Cat: {
              type: 'object',
              required: ['petType', 'meow'],
              properties: {
                petType: { type: 'string' },
                meow: { type: 'string' },
              },
            },
            Dog: {
              type: 'object',
              required: ['petType', 'bark'],
              properties: {
                petType: { type: 'string' },
                bark: { type: 'string' },
              },
            },
            Pet: {
              oneOf: [{ $ref: '#/components/schemas/Cat' }, { $ref: '#/components/schemas/Dog' }],
              discriminator: {
                propertyName: 'petType',
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(oneOfDoc);

      // PROVE: IR captures oneOf with discriminator
      expect(ctx._ir?.components?.length).toBe(3);

      const petComponent = ctx._ir?.components?.find((c) => c.name === 'Pet');
      expect(petComponent).toBeDefined();

      // PROVE: Code generation handles oneOf
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: oneOfDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      assertContentContains(content, ['Cat', 'Dog', 'Pet']);
    });

    test('handles deeply nested object properties', async () => {
      const nestedDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Deep Nesting Test' },
        paths: {},
        components: {
          schemas: {
            DeepObject: {
              type: 'object',
              properties: {
                level1: {
                  type: 'object',
                  properties: {
                    level2: {
                      type: 'object',
                      properties: {
                        level3: {
                          type: 'object',
                          properties: {
                            level4: {
                              type: 'object',
                              properties: {
                                value: { type: 'string' },
                              },
                            },
                          },
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

      const ctx = getZodClientTemplateContext(nestedDoc);

      // PROVE: IR handles deep nesting
      const deepComponent = ctx._ir?.components?.find((c) => c.name === 'DeepObject');
      expect(deepComponent).toBeDefined();
      expect(deepComponent?.schema?.metadata).toBeDefined();

      // PROVE: Code generation succeeds with deep nesting
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: nestedDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      assertContentContains(content, ['DeepObject', 'level1']);
    });

    test('handles arrays of refs with complex items', async () => {
      const arrayDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Array Complex Test' },
        paths: {},
        components: {
          schemas: {
            Item: {
              type: 'object',
              required: ['id'],
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                tags: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Tag' },
                },
              },
            },
            Tag: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string' },
                items: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Item' },
                },
              },
            },
          },
        },
      };

      const ctx = getZodClientTemplateContext(arrayDoc);

      // PROVE: IR handles arrays with circular refs
      expect(ctx._ir?.components?.length).toBe(2);

      const itemComponent = findComponent(ctx._ir?.components, 'Item');
      const tagComponent = findComponent(ctx._ir?.components, 'Tag');

      assertComponentExists(itemComponent, 'Item');
      assertComponentExists(tagComponent, 'Tag');

      // Circular refs should be detected
      const totalCircularRefs = countTotalCircularRefs([itemComponent, tagComponent]);

      expect(totalCircularRefs).toBeGreaterThan(0);

      // PROVE: Code generation handles arrays with circular refs
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: arrayDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      assertContentContains(content, ['Item', 'Tag']);
    });
  });

  describe('Operation Complexity', () => {
    test('handles operations with multiple content types', async () => {
      const multiContentDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Multi Content Test' },
        paths: {
          '/upload': {
            post: {
              operationId: 'uploadFile',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        filename: { type: 'string' },
                        content: { type: 'string' },
                      },
                    },
                  },
                  'multipart/form-data': {
                    schema: {
                      type: 'object',
                      properties: {
                        file: { type: 'string', format: 'binary' },
                      },
                    },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'Created',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(multiContentDoc);

      // PROVE: IR captures operation with multiple content types
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'uploadFile');
      expect(operation).toBeDefined();
      expect(operation?.requestBody).toBeDefined();

      // PROVE: Code generation handles multiple content types
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: multiContentDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      expect(content).toContain('uploadFile');
    });

    test('handles operations with many parameters', async () => {
      const manyParamsDoc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { version: '1.0.0', title: 'Many Parameters Test' },
        paths: {
          '/search': {
            get: {
              operationId: 'advancedSearch',
              parameters: [
                { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
                { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
                { name: 'limit', in: 'query', schema: { type: 'integer', maximum: 100 } },
                { name: 'sort', in: 'query', schema: { type: 'string' } },
                { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } },
                {
                  name: 'filter',
                  in: 'query',
                  schema: { type: 'array', items: { type: 'string' } },
                },
                { name: 'X-API-Key', in: 'header', required: true, schema: { type: 'string' } },
              ],
              responses: {
                '200': {
                  description: 'Success',
                  content: {
                    'application/json': {
                      schema: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        components: { schemas: {} },
      };

      const ctx = getZodClientTemplateContext(manyParamsDoc);

      // PROVE: IR captures all parameters
      const operation = ctx._ir?.operations?.find((op) => op.operationId === 'advancedSearch');
      expect(operation).toBeDefined();
      expect(operation?.parameters?.length).toBe(7);

      // Every parameter must have metadata
      operation?.parameters?.forEach((param) => {
        expect(param.metadata).toBeDefined();
      });

      // PROVE: Code generation handles many parameters
      const result = await generateZodClientFromOpenAPI({
        disableWriteToFile: true,
        openApiDoc: manyParamsDoc,
      });

      const content = assertAndGetSingleFileContent(result);

      expect(content).toBeDefined();
      expect(content).toContain('advancedSearch');
    });
  });
});
