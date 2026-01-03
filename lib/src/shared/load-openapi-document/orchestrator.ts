/**
 * Main orchestrator for OpenAPI document loading
 * Coordinates the entire pipeline
 * @module
 * @internal
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { OTTLoadedOpenApiDocument } from '../bundle-metadata.types.js';
import { normalizeInput } from './normalize-input.js';
import { setupBundleInfrastructure } from './bundle-infrastructure.js';
import { createBundleConfig } from './bundle-config.js';
import { bundleDocument } from './bundle-document.js';
import { upgradeAndValidate } from './upgrade-validate.js';
import { createMetadata, formatDescriptor } from './metadata.js';

/**
 * Load and process OpenAPI document through complete pipeline.
 *
 * **Pipeline Stages:**
 * 1. Normalize Input: Accept string/URL/object, determine entry point
 * 2. Bundle: Resolve external file/URL references via @scalar/json-magic
 * 3. Upgrade: Convert OpenAPI 2.0/3.0 → 3.1 via @scalar/openapi-parser
 * 4. Validate: Type-guard to ensure BundledOpenApiDocument (intersection type)
 *
 * **Architecture Notes:**
 * - Replaces legacy SwaggerParser approach (ADR-019)
 * - bundle() preserves internal $refs (doesn't fully dereference)
 * - upgrade() automatically converts old specs to 3.1
 * - Type-safe at boundaries (no casting except Scalar interface)
 *
 * @param input - String path/URL, URL object, or in-memory OpenAPI document
 * @returns Loaded document with OpenAPI 3.1 spec and bundle metadata
 * @throws Error if bundling, upgrading, or validation fails
 *
 * @see {@link https://github.com/scalar/scalar Scalar OpenAPI Parser}
 * @see {@link .agent/architecture/SCALAR-PIPELINE.md Architecture docs}
 * @see {@link docs/architectural_decision_records/ADR-019-scalar-pipeline-adoption.md ADR-019}
 * @see {@link docs/architectural_decision_records/ADR-020-intersection-type-strategy.md ADR-020}
 * @public
 */
export async function loadOpenApiDocument(
  input: string | URL | OpenAPIObject,
): Promise<OTTLoadedOpenApiDocument> {
  const normalizedInput = normalizeInput(input);
  const { entrypoint, bundleInput, origin, originalDescriptor } = normalizedInput;

  const infrastructure = setupBundleInfrastructure(entrypoint.uri);
  const bundleConfig = createBundleConfig(
    infrastructure.filePlugin,
    infrastructure.urlPlugin,
    origin,
    infrastructure.warnings,
  );

  try {
    const bundledDocument = await bundleDocument(bundleInput, bundleConfig);
    const upgraded = upgradeAndValidate(bundledDocument);

    return {
      document: upgraded,
      metadata: createMetadata(
        entrypoint,
        infrastructure.files,
        infrastructure.urls,
        infrastructure.warnings,
        infrastructure.externalReferences,
      ),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const descriptor = formatDescriptor(originalDescriptor, entrypoint.uri);
    throw new Error(`Failed to load OpenAPI document (${descriptor}): ${message}`);
  }
}
