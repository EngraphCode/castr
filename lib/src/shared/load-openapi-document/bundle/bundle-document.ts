/**
 * Document bundling via Scalar parser
 * @module
 * @internal
 */

import { bundle } from '@scalar/json-magic/bundle';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

import type { UnknownRecord } from '../../type-utils/types.js';

/**
 * Bundle OpenAPI document, resolving external references.
 *
 * Handles both string paths/URLs and in-memory OpenAPI objects.
 * For objects, performs type casting as Scalar expects Record<string, unknown>.
 *
 * @param input - String path/URL or OpenAPI object
 * @param config - Bundle configuration from createBundleConfig
 * @returns Bundled document (string, object, or filesystem)
 * @public
 */
export async function bundleDocument(
  input: string | OpenAPIObject,
  config: Parameters<typeof bundle>[1],
): Promise<string | AnyObject | Filesystem> {
  if (typeof input === 'string') {
    return await bundle(input, config);
  }

  const payload: UnknownRecord = {};
  Object.assign(payload, input);
  return await bundle(payload, config);
}
