import type { SchemaObject } from '../../../../shared/openapi-types.js';
import type { CastrSchema } from '../../../ir/index.js';

function addCoreDocumentationFields(schema: SchemaObject, irSchema: CastrSchema): void {
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

function addSchemaAccessFlags(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.readOnly !== undefined) {
    irSchema.readOnly = schema.readOnly;
  }
  if (schema.writeOnly !== undefined) {
    irSchema.writeOnly = schema.writeOnly;
  }
  if (schema.deprecated !== undefined) {
    irSchema.deprecated = schema.deprecated;
  }
}

export function addSchemaDocumentation(schema: SchemaObject, irSchema: CastrSchema): void {
  addCoreDocumentationFields(schema, irSchema);
  addSchemaAccessFlags(schema, irSchema);
}
