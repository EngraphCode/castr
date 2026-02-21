import type { EndpointDefinition } from '../../../endpoints/definition.types.js';

export interface MinimalTemplateContext {
  schemas: Record<string, string>;
  endpoints: EndpointDefinition[];
  types: Record<string, string>;
  imports?: Record<string, string>;
}

export const makeEndpointTemplateContext = (): MinimalTemplateContext => ({
  schemas: {},
  endpoints: [],
  types: {},
});
