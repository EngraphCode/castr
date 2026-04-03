/**
 * Unified OpenAPI Input Preparation Pipeline
 *
 * This module provides a single, deterministic pipeline for preparing OpenAPI
 * documents from various input sources (file paths, URLs, or in-memory objects).
 * Both CLI and programmatic APIs use this helper to ensure consistent behavior.
 *
 * **Architecture:**
 *
 * The pipeline uses Scalar's json-magic and openapi-parser to:
 * 1. Bundle specs (resolves external $refs, adds x-ext metadata)
 * 2. Validate against the declared OpenAPI version before upgrade/canonicalisation
 * 3. Bridge older specs through Scalar's OpenAPI 3.1 upgrade path, then canonicalise to 3.2.0
 * 4. Type and return the canonical document as the current openapi3-ts/oas31-compatible surface
 *
 * **Why Bundle Mode (Not Dereference)?**
 *
 * The pipeline keeps internal $refs intact. This is essential because:
 *
 * 1. **Circular References**: Dereferencing creates circular JavaScript object references
 *    (e.g., `Node.properties.next === Node`), which cause stack overflows during Zod
 *    schema generation. Bundle mode preserves $refs, allowing us to detect cycles and
 *    use getter-based recursion appropriately.
 *
 * 2. **Dependency Tracking**: Our dependency graph relies on $ref strings to determine
 *    schema ordering. After dereferencing, these $refs are gone, making it impossible
 *    to determine which schemas depend on which.
 *
 * 3. **Code Generation**: The Zod conversion code expects $refs, not inlined schemas.
 *    It handles $refs by generating references to other schema constants, maintaining
 *    clean, readable generated code.
 *
 * @module
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { loadOpenApiDocument } from './load-openapi-document/index.js';

// eslint-disable-next-line sonarjs/redundant-type-aliases -- JC: it is semantically useful.
type FilePathInput = string;

/**
 * Prepares an OpenAPI document from various input sources.
 *
 * This is the unified entry point for all OpenAPI input processing. It handles:
 * - File paths (relative or absolute)
 * - URLs (HTTP/HTTPS)
 * - In-memory OpenAPI objects
 *
 * The pipeline performs:
 * 1. Bundling via @scalar/json-magic (validates structure, resolves external $refs, keeps internal ones)
 * 2. Strict declared-version validation via @scalar/openapi-parser
 * 3. Upgrade/canonicalisation to OpenAPI 3.2.0 via the shared preparation boundary
 * 4. Type boundary validation to ensure openapi3-ts/oas31 compatibility
 *
 * **Processing Strategy:**
 * The function uses Scalar's bundle() which resolves external $refs but preserves
 * internal $refs. This is essential for proper handling of circular references and
 * dependency tracking (see module documentation for details).
 *
 * **Error Handling:**
 * - All errors include actionable messages with file paths/URLs when available
 * - Supports OpenAPI 3.0.x, 3.1.x, and native 3.2.x specifications
 * - Returns a canonical OpenAPI 3.2.0 document after the shared preparation boundary
 *
 * @param input - OpenAPI document source: file path string, URL object, or in-memory OpenAPIObject
 * @returns Validated, bundled, and canonicalised OpenAPIObject (3.2.0) with internal $refs preserved
 *
 * @throws {Error} When input cannot be loaded (file not found, network error, etc.)
 * @throws {Error} When OpenAPI document fails validation (structural errors)
 *
 * @example File path input
 * ```typescript
 * import { prepareOpenApiDocument } from '@engraph/castr';
 *
 * const spec = await prepareOpenApiDocument('./api.yaml');
 * // spec is now a validated, bundled OpenAPI 3.2.0 document ready for code generation
 * ```
 *
 * @example URL input
 * ```typescript
 * const spec = await prepareOpenApiDocument(new URL('https://api.example.com/openapi.json'));
 * ```
 *
 * @example In-memory object
 * ```typescript
 * const mySpec: OpenAPIObject = {
 *   openapi: '3.0.0',
 *   info: { title: 'My API', version: '1.0.0' },
 *   paths: {}
 * };
 * const spec = await prepareOpenApiDocument(mySpec);
 * // Returns an OpenAPI 3.2.0 document (automatically upgraded from 3.0 bridge syntax)
 * ```
 *
 * @public
 */
export async function prepareOpenApiDocument(
  input: FilePathInput | URL | OpenAPIObject,
): Promise<OpenAPIObject> {
  const { document } = await loadOpenApiDocument(input);
  return document;
}
