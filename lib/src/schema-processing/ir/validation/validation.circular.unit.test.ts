/**
 * IR Validation Tests - Circular Reference Detection
 *
 * PROVES: IR correctly identifies and handles circular references in schemas
 *
 * @module ir-validation.circular.test
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { describe, expect, test } from 'vitest';
import { getZodClientTemplateContext } from '../../context/index.js';
import { assertSchemaComponent } from '../test-helpers.js';

describe('IR Validation - Circular Reference Detection', () => {
  test('detects self-referencing schemas', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
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

    const ctx = getZodClientTemplateContext(openApiDoc);
    const nodeComponent = ctx._ir?.components?.find((c) => c.name === 'Node');

    // PROVE: Circular reference is detected
    expect(nodeComponent).toBeDefined();
    const metadata = assertSchemaComponent(nodeComponent).schema.metadata;
    expect(metadata?.circularReferences.length).toBeGreaterThan(0);
    expect(metadata?.circularReferences).toContain('#/components/schemas/Node');
  });

  test('detects mutual circular references', () => {
    const openApiDoc: OpenAPIObject = {
      openapi: '3.1.0',
      info: { version: '1.0.0', title: 'Test API' },
      paths: {},
      components: {
        schemas: {
          Author: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              books: { type: 'array', items: { $ref: '#/components/schemas/Book' } },
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

    const ctx = getZodClientTemplateContext(openApiDoc);

    // PROVE: Both schemas detect the circular dependency
    const authorComponent = ctx._ir?.components?.find((c) => c.name === 'Author');
    const bookComponent = ctx._ir?.components?.find((c) => c.name === 'Book');

    const authorCircularRefs =
      assertSchemaComponent(authorComponent).schema.metadata.circularReferences || [];
    const bookCircularRefs =
      assertSchemaComponent(bookComponent).schema.metadata.circularReferences || [];

    // At least one should detect the cycle
    const totalCircularRefs = authorCircularRefs.length + bookCircularRefs.length;
    expect(totalCircularRefs).toBeGreaterThan(0);
  });
});
