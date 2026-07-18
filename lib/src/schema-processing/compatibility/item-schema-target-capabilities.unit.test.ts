import { describe, expect, it } from 'vitest';
import { createMockCastrDocument, createMockCastrSchema } from '../ir/index.js';
import type { CastrDocument } from '../ir/index.js';
import { assertDocumentSupportsItemSchemaTargetCapabilities } from './item-schema-target-capabilities.js';

const ITEM_SCHEMA_TARGETS = ['Endpoints', 'MCP', 'TypeScript'] as const;

function createStreamingResponseDocument(): CastrDocument {
  return createMockCastrDocument({
    operations: [
      {
        method: 'get',
        path: '/stream',
        parameters: [],
        parametersByLocation: { query: [], path: [], header: [], cookie: [] },
        responses: [
          {
            statusCode: '200',
            content: {
              'application/x-ndjson': {
                itemSchema: createMockCastrSchema({ type: 'string' }),
              },
            },
          },
        ],
      },
    ],
  });
}

describe('assertDocumentSupportsItemSchemaTargetCapabilities', () => {
  it('accepts documents without itemSchema', () => {
    const document = createMockCastrDocument({
      operations: [
        {
          method: 'get',
          path: '/plain',
          parameters: [],
          parametersByLocation: { query: [], path: [], header: [], cookie: [] },
          responses: [
            {
              statusCode: '200',
              content: {
                'application/json': { schema: createMockCastrSchema({ type: 'string' }) },
              },
            },
          ],
        },
      ],
    });

    expect(() =>
      assertDocumentSupportsItemSchemaTargetCapabilities(document, 'TypeScript'),
    ).not.toThrow();
  });

  it('rejects itemSchema for TypeScript with the full unimplemented-mapping fail-fast message', () => {
    const document = createStreamingResponseDocument();
    const act = (): void =>
      assertDocumentSupportsItemSchemaTargetCapabilities(document, 'TypeScript');

    expect(act).toThrow(
      'The OpenAPI 3.2 itemSchema sequential media-type item contract is representable in ' +
        'TypeScript output, but Castr has not yet implemented that mapping. ' +
        'itemSchema currently survives the OpenAPI parser -> IR -> OpenAPI writer round-trip only. ' +
        'Castr fails fast rather than silently dropping the item contract. ' +
        'Found itemSchema at GET /stream responses/200/application/x-ndjson.',
    );
  });

  it.each(ITEM_SCHEMA_TARGETS)(
    'states the representable-but-unimplemented mapping for %s and fails fast without claiming impossibility',
    (target) => {
      const document = createStreamingResponseDocument();
      const act = (): void => assertDocumentSupportsItemSchemaTargetCapabilities(document, target);

      expect(act).toThrow(
        `is representable in ${target} output, but Castr has not yet implemented that mapping.`,
      );
      expect(act).toThrow('fails fast rather than silently dropping the item contract');
      expect(act).not.toThrow('.agent/');
      expect(act).not.toThrow('does not map');
      expect(act).not.toThrow('deliberately fails fast');
    },
  );
});
