// Re-export core handlers
export {
  getSchemaNameFromRef,
  handleArraySchema,
  handleMultipleTypeSchema,
  handlePrimitiveSchema,
  handleReferenceObject,
} from './openApiToZod.handlers.core.js';

// Re-export object property builders
export {
  buildObjectPropertiesString,
  buildPropertyEntry,
} from './openApiToZod.handlers.object.properties.js';

// Re-export object schema handler
export { handleObjectSchema } from './openApiToZod.handlers.object.schema.js';
