/**
 * Additional Properties Handling
 *
 * Pure function for writing Zod object additional properties modifiers.
 * Handles .strict(), .passthrough(), and .catchall() based on OpenAPI additionalProperties.
 *
 * @module writers/zod/additional-properties
 */

import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema, IRArrayItemsContext } from '../../ir/index.js';
import type { TemplateContextOptions } from '../../context/index.js';

/**
 * Check if a schema should be treated as strict (rejecting unknown keys).
 * @internal
 */
function shouldBeStrict(schema: CastrSchema, options: TemplateContextOptions | undefined): boolean {
  return (
    schema.additionalProperties === false ||
    (options?.strictObjects === true && schema.additionalProperties !== true)
  );
}

/**
 * Check if a schema should use passthrough (accepting & preserving unknown keys).
 *
 * Skips passthrough for schemas with circular references because `.passthrough()`
 * eagerly reads the object shape, triggering `ReferenceError` on recursive getter
 * properties before initialization completes.
 *
 * @internal
 */
function shouldPassthrough(schema: CastrSchema): boolean {
  if (schema.additionalProperties !== true && schema.additionalProperties !== undefined) {
    return false;
  }
  const hasCircularRef =
    schema.metadata?.circularReferences && schema.metadata.circularReferences.length > 0;
  return !hasCircularRef;
}

/**
 * Write a `.catchall(schema)` modifier for typed additional properties.
 * @internal
 */
function writeCatchall(
  additionalSchema: CastrSchema,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: (
    context: IRArrayItemsContext,
    options?: TemplateContextOptions,
  ) => WriterFunction,
): void {
  writer.write('.catchall(');
  const additionalContext: IRArrayItemsContext = {
    contextType: 'arrayItems',
    schema: additionalSchema,
  };
  writeZodSchema(additionalContext, options)(writer);
  writer.write(')');
}

/**
 * Write additional properties handling for Zod objects.
 *
 * Maps OpenAPI additionalProperties to Zod modifiers:
 * - `false` or strictObjects option → `.strict()`
 * - `true` or undefined → `.passthrough()` (unless circular reference)
 * - Schema → `.catchall(schema)`
 *
 * @param schema - CastrSchema with additionalProperties
 * @param writer - ts-morph writer for code output
 * @param options - Template context options
 * @param writeZodSchema - Schema writer callback for catchall schemas
 *
 * @internal
 */
export function writeAdditionalProperties(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: (
    context: IRArrayItemsContext,
    options?: TemplateContextOptions,
  ) => WriterFunction,
): void {
  if (shouldBeStrict(schema, options)) {
    writer.write('.strict()');
  } else if (shouldPassthrough(schema)) {
    writer.write('.passthrough()');
  } else if (schema.additionalProperties && typeof schema.additionalProperties !== 'boolean') {
    writeCatchall(schema.additionalProperties, writer, options, writeZodSchema);
  }
}
