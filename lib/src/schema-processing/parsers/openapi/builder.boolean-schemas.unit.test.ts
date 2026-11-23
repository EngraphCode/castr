import { describe, expect, it } from 'vitest';

import { assertSchemaComponent } from '../../ir/index.js';

import { buildIR } from './index.js';

/** A document as it is read from a file: its schemas are not checked by the compiler. */
function read(schema: object): ReturnType<typeof assertSchemaComponent>['schema'] {
  const document: object = {
    openapi: '3.1.0',
    info: { title: 'boolean schemas', version: '1' },
    paths: {},
    components: { schemas: { Subject: schema } },
  };
  return assertSchemaComponent(buildIR(document).components[0]).schema;
}

describe('the OpenAPI reader and a boolean where a schema stands', () => {
  it.each([true, false])('reads items: %s as the schema it is', (items) => {
    const schema = read({ type: 'array', items });

    expect(schema.items).toMatchObject({ booleanSchema: items });
  });

  it.each([true, false])('reads a property whose schema is %s as the schema it is', (property) => {
    const schema = read({
      type: 'object',
      properties: { subject: property },
      additionalProperties: false,
    });

    expect(schema.properties?.get('subject')).toMatchObject({ booleanSchema: property });
  });

  it.each([true, false])('reads a member of a composition that is %s', (member) => {
    const schema = read({ anyOf: [{ type: 'string' }, member] });

    expect(schema.anyOf?.[1]).toMatchObject({ booleanSchema: member });
  });

  describe.each([true, false])('%s where an operation holds a schema', (schema) => {
    const document: object = {
      openapi: '3.1.0',
      info: { title: 'boolean schemas', version: '1' },
      paths: {
        '/things': {
          post: {
            operationId: 'postThing',
            parameters: [{ name: 'q', in: 'query', schema }],
            requestBody: { content: { 'application/json': { schema } } },
            responses: {
              '200': {
                description: 'ok',
                headers: { 'X-Thing': { schema } },
                content: { 'application/json': { schema } },
              },
            },
          },
        },
      },
    };
    const [operation] = buildIR(document).operations;

    it("is read as a parameter's schema", () => {
      expect(operation?.parameters[0]?.schema).toMatchObject({ booleanSchema: schema });
    });

    it("is read as a request body's schema", () => {
      expect(operation?.requestBody?.content['application/json']).toMatchObject({
        schema: { booleanSchema: schema },
      });
    });

    it("is read as a response's schema", () => {
      expect(operation?.responses[0]?.content?.['application/json']).toMatchObject({
        schema: { booleanSchema: schema },
      });
    });

    it("is read as a response header's schema", () => {
      expect(operation?.responses[0]?.headers?.['X-Thing']?.schema).toMatchObject({
        booleanSchema: schema,
      });
    });
  });
});
