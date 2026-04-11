/**
 * Main orchestrator for OpenAPI document loading
 * Coordinates the entire pipeline
 * @module
 * @internal
 */

import { validate } from '@scalar/openapi-parser';
import type { OpenAPIInputDocument } from '../openapi-types.js';
import type { OTTLoadedOpenApiDocument } from './bundle/bundle-metadata.types.js';
import { normalizeInput, type OTTNormalizedInput } from './normalize-input.js';
import {
  setupBundleInfrastructure,
  createBundleConfig,
  bundleDocument,
  type OTTBundleInfrastructure,
} from './bundle/index.js';
import { validateAdditionalOperationMethods } from './additional-operations-validation/index.js';
import { validateTopLevelPathTemplates } from './path-template-validation/index.js';
import { upgradeAndValidate } from './upgrade-validate.js';
import { createMetadata, formatDescriptor } from './metadata.js';
import { createValidationErrorMessage } from './validation-errors.js';

type BundledDocument = Awaited<ReturnType<typeof bundleDocument>>;
type BundleConfig = Parameters<typeof bundleDocument>[1];

interface BundleRuntime {
  readonly normalizedInput: OTTNormalizedInput;
  readonly infrastructure: OTTBundleInfrastructure;
  readonly bundleConfig: BundleConfig;
}

function createBundleRuntime(normalizedInput: OTTNormalizedInput): BundleRuntime {
  const { entrypoint, origin } = normalizedInput;
  const infrastructure = setupBundleInfrastructure(entrypoint.uri);
  const bundleConfig = createBundleConfig(
    infrastructure.filePlugin,
    infrastructure.urlPlugin,
    origin,
    infrastructure.warnings,
  );

  return {
    normalizedInput,
    infrastructure,
    bundleConfig,
  };
}

function throwIfValidationErrors(
  errors: Parameters<typeof createValidationErrorMessage>[0],
  bundledDocument: unknown,
): void {
  if (!errors || errors.length === 0) {
    return;
  }

  throw new Error(createValidationErrorMessage(errors, bundledDocument));
}

async function validateBundledDocument(bundledDocument: BundledDocument): Promise<void> {
  throwIfValidationErrors(validateAdditionalOperationMethods(bundledDocument), bundledDocument);

  // STRICT VALIDATION: Validate against declared version BEFORE upgrade
  // Per principles.md: "Fail fast, fail hard, be strict at all times"
  const validationResult = await validate(bundledDocument);
  if (!validationResult.valid) {
    throwIfValidationErrors(validationResult.errors, bundledDocument);
  }

  throwIfValidationErrors(validateTopLevelPathTemplates(bundledDocument), bundledDocument);
}

async function bundleAndValidateDocument(runtime: BundleRuntime): Promise<BundledDocument> {
  const bundledDocument = await bundleDocument(
    runtime.normalizedInput.bundleInput,
    runtime.bundleConfig,
  );
  await validateBundledDocument(bundledDocument);
  return bundledDocument;
}

function createLoadedDocument(
  runtime: BundleRuntime,
  bundledDocument: BundledDocument,
): OTTLoadedOpenApiDocument {
  const upgraded = upgradeAndValidate(bundledDocument);
  const { entrypoint } = runtime.normalizedInput;
  const { files, urls, warnings, externalReferences } = runtime.infrastructure;

  return {
    document: upgraded,
    metadata: createMetadata(entrypoint, files, urls, warnings, externalReferences),
  };
}

function createLoadOpenApiDocumentError(
  error: unknown,
  normalizedInput: Pick<OTTNormalizedInput, 'entrypoint' | 'originalDescriptor'>,
): Error {
  const message = error instanceof Error ? error.message : String(error);
  const descriptor = formatDescriptor(
    normalizedInput.originalDescriptor,
    normalizedInput.entrypoint.uri,
  );
  return new Error(`Failed to load OpenAPI document (${descriptor}): ${message}`, {
    cause: error,
  });
}

/**
 * Load and process OpenAPI document through complete pipeline.
 *
 * **Pipeline Stages:**
 * 1. Normalize Input: Accept string/URL/object, determine entry point
 * 2. Bundle: Resolve external file/URL references via @scalar/json-magic
 * 3. **Validate**: Strict validation against declared version schema (FAIL FAST)
 * 4. **Validate Path Templates**: Reject malformed top-level `paths` keys before upgrade
 * 5. Upgrade/Canonicalise: Bridge older specs through 3.1 semantics, then stamp 3.2.0
 * 6. Type Guard: Ensure BundledOpenApiDocument (intersection type)
 *
 * **Architecture Notes:**
 * - Replaces legacy SwaggerParser approach (ADR-019)
 * - bundle() preserves internal $refs (doesn't fully dereference)
 * - validate() STRICTLY validates against declared version BEFORE upgrade
 * - upgrade() automatically converts old specs to 3.1 bridge syntax
 * - the shared boundary returns canonical OpenAPI 3.2.0 documents
 * - Type-safe at boundaries (no casting except Scalar interface)
 *
 * @param input - String path/URL, URL object, or in-memory OpenAPI document
 * @returns Loaded document with canonical OpenAPI 3.2.0 spec and bundle metadata
 * @throws Error if validation, bundling, upgrading, or type guard fails
 *
 * @see {@link https://github.com/scalar/scalar Scalar OpenAPI Parser}
 * @see {@link .agent/architecture/SCALAR-PIPELINE.md Architecture docs}
 * @see {@link docs/architectural_decision_records/ADR-019-scalar-pipeline-adoption.md ADR-019}
 * @see {@link docs/architectural_decision_records/ADR-020-intersection-type-strategy.md ADR-020}
 * @public
 */
export async function loadOpenApiDocument(
  input: string | URL | OpenAPIInputDocument | object,
): Promise<OTTLoadedOpenApiDocument> {
  const normalizedInput = normalizeInput(input);
  const runtime = createBundleRuntime(normalizedInput);

  try {
    const bundledDocument = await bundleAndValidateDocument(runtime);
    return createLoadedDocument(runtime, bundledDocument);
  } catch (error) {
    throw createLoadOpenApiDocumentError(error, normalizedInput);
  }
}
