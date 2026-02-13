/**
 * Additional Properties Handling
 *
 * Pure function for writing Zod object additional properties modifiers.
 * Handles .strict(), .passthrough(), and .catchall() based on OpenAPI additionalProperties.
 *
 * @module writers/zod/additional-properties
 */

import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type { IRArrayItemsContext } from '../../ir/context.js';

/**
 * Write additional properties handling for Zod objects.
 *
 * Maps OpenAPI additionalProperties to Zod modifiers:
 * - `false` or strictObjects option → `.strict()`
 * - `true` or undefined → `.passthrough()`
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
  // Handle strict objects
  // If additionalProperties is explicitly false, OR if strictObjects option is true and additionalProperties is not true
  if (
    schema.additionalProperties === false ||
    (options?.strictObjects && schema.additionalProperties !== true)
  ) {
    writer.write('.strict()');
  } else if (schema.additionalProperties === true || schema.additionalProperties === undefined) {
    writer.write('.passthrough()');
  } else if (schema.additionalProperties) {
    // Schema for additional properties
    writer.write('.catchall(');
    const additionalContext: IRArrayItemsContext = {
      contextType: 'arrayItems',
      schema: schema.additionalProperties,
    };
    writeZodSchema(additionalContext, options)(writer);
    writer.write(')');
  }
}
