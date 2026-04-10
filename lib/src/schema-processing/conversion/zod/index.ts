import type { SchemaObject } from '../../../shared/openapi-types.js';
import { buildCastrSchema, type IRBuildContext } from '../../parsers/openapi/index.js';
import { generateZodSchema } from '../../../test-helpers/generate-zod-schema.js';
import { CANONICAL_OPENAPI_VERSION } from '../../../shared/openapi/version.js';

export function getZodSchema({ schema }: { schema: SchemaObject | object }): {
  code: string;
  schema: SchemaObject | object;
} {
  const context: IRBuildContext = {
    doc: { openapi: CANONICAL_OPENAPI_VERSION, info: { title: '', version: '' }, paths: {} },
    path: [],
    required: false,
  };
  const irSchema = buildCastrSchema(schema, context);
  const code = generateZodSchema(irSchema);
  return { code, schema };
}
