import type { SchemaObject } from '../../../../shared/openapi-types.js';
import type { CastrSchema } from '../../../ir/index.js';

export function addSchemaDocumentation(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.title !== undefined) {
    irSchema.title = schema.title;
  }
  if (schema.description !== undefined) {
    irSchema.description = schema.description;
  }
  if (schema.default !== undefined) {
    irSchema.default = schema.default;
  }
  if (schema.example !== undefined) {
    irSchema.example = schema.example;
  }
  if (schema.examples !== undefined) {
    irSchema.examples = schema.examples;
  }
}
