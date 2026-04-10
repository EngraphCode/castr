export { getSchemaNameFromRef, processCommonSchemasForGroups } from './template-context.common.js';
export {
  collectEndpointDependencies,
  normalizeSchemaNameForDependency,
  processTransitiveDependenciesForGroup,
} from './template-context.endpoints.dependencies.js';
export {
  makeEndpointTemplateContext,
  type MinimalTemplateContext,
} from './template-context.endpoints.types.js';
