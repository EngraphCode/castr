/**
 * Document bundling via Scalar parser
 * @module
 * @internal
 */

import { bundle } from '@scalar/json-magic/bundle';
import type { AnyObject, Filesystem } from '@scalar/openapi-parser';
import type { OpenAPIObject } from 'openapi3-ts/oas31';

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

  // bundle() expects Record<string, unknown>, OpenAPIObject needs type casting
  // This is safe as we're passing it to Scalar's own bundle function
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-restricted-types
  return await bundle(input as unknown as Record<string, unknown>, config);
}
