import { describe, expect, it } from 'vitest';

import { buildIR } from './index.js';

const STRING = { type: 'string' };

/** A schema that holds one of the four keywords, each with a value valid for it. */
function holding(keyword: string): object {
  return { type: 'string', [keyword]: { const: 'a' } };
}

function withComponent(schema: object): object {
  return {
    openapi: '3.1.0',
    info: { title: 'unread applicators', version: '1' },
    paths: {},
    components: { schemas: { Base: STRING, Subject: schema } },
  };
}

function withOperation(operation: object): object {
  return {
    openapi: '3.1.0',
    info: { title: 'unread applicators', version: '1' },
    paths: { '/things': { post: { operationId: 'postThing', ...operation } } },
  };
}

const OK = { '200': { description: 'ok' } };

describe.each(['not', 'if', 'then', 'else'])(
  'the OpenAPI reader and %s, which the model it builds does not carry',
  (keyword) => {
    const subject = holding(keyword);
    const rejected = new RegExp(`${keyword} is rejected, at `);

    it.each([
      ['a component', withComponent(subject)],
      [
        'a property',
        withComponent({ type: 'object', properties: { p: subject }, additionalProperties: false }),
      ],
      ['the items of an array', withComponent({ type: 'array', items: subject })],
      ['a member of a composition', withComponent({ anyOf: [STRING, subject] })],
      ['the values of a map', withComponent({ type: 'object', additionalProperties: subject })],
      [
        'a schema beside a reference',
        withComponent({ $ref: '#/components/schemas/Base', [keyword]: { const: 'a' } }),
      ],
      [
        'a parameter',
        withOperation({ parameters: [{ name: 'q', in: 'query', schema: subject }], responses: OK }),
      ],
      [
        'a request body',
        withOperation({
          requestBody: { content: { 'application/json': { schema: subject } } },
          responses: OK,
        }),
      ],
      [
        'a response',
        withOperation({
          responses: {
            '200': { description: 'ok', content: { 'application/json': { schema: subject } } },
          },
        }),
      ],
      [
        'a response header',
        withOperation({
          responses: { '200': { description: 'ok', headers: { 'X-Thing': { schema: subject } } } },
        }),
      ],
    ])('refuses it in %s', (_position, document) => {
      expect(() => buildIR(document)).toThrow(rejected);
    });
  },
);
