import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema, CastrSchemaContext, IRArrayItemsContext } from '../../../ir/index.js';
import type { TemplateContextOptions } from '../../../context/index.js';
import {
  formatPropertyKey,
  buildPropertyContext,
  getSortedPropertyEntries,
} from '../properties.js';
import { shouldUseGetterSyntax } from '../../support/zod/properties.recursion.js';
import { hasRecursiveCatchallSubtree } from '../../support/zod/catchall-recursion.js';
import { writeObjectRefinements, writeArrayRefinements } from '../refinements/index.js';

export function writeArraySchema(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;

  // Tuple: prefixItems maps to z.tuple([...])
  if (schema.prefixItems !== undefined) {
    writeTupleSchema(schema, writer, writeZodSchemaFn, options);
    writeArrayRefinements(schema, writer);
    return;
  }

  writer.write('z.array(');
  if (schema.items && !Array.isArray(schema.items)) {
    const itemsContext: IRArrayItemsContext = {
      contextType: 'arrayItems',
      schema: schema.items,
    };
    writeZodSchemaFn(itemsContext, options)(writer);
  } else {
    writer.write('z.unknown()');
  }
  writer.write(')');
  writeArrayRefinements(schema, writer);
}

/**
 * Write a Zod tuple schema from IR prefixItems.
 *
 * Emits `z.tuple([elementA, elementB, ...])` for schemas with positional
 * array items (JSON Schema 2020-12 `prefixItems`).
 *
 * @internal
 */
function writeTupleSchema(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  const items = schema.prefixItems;
  if (items === undefined) {
    return;
  }
  writer.write('z.tuple([');
  for (const [index, item] of items.entries()) {
    if (index > 0) {
      writer.write(', ');
    }
    const itemContext: IRArrayItemsContext = {
      contextType: 'arrayItems',
      schema: item,
    };
    writeZodSchemaFn(itemContext, options)(writer);
  }
  writer.write('])');
}

export function writeObjectSchema(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;
  const hasExplicitCatchall = usesExplicitCatchall(schema);

  assertCatchallIsWritable(schema, hasExplicitCatchall);
  writeObjectConstructor(writer, schema, hasExplicitCatchall, writeZodSchemaFn, options);
  writeCatchall(writer, schema, hasExplicitCatchall, writeZodSchemaFn, options);

  writeObjectRefinements(schema, writer);
}

function usesExplicitCatchall(schema: CastrSchema): boolean {
  return schema.additionalProperties !== undefined && schema.additionalProperties !== false;
}

function assertCatchallIsWritable(schema: CastrSchema, hasExplicitCatchall: boolean): void {
  if (!hasExplicitCatchall || !hasRecursiveCatchallSubtree(schema)) {
    return;
  }

  throw new Error(
    'Recursive object schemas with explicit additionalProperties cannot yet be emitted safely in Zod. ' +
      'Recursive catchall output still triggers eager getter evaluation in Zod 4. Stop at IR/OpenAPI/JSON Schema ' +
      'or remove the recursive catchall semantics.',
  );
}

function writeObjectConstructor(
  writer: CodeBlockWriter,
  schema: CastrSchema,
  hasExplicitCatchall: boolean,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  writer.write(hasExplicitCatchall ? 'z.object(' : 'z.strictObject(').inlineBlock(() => {
    if (schema.properties) {
      writeProperties(schema, writer, writeZodSchemaFn, options);
    }
  });
  writer.write(')');
}

function writeCatchall(
  writer: CodeBlockWriter,
  schema: CastrSchema,
  hasExplicitCatchall: boolean,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  if (!hasExplicitCatchall) {
    return;
  }

  writer.write('.catchall(');
  if (schema.additionalProperties === true) {
    writer.write('z.unknown()');
  } else if (schema.additionalProperties !== undefined && schema.additionalProperties !== false) {
    const catchallContext: CastrSchemaContext = {
      contextType: 'arrayItems',
      schema: schema.additionalProperties,
    };
    writeZodSchemaFn(catchallContext, options)(writer);
  }
  writer.write(')');
}

export function writeProperties(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  writeZodSchemaFn: (
    c: CastrSchemaContext,
    opts?: TemplateContextOptions,
  ) => (w: CodeBlockWriter) => void,
  options?: TemplateContextOptions,
): void {
  if (!schema.properties) {
    return;
  }

  for (const [key, prop] of getSortedPropertyEntries(schema)) {
    const quotedKey = formatPropertyKey(key);
    const isRequired = schema.required?.some((requiredName) => requiredName === key) ?? false;
    const propContext = buildPropertyContext(key, prop, isRequired);
    const useGetterSyntax = shouldUseGetterSyntax(prop, schema);

    if (useGetterSyntax) {
      // Zod 4 getter syntax for circular references
      writer.write(`get ${quotedKey}() { return `);
      writeZodSchemaFn(propContext, options)(writer);
      writer.write('; },').newLine();
    } else {
      // Normal property assignment
      writer.write(`${quotedKey}: `);
      writeZodSchemaFn(propContext, options)(writer);
      writer.write(',').newLine();
    }
  }
}
