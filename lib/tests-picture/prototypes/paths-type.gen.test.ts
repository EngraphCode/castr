/**
 * What the prototype of the `paths` module has to hold for a client of `openapi-fetch`,
 * asserted at type level: a module that merely compiles proves nothing, because a shape
 * of `any` or `never` compiles too. Each case is one small document, and each is a
 * choice the rows for the document's structure will have to state.
 */

import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { generateZodClientFromOpenAPI } from '../../src/index.js';
import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import { compiled } from '../cases/typescript-type.js';

import { writePathsModule } from './paths-type.js';

const THING = {
  type: 'object',
  properties: { id: { type: 'string' }, size: { type: 'number' } },
  required: ['id'],
  additionalProperties: false,
};
const PROBLEM = {
  type: 'object',
  properties: { message: { type: 'string' } },
  required: ['message'],
  additionalProperties: false,
};
const json = (schema: object): object => ({ 'application/json': { schema } });
const ref = (name: string): object => ({ $ref: `#/components/schemas/${name}` });

const DOCUMENT: object = {
  openapi: '3.1.0',
  info: { title: 'things', version: '1' },
  paths: {
    '/things/{id}': {
      get: {
        operationId: 'getThing',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'verbose', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': {
            description: 'ok',
            headers: { 'X-Rate': { schema: { type: 'integer' } } },
            content: json(ref('Thing')),
          },
          '302': { description: 'moved', headers: { Location: { schema: { type: 'string' } } } },
          '404': { description: 'none', content: json(ref('Problem')) },
          '5XX': { description: 'broken', content: json(ref('Problem')) },
        },
      },
    },
    '/things': {
      post: {
        operationId: 'makeThing',
        requestBody: { required: true, content: json(ref('Thing')) },
        responses: {
          '201': { description: 'made', content: json(ref('Thing')) },
          default: { description: 'other', content: json(ref('Problem')) },
        },
      },
      patch: {
        requestBody: { content: json(ref('Thing')) },
        responses: { '204': { description: 'done' } },
      },
    },
  },
  components: { schemas: { Thing: THING, Problem: PROBLEM } },
};

const HEAD = [
  `import createClient from 'openapi-fetch';`,
  `import type { z } from 'zod';`,
  `import type { paths, components, Thing, Problem } from './picture-generated.js';`,
  `import type * as generated from './picture-generated.js';`,
  `type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;`,
  `const client = createClient<paths>({ baseUrl: 'https://example.com' });`,
].join('\n');

const OAK = 'tests-transforms/__fixtures__/corpus/oak-curriculum-api-v1-1.1.1.json';

async function moduleFor(document: object): Promise<string> {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: document,
    disableWriteToFile: true,
    // The endpoint definitions refuse a status range until they have a shape for one.
    template: 'schemas-only',
    options: { shouldExportAllTypes: true },
  });
  if (!('content' in result)) {
    throw new Error('the prototype needs the one module');
  }
  return `${result.content}\n${writePathsModule(buildIR(document))}`;
}

/** The compiler's messages for client code written against the module. */
async function messagesFor(clientCode: string): Promise<readonly string[]> {
  const { broken, besideMessages } = compiled(
    await moduleFor(DOCUMENT),
    `${HEAD}\nexport async function use(): Promise<void> {\n${clientCode}\n}\n`,
  );
  return broken === undefined ? besideMessages : [`the module itself: ${broken}`];
}

describe('the prototype of the paths module, read by a client of openapi-fetch', () => {
  it('gives data the type of the success body and error the type of each error body', async () => {
    const messages = await messagesFor(`
      const { data, error } = await client.GET('/things/{id}', { params: { path: { id: 'a' } } });
      const dataIsThing: Same<NonNullable<typeof data>, Thing> = true;
      const errorIsProblem: Same<NonNullable<typeof error>, Problem> = true;
      const sameAsZod: Same<Thing, z.output<typeof generated.Thing>> = true;
      const oneType: Same<components['schemas']['Thing'], Thing> = true;
      void [dataIsThing, errorIsProblem, sameAsZod, oneType];
    `);

    expect(messages).toEqual([]);
  }, 60_000);

  it('refuses a call that leaves out a required path parameter', async () => {
    const messages = await messagesFor(`await client.GET('/things/{id}', { params: {} });`);

    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('path');
  }, 60_000);

  it('refuses a method the path does not declare, and a path the document does not hold', async () => {
    const messages = await messagesFor(`
      await client.DELETE('/things/{id}', { params: { path: { id: 'a' } } });
      await client.GET('/nothing');
    `);

    expect(messages).toHaveLength(2);
  }, 60_000);

  it('requires a required request body and types it, and leaves an optional one optional', async () => {
    const good = await messagesFor(`
      await client.POST('/things', { body: { id: 'a' } });
      await client.PATCH('/things');
      await client.PATCH('/things', { body: { id: 'a', size: 2 } });
    `);
    const bad = await messagesFor(`
      await client.POST('/things');
      await client.POST('/things', { body: { id: 1 } });
    `);

    expect(good).toEqual([]);
    expect(bad).toHaveLength(2);
  }, 60_000);

  it('takes default and a status range as errors', async () => {
    const messages = await messagesFor(`
      const made = await client.POST('/things', { body: { id: 'a' } });
      const otherIsProblem: Same<NonNullable<typeof made.error>, Problem> = true;
      void otherIsProblem;
    `);

    expect(messages).toEqual([]);
  }, 60_000);

  it('holds a response with no body as no content, and its header as a header', async () => {
    const messages = await messagesFor(`
      type Moved = paths['/things/{id}']['get']['responses'][302];
      const noContent: Same<Moved['content'], undefined> = true;
      const location: Same<Moved['headers']['Location'], string | undefined> = true;
      const done = await client.PATCH('/things');
      const noData: Same<typeof done.data, undefined> = true;
      void [noContent, location, noData];
    `);

    expect(messages).toEqual([]);
  }, 60_000);

  it('is written for the whole of the Oak document, and a client reads a lesson from it', async () => {
    const oak: object = JSON.parse(readFileSync(OAK, 'utf8'));
    const { broken, besideMessages } = compiled(
      await moduleFor(oak),
      [
        `import createClient from 'openapi-fetch';`,
        `import type { paths, components } from './picture-generated.js';`,
        `type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;`,
        `const client = createClient<paths>({ baseUrl: 'https://example.com' });`,
        `export async function use(): Promise<void> {`,
        `  const { data, error } = await client.GET('/lessons/{lesson}/summary', { params: { path: { lesson: 'a' } } });`,
        `  const typed: Same<NonNullable<typeof data>['lessonTitle'], string> = true;`,
        `  const failed: Same<NonNullable<typeof error>, components['schemas']['error.BAD_REQUEST'] | components['schemas']['error.UNAUTHORIZED'] | components['schemas']['error.NOT_FOUND']> = true;`,
        `  const notAny: Same<NonNullable<typeof data>, { never: 1 }> = false;`,
        `  void [typed, failed, notAny];`,
        `}`,
      ].join('\n'),
    );

    expect(broken).toBeUndefined();
    expect(besideMessages).toEqual([]);
  }, 120_000);
});
