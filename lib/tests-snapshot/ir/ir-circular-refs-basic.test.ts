/**
 * IR Integration - Basic Circular Reference Handling
 *
 * PROVES: Basic circular references (self, mutual) detected in IR result in getter-based schemas (Zod 4 native recursion)
 *
 * @module ir-circular-refs-basic.test
 */

import { generateZodClientFromOpenAPI, isSingleFileResult } from '../../src/index.js';
import { getZodClientTemplateContext } from '../../src/schema-processing/context/template-context.js';
import { assertSchemaComponent } from '../../src/schema-processing/ir/test-helpers.js';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';

describe('IR Integration - Basic Circular References', () => {
  test('self-referencing schema generates getter-based Zod schema', async () => {
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
    const circularRefs =
      assertSchemaComponent(nodeComponent).schema.metadata.circularReferences || [];

    expect(circularRefs.length).toBeGreaterThan(0);
    expect(circularRefs).toContain('#/components/schemas/Node');

    // SECOND: Prove generated code uses getter syntax for circular ref (Zod 4 native recursion)
    const result = await generateZodClientFromOpenAPI({
      disableWriteToFile: true,
      openApiDoc,
    });

    // Type guard: narrows result to single file
    if (!isSingleFileResult(result)) {
      throw new Error('Expected single file result');
    }

    expect(result.content).toContain('Node');
    // Zod 4 uses getter syntax for native recursion, not z.lazy()
    expect(result.content).toMatch(/get\s+\w+\(\)\s*\{/);
  });

  test('mutual circular references generate getter-based schemas', async () => {
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

    const authorCircularRefs =
      assertSchemaComponent(authorComponent).schema.metadata.circularReferences || [];
    const bookCircularRefs =
      assertSchemaComponent(bookComponent).schema.metadata.circularReferences || [];

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

    // Zod 4 uses getter syntax to break the cycle (native recursion)
    expect(result.content).toMatch(/get\s+\w+\(\)\s*\{/);
  });
});
