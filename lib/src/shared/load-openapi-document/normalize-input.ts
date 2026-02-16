/**
 * Input normalization for OpenAPI document loading
 * Converts string/URL/object inputs into normalized form
 * @module
 * @internal
 */

import path from 'node:path';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { OTTBundleMetadata } from '../bundle-metadata.types.js';

/**
 * Normalized input ready for bundling.
 *
 * **OTT Domain Type** - Internal helper for input normalization.
 */
export interface OTTNormalizedInput {
  readonly entrypoint: OTTBundleMetadata['entrypoint'];
  readonly bundleInput: string | OpenAPIObject;
  readonly origin?: string;
  readonly originalDescriptor: string;
}

const IN_MEMORY_DESCRIPTOR = '[in-memory document]';
const HTTP_PROTOCOL = 'http:' as const;
const HTTPS_PROTOCOL = 'https:' as const;

/**
 * Check if string is a remote URL (http/https)
 * @internal
 */
export function isRemoteUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === HTTP_PROTOCOL || parsed.protocol === HTTPS_PROTOCOL;
  } catch {
    return false;
  }
}

/**
 * Normalize input into standard format for bundling.
 * Handles three input types: URL objects, string paths/URLs, and in-memory objects.
 *
 * @param input - URL, string path/URL, or OpenAPI object
 * @returns Normalized input with entrypoint metadata
 * @public
 */
export function normalizeInput(input: string | URL | OpenAPIObject): OTTNormalizedInput {
  if (input instanceof URL) {
    const href = input.toString();
    return {
      entrypoint: { kind: 'url', uri: href },
      bundleInput: href,
      origin: href,
      originalDescriptor: href,
    };
  }

  if (typeof input === 'string') {
    const descriptor = input;
    if (isRemoteUrl(input)) {
      return {
        entrypoint: { kind: 'url', uri: input },
        bundleInput: input,
        origin: input,
        originalDescriptor: descriptor,
      };
    }
    const absolutePath = path.resolve(input);
    return {
      entrypoint: { kind: 'file', uri: absolutePath },
      bundleInput: absolutePath,
      origin: absolutePath,
      originalDescriptor: descriptor,
    };
  }

  // In-memory object - pass directly to Scalar
  return {
    entrypoint: { kind: 'object', uri: IN_MEMORY_DESCRIPTOR },
    bundleInput: input,
    originalDescriptor: IN_MEMORY_DESCRIPTOR,
  };
}
