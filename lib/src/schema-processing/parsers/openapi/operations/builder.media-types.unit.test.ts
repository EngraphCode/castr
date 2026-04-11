import { describe, expect, it } from 'vitest';
import type { OpenAPIDocument } from '../../../../shared/openapi-types.js';
import { buildIRMediaType, deriveSchemaFromMediaTypeEntries } from './builder.media-types.js';

const mockDocument: OpenAPIDocument = {
  openapi: '3.2.0',
  info: { title: 'Media Type Builder', version: '1.0.0' },
  paths: {},
};

describe('buildIRMediaType', () => {
  it('parses both schema and itemSchema from OpenAPI 3.2 media types', () => {
    const result = buildIRMediaType(
      {
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        itemSchema: {
          type: 'string',
          minLength: 1,
        },
        example: 'alpha',
      },
      {
        doc: mockDocument,
        path: ['paths', '/phase-e', 'query', 'responses', '200', 'content', 'application/x-ndjson'],
        required: false,
      },
    );

    expect(result.schema?.type).toBe('array');
    expect(result.itemSchema?.type).toBe('string');
    expect(result.itemSchema?.minLength).toBe(1);
    expect(result.example).toBe('alpha');
  });

  it('derives a compatibility schema from itemSchema when schema is absent', () => {
    const result = deriveSchemaFromMediaTypeEntries(
      {
        'application/x-ndjson': {
          itemSchema: {
            type: 'string',
            minLength: 1,
          },
        },
      },
      {
        doc: mockDocument,
        path: ['paths', '/phase-e', 'query', 'parameters', 'phase-e-filter'],
        required: false,
      },
      ['paths', '/phase-e', 'query', 'parameters', 'phase-e-filter', 'content'],
    );

    expect(result?.type).toBe('string');
    expect(result?.minLength).toBe(1);
  });
});
