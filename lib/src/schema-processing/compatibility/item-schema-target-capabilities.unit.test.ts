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

  it('rejects itemSchema for TypeScript with the full policy-honest fail-fast message', () => {
    const document = createStreamingResponseDocument();
    const act = (): void =>
      assertDocumentSupportsItemSchemaTargetCapabilities(document, 'TypeScript');

    expect(act).toThrow(
      'Castr does not map OpenAPI 3.2 itemSchema to TypeScript output. ' +
        'itemSchema is supported on the OpenAPI parser -> IR -> OpenAPI writer round-trip only. ' +
        'Emitting this document to TypeScript would silently drop the sequential media-type ' +
        'item contract, so Castr deliberately fails fast. ' +
        'Found itemSchema at GET /stream responses/200/application/x-ndjson.',
    );
  });

  it.each(ITEM_SCHEMA_TARGETS)(
    'states the deliberate policy for %s instead of framing itemSchema as unimplemented work',
    (target) => {
      const document = createStreamingResponseDocument();
      const act = (): void => assertDocumentSupportsItemSchemaTargetCapabilities(document, target);

      expect(act).toThrow(`Castr does not map OpenAPI 3.2 itemSchema to ${target} output.`);
      expect(act).not.toThrow('does not yet support');
    },
  );
});
