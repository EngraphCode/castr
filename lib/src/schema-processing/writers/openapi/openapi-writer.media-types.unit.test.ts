import { describe, expect, it } from 'vitest';
import { createMockCastrSchema } from '../../ir/index.js';
import { writeMediaTypeEntry } from './openapi-writer.media-types.js';

describe('writeMediaTypeEntry', () => {
  it('writes itemSchema alongside schema for OpenAPI 3.2 streaming media types', () => {
    const result = writeMediaTypeEntry({
      schema: createMockCastrSchema({
        type: 'array',
        items: createMockCastrSchema({ type: 'string' }),
      }),
      itemSchema: createMockCastrSchema({
        type: 'string',
        minLength: 1,
      }),
      example: 'alpha',
    });

    if ('$ref' in result) {
      throw new Error('Expected an inline media type object');
    }

    expect(result.schema).toBeDefined();
    expect(result.itemSchema).toMatchObject({ type: 'string', minLength: 1 });
    expect(result.example).toBe('alpha');
  });
});
