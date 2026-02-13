import { describe, expect, it } from 'vitest';
import { isReferenceObject, type SchemaObject } from 'openapi3-ts/oas31';

import { prepareOpenApiDocument } from '../shared/prepare-openapi-document.js';
import { convertOpenApiSchemaToJsonSchema } from '../schema-processing/conversion/json-schema/convert-schema.js';
import { resolveOperationSecurity } from '../schema-processing/conversion/json-schema/security/extract-operation-security.js';

describe('Characterisation: JSON Schema conversion & security extraction', () => {
  it('converts CreateUserInput schema from multi-auth example', async () => {
    const doc = await prepareOpenApiDocument('./examples/custom/openapi/v3.1/multi-auth.yaml');
    const schema = doc.components?.schemas?.['CreateUserInput'];

    expect(schema).toBeDefined();
    if (!schema || isReferenceObject(schema)) {
      throw new Error('CreateUserInput schema should be inline for this fixture');
    }

    const jsonSchema = convertOpenApiSchemaToJsonSchema(schema as SchemaObject);

    expect(jsonSchema).toMatchSnapshot();
  });

  it('extracts Layer 2 security metadata for createUser and listUsers operations', async () => {
    const doc = await prepareOpenApiDocument('./examples/custom/openapi/v3.1/multi-auth.yaml');

    const createUserSecurity = resolveOperationSecurity({
      document: doc,
      operationSecurity: doc.paths?.['/users']?.post?.security,
    });

    const listUsersSecurity = resolveOperationSecurity({
      document: doc,
      operationSecurity: doc.paths?.['/users']?.get?.security,
    });

    expect({ createUserSecurity, listUsersSecurity }).toMatchSnapshot();
  });
});
