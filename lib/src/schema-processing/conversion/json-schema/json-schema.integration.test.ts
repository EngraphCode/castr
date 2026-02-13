import { describe, expect, it } from 'vitest';
import {
  isReferenceObject,
  type OpenAPIObject,
  type ReferenceObject,
  type SchemaObject,
} from 'openapi3-ts/oas31';

import { prepareOpenApiDocument } from '../../../shared/prepare-openapi-document.js';
import { convertOpenApiSchemaToJsonSchema } from './convert-schema.js';
import { createDraft07Validator } from './test-utils.js';
import { resolveOperationSecurity } from './security/extract-operation-security.js';

describe('Integration: OpenAPI → JSON Schema Draft 07 conversion', () => {
  it('converts CreateUserInput schema to Draft 07', async () => {
    const schema = await loadCreateUserSchema();
    const jsonSchema = convertOpenApiSchemaToJsonSchema(schema);

    expect(jsonSchema).toMatchObject({
      type: 'object',
      additionalProperties: false,
      required: ['username', 'email'],
      properties: {
        username: {
          anyOf: [
            expect.objectContaining({
              type: 'string',
              minLength: 3,
            }),
            { type: 'null' },
          ],
        },
        email: {
          type: 'string',
          format: 'email',
        },
        age: {
          anyOf: [
            expect.objectContaining({
              type: 'integer',
              minimum: 0,
            }),
            { type: 'null' },
          ],
        },
      },
    });
  });

  it('validates payloads using the generated Draft 07 schema', async () => {
    const schema = await loadCreateUserSchema();
    const jsonSchema = convertOpenApiSchemaToJsonSchema(schema);

    const validator = createDraft07Validator();
    expect(validator.validateSchema(jsonSchema)).toBe(true);
    expect(validator.errors).toBeNull();

    const validatePayload = validator.compile(jsonSchema);
    expect(validatePayload(buildValidPayload())).toBe(true);
    expect(validatePayload(buildInvalidPayload())).toBe(false);
  });

  it('extracts upstream security metadata for the createUser operation', async () => {
    const document = await loadMultiAuthDocument();
    const createUserOperation = document.paths?.['/users']?.post;

    expect(createUserOperation).toBeDefined();
    const security = resolveOperationSecurity({
      document,
      operationSecurity: createUserOperation?.security,
    });

    expect(security).toMatchObject({
      isPublic: false,
      usesGlobalSecurity: false,
      requirementSets: [
        {
          schemes: [
            {
              schemeName: 'OAuth2',
              scheme: expect.objectContaining({ type: 'oauth2' }),
            },
          ],
        },
        {
          schemes: [
            {
              schemeName: 'ApiKey',
              scheme: expect.objectContaining({ type: 'apiKey' }),
            },
          ],
        },
        {
          schemes: [
            expect.objectContaining({ schemeName: 'OAuth2' }),
            expect.objectContaining({ schemeName: 'ApiKey' }),
          ],
        },
      ],
    });
  });

  it('marks listUsers as a public operation when security overrides are empty', async () => {
    const document = await loadMultiAuthDocument();
    const listUsersOperation = document.paths?.['/users']?.get;

    expect(listUsersOperation).toBeDefined();

    const security = resolveOperationSecurity({
      document,
      operationSecurity: listUsersOperation?.security,
    });

    expect(security).toMatchObject({
      isPublic: true,
      requirementSets: [],
    });
  });

  it('converts petstore components to valid Draft 07 schemas', async () => {
    const document = await prepareOpenApiDocument('./examples/openapi/v3.0/petstore-expanded.yaml');
    const petSchema = getInlineSchema(document.components?.schemas?.['Pet'], 'Pet');
    const jsonSchema = convertOpenApiSchemaToJsonSchema(petSchema);

    expect(jsonSchema).toMatchObject({
      allOf: [
        { $ref: '#/definitions/NewPet' },
        {
          type: 'object',
          required: ['id'],
          properties: {
            id: expect.anything(),
          },
        },
      ],
    });

    const newPetSchema = getInlineSchema(document.components?.schemas?.['NewPet'], 'NewPet');
    const validator = createDraft07Validator();
    expect(validator.validateSchema(jsonSchema)).toBe(true);
    expect(validator.validateSchema(convertOpenApiSchemaToJsonSchema(newPetSchema))).toBe(true);
  });

  it('converts tictactoe board schema with nested arrays and references', async () => {
    const document = await prepareOpenApiDocument('./examples/openapi/v3.1/tictactoe.yaml');
    const boardSchema = getInlineSchema(document.components?.schemas?.['board'], 'board');
    const jsonSchema = convertOpenApiSchemaToJsonSchema(boardSchema);

    expect(jsonSchema).toMatchObject({
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'array',
        minItems: 3,
        maxItems: 3,
        items: {
          $ref: '#/definitions/mark',
        },
      },
    });

    const validator = createDraft07Validator();
    expect(validator.validateSchema(jsonSchema)).toBe(true);
  });
});

function getInlineSchema(
  schema: SchemaObject | ReferenceObject | undefined,
  schemaName: string,
): SchemaObject {
  if (!schema || isReferenceObject(schema)) {
    throw new Error(`Expected inline schema for ${schemaName}`);
  }
  return schema;
}

async function loadCreateUserSchema(): Promise<SchemaObject> {
  const document = await loadMultiAuthDocument();
  return getInlineSchema(document.components?.schemas?.['CreateUserInput'], 'CreateUserInput');
}

function buildValidPayload(): CreateUserPayload {
  return {
    username: 'alex',
    email: 'alex@example.com',
    age: 34,
  };
}

function buildInvalidPayload(): CreateUserPayload {
  return {
    username: 'al',
    email: 'invalid-email',
  };
}

interface CreateUserPayload {
  username: string;
  email: string;
  age?: number | null;
}

async function loadMultiAuthDocument(): Promise<OpenAPIObject> {
  return prepareOpenApiDocument('./examples/custom/openapi/v3.1/multi-auth.yaml');
}
