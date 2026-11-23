/**
 * TypeScript type-writer module.
 *
 * Responsible for emitting TypeScript type definitions from CastrSchema IR.
 *
 * @internal
 */
export { writeTypeDefinition } from './core.js';
export {
  rejectDynamicReferenceKeywords,
  rejectUnsupportedObjectKeywords,
  rejectUnsupportedArrayKeywords,
} from './fail-fast.js';
