import { describe, expect, it } from 'vitest';
import type { SchemaObject } from 'openapi3-ts/oas31';

import { convertOpenApiSchemaToJsonSchema } from './convert-schema.js';
import { createDraft07Validator } from './test-utils.js';

describe('Draft 07 validation harness', () => {
  it('validates generated schemas against the draft-07 meta-schema', () => {
    const openApiSchema = {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 1 },
        tags: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
      },
      required: ['title'],
      additionalProperties: false,
    } satisfies SchemaObject;

    const jsonSchema = convertOpenApiSchemaToJsonSchema(openApiSchema);
    const validator = createDraft07Validator();

    const isValid = validator.validateSchema(jsonSchema);

    expect(isValid).toBe(true);
    expect(validator.errors).toBeNull();
  });

  it('exposes a helper for validating data against generated schemas', () => {
    const openApiSchema = {
      type: 'string',
      minLength: 3,
    } satisfies SchemaObject;

    const jsonSchema = convertOpenApiSchemaToJsonSchema(openApiSchema);
    const validator = createDraft07Validator();
    const validate = validator.compile(jsonSchema);

    expect(validate('foo')).toBe(true);
    expect(validate('f')).toBe(false);
    expect(validate.errors?.[0]?.keyword).toBe('minLength');
  });
});
