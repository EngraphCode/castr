import AjvFactory, { type AnySchemaObject, type Schema as JsonSchema } from 'ajv';
import addFormats from 'ajv-formats/dist/index.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const _draft07MetaSchema: unknown = require('ajv/dist/refs/json-schema-draft-07.json');

function isAnySchemaObject(value: unknown): value is AnySchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

if (!isAnySchemaObject(_draft07MetaSchema)) {
  throw new Error('Failed to load draft-07 meta schema: expected an object record.');
}

const draft07MetaSchema: AnySchemaObject = _draft07MetaSchema;

type AjvConstructor = typeof AjvFactory.default;
type AjvInstance = InstanceType<AjvConstructor>;

/**
 * Create an AJV instance pre-configured with the JSON Schema Draft 07 meta-schema.
 *
 * @remarks
 * AJV v8 defaults to Draft 2020-12. MCP requires Draft 07, so we explicitly register
 * the draft-07 meta-schema to validate converter output.
 */
export function createDraft07Validator(): AjvInstance {
  const ajv = new AjvFactory.default({
    meta: false,
    validateSchema: true,
    allErrors: true,
    strictSchema: true,
  });

  ajv.addMetaSchema(draft07MetaSchema);
  addFormats.default(ajv);

  return ajv;
}

/**
 * Validate a JSON Schema document against the Draft 07 meta-schema.
 *
 * @param schema - Schema produced by the JSON Schema converter.
 * @param validator - Optional AJV instance to reuse across validations.
 * @returns `true` when the schema conforms to Draft 07, `false` otherwise.
 */
export function validateJsonSchema(schema: JsonSchema, validator?: AjvInstance): boolean {
  const ajv = validator ?? createDraft07Validator();
  const validationResult = ajv.validateSchema(schema);
  if (typeof validationResult !== 'boolean') {
    throw new Error('Expected synchronous JSON Schema validation');
  }
  return validationResult;
}
