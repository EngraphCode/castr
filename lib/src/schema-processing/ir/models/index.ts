export {
  type IRHttpMethod,
  type CastrSchema,
  type IRUuidVersion,
  type CastrSchemaNode,
  type CastrSchemaDependencyInfo,
  type IRInheritanceInfo,
  type IRZodChainInfo,
  type IRDependencyGraph,
  type IRDependencyNode,
} from './schema.js';
export type { IRIntegerSemantics } from '../integer-semantics/core.js';

export { type IREnum, type CastrDocument, allOperations } from './schema-document.js';
export { isCastrDocument } from '../validation/index.js';

export { CastrSchemaProperties } from './schema.js';

export type {
  IRComponent,
  CastrSchemaComponent,
  IRSecuritySchemeComponent,
  CastrParameterComponent,
  CastrResponseComponent,
  IRRequestBodyComponent,
  IRHeaderComponent,
  IRLinkComponent,
  IRCallbackComponent,
  IRPathItemComponent,
  IRMediaTypeComponent,
  IRExampleComponent,
} from './schema.components.js';

export type {
  CastrAdditionalOperation,
  CastrOperation,
  CastrParameter,
  IRRequestBody,
  IRMediaTypeReference,
  IRMediaTypeEntry,
  IRMediaType,
  CastrResponse,
  IRResponseHeader,
  IRSecurityRequirement,
} from './schema.operations.js';
