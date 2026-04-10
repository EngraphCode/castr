import { describe, expect, it } from 'vitest';
import type { ReferenceObject } from '../../../shared/openapi-types.js';
import { createMockCastrDocument, createMockCastrSchema } from '../test-helpers.js';
import { getSchemaFromIRMediaTypeEntry, resolveIRMediaTypeEntry } from './index.js';

function createMediaTypeRef(ref: string): ReferenceObject {
  return { $ref: ref };
}

describe('resolveIRMediaTypeEntry', () => {
  it('resolves reusable media type refs to inline IR media types', () => {
    const schema = createMockCastrSchema({ type: 'object' });
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'JsonEnvelope',
          mediaType: {
            schema,
            example: { ok: true },
          },
        },
      ],
    });

    const resolved = resolveIRMediaTypeEntry(
      document,
      createMediaTypeRef('#/components/mediaTypes/JsonEnvelope'),
      '#/paths/~1users/get/responses/200/content/application~1json',
    );

    expect(resolved.schema).toBe(schema);
    expect(resolved.example).toEqual({ ok: true });
  });

  it('returns undefined schema for schema-less reusable media types', () => {
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'PlainText',
          mediaType: {
            example: 'hello world',
          },
        },
      ],
    });

    expect(
      getSchemaFromIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/components/mediaTypes/PlainText'),
        '#/components/mediaTypes/PlainText',
      ),
    ).toBeUndefined();
  });

  it('fails fast when a ref points at a non-media-type component', () => {
    const document = createMockCastrDocument();

    expect(() =>
      resolveIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/components/schemas/User'),
        '#/paths/~1users/get/responses/200/content/application~1json',
      ),
    ).toThrow('Unsupported IR media type reference');
  });

  it('fails fast when a media type component ref is missing', () => {
    const document = createMockCastrDocument();

    expect(() =>
      resolveIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/components/mediaTypes/Missing'),
        '#/paths/~1users/get/responses/200/content/application~1json',
      ),
    ).toThrow('Unresolvable IR media type reference');
  });

  it('fails fast on circular media type component refs', () => {
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'A',
          mediaType: createMediaTypeRef('#/components/mediaTypes/B'),
        },
        {
          type: 'mediaType',
          name: 'B',
          mediaType: createMediaTypeRef('#/components/mediaTypes/A'),
        },
      ],
    });

    expect(() =>
      resolveIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/components/mediaTypes/A'),
        '#/components/mediaTypes/A',
      ),
    ).toThrow('Circular IR media type reference');
  });
});
