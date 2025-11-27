/**
 * IR Characterization Tests - Complex Schema Patterns
 *
 * PROVES: IR system works correctly on complex schema patterns like circular refs, allOf, oneOf, etc.
 *
 * @module ir-real-world.complex.char.test
 */

import { generateZodClientFromOpenAPI } from '../../index.js';
import { getZodClientTemplateContext } from '../../context/template-context.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import {
  assertAndGetSingleFileContent,
  findComponent,
  countTotalCircularRefs,
  assertComponentExists,
  assertContentContains,
} from '../ir-test-helpers.js';

describe('IR Characterization - Real-World Specs', () => {
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
});
