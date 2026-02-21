// Removed duplicate exports from template-context.endpoints.from-ir
// The original setup naturally exported everything through the barrel, causing collisions.
export { getEndpointDefinitionsFromIR } from './template-context.endpoints.from-ir.js';
export {
  processEndpointGroupingAndCommonSchemas,
  type TemplateContextGroupStrategy,
  type MinimalTemplateContext,
  processCommonSchemasForGroups,
  processEndpointGrouping,
} from './template-context.endpoints.js';
