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

    it.each([
      ['a component', '#/components/schemas/Subject', withComponent(subject)],
      [
        'a property',
        '#/components/schemas/Subject/properties/p',
        withComponent({ type: 'object', properties: { p: subject }, additionalProperties: false }),
      ],
      [
        'the items of an array',
        '#/components/schemas/Subject/items',
        withComponent({ type: 'array', items: subject }),
      ],
      [
        'a member of a composition',
        '#/components/schemas/Subject/anyOf/1',
        withComponent({ anyOf: [STRING, subject] }),
      ],
      [
        'the values of a map',
        '#/components/schemas/Subject/additionalProperties',
        withComponent({ type: 'object', additionalProperties: subject }),
      ],
      [
        'a schema beside a reference',
        '#/components/schemas/Subject',
        withComponent({ $ref: '#/components/schemas/Base', [keyword]: { const: 'a' } }),
      ],
      [
        'a parameter',
        '/things/post/q',
        withOperation({ parameters: [{ name: 'q', in: 'query', schema: subject }], responses: OK }),
      ],
      [
        'a request body',
        '/things/post/requestBody/application/json/schema',
        withOperation({
          requestBody: { content: { 'application/json': { schema: subject } } },
          responses: OK,
        }),
      ],
      [
        'a response',
        '/things/post/responses/200/application/json/schema',
        withOperation({
          responses: {
            '200': { description: 'ok', content: { 'application/json': { schema: subject } } },
          },
        }),
      ],
      [
        'a response header',
        '/things/post/headers/X-Thing',
        withOperation({
          responses: { '200': { description: 'ok', headers: { 'X-Thing': { schema: subject } } } },
        }),
      ],
    ])('refuses it in %s, and names the place', (_position, place, document) => {
      expect(() => buildIR(document)).toThrow(
        `A schema that holds the keyword ${keyword} is rejected, at ${place}:`,
      );
    });
  },
);
