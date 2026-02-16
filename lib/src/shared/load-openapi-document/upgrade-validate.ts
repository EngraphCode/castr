/**
 * Document upgrade and validation
 * @module
 * @internal
 */

import { upgrade } from '@scalar/openapi-parser';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';
import { split } from 'lodash-es';
import { isOpenAPIObject } from '../../validation/cli-type-guards.js';
import type { BundledOpenApiDocument } from '../bundle-metadata.types.js';

const OPENAPI_VERSION_SEPARATOR = '.' as const;
const OPENAPI_VERSION_MAJOR_3 = '3' as const;
const OPENAPI_VERSION_MINOR_1 = '1' as const;

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
  const version = value.openapi;
  const versionSegments = split(version, OPENAPI_VERSION_SEPARATOR);
  const major = versionSegments[0];
  const minor = versionSegments[1];
  if (
    typeof version !== 'string' ||
    major !== OPENAPI_VERSION_MAJOR_3 ||
    minor !== OPENAPI_VERSION_MINOR_1
  ) {
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
