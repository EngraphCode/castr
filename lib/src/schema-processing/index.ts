/**
 * Schema Processing Module
 *
 * This module contains all code related to parsing, writing, converting,
 * and representing schemas. It provides a clear boundary for:
 *
 * 1. String manipulation ESLint rules (ADR-026)
 * 2. Public API exports for schema operations
 *
 * For external consumers, import specific submodules directly:
 * - `./parsers/openapi` - OpenAPI → IR
 * - `./parsers/zod` - Zod → IR
 * - `./writers/openapi` - IR → OpenAPI
 * - `./writers/zod` - IR → Zod
 * - `./writers/typescript` - IR → TypeScript
 * - `./writers/markdown` - IR → Markdown
 * - `./context` - Template context (includes backward-compatible re-exports)
 * - `./ir` - IR types and utilities
 *
 * This index provides a unified entry point but note that context/index.ts
 * also re-exports ir and parser types for backward compatibility.
 *
 * @module schema-processing
 */

// Core schema operations - export from context (which re-exports ir and buildIR for compatibility)
export * from './context/index.js';

// Additional parsers not re-exported by context
export { parseZodSource } from './parsers/zod/index.js';

// Writers
export { writeOpenApi } from './writers/openapi/index.js';
export { writeZodSchema } from './writers/zod/index.js';
export { writeTypeScript, writeIndexFile, writeCommonFile } from './writers/typescript/index.js';
export { writeMarkdown } from './writers/markdown/index.js';

// Conversions
export { convertOpenApiSchemaToJsonSchema } from './conversion/json-schema/convert-schema.js';
export { getZodSchema } from './conversion/zod/index.js';
