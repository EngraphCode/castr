import { describe, expect, it } from 'vitest';

import {
  holdsPropertyNamesThatRefuseNoName,
  isConstrainedMap,
  refusesNoPropertyName,
} from './map-rows.js';

const STRING = { type: 'string' };

describe('isConstrainedMap', () => {
  it('holds for an object that names no property and constrains every key by a schema', () => {
    expect(isConstrainedMap({ type: 'object', additionalProperties: STRING })).toBe(true);
  });

  it('holds when a keyword of its own row stands beside it', () => {
    const schema = { type: 'object', additionalProperties: STRING, minProperties: 1 };

    expect(isConstrainedMap(schema)).toBe(true);
  });

  it.each([
    ['true', true],
    ['false', false],
    ['the empty schema', {}],
    ['an empty schema that holds only metadata', { metadata: { required: false } }],
    ["the model's node for true", { booleanSchema: true, metadata: { required: false } }],
    ["the model's node for false", { booleanSchema: false, metadata: { required: false } }],
  ])('does not hold when additionalProperties is %s', (_name, additionalProperties) => {
    expect(isConstrainedMap({ type: 'object', additionalProperties })).toBe(false);
  });

  it('does not hold when additionalProperties is absent', () => {
    expect(isConstrainedMap({ type: 'object' })).toBe(false);
  });

  it.each([
    ['absent', undefined],
    ['a list', ['object', 'null']],
    ['another type', 'string'],
  ])('does not hold when type is %s', (_name, type) => {
    expect(isConstrainedMap({ type, additionalProperties: STRING })).toBe(false);
  });

  it.each([
    ['properties', { a: STRING }],
    ['required', ['a']],
    ['required', []],
    ['patternProperties', { '^a': STRING }],
    ['unevaluatedProperties', false],
    ['$ref', '#/components/schemas/A'],
    ['$dynamicRef', '#a'],
    ['allOf', [STRING]],
    ['anyOf', [STRING]],
    ['oneOf', [STRING]],
    ['not', STRING],
    ['if', STRING],
    ['dependentSchemas', { a: STRING }],
  ])('does not hold when the schema also holds %s', (keyword, value) => {
    const schema = { type: 'object', additionalProperties: STRING, [keyword]: value };

    expect(isConstrainedMap(schema)).toBe(false);
  });
});

describe('refusesNoPropertyName', () => {
  it.each([
    ['true', true],
    ['the empty schema', {}],
    ['an empty schema that holds only metadata', { metadata: { required: false } }],
    ['type string alone', { type: 'string' }],
    ['type string with metadata', { type: 'string', metadata: { required: false } }],
    ["the model's node for true", { booleanSchema: true, metadata: { required: false } }],
  ])('holds for %s', (_name, propertyNames) => {
    expect(refusesNoPropertyName(propertyNames)).toBe(true);
  });

  it.each([
    ['false', false],
    ["the model's node for false", { booleanSchema: false, metadata: { required: false } }],
    ['type string with a pattern', { type: 'string', pattern: '^a' }],
    ['type string with a description', { type: 'string', description: 'a slug' }],
    ['another type', { type: 'number' }],
    ['a list of types', { type: ['string', 'null'] }],
    ['an enum', { enum: ['a'] }],
    ['a reference', { $ref: '#/components/schemas/A' }],
  ])('does not hold for %s', (_name, propertyNames) => {
    expect(refusesNoPropertyName(propertyNames)).toBe(false);
  });
});

describe('holdsPropertyNamesThatRefuseNoName', () => {
  it('holds for a map whose propertyNames is type string alone', () => {
    const schema = { type: 'object', additionalProperties: STRING, propertyNames: STRING };

    expect(holdsPropertyNamesThatRefuseNoName(schema)).toBe(true);
  });

  it('does not hold when the schema has no propertyNames', () => {
    expect(holdsPropertyNamesThatRefuseNoName({ type: 'object' })).toBe(false);
  });

  it('does not hold when the propertyNames can refuse a name', () => {
    const schema = { type: 'object', propertyNames: { type: 'string', pattern: '^a' } };

    expect(holdsPropertyNamesThatRefuseNoName(schema)).toBe(false);
  });

  it('does not hold on an object that names a property, which the rows are not for', () => {
    const schema = { type: 'object', properties: { a: STRING }, propertyNames: STRING };

    expect(holdsPropertyNamesThatRefuseNoName(schema)).toBe(false);
  });
});
