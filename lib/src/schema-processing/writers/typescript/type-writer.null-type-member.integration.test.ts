/**
 * Runtime `null` members of OpenAPI 3.1 type arrays.
 *
 * Scalar's pipeline delivers a RUNTIME `null` member (YAML `- null`, JSON
 * `null`) where the specification requires the string token `'null'`. Both
 * denote the null type, so the TypeScript writer must render such members as
 * `null` — in lockstep with the Zod writer and the JSON Schema converter,
 * which already fold runtime null — never fall through to `unknown`.
 *
 * Drives the full public pipeline (prepare → context → write) so the
 * runtime-null shape reaches the writer exactly as production delivers it;
 * the IR's declared types cannot express the invalid member, so a unit-level
 * construction would need a forbidden type assertion.
 */

import { describe, expect, it } from 'vitest';
import { prepareOpenApiDocument } from '../../../shared/prepare-openapi-document.js';
import { getZodClientTemplateContext } from '../../context/index.js';
import { writeTypeScript } from './index.js';

async function generateFromDocument(document: object): Promise<string> {
  const openApiDoc = await prepareOpenApiDocument(document);
  const data = getZodClientTemplateContext(openApiDoc);
  const output = writeTypeScript({
    ...data,
    options: { ...data.options, apiClientName: 'api' },
  });
  return output.replace(/\s+/gu, ' ');
}

describe('type arrays with runtime null members', () => {
  const document = {
    openapi: '3.1.0',
    info: { title: 'Runtime Null Type Members', version: '1.0.0' },
    paths: {
      '/widgets': {
        get: {
          operationId: 'getWidget',
          responses: {
            '200': {
              description: 'A widget',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Widget' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        Widget: {
          type: 'object',
          additionalProperties: false,
          required: ['alpha', 'beta', 'gamma'],
          properties: {
            // YAML `- null` / JSON null: a runtime null member, not the token.
            alpha: { type: ['string', null] },
            // Token AND runtime null members together must render one branch.
            beta: { type: ['string', 'null', null] },
            // The declared-type set the enum intersection consults must admit
            // the runtime null member as the null type.
            gamma: { type: ['string', null], enum: ['a', null] },
          },
        },
      },
    },
  };

  it('renders a runtime null member as the null type, in lockstep with Zod', async () => {
    const output = await generateFromDocument(document);
    expect(output).toContain('alpha: string | null;');
    expect(output).toContain('z.string().nullable()');
    expect(output).not.toContain('string | unknown');
  });

  it('renders token and runtime null members as a single null branch', async () => {
    const output = await generateFromDocument(document);
    expect(output).toContain('beta: string | null;');
    expect(output).not.toContain('null | null');
  });

  it('admits null enum members against a runtime null type member', async () => {
    const output = await generateFromDocument(document);
    expect(output).toContain('gamma: "a" | null;');
  });
});
