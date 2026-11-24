import { describe, expect, it } from 'vitest';

import { IR_SCHEMA_VERSION, isCastrDocument } from '../../../ir/index.js';
import { writeOpenApi } from '../../../writers/openapi/index.js';
import { buildIR } from '../index.js';

const text = { 'application/json': { schema: { type: 'string' } } };

const DOCUMENT: object = {
  openapi: '3.1.0',
  info: { title: 'things given by reference', version: '1' },
  paths: {
    '/things': {
      post: {
        operationId: 'makeThing',
        parameters: [
          { $ref: '#/components/parameters/Page' },
          { name: 'own', in: 'query', schema: { type: 'string' } },
        ],
        requestBody: { $ref: '#/components/requestBodies/Thing' },
        responses: {
          '200': { $ref: '#/components/responses/Made' },
          '201': {
            description: 'made here',
            headers: {
              'X-Rate': { $ref: '#/components/headers/Rate' },
              'X-Own': { schema: { type: 'string' } },
            },
          },
        },
      },
    },
  },
  components: {
    parameters: { Page: { name: 'page', in: 'query', schema: { type: 'integer' } } },
    requestBodies: { Thing: { content: text } },
    responses: { Made: { description: 'made', content: text } },
    headers: { Rate: { schema: { type: 'integer' } } },
  },
};

describe('what an operation is given by reference (SPEC-PR-3)', () => {
  const [operation] = buildIR(DOCUMENT).operations;

  it('keeps the reference of a parameter, and holds what it points to', () => {
    expect(operation?.parameters.map((parameter) => [parameter.name, parameter.ref])).toEqual([
      ['page', '#/components/parameters/Page'],
      ['own', undefined],
    ]);
  });

  it('keeps the reference of a request body', () => {
    expect(operation?.requestBody?.ref).toBe('#/components/requestBodies/Thing');
    expect(Object.keys(operation?.requestBody?.content ?? {})).toEqual(['application/json']);
  });

  it('keeps the reference of a response', () => {
    expect(operation?.responses.map((response) => [response.statusCode, response.ref])).toEqual([
      ['200', '#/components/responses/Made'],
      ['201', undefined],
    ]);
  });

  it('keeps the reference of a response header', () => {
    const headers = operation?.responses[1]?.headers;

    expect(headers?.['X-Rate']?.ref).toBe('#/components/headers/Rate');
    expect(headers?.['X-Own']?.ref).toBeUndefined();
  });

  it('is written back to OpenAPI as a reference, never as the object it points to', () => {
    const written = writeOpenApi(buildIR(DOCUMENT)).paths?.['/things']?.post;

    expect(written?.parameters?.[0]).toEqual({ $ref: '#/components/parameters/Page' });
    expect(written?.requestBody).toEqual({ $ref: '#/components/requestBodies/Thing' });
    expect(written?.responses?.['200']).toEqual({ $ref: '#/components/responses/Made' });
    expect(written?.responses?.['201']).toMatchObject({
      headers: { 'X-Rate': { $ref: '#/components/headers/Rate' } },
    });
  });

  describe('at the boundary of a stored model', () => {
    const model = buildIR(DOCUMENT);
    const [built] = model.operations;
    const [first, second] = built?.responses ?? [];
    const withOperation = (changed: object): unknown => ({
      ...model,
      operations: [{ ...built, ...changed }],
    });

    it('accepts the model the reader builds', () => {
      expect(isCastrDocument(model)).toBe(true);
    });

    it('refuses a request body whose reference is not text', () => {
      const changed = withOperation({ requestBody: { ...built?.requestBody, ref: 7 } });

      expect(isCastrDocument(changed)).toBe(false);
    });

    it('refuses a response whose reference is not text', () => {
      const changed = withOperation({ responses: [{ ...first, ref: 7 }, second] });

      expect(isCastrDocument(changed)).toBe(false);
    });

    it('refuses a response header whose reference is not text', () => {
      const headers = { 'X-Rate': { ...second?.headers?.['X-Rate'], ref: 7 } };
      const changed = withOperation({ responses: [first, { ...second, headers }] });

      expect(isCastrDocument(changed)).toBe(false);
    });

    it('carries a version that a model stored before references were kept does not', () => {
      expect(model.version).toBe(IR_SCHEMA_VERSION);
      expect(IR_SCHEMA_VERSION).not.toBe('2.0.0');
    });
  });
});
