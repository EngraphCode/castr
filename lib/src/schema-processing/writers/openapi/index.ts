/**
 * OpenAPI writer module — generates canonical OpenAPI 3.2.0 from IR.
 *
 * This module provides the `writeOpenApi` function that converts a CastrDocument
 * (the canonical intermediate representation) to a valid OpenAPI 3.2.0 specification.
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
export { writeOpenApiSchema } from './schema/index.js';
export { writeOpenApiComponents } from './components/index.js';
export { writeOpenApiPaths } from './operations/index.js';
export { validateOpenAPI } from './openapi-validator.js';
