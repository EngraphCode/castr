import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { getTemplateContext, type TemplateContextOptions } from '../context/template-context.js';
import { generateZodSchema } from './generate-zod-schema.js';

export { generateZodClientFromOpenAPI } from '../rendering/index.js';
export { isSingleFileResult } from '../rendering/generation-result.js';
export { getZodClientTemplateContext } from '../context/template-context.js';
export { getZodSchema } from '../conversion/zod/index.js';
export { getOpenApiDependencyGraph } from '../shared/dependency-graph.js';

import type {
  EndpointDefinition,
  EndpointParameter,
  EndpointError,
} from '../endpoints/definition.types.js';

export interface LegacyEndpointParameter extends Omit<EndpointParameter, 'schema'> {
  schema: string;
}

export interface LegacyEndpointError extends Omit<EndpointError, 'schema'> {
  schema: string;
}

export interface LegacyEndpointDefinition
  extends Omit<EndpointDefinition, 'response' | 'parameters' | 'errors'> {
  response?: string;
  parameters: LegacyEndpointParameter[];
  errors: LegacyEndpointError[];
}

/**
 * Re-implementation of the legacy getEndpointDefinitionList function
 * using the new IR-based architecture.
 * This is used to keep existing snapshot tests working.
 */
export function getEndpointDefinitionList(
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): { endpoints: LegacyEndpointDefinition[] } {
  const context = getTemplateContext(doc, options);

  const endpoints = context.endpoints.map((ep) => {
    return {
      ...ep,
      response: generateZodSchema(ep.response),
      parameters: ep.parameters.map((p) => ({
        ...p,
        schema: generateZodSchema(p.schema),
      })),
      errors: ep.errors.map((e) => ({
        ...e,
        schema: generateZodSchema(e.schema),
      })),
    };
  });

  return { endpoints };
}
