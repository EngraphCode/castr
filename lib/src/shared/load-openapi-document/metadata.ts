/**
 * Metadata creation and formatting utilities
 * @module
 * @internal
 */

import type {
  OTTBundleFileEntry,
  OTTBundleUrlEntry,
  OTTBundleWarning,
  OTTBundleMetadata,
} from '../bundle-metadata.types.js';

/**
 * Format descriptor for error messages.
 * Shows transformation path if original differs from final URI.
 *
 * @param originalDescriptor - Original input descriptor
 * @param entrypointUri - Final resolved URI
 * @returns Formatted descriptor string
 * @public
 */
export function formatDescriptor(originalDescriptor: string, entrypointUri: string): string {
  if (originalDescriptor === entrypointUri) {
    return entrypointUri;
  }
  return `${originalDescriptor} -> ${entrypointUri}`;
}

/**
 * Create bundle metadata from collected data.
 *
 * Transforms Map of external references into array format.
 *
 * @param entrypoint - Entrypoint metadata
 * @param files - Collected file entries
 * @param urls - Collected URL entries
 * @param warnings - Collected warnings
 * @param externalReferences - Map of URI -> usage count
 * @returns Complete bundle metadata
 * @public
 */
export function createMetadata(
  entrypoint: OTTBundleMetadata['entrypoint'],
  files: OTTBundleFileEntry[],
  urls: OTTBundleUrlEntry[],
  warnings: OTTBundleWarning[],
  externalReferences: Map<string, number>,
): OTTBundleMetadata {
  return {
    entrypoint,
    files,
    urls,
    warnings,
    externalReferences: Array.from(externalReferences.entries()).map(([uri, usageCount]) => ({
      uri,
      usageCount,
    })),
  };
}
