/**
 * IR Builder - Shared Types
 *
 * Common types used across IR builder modules.
 *
 * @module
 */

import type { OpenAPIDocument } from '../../../shared/openapi-types.js';

/**
 * Context passed through IR building process for schema resolution and metadata.
 *
 * Tracks current location in the OpenAPI document tree and provides access
 * to the full document for reference resolution.
 *
 * @internal
 */
export interface IRBuildContext {
  /**
   * The full OpenAPI document (for reference resolution).
   */
  doc: OpenAPIDocument;

  /**
   * Current path in the schema tree (for debugging and metadata).
   */
  path: string[];

  /**
   * Whether the current schema is required by its parent.
   */
  required: boolean;
}
