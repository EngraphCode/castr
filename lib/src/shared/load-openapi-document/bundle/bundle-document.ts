/**
 * Document bundling via Scalar parser
 * @module
 * @internal
 */

import { bundle } from '@scalar/json-magic/bundle';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';

/**
 * Bundle OpenAPI document, resolving external references.
 *
 * Handles both string paths/URLs and in-memory OpenAPI objects.
 * For objects, copies into a plain unknown-key map for Scalar's bundle helper.
 *
 * @param input - String path/URL or OpenAPI object
 * @param config - Bundle configuration from createBundleConfig
 * @returns Bundled document (string, object, or filesystem)
 * @public
 */
export async function bundleDocument(
  input: string | object,
  config: Parameters<typeof bundle>[1],
): Promise<string | AnyObject | Filesystem> {
  if (typeof input === 'string') {
    return await bundle(input, config);
  }

  const payload: AnyObject = {};
  Object.assign(payload, input);
  return await bundle(payload, config);
}
