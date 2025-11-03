/**
 * Unified OpenAPI Input Preparation Pipeline
 *
 * This module provides a single, deterministic pipeline for preparing OpenAPI
 * documents from various input sources (file paths, URLs, or in-memory objects).
 * Both CLI and programmatic APIs use this helper to ensure consistent behavior.
 *
 * **Why Bundle Mode (Not Dereference)?**
 *
 * The pipeline uses SwaggerParser.bundle() which resolves external $refs but keeps
 * internal $refs intact. This is essential because:
 *
 * 1. **Circular References**: Dereferencing creates circular JavaScript object references
 *    (e.g., `Node.properties.next === Node`), which cause stack overflows during Zod
 *    schema generation. Bundle mode preserves $refs, allowing us to detect cycles and
 *    use `z.lazy()` appropriately.
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

import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPI } from 'openapi-types';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import { isOpenAPIObject } from '../validation/cli-type-guards.js';

// eslint-disable-next-line sonarjs/redundant-type-aliases -- it is semantically useful.
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
 * 1. Bundling via SwaggerParser.bundle() (validates structure, resolves external $refs, keeps internal ones)
 * 2. Type boundary assertion to ensure openapi3-ts compatibility
 *
 * Note: We use bundle() directly (not validate() + bundle()) because bundle() performs
 * validation internally. Calling validate() separately on in-memory objects causes mutation
 * that breaks circular reference handling.
 *
 * **Processing Strategy:**
 * The function uses SwaggerParser.bundle() which resolves external $refs but preserves
 * internal $refs. This is essential for proper handling of circular references and
 * dependency tracking (see module documentation for details).
 *
 * **Error Handling:**
 * - All errors are sourced from SwaggerParser for consistency
 * - Errors include actionable messages with file paths/URLs when available
 * - Supports OpenAPI 3.0.x and 3.1.x specifications
 *
 * @param input - OpenAPI document source: file path string, URL object, or in-memory OpenAPIObject
 * @returns Validated and bundled OpenAPIObject with internal $refs preserved
 *
 * @throws {Error} When input cannot be loaded (file not found, network error, etc.)
 * @throws {Error} When OpenAPI document fails validation (structural errors)
 *
 * @example File path input
 * ```typescript
 * import { prepareOpenApiDocument } from 'openapi-zod-client';
 *
 * const spec = await prepareOpenApiDocument('./api.yaml');
 * // spec is now a validated, bundled OpenAPIObject ready for code generation
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
 * ```
 *
 * @public
 */
export async function prepareOpenApiDocument(
  input: FilePathInput | URL | OpenAPIObject,
): Promise<OpenAPIObject> {
  // Normalize input: convert URL to string if needed
  let parserInput: string | OpenAPI.Document;
  if (input instanceof URL) {
    parserInput = input.toString();
  } else if (typeof input === 'string') {
    parserInput = input;
  } else {
    // Handle type boundary: SwaggerParser uses openapi-types, we use openapi3-ts
    // Both are structurally compatible but nominally different. This is the ONE place we need to assert the type.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    parserInput = input as OpenAPI.Document;
  }

  // Bundle with SwaggerParser. Validates the document structure, resolves external $refs, and keeps internal $refs.
  // Internal $refs are essential for circular reference handling and dependency tracking
  const processed = await SwaggerParser.bundle(parserInput);

  // Convert back to openapi3-ts types
  if (!isOpenAPIObject(processed)) {
    throw new Error('SwaggerParser.bundle() returned invalid OpenAPI document');
  }
  return processed;
}
