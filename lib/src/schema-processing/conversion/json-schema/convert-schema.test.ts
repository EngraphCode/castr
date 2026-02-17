import { describe, expect, it, vi } from 'vitest';
import type { Schema as JsonSchema } from 'ajv';
import type { SchemaObject } from 'openapi3-ts/oas31';

import { convertOpenApiSchemaToJsonSchema } from './convert-schema.js';
import * as keywordPrimitives from './keyword-primitives.js';

function expectSchemaObject(schema: JsonSchema): asserts schema is Extract<JsonSchema, object> {
  if (typeof schema === 'boolean') {
    throw new Error('Expected JSON Schema object but received boolean schema');
  }
}

describe('convertOpenApiSchemaToJsonSchema', () => {
  it('converts a simple string schema with metadata', () => {
    const schema: SchemaObject = {
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^[a-z]+$',
      description: 'Username',
      default: 'guest',
      format: 'email',
      examples: [{ value: 'alice' }, { value: 'bob' }],
      readOnly: true,
      writeOnly: false,
    };

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      type: 'string',
      minLength: 1,
      maxLength: 255,
      pattern: '^[a-z]+$',
      description: 'Username',
      default: 'guest',
      format: 'email',
      examples: ['alice', 'bob'],
      readOnly: true,
      writeOnly: false,
    });
  });

  it('converts nullable string schema to draft-07 anyOf form', () => {
    const schema: SchemaObject = {
      type: ['string', 'null'],
      minLength: 3,
      description: 'Nullable label',
    };

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      anyOf: [
        {
          type: 'string',
          minLength: 3,
        },
        {
          type: 'null',
        },
      ],
      description: 'Nullable label',
    });
  });

  it('converts exclusiveMinimum boolean flag to numeric draft-07 representation', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "integer",
        "minimum": 0,
        "exclusiveMinimum": true
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      type: 'integer',
      exclusiveMinimum: 0,
    });
  });

  it('rewrites component schema references to definitions', () => {
    const ref = { $ref: '#/components/schemas/User' };

    const result = convertOpenApiSchemaToJsonSchema(ref);

    expect(result).toEqual({
      $ref: '#/definitions/User',
    });
  });

  it('throws when a schema reference has invalid syntax', () => {
    const ref = { $ref: '#/components/schemas/' };

    expect(() => convertOpenApiSchemaToJsonSchema(ref)).toThrow(
      /Invalid schema component reference.*Expected format/,
    );
  });

  it('throws when a schema reference points to a non-schema component', () => {
    const ref = { $ref: '#/components/parameters/UserId' };

    expect(() => convertOpenApiSchemaToJsonSchema(ref)).toThrow(
      /Unsupported schema component reference.*Expected #\/components\/schemas\/\{name\}/,
    );
  });

  it('converts object schemas with properties and required keys', () => {
    const schema: SchemaObject = {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        age: { type: 'integer', minimum: 0 },
      },
      required: ['id'],
      additionalProperties: false,
      description: 'User info',
    };

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      type: 'object',
      description: 'User info',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
        },
        age: {
          type: 'integer',
          minimum: 0,
        },
      },
      required: ['id'],
      additionalProperties: false,
    });
  });

  it('converts array schemas with items and constraints', () => {
    const schema: SchemaObject = {
      type: 'array',
      items: { type: 'string', minLength: 2 },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
    };

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      type: 'array',
      items: {
        type: 'string',
        minLength: 2,
      },
      minItems: 1,
      maxItems: 5,
      uniqueItems: true,
    });
  });

  it('converts composition keywords by mapping subschemas recursively', () => {
    const schema: SchemaObject = {
      allOf: [
        { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
        { type: 'object', properties: { name: { type: 'string' } } },
      ],
      description: 'Entity',
    };

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      description: 'Entity',
      allOf: [
        {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
      ],
    });
  });

  it('converts prefixItems tuples and enforces additionalItems when items is false', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "array",
        "prefixItems": [
          { "type": "string" },
          { "type": "number" }
        ],
        "items": false
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toEqual({
      type: 'array',
      items: [{ type: 'string' }, { type: 'number' }],
      additionalItems: false,
    });
  });

  it('converts unevaluatedProperties keyword to additionalProperties', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "object",
        "unevaluatedProperties": { "type": "string" },
        "properties": {
          "id": { "type": "integer" }
        }
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toMatchObject({
      type: 'object',
      properties: {
        id: { type: 'integer' },
      },
      additionalProperties: { type: 'string' },
    });
  });

  it('converts unevaluatedItems keyword to additionalItems', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "array",
        "unevaluatedItems": false
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expect(result).toMatchObject({
      type: 'array',
      additionalItems: false,
    });
  });

  it('converts dependentSchemas to Draft 07 dependencies', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "object",
        "dependentSchemas": {
          "admin": {
            "type": "object",
            "properties": {
              "role": { "type": "string" }
            }
          }
        }
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expectSchemaObject(result);
    expect(result['dependencies']).toEqual({
      admin: {
        type: 'object',
        properties: {
          role: { type: 'string' },
        },
      },
    });
  });

  it('rewrites $dynamicRef to a standard $ref', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "$dynamicRef": "#/components/schemas/DynamicUser"
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expectSchemaObject(result);
    expect(result['$ref']).toBe('#/definitions/DynamicUser');
  });

  it('strips Draft 2020-12 specific keywords from output', () => {
    const schema: SchemaObject = JSON.parse(
      `{
        "type": "object",
        "$vocabulary": {
          "https://json-schema.org/draft/2020-12/vocab/core": true
        },
        "$dynamicRef": "#/components/schemas/DynamicRole",
        "unevaluatedProperties": false,
        "unevaluatedItems": { "type": "null" },
        "dependentSchemas": {
          "manager": { "$ref": "#/components/schemas/Manager" }
        }
      }`,
    );

    const result = convertOpenApiSchemaToJsonSchema(schema);

    expectSchemaObject(result);
    expect(result).toMatchObject({
      type: 'object',
      additionalProperties: false,
      additionalItems: { type: 'null' },
      dependencies: {
        manager: { $ref: '#/definitions/Manager' },
      },
      $ref: '#/definitions/DynamicRole',
    });
    expect(typeof result).toBe('object');
    if (typeof result === 'object' && result !== null) {
      expect(Object.prototype.hasOwnProperty.call(result, '$vocabulary')).toBe(false);
    }
  });

  it('throws a contextual error when conversion fails', () => {
    const schema: SchemaObject = { type: 'string' };
    const failure = new Error('boom');
    const primitiveSpy = vi
      .spyOn(keywordPrimitives, 'applyTypeInformation')
      .mockImplementation(() => {
        throw failure;
      });

    try {
      expect(() => convertOpenApiSchemaToJsonSchema(schema)).toThrow(
        /Failed to convert schema.*type string.*boom/,
      );
    } finally {
      primitiveSpy.mockRestore();
    }
  });
});
