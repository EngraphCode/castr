/**
 * @deprecated This file has been decomposed into the endpoint-operation/ directory.
 * Import from 'endpoint-operation' instead.
 *
 * This re-export file maintains backwards compatibility during the transition.
 * Will be removed once all imports are updated.
 */

export type {
  EndpointParameter,
  GetZodVarNameFn,
  EndpointResponse,
  EndpointError,
  ProcessResponseResult,
  ProcessDefaultResponseResult,
} from './endpoint-operation/index.js';

export {
  processRequestBody,
  processParameter,
  processResponse,
  processDefaultResponse,
} from './endpoint-operation/index.js';
