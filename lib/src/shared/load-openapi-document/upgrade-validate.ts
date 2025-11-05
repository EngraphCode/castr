/**
 * Document upgrade and validation
 * @module
 * @internal
 */

import { upgrade } from '@scalar/openapi-parser';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';
import { isOpenAPIObject } from '../../validation/cli-type-guards.js';
import type { BundledOpenApiDocument } from '../bundle-metadata.types.js';

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
 * 2. Version is 3.1.x (upgrade() should guarantee this)
 *
 * @param value - Value to validate
 * @returns True if value is valid BundledOpenApiDocument
 * @internal
 */
export function isBundledOpenApiDocument(value: unknown): value is BundledOpenApiDocument {
  if (!isOpenAPIObject(value)) {
    return false;
  }

  // Ensure it's 3.1.x (upgrade() should guarantee this)
  if (typeof value.openapi !== 'string' || !value.openapi.startsWith('3.1.')) {
    return false;
  }

  return true;
}

/**
 * Upgrade bundled document to OpenAPI 3.1 and validate.
 *
 * Uses Scalar's upgrade() to convert OpenAPI 2.0/3.0 → 3.1,
 * then validates the result with type guard.
 *
 * @param bundledDocument - Document from bundleDocument()
 * @returns Validated OpenAPI 3.1 document (intersection of Scalar and openapi3-ts types)
 * @throws Error if upgrade fails or result is invalid
 * @public
 */
export function upgradeAndValidate(
  bundledDocument: string | AnyObject | Filesystem,
): BundledOpenApiDocument {
  const { specification: upgraded } = upgrade(bundledDocument);

  if (!isBundledOpenApiDocument(upgraded)) {
    throw new Error('Failed to produce valid OpenAPI 3.1 document');
  }

  return upgraded;
}
