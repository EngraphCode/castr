/**
 * Unit tests for OpenAPI-side $ref sibling carrying (H4).
 *
 * OpenAPI 3.1+ schemas use the JSON Schema 2020-12 dialect, where sibling
 * keywords next to $ref apply. The IR builder must carry them instead of
 * silently dropping everything except the reference.
 */

import { describe, expect, it } from 'vitest';

import type { ComponentsObject } from '../../../shared/openapi-types.js';

import { buildCastrSchemas } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';

describe('buildCastrSchemas $ref sibling carrying', () => {
  it('carries description, minLength, and title siblings alongside $ref', () => {
    const components: ComponentsObject = {
      schemas: {
        Base: { type: 'string' },
        Alias: {
          $ref: '#/components/schemas/Base',
          description: 'hi',
          minLength: 5,
          title: 'T',
        },
      },
    };

    const result = buildCastrSchemas(components);

    const alias = result.find((component) => component.name === 'Alias');
    expect(alias).toBeDefined();
    if (alias === undefined) {
      throw new Error('Expected Alias component');
    }
    const schema = assertSchemaComponent(alias).schema;
    expect(schema.$ref).toBe('#/components/schemas/Base');
    expect(schema.description).toBe('hi');
    expect(schema.minLength).toBe(5);
    expect(schema.title).toBe('T');
  });

  it('keeps pure $ref nodes minimal', () => {
    const components: ComponentsObject = {
      schemas: {
        Base: { type: 'string' },
        Alias: { $ref: '#/components/schemas/Base' },
      },
    };

    const result = buildCastrSchemas(components);

    const alias = result.find((component) => component.name === 'Alias');
    expect(alias).toBeDefined();
    if (alias === undefined) {
      throw new Error('Expected Alias component');
    }
    const schema = assertSchemaComponent(alias).schema;
    expect(Object.keys(schema).sort()).toEqual(['$ref', 'metadata']);
  });
});
