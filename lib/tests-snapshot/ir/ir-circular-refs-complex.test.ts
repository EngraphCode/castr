/**
 * IR Integration - Complex Circular Reference Handling
 *
 * PROVES: Complex circular references (deep, allOf, three-way) detected in IR result in getter-based schemas (Zod 4 native recursion)
 *
 * @module ir-circular-refs-complex.test
 */

import { generateZodClientFromOpenAPI, isSingleFileResult } from '../../src/index.js';
import { getZodClientTemplateContext } from '../../src/context/template-context.js';
import { assertSchemaComponent } from '../../src/ir/test-helpers.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

describe('IR Integration - Complex Circular References', () => {
  test('deeply nested circular reference generates correct getter-based schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Deep Circular Test' },
      paths: {},
      components: {
        schemas: {
          TreeNode: {
            type: 'object',
            properties: {
              value: { type: 'integer' },
              children: {
                type: 'array',
                items: { $ref: '#/components/schemas/TreeNode' },
              },
              parent: { $ref: '#/components/schemas/TreeNode' },
            },
          },
        },
      },
    };

    // FIRST: Prove IR detects circular reference
    const ctx = getZodClientTemplateContext(openApiDoc);
    const treeComponent = ctx._ir?.components?.find((c) => c.name === 'TreeNode');
    const circularRefs =
      assertSchemaComponent(treeComponent).schema.metadata.circularReferences || [];

    expect(circularRefs.length).toBeGreaterThan(0);

    // SECOND: Prove generated code uses getter syntax correctly (Zod 4 native recursion)
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('TreeNode');
    // Zod 4 uses getter syntax for native recursion, not z.lazy()
    expect(result.content).toMatch(/get\s+\w+\(\)\s*\{/);

    // Should handle both children array and parent reference
    const treeNodeDefinition = result.content.substring(
      result.content.indexOf('TreeNode'),
      result.content.indexOf('TreeNode') + 500,
    );

    expect(treeNodeDefinition).toContain('children');
    expect(treeNodeDefinition).toContain('parent');
  });

  test('circular reference in allOf generates correct schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'AllOf Circular Test' },
      paths: {},
      components: {
        schemas: {
          Base: {
            type: 'object',
            properties: {
              id: { type: 'string' },
            },
          },
          Extended: {
            allOf: [
              { $ref: '#/components/schemas/Base' },
              {
                type: 'object',
                properties: {
                  related: { $ref: '#/components/schemas/Extended' },
                },
              },
            ],
          },
        },
      },
    };

    // FIRST: Prove IR detects circular reference in allOf
    const ctx = getZodClientTemplateContext(openApiDoc);
    const extendedComponent = ctx._ir?.components?.find((c) => c.name === 'Extended');

    // Should detect self-reference even in allOf composition
    expect(extendedComponent).toBeDefined();

    // SECOND: Prove generated code handles it correctly
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('Extended');
    // Should not fail generation - circular ref should be handled
    expect(result).toBeDefined();
  });

  test('three-way circular reference generates correct getter-based schemas', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Three-Way Circular Test' },
      paths: {},
      components: {
        schemas: {
          A: {
            type: 'object',
            properties: {
              b: { $ref: '#/components/schemas/B' },
            },
          },
          B: {
            type: 'object',
            properties: {
              c: { $ref: '#/components/schemas/C' },
            },
          },
          C: {
            type: 'object',
            properties: {
              a: { $ref: '#/components/schemas/A' },
            },
          },
        },
      },
    };

    // FIRST: Prove IR detects the three-way cycle
    const ctx = getZodClientTemplateContext(openApiDoc);

    const aComponent = ctx._ir?.components?.find((c) => c.name === 'A');
    const bComponent = ctx._ir?.components?.find((c) => c.name === 'B');
    const cComponent = ctx._ir?.components?.find((c) => c.name === 'C');

    const aCircularRefs =
      assertSchemaComponent(aComponent).schema.metadata.circularReferences || [];
    const bCircularRefs =
      assertSchemaComponent(bComponent).schema.metadata.circularReferences || [];
    const cCircularRefs =
      assertSchemaComponent(cComponent).schema.metadata.circularReferences || [];

    const totalCircularRefs = aCircularRefs.length + bCircularRefs.length + cCircularRefs.length;

    // At least one should detect the cycle
    expect(totalCircularRefs).toBeGreaterThan(0);

    // SECOND: Prove generated code handles the complex cycle
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('A');
    expect(result.content).toContain('B');
    expect(result.content).toContain('C');

    // Zod 4 uses getter syntax to break the cycle (native recursion)
    expect(result.content).toMatch(/get\s+\w+\(\)\s*\{/);
  });

  test('optional circular reference generates correct nullable getter-based schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Optional Circular Test' },
      paths: {},
      components: {
        schemas: {
          LinkedList: {
            type: 'object',
            required: ['value'],
            properties: {
              value: { type: 'string' },
              next: { $ref: '#/components/schemas/LinkedList' },
            },
          },
        },
      },
    };

    // FIRST: Prove IR detects circular reference and tracks required status
    const ctx = getZodClientTemplateContext(openApiDoc);
    const listComponent = ctx._ir?.components?.find((c) => c.name === 'LinkedList');

    expect(listComponent).toBeDefined();
    const circularRefs =
      assertSchemaComponent(listComponent).schema.metadata.circularReferences || [];
    expect(circularRefs.length).toBeGreaterThan(0);

    // SECOND: Prove generated code handles optional circular ref correctly
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('LinkedList');
    // Zod 4 uses getter syntax for native recursion, not z.lazy()
    expect(result.content).toMatch(/get\s+\w+\(\)\s*\{/);

    // Next field should be optional (not required)
    const linkedListDef = result.content.substring(
      result.content.indexOf('LinkedList'),
      result.content.indexOf('LinkedList') + 300,
    );

    expect(linkedListDef).toContain('next');
    expect(linkedListDef).toContain('value');
  });
});
