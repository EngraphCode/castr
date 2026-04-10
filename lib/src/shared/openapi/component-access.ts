/**
 * Type-safe access to OpenAPI component definitions.
 * Handles both dereferenced and non-dereferenced specs with zero type assertions.
 */

export {
  assertNotReference,
  getParameterByRef,
  getRequestBodyByRef,
  getResponseByRef,
} from './access/component-ref-access.js';
export { getSchemaFromComponents, resolveSchemaRef } from './access/schema-component-access.js';
