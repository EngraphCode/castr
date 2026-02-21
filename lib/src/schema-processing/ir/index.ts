/**
 * Intermediate Representation (IR) Module
 *
 * This module provides the canonical IR types and utilities for Castr.
 * The IR is the single source of truth for all schema transformations.
 *
 * @module ir
 * @see ADR-023 for IR architecture
 * @see ADR-029 for canonical structure
 */

// Core IR types (CastrSchemaProperties from schema.js also re-exports from schema.js)
export { CastrSchemaProperties } from './models/index.js';
export type {
  IREnum,
  IRHttpMethod,
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
  CastrOperation,
  CastrParameter,
  IRRequestBody,
  IRMediaType,
  CastrResponse,
  IRResponseHeader,
  IRSecurityRequirement,
  CastrSchema,
  CastrSchemaNode,
  CastrSchemaDependencyInfo,
  IRInheritanceInfo,
  IRZodChainInfo,
  CastrDocument,
  IRDependencyGraph,
  IRDependencyNode,
} from './models/index.js';

// Serialization utilities
// Validators and type guards
// Schema context utilities
export { serializeIR, deserializeIR } from './serialization.js';
export {
  isCastrDocument,
  isIRComponent,
  isCastrOperation,
  isCastrSchema,
  isCastrSchemaNode,
} from './validation/index.js';
export type {
  CastrSchemaContext,
  IRComponentSchemaContext,
  IRPropertySchemaContext,
  IRCompositionMemberContext,
  IRArrayItemsContext,
  CastrParameterSchemaContext,
} from './context.js';

// Test Utilities
export {
  createMockCastrDocument,
  createMockCastrSchemaNode,
  createMockCastrSchema,
  assertSchemaComponent,
  getComponent,
  getSchemaProperty,
  assertPropertyRequired,
  assertPropertyNullable,
  assertPropertiesMetadata,
  countCircularRefs,
  assertHasCastrSchemaProperties,
} from './test-helpers.js';
