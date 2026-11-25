/**
 * The coverage map, held to the computed lists and to the prototype's own elements.
 *
 * The lists are recomputed from the pinned definitions of the formats and the elements
 * are read from `model.ts` through the compiler, so this is an end-to-end test.
 */

import { describe, it, expect } from 'vitest';

import { loadDefinition } from '../rows/definitions.js';
import type { Inventory } from '../rows/inventory.js';
import {
  dialect2020OwnNames,
  openApi31Objects,
  openApi32Objects,
  draft07Keywords,
  draft07TypeValues,
  schemaKeywords,
  schemaTypeValues,
} from '../rows/published-rows.js';
import { readJsonSchemaTextConstructs } from '../rows/json-schema-text-constructs.js';
import { readOpenApiTextConstructs } from '../rows/openapi-text-constructs.js';
import { readZodConstructs } from '../rows/zod-constructs.js';

import {
  DIALECT_2020_12_OWN_NAMES,
  DRAFT_07,
  DRAFT_2020_12,
  JSON_SCHEMA_TEXT,
  OPENAPI,
  OPENAPI_TEXT,
  TYPE_VALUES,
  ZOD_CHECKS,
  ZOD_FORMAT,
  ZOD_SCHEMAS,
  type Coverage,
} from './coverage.js';
import { elements } from './elements.js';

const ZOD = readZodConstructs();

/** The kinds of an inventory: each field, each object's keys, and each object's extensions. */
function kindsOf(inventory: Inventory): readonly string[] {
  return inventory.objects.flatMap((object) => [
    ...object.fields.map((field) => `${object.name}.${field.name}`),
    ...(object.keyedBy.length > 0 ? [`${object.name}[key]`] : []),
    ...(object.extensible ? [`${object.name}[x-]`] : []),
  ]);
}

const OPENAPI_32 = kindsOf(openApi32Objects(loadDefinition));
const OPENAPI_31 = kindsOf(openApi31Objects(loadDefinition));

const LISTS: readonly (readonly [string, readonly string[], Readonly<Record<string, Coverage>>])[] =
  [
    [
      'Draft 2020-12 keyword',
      schemaKeywords(loadDefinition).map((one) => one.keyword),
      DRAFT_2020_12,
    ],
    ['Draft-07 keyword', draft07Keywords(loadDefinition).map((one) => one.keyword), DRAFT_07],
    ['Draft 2020-12 type', schemaTypeValues(loadDefinition), TYPE_VALUES],
    ['Draft-07 type', draft07TypeValues(loadDefinition), TYPE_VALUES],
    [
      'Draft 2020-12 name outside its vocabularies',
      dialect2020OwnNames(loadDefinition).map((one) => one.name),
      DIALECT_2020_12_OWN_NAMES,
    ],
    ['OpenAPI 3.2', OPENAPI_32, OPENAPI],
    ['Zod schema', ZOD.schemas.map((one) => one.name), ZOD_SCHEMAS],
    ['Zod check', ZOD.checks.map((one) => one.name), ZOD_CHECKS],
    [
      'JSON Schema text',
      readJsonSchemaTextConstructs()
        .filter((row) => row.disposition === 'holds' || row.disposition === 'default')
        .map((row) => row.id),
      JSON_SCHEMA_TEXT,
    ],
    [
      'OpenAPI text',
      readOpenApiTextConstructs()
        .constructs.filter((row) => row.disposition === 'holds' || row.disposition === 'default')
        .map((row) => row.id),
      OPENAPI_TEXT,
    ],
  ];

describe('the elements of the prototype', () => {
  const known = elements();

  it('are its types, their properties, and the members of a union by their literal', () => {
    expect(
      ['ObjectPart', 'ObjectPart.rest', 'Shape[when]', 'Shape[rest-of].keys'].filter(
        (name) => !known.has(name),
      ),
    ).toEqual([]);
  });

  it('do not include a name the types do not have', () => {
    expect(
      ['Shape[keyed]', 'ObjectPart.additional', 'Table'].filter((name) => known.has(name)),
    ).toEqual([]);
  });
});

