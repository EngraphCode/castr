export {
  type IRHttpMethod,
  type CastrSchema,
  type IRUnknownKeyBehavior,
  type IRUuidVersion,
  type CastrSchemaNode,
  type CastrSchemaDependencyInfo,
  type IRInheritanceInfo,
  type IRZodChainInfo,
  type IRDependencyGraph,
  type IRDependencyNode,
} from './schema.js';
export type { IRIntegerSemantics } from '../integer-semantics/core.js';

export { isCastrDocument, type IREnum, type CastrDocument } from './schema-document.js';

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
  IRExampleComponent,
} from './schema.components.js';

export type {
  CastrOperation,
  CastrParameter,
  IRRequestBody,
  IRMediaType,
  CastrResponse,
  IRResponseHeader,
  IRSecurityRequirement,
} from './schema.operations.js';
