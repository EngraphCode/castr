// Re-export core handlers
export {
  getSchemaNameFromRef,
  handleArraySchema,
  handleMultipleTypeSchema,
  handlePrimitiveSchema,
  handleReferenceObject,
} from './handlers.core.js';

// Re-export object property builders
export { buildObjectPropertiesString, buildPropertyEntry } from './handlers.object.properties.js';

// Re-export object schema handler
export { handleObjectSchema } from './handlers.object.schema.js';
