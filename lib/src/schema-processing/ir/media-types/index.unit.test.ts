import { describe, expect, it } from 'vitest';
import type { ReferenceObject } from '../../../shared/openapi-types.js';
import { createMockCastrDocument, createMockCastrSchema } from '../test-helpers.js';
import type { IRMediaTypeReference } from '../models/schema.operations.js';
import {
  getItemSchemaFromIRMediaTypeEntry,
  getSchemaFromIRMediaTypeEntry,
  resolveIRMediaTypeEntry,
} from './index.js';

function createMediaTypeRef(ref: IRMediaTypeReference['$ref']): IRMediaTypeReference {
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

  it('resolves x-ext media type refs to inline IR media types', () => {
    const schema = createMockCastrSchema({ type: 'object' });
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'JsonEnvelope',
          xExtKey: 'abc123',
          mediaType: {
            schema,
          },
        },
      ],
    });

    const resolved = resolveIRMediaTypeEntry(
      document,
      createMediaTypeRef('#/x-ext/abc123/components/mediaTypes/JsonEnvelope'),
      '#/paths/~1users/get/responses/200/content/application~1json',
    );

    expect(resolved.schema).toBe(schema);
  });

  it('distinguishes local and x-ext media type components with the same name', () => {
    const localSchema = createMockCastrSchema({ type: 'object' });
    const externalSchema = createMockCastrSchema({ type: 'string' });
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'JsonEnvelope',
          mediaType: {
            schema: localSchema,
          },
        },
        {
          type: 'mediaType',
          name: 'JsonEnvelope',
          xExtKey: 'abc123',
          mediaType: {
            schema: externalSchema,
          },
        },
      ],
    });

    expect(
      resolveIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/components/mediaTypes/JsonEnvelope'),
        '#/components/mediaTypes/JsonEnvelope',
      ).schema,
    ).toBe(localSchema);

    expect(
      resolveIRMediaTypeEntry(
        document,
        createMediaTypeRef('#/x-ext/abc123/components/mediaTypes/JsonEnvelope'),
        '#/x-ext/abc123/components/mediaTypes/JsonEnvelope',
      ).schema,
    ).toBe(externalSchema);
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

  it('resolves reusable media type itemSchema separately from the full schema', () => {
    const schema = createMockCastrSchema({ type: 'array' });
    const itemSchema = createMockCastrSchema({ type: 'string' });
    const document = createMockCastrDocument({
      components: [
        {
          type: 'mediaType',
          name: 'EventStream',
          mediaType: {
            schema,
            itemSchema,
          },
        },
      ],
    });

    const ref = createMediaTypeRef('#/components/mediaTypes/EventStream');

    expect(
      getSchemaFromIRMediaTypeEntry(document, ref, '#/components/mediaTypes/EventStream'),
    ).toBe(schema);
    expect(
      getItemSchemaFromIRMediaTypeEntry(document, ref, '#/components/mediaTypes/EventStream'),
    ).toBe(itemSchema);
  });

  it('fails fast when a ref points at a non-media-type component', () => {
    const document = createMockCastrDocument();

    expect(() =>
      resolveIRMediaTypeEntry(
        document,
        { $ref: '#/components/schemas/User' } satisfies ReferenceObject,
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
