/**
 * TypeScript type-writer module.
 *
 * Responsible for emitting TypeScript type definitions from CastrSchema IR.
 *
 * @module type-writer
 * @internal
 */
export { writeTypeDefinition } from './core.js';
export {
  rejectDynamicReferenceKeywords,
  rejectUnsupportedObjectKeywords,
  rejectUnsupportedArrayKeywords,
  resolveSchemaTypeString,
} from './fail-fast.js';
