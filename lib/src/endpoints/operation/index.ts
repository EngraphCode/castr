/**
 * Endpoint Operation Processing
 *
 * This module provides pure helper functions for processing individual
 * endpoint operations according to OpenAPI 3.0 specification.
 *
 * **Decomposition Strategy:**
 * Originally a single 385-line file, now organized as:
 * - `process-request-body.ts` - Request body processing
 * - `process-parameter.ts` - Parameter processing (path, query, header)
 * - `process-response.ts` - Response processing (2xx, 4xx, 5xx)
 * - `process-default-response.ts` - Default response handling
 *
 * Each file has single responsibility, comprehensive documentation, and
 * stays well under the 250-line limit.
 *
 * @module endpoint-operation
 * @since 2.0.0
 * @public
 */

// Request Body
export { processRequestBody } from './process-request-body.js';
export type { EndpointParameter as RequestBodyParameter } from './process-request-body.js';

// Parameters
export { processParameter } from './process-parameter.js';
export type { EndpointParameter } from '../definition.types.js';
export type { GetZodVarNameFn } from './process-parameter.js';

// Responses
export { processResponse } from './process-response.js';
export type { EndpointResponse, EndpointError, ProcessResponseResult } from './process-response.js';

// Default Response
export { processDefaultResponse } from './process-default-response.js';
export type { ProcessDefaultResponseResult } from './process-default-response.js';
