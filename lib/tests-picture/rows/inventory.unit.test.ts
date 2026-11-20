/**
 * The rules by which a published definition is read into objects and fields, each proved
 * on a small definition written here.
 */

import { describe, it, expect } from 'vitest';

import { readInventory, readKeywords, type InventoryOptions } from './inventory.js';

const OPTIONS: InventoryOptions = {
  rootName: 'document',
  extensionRef: '#/$defs/extensions',
  corrections: [],
};

describe('readInventory', () => {
  it('lists the fields an object declares, with the fixed values of each', () => {
    const inventory = readInventory(
      {
        $defs: {
          parameter: {
            properties: {
              name: { type: 'string' },
              in: { enum: ['query', 'path'] },
              style: { const: 'simple' },
            },
          },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects).toEqual([
      { name: 'document', fields: [], keyedBy: [], extensible: false },
      {
        name: 'parameter',
        fields: [
          { name: 'in', values: ['path', 'query'] },
          { name: 'name', values: [] },
          { name: 'style', values: ['simple'] },
        ],
        keyedBy: [],
        extensible: false,
      },
    ]);
    expect(inventory.problems).toEqual([]);
  });

  it('counts a field declared in a branch of a conditional', () => {
    const inventory = readInventory(
      {
        $defs: {
          parameter: {
            properties: { in: { enum: ['query'] } },
            if: { properties: { in: { const: 'query' } } },
            then: { properties: { allowEmptyValue: { type: 'boolean' } } },
          },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual([
      'allowEmptyValue',
      'in',
    ]);
  });

  it('counts a field an object takes by composing another definition, and folds that definition', () => {
    const inventory = readInventory(
      {
        $defs: {
          header: { properties: { schema: true }, allOf: [{ $ref: '#/$defs/examples' }] },
          examples: { properties: { example: true } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects.map((object) => object.name)).toEqual(['document', 'header']);
    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual(['example', 'schema']);
    expect(inventory.folded).toEqual(['examples']);
  });

  it('does not follow a reference that is the value of a field', () => {
    const inventory = readInventory(
      {
        $defs: {
          operation: { properties: { externalDocs: { $ref: '#/$defs/docs' } } },
          docs: { properties: { url: { type: 'string' } } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual(['externalDocs']);
    expect(inventory.objects.map((object) => object.name)).toContain('docs');
    expect(inventory.folded).toEqual([]);
  });

  it('makes an object of a definition nested inside another and used as a value', () => {
    const inventory = readInventory(
      {
        $defs: {
          flows: {
            properties: { implicit: { $ref: '#/$defs/flows/$defs/implicit' } },
            $defs: { implicit: { properties: { authorizationUrl: { type: 'string' } } } },
          },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects.map((object) => object.name)).toEqual([
      'document',
      'flows',
      'flows/implicit',
    ]);
    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual(['implicit']);
    expect(inventory.objects[2]?.fields.map((field) => field.name)).toEqual(['authorizationUrl']);
  });

  it('reads a choice between two references as no object with fields', () => {
    const inventory = readInventory(
      {
        $defs: {
          'header-or-reference': {
            if: { required: ['$ref'] },
            then: { $ref: '#/$defs/reference' },
            else: { $ref: '#/$defs/header' },
          },
          reference: { properties: { $ref: { type: 'string' } } },
          header: { properties: { schema: true } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]).toEqual({
      name: 'header-or-reference',
      fields: [],
      keyedBy: [],
      extensible: false,
    });
    expect(inventory.folded).toEqual([]);
  });

  it('does not make an object of a definition that is a list', () => {
    const inventory = readInventory(
      {
        $defs: {
          parameters: {
            type: 'array',
            items: { $ref: '#/$defs/parameter' },
            not: { contains: { properties: { in: { const: 'query' } } } },
          },
          parameter: { properties: { name: { type: 'string' } } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects.map((object) => object.name)).toEqual(['document', 'parameter']);
  });

  it('does not search a schema that describes a value or a predicate for fields', () => {
    const inventory = readInventory(
      {
        $defs: {
          server: {
            properties: { url: { type: 'string' } },
            not: { properties: { forbidden: true } },
          },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual(['url']);
  });

  it('records how the other entries of an object are keyed', () => {
    const inventory = readInventory(
      {
        $defs: {
          paths: { patternProperties: { '^/': { $ref: '#/$defs/item' } } },
          content: { additionalProperties: { $ref: '#/$defs/item' } },
          item: { properties: { summary: { type: 'string' } } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]?.keyedBy).toEqual(['^/']);
    expect(inventory.objects[2]?.keyedBy).toEqual(['*']);
  });

  it('records that an object admits extensions, without making fields of them', () => {
    const inventory = readInventory(
      {
        $defs: {
          info: { properties: { title: { type: 'string' } }, $ref: '#/$defs/extensions' },
          extensions: { patternProperties: { '^x-': true } },
        },
      },
      OPTIONS,
    );

    expect(inventory.objects[1]).toEqual({
      name: 'info',
      fields: [{ name: 'title', values: [] }],
      keyedBy: [],
      extensible: true,
    });
  });

  it('reads the field the specification names where the definition is corrected', () => {
    const inventory = readInventory(
      { $defs: { link: { properties: { body: { type: 'object' } } } } },
      {
        ...OPTIONS,
        corrections: [{ object: 'link', published: 'body', specified: 'server', section: 's' }],
      },
    );

    expect(inventory.objects[1]?.fields.map((field) => field.name)).toEqual(['server']);
    expect(inventory.problems).toEqual([]);
  });

  it('reports a correction that no longer applies', () => {
    const inventory = readInventory(
      { $defs: { link: { properties: { server: { type: 'object' } } } } },
      {
        ...OPTIONS,
        corrections: [{ object: 'link', published: 'body', specified: 'server', section: 's' }],
      },
    );

    expect(inventory.problems).toEqual(['a correction no longer applies: link.body']);
  });

  it('reports a composed reference that has no target', () => {
    const inventory = readInventory(
      { $defs: { header: { allOf: [{ $ref: '#/$defs/missing' }] } } },
      OPTIONS,
    );

    expect(inventory.problems).toEqual([
      'header composes a reference that has no target: #/$defs/missing',
    ]);
  });

  it('reports a field whose value is a reference that has no target', () => {
    const inventory = readInventory(
      { $defs: { operation: { properties: { externalDocs: { $ref: '#/$defs/missing' } } } } },
      OPTIONS,
    );

    expect(inventory.problems).toEqual(['a reference has no target: #/$defs/missing']);
  });

  it('reports fields declared inline in the value of a field, which it does not count', () => {
    const inventory = readInventory(
      {
        $defs: {
          server: { properties: { variables: { properties: { default: { type: 'string' } } } } },
        },
      },
      OPTIONS,
    );

    expect(inventory.problems).toEqual([
      'server.variables declares fields inline; they are not counted',
    ]);
  });
});

describe('readKeywords', () => {
  it('lists the properties a vocabulary meta-schema declares', () => {
    expect(readKeywords('applicator', { properties: { allOf: {}, not: {} } })).toEqual([
      { vocabulary: 'applicator', keyword: 'allOf' },
      { vocabulary: 'applicator', keyword: 'not' },
    ]);
  });

  it('lists nothing for a meta-schema that declares no properties', () => {
    expect(readKeywords('empty', {})).toEqual([]);
  });
});
