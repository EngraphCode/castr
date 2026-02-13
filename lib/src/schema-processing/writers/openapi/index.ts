/**
 * OpenAPI writer module — generates OpenAPI 3.1 from IR.
 *
 * This module provides the `writeOpenApi` function that converts a CastrDocument
 * (the canonical intermediate representation) to a valid OpenAPI 3.1 specification.
 *
 * @example
 * ```typescript
 * import { writeOpenApi } from '@engraph/castr/writers/openapi';
 *
 * const openApiDoc = writeOpenApi(ir);
 * console.log(JSON.stringify(openApiDoc, null, 2));
 * ```
 *
 * @module
 */

export { writeOpenApi } from './openapi-writer.js';
export { writeOpenApiSchema } from './openapi-writer.schema.js';
export { writeOpenApiComponents } from './openapi-writer.components.js';
export { writeOpenApiPaths } from './openapi-writer.operations.js';
