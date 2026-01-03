import { CodeBlockWriter } from 'ts-morph';
import { buildCastrSchema } from '../../context/ir-builder.core.js';
import { writeTypeDefinition } from '../../writers/type-writer.js';
import type { SchemaObject } from 'openapi3-ts/oas31';
import type { IRBuildContext } from '../../context/ir-builder.types.js';

/**
 * Convert an OpenAPI schema to TypeScript type definition.
 *
 * Generates TypeScript type syntax from an OpenAPI SchemaObject.
 * This is a stateless conversion that produces type strings directly.
 *
 * @remarks
 * Unlike Zod generation, TypeScript type generation doesn't require options
 * like `allReadonly` because TypeScript's `readonly` modifier is a type-level
 * concern not derived from OpenAPI `readOnly` property semantics.
 *
 * If you need readonly TypeScript types, use `Readonly<T>` wrapper after generation.
 *
 * @param params - Conversion parameters
 * @param params.schema - OpenAPI schema to convert
 * @param params.meta - Optional metadata for the type
 * @param params.meta.name - If provided, generates `export type {name} = ...;`
 * @returns TypeScript type definition as string
 *
 * @example
 * ```typescript
 * // Simple type
 * getTypescriptFromOpenApi({ schema: { type: 'string' } });
 * // → "string"
 *
 * // Named export
 * getTypescriptFromOpenApi({
 *   schema: { type: 'object', properties: { id: { type: 'string' } } },
 *   meta: { name: 'User' }
 * });
 * // → "export type User = { id?: string; };"
 * ```
 *
 * @public
 */
export function getTypescriptFromOpenApi({
  schema,
  meta,
}: {
  schema: SchemaObject;
  meta?: { name: string; $ref?: string };
}): string {
  const context: IRBuildContext = {
    doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
    path: [],
    required: false,
  };
  const irSchema = buildCastrSchema(schema, context);

  const writer = new CodeBlockWriter({
    useTabs: false,
    indentNumberOfSpaces: 2,
  });

  if (meta?.name) {
    writer.write(`export type ${meta.name} = `);
    writeTypeDefinition(irSchema)(writer);
    writer.write(';');
  } else {
    writeTypeDefinition(irSchema)(writer);
  }

  return writer.toString();
}
