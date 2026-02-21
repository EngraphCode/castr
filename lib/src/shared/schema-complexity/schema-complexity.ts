import type { ReferenceObject, SchemaObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import { calculateTypeArrayComplexity } from './schema-complexity.helpers.js';
import {
  complexityByComposite,
  handleReferenceSchema,
  trySchemaTypeHandlers,
} from './schema-complexity.handlers.js';

export function getSchemaComplexity({
  current,
  schema,
}: {
  current: number;
  schema: SchemaObject | ReferenceObject | undefined;
}): number {
  // Early returns for null/undefined and references
  if (!schema) {
    return current;
  }
  if (isReferenceObject(schema)) {
    return handleReferenceSchema(current);
  }

  // Handle type array (OpenAPI 3.1 feature)
  if (Array.isArray(schema.type)) {
    return calculateTypeArrayComplexity(
      schema.type,
      schema,
      current,
      complexityByComposite,
      getSchemaComplexity,
    );
  }

  // Try all schema type handlers
  return trySchemaTypeHandlers(schema, current, getSchemaComplexity);
}
