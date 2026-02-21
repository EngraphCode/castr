/**
 * Bundle configuration for Scalar parser
 * @module
 * @internal
 */

import type { LoaderPlugin, bundle } from '@scalar/json-magic/bundle';
import type { OTTBundleWarning } from './bundle-metadata.types.js';

/**
 * Resolve error node from Scalar parser.
 *
 * **OTT Domain Type** - Scalar doesn't export this structure.
 *
 * @internal
 */
export interface OTTResolveNode {
  readonly pointer?: unknown;
  readonly $ref?: unknown;
  readonly message?: unknown;
}

/**
 * Build warning object from resolve error node.
 *
 * @param node - Resolve error node from Scalar
 * @returns Bundle warning with code and message
 * @internal
 */
export function buildWarning(node: OTTResolveNode): OTTBundleWarning {
  const pointerValue = node.pointer;
  const refValue = node.$ref;
  let pointer: string | undefined;

  if (typeof pointerValue === 'string') {
    pointer = pointerValue;
  } else if (typeof refValue === 'string') {
    pointer = refValue;
  }

  const messageValue = node.message;
  const message = typeof messageValue === 'string' ? messageValue : 'Failed to resolve reference';

  if (pointer === undefined) {
    return { code: 'resolve:error', message };
  }

  return { code: 'resolve:error', message, pointer };
}

/**
 * Create bundle configuration for Scalar parser.
 *
 * @param filePlugin - Wrapped file loader plugin
 * @param urlPlugin - Wrapped URL loader plugin
 * @param origin - Optional origin URL for relative resolution
 * @param warnings - Array to populate with warnings
 * @returns Bundle configuration object
 * @public
 */
export function createBundleConfig(
  filePlugin: LoaderPlugin,
  urlPlugin: LoaderPlugin,
  origin: string | undefined,
  warnings: OTTBundleWarning[],
): Parameters<typeof bundle>[1] {
  const config: Parameters<typeof bundle>[1] = {
    plugins: [filePlugin, urlPlugin],
    treeShake: false,
    urlMap: true,
    hooks: {
      onResolveError: (node: OTTResolveNode) => {
        warnings.push(buildWarning(node));
      },
    },
  };

  if (origin !== undefined) {
    config.origin = origin;
  }

  return config;
}
