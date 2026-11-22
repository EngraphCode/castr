/**
 * The rows the picture computes from the formats' published definitions.
 *
 * This test reads the pinned files from the repository, so it is an end-to-end test of
 * the picture's reading. The reading rules themselves are proved without files in
 * `inventory.unit.test.ts` and `definitions.unit.test.ts`.
 *
 * Each test states a fact about OpenAPI 3.1 or 3.2 that the specifications' text gives,
 * so a reading rule that loses a field, merges two objects or follows the wrong reference
 * fails here.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition, readPins } from './definitions.js';
import type { Inventory, ObjectKind } from './inventory.js';
import {
  openApi31Objects,
  openApi31SchemaVocabulary,
  openApi32Objects,
  openApi32SchemaVocabulary,
  schemaKeywords,
  schemaTypeValues,
} from './published-rows.js';

function objectNamed(inventory: Inventory, name: string): ObjectKind {
  const found = inventory.objects.find((candidate) => candidate.name === name);
  if (found === undefined) {
    throw new Error(`no object named ${name}`);
  }
  return found;
}

function fieldNames(inventory: Inventory, name: string): readonly string[] {
  return objectNamed(inventory, name).fields.map((field) => field.name);
}

function valuesOf(inventory: Inventory, name: string, field: string): readonly string[] {
  const found = objectNamed(inventory, name).fields.find((candidate) => candidate.name === field);
  if (found === undefined) {
    throw new Error(`no field ${name}.${field}`);
  }
  return found.values;
}

describe('the pinned definitions', () => {
  it('every pinned file still has the bytes and the identifier its pin records', () => {
    const pins = readPins();

    expect(pins).toHaveLength(18);
    for (const pin of pins) {
      expect(loadDefinition(pin.file).pin).toEqual(pin);
    }
  });

  it('refuses a file that has no pin', () => {
    expect(() => loadDefinition('not-pinned.json')).toThrow('has no pin');
  });
});

describe('JSON Schema 2020-12 keywords', () => {
  it('counts the 57 keywords of the seven vocabularies', () => {
    const keywords = schemaKeywords(loadDefinition);

    expect(keywords).toHaveLength(57);
    expect(new Set(keywords.map((entry) => entry.keyword)).size).toBe(57);
  });

  it('lists the seven values of type', () => {
    expect(schemaTypeValues(loadDefinition)).toEqual([
      'array',
      'boolean',
      'integer',
      'null',
      'number',
      'object',
      'string',
    ]);
  });

  it('places a keyword in the vocabulary that defines it', () => {
    const byKeyword = new Map(
      schemaKeywords(loadDefinition).map((entry) => [entry.keyword, entry.vocabulary]),
    );

    expect(byKeyword.get('$dynamicRef')).toBe('core');
    expect(byKeyword.get('prefixItems')).toBe('applicator');
    expect(byKeyword.get('unevaluatedProperties')).toBe('unevaluated');
    expect(byKeyword.get('dependentRequired')).toBe('validation');
    expect(byKeyword.get('format')).toBe('format');
    expect(byKeyword.get('contentSchema')).toBe('content');
    expect(byKeyword.get('readOnly')).toBe('meta-data');
  });
});

describe('OpenAPI 3.1 objects', () => {
  const inventory = openApi31Objects(loadDefinition);

  it('reads every reference the definition uses', () => {
    expect(inventory.problems).toEqual([]);
  });

  it('gives the document its ten fixed fields', () => {
    expect(fieldNames(inventory, 'openapi')).toEqual([
      'components',
      'externalDocs',
      'info',
      'jsonSchemaDialect',
      'openapi',
      'paths',
      'security',
      'servers',
      'tags',
      'webhooks',
    ]);
  });

  it('counts a field an object takes through composition', () => {
    for (const name of ['parameter', 'media-type', 'header']) {
      expect(fieldNames(inventory, name)).toEqual(expect.arrayContaining(['example', 'examples']));
    }
    expect(inventory.folded).toEqual(['examples', 'explode-for-form']);
  });

  it('gives a parameter its four locations and its seven styles', () => {
    expect(valuesOf(inventory, 'parameter', 'in')).toEqual(['cookie', 'header', 'path', 'query']);
    expect(valuesOf(inventory, 'parameter', 'style')).toEqual([
      'deepObject',
      'form',
      'label',
      'matrix',
      'pipeDelimited',
      'simple',
      'spaceDelimited',
    ]);
  });

  it('reads the link object with the field the specification states, `server`', () => {
    const fields = fieldNames(inventory, 'link');

    expect(fields).toContain('server');
    expect(fields).not.toContain('body');
  });

  it('keeps the four OAuth flows as objects of their own', () => {
    expect(fieldNames(inventory, 'oauth-flows')).toEqual([
      'authorizationCode',
      'clientCredentials',
      'implicit',
      'password',
    ]);
    expect(fieldNames(inventory, 'oauth-flows/implicit')).toEqual([
      'authorizationUrl',
      'refreshUrl',
      'scopes',
    ]);
    expect(fieldNames(inventory, 'oauth-flows/client-credentials')).toEqual([
      'refreshUrl',
      'scopes',
      'tokenUrl',
    ]);
  });

  it('does not count a choice between an object and a reference as an object', () => {
    const names = inventory.objects.map((candidate) => candidate.name);

    expect(names.filter((name) => name.endsWith('-or-reference'))).toEqual([]);
    expect(fieldNames(inventory, 'reference')).toEqual(['$ref', 'description', 'summary']);
    expect(names).toHaveLength(34);
  });

  it('records how the entries of a map are keyed', () => {
    expect(objectNamed(inventory, 'paths').keyedBy).toEqual(['^/']);
    expect(objectNamed(inventory, 'responses').keyedBy).toEqual(['^[1-5](?:[0-9]{2}|XX)$']);
    expect(fieldNames(inventory, 'responses')).toEqual(['default']);
    expect(objectNamed(inventory, 'content').keyedBy).toEqual(['*']);
  });

  it('records which objects admit specification extensions', () => {
    expect(objectNamed(inventory, 'info').extensible).toBe(true);
    expect(objectNamed(inventory, 'reference').extensible).toBe(false);
    expect(objectNamed(inventory, 'security-requirement').extensible).toBe(false);
  });
});

describe('OpenAPI 3.2 objects', () => {
  const inventory = openApi32Objects(loadDefinition);

  it('reads every reference the definition uses', () => {
    expect(inventory.problems).toEqual([]);
  });

  it('adds the fields 3.2 defines', () => {
    expect(fieldNames(inventory, 'openapi')).toContain('$self');
    expect(fieldNames(inventory, 'path-item')).toEqual(
      expect.arrayContaining(['query', 'additionalOperations']),
    );
    expect(fieldNames(inventory, 'media-type')).toEqual(
      expect.arrayContaining(['itemSchema', 'itemEncoding', 'prefixEncoding']),
    );
    expect(fieldNames(inventory, 'link')).toContain('server');
  });

  it('adds the querystring location and the cookie style', () => {
    expect(valuesOf(inventory, 'parameter', 'in')).toContain('querystring');
    expect(valuesOf(inventory, 'parameter', 'style')).toContain('cookie');
  });

  it('does not count a list of parameters as an object', () => {
    expect(inventory.objects.map((candidate) => candidate.name)).not.toContain('parameters');
    expect(valuesOf(inventory, 'parameter', 'in')).toEqual([
      'cookie',
      'header',
      'path',
      'query',
      'querystring',
    ]);
  });

  it('adds the device authorization flow', () => {
    expect(fieldNames(inventory, 'oauth-flows')).toContain('deviceAuthorization');
    expect(fieldNames(inventory, 'oauth-flows/device-authorization')).toContain(
      'deviceAuthorizationUrl',
    );
  });
});

describe('the keywords OpenAPI adds to the schema object', () => {
  it('lists the four of 3.1 with their fields', () => {
    const inventory = openApi31SchemaVocabulary(loadDefinition);

    expect(inventory.problems).toEqual([]);
    expect(fieldNames(inventory, 'schema')).toEqual([
      'discriminator',
      'example',
      'externalDocs',
      'xml',
    ]);
    expect(fieldNames(inventory, 'discriminator')).toEqual(['mapping', 'propertyName']);
    expect(fieldNames(inventory, 'xml')).toEqual([
      'attribute',
      'name',
      'namespace',
      'prefix',
      'wrapped',
    ]);
  });

  it('adds the default mapping and the five node types of 3.2', () => {
    const inventory = openApi32SchemaVocabulary(loadDefinition);

    expect(inventory.problems).toEqual([]);
    expect(fieldNames(inventory, 'discriminator')).toContain('defaultMapping');
    expect(valuesOf(inventory, 'xml', 'nodeType')).toEqual([
      'attribute',
      'cdata',
      'element',
      'none',
      'text',
    ]);
  });
});