describe('the coverage map', () => {
  it('has an entry for every kind computed, and none for a kind that is gone', () => {
    const wrong = LISTS.flatMap(([list, kinds, map]) => [
      ...kinds.filter((kind) => map[kind] === undefined).map((kind) => `${list} ${kind}: no entry`),
      ...Object.keys(map)
        .filter((kind) => !kinds.includes(kind))
        .map((kind) => `${list} ${kind}: an entry for no kind`),
    ]);

    expect(wrong).toEqual([]);
  });

  it('names only elements the prototype has', () => {
    const known = elements();
    const unknown = LISTS.flatMap(([, , map]) =>
      Object.values(map).flatMap((entry) =>
        'held' in entry ? entry.held.filter((element) => !known.has(element)) : [],
      ),
    );

    expect([...new Set(unknown)]).toEqual([]);
  });

  it('has every kind of OpenAPI 3.1 among those of 3.2', () => {
    expect(OPENAPI_31.filter((kind) => !OPENAPI_32.includes(kind))).toEqual([]);
  });

  it('cites a clause of the specification for every kind it puts outside the model', () => {
    const uncited = LISTS.flatMap(([list, , map]) =>
      Object.entries(map)
        .filter(([, entry]) => 'refused' in entry && !/^SPEC-[A-Z]+-\d+/.test(entry.refused))
        .map(([kind]) => `${list} ${kind}`),
    );

    expect(uncited).toEqual([]);
  });

  it('owes these kinds an element, and no other', () => {
    const owed = LISTS.flatMap(([list, , map]) =>
      Object.entries(map)
        .filter(([, entry]) => 'owed' in entry)
        .map(([kind]) => `${list} ${kind}`),
    );

    expect(owed).toEqual([
      'Draft 2020-12 keyword $comment',
      'Draft 2020-12 keyword format',
      'Draft 2020-12 keyword contentEncoding',
      'Draft 2020-12 keyword contentMediaType',
      'Draft 2020-12 keyword examples',
      'Draft 2020-12 keyword contentSchema',
      'Draft-07 keyword $comment',
      'Draft-07 keyword format',
      'Draft-07 keyword contentEncoding',
      'Draft-07 keyword contentMediaType',
      'Draft-07 keyword examples',
      'Draft 2020-12 name outside its vocabularies dependencies',
      'Draft 2020-12 name outside its vocabularies $recursiveAnchor',
      'Draft 2020-12 name outside its vocabularies $recursiveRef',
      'OpenAPI 3.2 info[x-]',
      'OpenAPI 3.2 contact[x-]',
      'OpenAPI 3.2 license[x-]',
      'OpenAPI 3.2 server-variable[x-]',
      'OpenAPI 3.2 components[x-]',
      'OpenAPI 3.2 paths[x-]',
      'OpenAPI 3.2 external-documentation[x-]',
      'OpenAPI 3.2 parameter.example',
      'OpenAPI 3.2 media-type.example',
      'OpenAPI 3.2 responses[x-]',
      'OpenAPI 3.2 header.example',
      'OpenAPI 3.2 oauth-flows[x-]',
      'OpenAPI 3.2 oauth-flows/implicit[x-]',
      'OpenAPI 3.2 oauth-flows/password[x-]',
      'OpenAPI 3.2 oauth-flows/client-credentials[x-]',
      'OpenAPI 3.2 oauth-flows/authorization-code[x-]',
      'OpenAPI 3.2 oauth-flows/device-authorization[x-]',
      'Zod schema $ZodDiscriminatedUnion',
      'Zod schema $ZodEnum',
      'Zod schema $ZodExactOptional',
      'Zod schema $ZodNonOptional',
      'Zod schema $ZodNumber',
      'Zod schema $ZodNumberFormat',
      'Zod schema $ZodReadonly',
      'Zod schema $ZodRecord',
      'Zod schema $ZodStringFormat',
      'Zod schema $ZodTemplateLiteral',
      'Zod check $ZodCheckMultipleOf',
      'Zod check $ZodCheckNumberFormat',
      'Zod check $ZodCheckProperties',
      'Zod check $ZodCheckProperty',
      'Zod check $ZodCheckStringFormat',
      'JSON Schema text JT-025',
      'JSON Schema text JT-026',
      'JSON Schema text JT-027',
      'JSON Schema text JT-041',
      'JSON Schema text JT-051',
      'JSON Schema text JT-085',
      'JSON Schema text JT-087',
      'JSON Schema text JT-094',
      'JSON Schema text JT-096',
      'JSON Schema text JT-098',
      'JSON Schema text JT-099',
      'JSON Schema text JT-100',
      'JSON Schema text JT-114',
      'JSON Schema text JT-126',
      'JSON Schema text JT-130',
      'JSON Schema text JT-132',
      'JSON Schema text JT-134',
      'OpenAPI text OT-003',
      'OpenAPI text OT-014',
      'OpenAPI text OT-017',
      'OpenAPI text OT-034',
      'OpenAPI text OT-076',
      'OpenAPI text OT-082',
      'OpenAPI text OT-098',
      'OpenAPI text OT-107',
      'OpenAPI text OT-108',
      'OpenAPI text OT-114',
      'OpenAPI text OT-117',
      'OpenAPI text OT-121',
      'OpenAPI text OT-122',
      'OpenAPI text OT-124',
      'OpenAPI text OT-125',
      'OpenAPI text OT-129',
      'OpenAPI text OT-130',
      'OpenAPI text OT-132',
    ]);
  });

  it('owes every one of Zod’s 57 formats an element, under one entry', () => {
    const formats = [...ZOD.stringFormats, ...ZOD.numberFormats, ...ZOD.bigintFormats];

    expect(formats).toHaveLength(57);
    expect('owed' in ZOD_FORMAT).toBe(true);
  });
});
