import { describe, expect, it } from 'vitest';
import type { ComponentsObject } from 'openapi3-ts/oas31';

import { buildCastrSchemas } from './index.js';
import { assertSchemaComponent } from '../../ir/index.js';

describe('buildCastrSchemas object keyword preservation', () => {
  it('should preserve strict unknown-key behavior from additionalProperties false', () => {
    const components: ComponentsObject = {
      schemas: {
        StrictObject: {
          type: 'object',
          additionalProperties: false,
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(false);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('should infer object type from additionalProperties false without explicit type', () => {
    const components: ComponentsObject = {
      schemas: {
        StrictObject: {
          additionalProperties: false,
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.type).toBe('object');
    expect(schema.additionalProperties).toBe(false);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strict' });
  });

  it('should preserve strip unknown-key behavior from the governed extension', () => {
    const components: ComponentsObject = {
      schemas: {
        StripObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'strip',
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'strip' });
  });

  it('should preserve passthrough unknown-key behavior from the governed extension', () => {
    const components: ComponentsObject = {
      schemas: {
        PassthroughObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'passthrough',
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(schema.additionalProperties).toBe(true);
    expect(schema.unknownKeyBehavior).toEqual({ mode: 'passthrough' });
  });

  it('should preserve catchall unknown-key behavior from schema-valued additionalProperties', () => {
    const components: ComponentsObject = {
      schemas: {
        CatchallObject: {
          type: 'object',
          additionalProperties: { type: 'string' },
        },
      },
    };

    const result = buildCastrSchemas(components);
    const schema = assertSchemaComponent(result[0]).schema;

    expect(typeof schema.additionalProperties).toBe('object');
    expect(schema.unknownKeyBehavior?.mode).toBe('catchall');
    if (
      typeof schema.additionalProperties === 'object' &&
      schema.unknownKeyBehavior?.mode === 'catchall'
    ) {
      expect(schema.additionalProperties.type).toBe('string');
      expect(schema.unknownKeyBehavior.schema.type).toBe('string');
    }
  });

  it('should reject invalid x-castr-unknownKeyBehavior values', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidObject: {
          type: 'object',
          additionalProperties: true,
          'x-castr-unknownKeyBehavior': 'strict',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /Invalid x-castr-unknownKeyBehavior value "strict"/,
    );
  });

  it('should reject x-castr-unknownKeyBehavior without additionalProperties true', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidObject: {
          type: 'object',
          'x-castr-unknownKeyBehavior': 'passthrough',
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /x-castr-unknownKeyBehavior requires additionalProperties: true/,
    );
  });

  it('should reject object-only keywords on non-object schemas', () => {
    const components: ComponentsObject = {
      schemas: {
        InvalidString: {
          type: 'string',
          additionalProperties: true,
        },
      },
    };

    expect(() => buildCastrSchemas(components)).toThrow(
      /Object-only keywords properties, required, additionalProperties, and x-castr-unknownKeyBehavior require an object schema type/,
    );
  });
});
