import { describe, expect, it } from 'vitest';
import type { ComponentsObject } from 'openapi3-ts/oas31';
import { buildCastrSchemas } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';

describe('buildCastrSchemas integer semantics', () => {
  it('preserves int64 semantics distinctly in IR', () => {
    const components: ComponentsObject = {
      schemas: {
        Count: {
          type: 'integer',
          format: 'int64',
        },
      },
    };

    const result = buildCastrSchemas(components);

    expect(result).toHaveLength(1);
    expect(assertSchemaComponent(result[0]).schema.integerSemantics).toBe('int64');
  });

  it('preserves nullable int64 semantics distinctly in IR', () => {
    const components: ComponentsObject = {
      schemas: {
        Count: {
          type: ['integer', 'null'],
          format: 'int64',
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(result).toHaveLength(1);
    expect(schema.type).toBe('integer');
    expect(schema.metadata.nullable).toBe(true);
    expect(schema.integerSemantics).toBe('int64');
  });

  it('rejects custom bigint integer formats because OpenAPI has no native bigint type', () => {
    const components: ComponentsObject = {
      schemas: {
        Count: {
          type: 'integer',
          format: 'bigint',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /OpenAPI 3\.1 cannot represent arbitrary-precision bigint natively/,
    );
  });
});
