/**
 * Additional Properties Handling
 *
 * Pure function for writing Zod object additional properties modifiers.
 * Handles .strict(), .passthrough(), and .catchall() based on OpenAPI additionalProperties.
 *
 * @module writers/zod/additional-properties
 */

import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema, CastrSchemaContext, IRArrayItemsContext } from '../../ir/index.js';
import {
  UNKNOWN_KEY_MODE_CATCHALL,
  UNKNOWN_KEY_MODE_PASSTHROUGH,
  UNKNOWN_KEY_MODE_STRICT,
  UNKNOWN_KEY_MODE_STRIP,
} from '../../ir/index.js';
import type { TemplateContextOptions } from '../../context/index.js';
import { isRecursiveObjectSchema } from './properties.js';

const CONTEXT_TYPE_COMPONENT = 'component';

function isSchemaWithAdditionalProperties(
  value: boolean | CastrSchema | undefined,
): value is CastrSchema {
  return value !== undefined && typeof value !== 'boolean';
}

function throwRecursiveUnknownKeyBehaviorError(mode: 'passthrough' | 'catchall'): never {
  throw new Error(
    `Recursive object schemas with unknown-key behavior "${mode}" cannot yet be emitted safely in Zod.`,
  );
}

type WriteZodSchemaFn = (
  context: IRArrayItemsContext,
  options?: TemplateContextOptions,
) => WriterFunction;

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
  return !isRecursiveObjectSchema(schema);
}

/**
 * Write a `.catchall(schema)` modifier for typed additional properties.
 * @internal
 */
function writeCatchall(
  additionalSchema: CastrSchema,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: WriteZodSchemaFn,
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
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: WriteZodSchemaFn,
): void {
  const schema = context.schema;
  const componentRef = getComponentRef(context);
  const isRecursive = isRecursiveObjectSchema(schema, componentRef);

  if (writeExplicitUnknownKeyBehavior(schema, isRecursive, writer, options, writeZodSchema)) {
    return;
  }

  if (
    writePortableAdditionalPropertiesBehavior(schema, isRecursive, writer, options, writeZodSchema)
  ) {
    return;
  }

  if (shouldPassthrough(schema)) {
    writer.write('.passthrough()');
  }
}

function getComponentRef(context: CastrSchemaContext): string | undefined {
  return context.contextType === CONTEXT_TYPE_COMPONENT
    ? `#/components/schemas/${context.name}`
    : undefined;
}

function writeExplicitUnknownKeyBehavior(
  schema: CastrSchema,
  isRecursive: boolean,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: WriteZodSchemaFn,
): boolean {
  switch (schema.unknownKeyBehavior?.mode) {
    case UNKNOWN_KEY_MODE_STRICT:
      writer.write('.strict()');
      return true;
    case UNKNOWN_KEY_MODE_STRIP:
      if (!isRecursive) {
        writer.write('.strip()');
      }
      return true;
    case UNKNOWN_KEY_MODE_PASSTHROUGH:
      assertNonRecursiveUnknownKeyBehavior(isRecursive, UNKNOWN_KEY_MODE_PASSTHROUGH);
      writer.write('.passthrough()');
      return true;
    case UNKNOWN_KEY_MODE_CATCHALL:
      assertNonRecursiveUnknownKeyBehavior(isRecursive, UNKNOWN_KEY_MODE_CATCHALL);
      writeCatchall(schema.unknownKeyBehavior.schema, writer, options, writeZodSchema);
      return true;
    default:
      return false;
  }
}

function writePortableAdditionalPropertiesBehavior(
  schema: CastrSchema,
  isRecursive: boolean,
  writer: CodeBlockWriter,
  options: TemplateContextOptions | undefined,
  writeZodSchema: WriteZodSchemaFn,
): boolean {
  if (shouldBeStrict(schema, options)) {
    writer.write('.strict()');
    return true;
  }

  if (isSchemaWithAdditionalProperties(schema.additionalProperties)) {
    assertNonRecursiveUnknownKeyBehavior(isRecursive, UNKNOWN_KEY_MODE_CATCHALL);
    writeCatchall(schema.additionalProperties, writer, options, writeZodSchema);
    return true;
  }

  if (schema.additionalProperties === true) {
    assertSafeRecursivePortablePassthrough(isRecursive);
    writer.write('.passthrough()');
    return true;
  }

  return false;
}

function assertNonRecursiveUnknownKeyBehavior(
  isRecursive: boolean,
  mode: typeof UNKNOWN_KEY_MODE_PASSTHROUGH | typeof UNKNOWN_KEY_MODE_CATCHALL,
): void {
  if (!isRecursive) {
    return;
  }

  throwRecursiveUnknownKeyBehaviorError(mode);
}

function assertSafeRecursivePortablePassthrough(isRecursive: boolean): void {
  if (!isRecursive) {
    return;
  }

  throw new Error(
    'Recursive object schemas with additionalProperties: true and no explicit unknown-key behavior cannot be emitted safely in Zod.',
  );
}
