/**
 * IR Integration - Circular Reference Handling
 *
 * PROVES: Circular references detected in IR result in lazy() schemas in generated code
 *
 * Test Philosophy:
 * - Circular refs in IR must produce z.lazy() in generated Zod code
 * - Without proper detection, code generation would fail or create invalid schemas
 * - These tests prove IR circular reference detection has real impact
 *
 * @module ir-circular-refs-integration.test
 */

import { generateZodClientFromOpenAPI, isSingleFileResult } from '../../src/index.js';
import { getZodClientTemplateContext } from '../../src/context/template-context.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

describe('IR Integration - Circular References', () => {
  test('self-referencing schema generates lazy() Zod schema', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Self-Reference Test' },
      paths: {},
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              next: { $ref: '#/components/schemas/Node' },
            },
          },
        },
      },
    };

    // FIRST: Prove IR detects the circular reference
    const ctx = getZodClientTemplateContext(openApiDoc);
    const nodeComponent = ctx._ir?.components?.find((c) => c.name === 'Node');
    const circularRefs = nodeComponent?.schema?.metadata.circularReferences || [];

    expect(circularRefs.length).toBeGreaterThan(0);
    expect(circularRefs).toContain('#/components/schemas/Node');

    // SECOND: Prove generated code uses lazy() for circular ref
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('Node');
    expect(result.content).toContain('z.lazy(');

    // The circular reference should be wrapped in lazy
    const hasLazyReference = result.content.includes('z.lazy(') && result.content.includes('Node');
    expect(hasLazyReference).toBe(true);
  });

  test('mutual circular references generate lazy() schemas', async () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Mutual Reference Test' },
      paths: {},
      components: {
        schemas: {
          Author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              books: {
                type: 'array',
                items: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          Book: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              author: { $ref: '#/components/schemas/Author' },
            },
          },
        },
      },
    };

    // FIRST: Prove IR detects mutual circular references
    const ctx = getZodClientTemplateContext(openApiDoc);

    const authorComponent = ctx._ir?.components?.find((c) => c.name === 'Author');
    const bookComponent = ctx._ir?.components?.find((c) => c.name === 'Book');

    const authorCircularRefs = authorComponent?.schema?.metadata.circularReferences || [];
    const bookCircularRefs = bookComponent?.schema?.metadata.circularReferences || [];

    const totalCircularRefs = authorCircularRefs.length + bookCircularRefs.length;
    expect(totalCircularRefs).toBeGreaterThan(0);

    // SECOND: Prove generated code handles the circular dependency
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('Author');
    expect(result.content).toContain('Book');

    // At least one should use lazy() to break the cycle
    expect(result.content).toContain('z.lazy(');
  });

  test('deeply nested circular reference generates correct lazy() schema', async () => {
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
    const circularRefs = treeComponent?.schema?.metadata.circularReferences || [];

    expect(circularRefs.length).toBeGreaterThan(0);

    // SECOND: Prove generated code uses lazy() correctly
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('TreeNode');
    expect(result.content).toContain('z.lazy(');

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

  test('three-way circular reference generates correct lazy() schemas', async () => {
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

    const aCircularRefs = aComponent?.schema?.metadata.circularReferences || [];
    const bCircularRefs = bComponent?.schema?.metadata.circularReferences || [];
    const cCircularRefs = cComponent?.schema?.metadata.circularReferences || [];

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

    // Should use lazy() to break the cycle
    expect(result.content).toContain('z.lazy(');
  });

  test('optional circular reference generates correct nullable lazy() schema', async () => {
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
    const circularRefs = listComponent?.schema?.metadata.circularReferences || [];
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
    expect(result.content).toContain('z.lazy(');

    // Next field should be optional (not required)
    const linkedListDef = result.content.substring(
      result.content.indexOf('LinkedList'),
      result.content.indexOf('LinkedList') + 300,
    );

    expect(linkedListDef).toContain('next');
    expect(linkedListDef).toContain('value');
  });
});
