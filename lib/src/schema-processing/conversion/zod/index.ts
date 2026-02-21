import type { SchemaObject } from 'openapi3-ts/oas31';
import { buildCastrSchema, type IRBuildContext } from '../../parsers/openapi/index.js';
import { generateZodSchema } from '../../../test-helpers/generate-zod-schema.js';

export function getZodSchema({ schema }: { schema: SchemaObject }): {
  code: string;
  schema: SchemaObject;
} {
  const context: IRBuildContext = {
    doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
    path: [],
    required: false,
  };
  const irSchema = buildCastrSchema(schema, context);
  const code = generateZodSchema(irSchema);
  return { code, schema };
}
