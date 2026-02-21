/**
 * Main orchestrator for OpenAPI document loading
 * Coordinates the entire pipeline
 * @module
 * @internal
 */

import { validate } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { OTTLoadedOpenApiDocument } from './bundle/bundle-metadata.types.js';
import { normalizeInput } from './normalize-input.js';
import { setupBundleInfrastructure, createBundleConfig, bundleDocument } from './bundle/index.js';
import { upgradeAndValidate } from './upgrade-validate.js';
import { createMetadata, formatDescriptor } from './metadata.js';
import { createValidationErrorMessage } from './validation-errors.js';

/**
 * Load and process OpenAPI document through complete pipeline.
 *
 * **Pipeline Stages:**
 * 1. Normalize Input: Accept string/URL/object, determine entry point
 * 2. Bundle: Resolve external file/URL references via @scalar/json-magic
 * 3. **Validate**: Strict validation against declared version schema (FAIL FAST)
 * 4. Upgrade: Convert OpenAPI 2.0/3.0 → 3.1 via @scalar/openapi-parser
 * 5. Type Guard: Ensure BundledOpenApiDocument (intersection type)
 *
 * **Architecture Notes:**
 * - Replaces legacy SwaggerParser approach (ADR-019)
 * - bundle() preserves internal $refs (doesn't fully dereference)
 * - validate() STRICTLY validates against declared version BEFORE upgrade
 * - upgrade() automatically converts old specs to 3.1
 * - Type-safe at boundaries (no casting except Scalar interface)
 *
 * @param input - String path/URL, URL object, or in-memory OpenAPI document
 * @returns Loaded document with OpenAPI 3.1 spec and bundle metadata
 * @throws Error if validation, bundling, upgrading, or type guard fails
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

    // STRICT VALIDATION: Validate against declared version BEFORE upgrade
    // Per RULES.md: "Fail fast, fail hard, be strict at all times"
    const validationResult = await validate(bundledDocument);

    if (!validationResult.valid) {
      const errorMessage = createValidationErrorMessage(validationResult.errors, bundledDocument);
      throw new Error(errorMessage);
    }

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
