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
  IRUnknownKeyBehavior,
  IRUuidVersion,
  CastrSchemaNode,
  CastrSchemaDependencyInfo,
  IRInheritanceInfo,
  IRZodChainInfo,
  CastrDocument,
  IRDependencyGraph,
  IRDependencyNode,
} from './models/index.js';
export {
  ensureObjectTypeForObjectKeywords,
  UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY,
  UNKNOWN_KEY_MODE_STRICT,
  UNKNOWN_KEY_MODE_STRIP,
  UNKNOWN_KEY_MODE_PASSTHROUGH,
  UNKNOWN_KEY_MODE_CATCHALL,
  isObjectSchemaType,
  getPortableUnknownKeyBehaviorExtension,
  resolvePortableUnknownKeyBehavior,
} from './unknown-key-behavior.js';
export type { PortableUnknownKeyBehaviorMode } from './unknown-key-behavior.js';
export {
  UUID_SCHEMA_TYPE,
  UUID_SCHEMA_FORMAT,
  UUID_V4_PATTERN,
  UUID_V7_PATTERN,
  isIRUuidVersion,
  inferUuidVersionFromPattern,
  applyExplicitUuidVersion,
  applyInferredUuidVersionFromPattern,
} from './uuid-version.js';

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
