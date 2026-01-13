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

// Core IR types (CastrSchemaProperties from schema.js also re-exports from schema-properties.js)
export {
  CastrSchemaProperties,
  type IRHttpMethod,
  type IRComponent,
  type CastrSchemaComponent,
  type IRSecuritySchemeComponent,
  type CastrParameterComponent,
  type CastrResponseComponent,
  type IRRequestBodyComponent,
  type CastrOperation,
  type CastrParameter,
  type IRRequestBody,
  type IRMediaType,
  type CastrResponse,
  type IRSecurityRequirement,
  type CastrSchema,
  type CastrSchemaNode,
  type CastrSchemaDependencyInfo,
  type IRInheritanceInfo,
  type IRZodChainInfo,
  type CastrDocument,
  type IRDependencyGraph,
  type IRDependencyNode,
} from './schema.js';

// Serialization utilities
export * from './serialization.js';

// Validators and type guards
export * from './validators.js';

// Schema context utilities
export * from './context.js';
