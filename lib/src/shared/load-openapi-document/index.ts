/**
 * Scalar Pipeline: OpenAPI Document Loading & Bundling
 *
 * **Public API:**
 * - `loadOpenApiDocument` - Main entry point for loading OpenAPI documents
 *
 * **Architecture:**
 * This module implements the core Scalar-based OpenAPI loading pipeline, which
 * replaces the legacy SwaggerParser-based approach (ADR-019).
 *
 * **Pipeline Stages:**
 * 1. Normalize Input: Accept string/URL/object, determine entry point
 * 2. Bundle: Resolve external file/URL references via @scalar/json-magic
 * 3. Upgrade: Convert OpenAPI 2.0/3.0 → 3.1 via @scalar/openapi-parser
 * 4. Validate: Type-guard to ensure BundledOpenApiDocument (intersection type)
 *
 * **Key Differences from SwaggerParser:**
 * - bundle() preserves internal $refs (doesn't fully dereference)
 * - upgrade() automatically converts old specs to 3.1
 * - Rich metadata tracking (files, URLs, warnings)
 * - Type-safe at boundaries (no casting)
 *
 * **For more details, see:**
 * - .agent/architecture/SCALAR-PIPELINE.md
 * - ADR-019: Scalar Pipeline Adoption
 * - ADR-020: Intersection Type Strategy
 *
 * @module
 * @public
 */

export { loadOpenApiDocument } from './orchestrator.js';

// Re-export types for convenience
export { type OTTNormalizedInput } from './normalize-input.js';
export { type OTTBundleInfrastructure } from './bundle/index.js';
export { type OTTResolveNode } from './bundle/index.js';
