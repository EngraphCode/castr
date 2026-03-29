import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema, CastrSchemaContext, IRArrayItemsContext } from '../../../ir/index.js';
import type { TemplateContextOptions } from '../../../context/index.js';
import {
  formatPropertyKey,
  buildPropertyContext,
  shouldUseGetterSyntax,
  getSortedPropertyEntries,
} from '../properties.js';
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

  writer
    .write('z.strictObject(')
    .inlineBlock(() => {
      if (schema.properties) {
        writeProperties(schema, writer, writeZodSchemaFn, options);
      }
    })
    .write(')');
  writeObjectRefinements(schema, writer);
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
