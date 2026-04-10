/**
 * Document upgrade and validation
 * @module
 * @internal
 */

import { upgrade } from '@scalar/openapi-parser';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';
import { isOpenAPIDocument } from '../../validation/cli-type-guards.js';
import { CANONICAL_OPENAPI_VERSION, isSupportedBundledOpenApiVersion } from '../openapi/version.js';
import type { BundledOpenApiDocument } from './bundle/bundle-metadata.types.js';

/**
 * Type guard for BundledOpenApiDocument (intersection type).
 *
 * Architecture Note:
 * This type guard validates at the boundary between Scalar's loose types
 * (Record<string, unknown>) and our strict types (BundledOpenApiDocument).
 * This follows our "validate at boundaries, no casting" principle (ADR-020).
 *
 * Validation checks:
 * 1. Basic OpenAPI structure (info, openapi, paths)
 * 2. Version is 3.1.x or 3.2.x (Scalar's upgrade bridge currently returns 3.1.x)
 *
 * @param value - Value to validate
 * @returns True if value is valid BundledOpenApiDocument
 * @internal
 */
export function isBundledOpenApiDocument(value: unknown): value is BundledOpenApiDocument {
  if (!isOpenAPIDocument(value)) {
    return false;
  }

  const version = value.openapi;
  if (typeof version !== 'string' || !isSupportedBundledOpenApiVersion(version)) {
    return false;
  }

  return true;
}

/**
 * Upgrade bundled document to the canonical OpenAPI 3.2 target and validate.
 *
 * Uses Scalar's upgrade() to convert OpenAPI 2.0/3.0 → 3.1 bridge syntax,
 * then validates the result with type guard.
 *
 * @param bundledDocument - Document from bundleDocument()
 * @returns Validated OpenAPI document canonicalised to OpenAPI 3.2.0
 * @throws Error if upgrade fails or result is invalid
 * @public
 */
export function upgradeAndValidate(
  bundledDocument: string | AnyObject | Filesystem,
): BundledOpenApiDocument {
  const { specification: upgraded } = upgrade(bundledDocument);

  if (!isBundledOpenApiDocument(upgraded)) {
    throw new Error('Failed to produce valid OpenAPI 3.2 document');
  }

  return {
    ...upgraded,
    openapi: CANONICAL_OPENAPI_VERSION,
  };
}
