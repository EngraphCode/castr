// Main endpoint list generation
export { getEndpointDefinitionList, type EndpointDefinitionListResult } from './definition-list.js';

// Endpoint type definitions
export type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
  EndpointResponse,
  HttpMethod,
  RequestFormat,
  ParameterType,
} from './definition.types.js';

// Endpoint helpers (for advanced usage)
export type { EndpointContext } from './helpers.js';
export {
  findExistingSchemaVar,
  generateUniqueVarName,
  getSchemaVarName,
  handleInlineEverything,
  handleRefSchema,
  registerSchemaName,
  shouldInlineSchema,
} from './helpers.js';
