import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema, CastrSchemaContext, IRArrayItemsContext } from '../../../ir/index.js';
import type { TemplateContextOptions } from '../../../context/index.js';
import { writeAdditionalProperties } from '../additional-properties.js';
import {
  formatPropertyKey,
  buildPropertyContext,
  shouldUseGetterSyntax,
  getSortedPropertyEntries,
} from '../properties.js';

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
    .write('z.object(')
    .inlineBlock(() => {
      if (schema.properties) {
        writeProperties(schema, writer, writeZodSchemaFn, options);
      }
    })
    .write(')');

  writeAdditionalProperties(schema, writer, options, writeZodSchemaFn);
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
