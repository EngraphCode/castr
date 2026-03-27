import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema, CastrSchemaContext, IRArrayItemsContext } from '../../../ir/index.js';
import type { TemplateContextOptions } from '../../../context/index.js';
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

  // FAIL-FAST: Reject 2020-12 array keywords with no Zod equivalent.
  rejectUnsupportedArrayKeywords(schema);

  // Tuple: prefixItems maps to z.tuple([...])
  if (schema.prefixItems !== undefined) {
    writeTupleSchema(schema, writer, writeZodSchemaFn, options);
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

  // FAIL-FAST: Zod has no native equivalent for patternProperties or propertyNames.
  // These IR keywords cannot be represented losslessly in Zod output.
  rejectUnsupportedObjectKeywords(schema);

  writer
    .write('z.strictObject(')
    .inlineBlock(() => {
      if (schema.properties) {
        writeProperties(schema, writer, writeZodSchemaFn, options);
      }
    })
    .write(')');
}

function rejectUnsupportedObjectKeywords(schema: CastrSchema): void {
  if (schema.patternProperties !== undefined) {
    throw new Error(
      'Unsupported IR pattern: patternProperties cannot be represented in Zod. ' +
        'Zod has no native equivalent for regex-keyed property schemas.',
    );
  }
  if (schema.propertyNames !== undefined) {
    throw new Error(
      'Unsupported IR pattern: propertyNames cannot be represented in Zod. ' +
        'Zod has no native equivalent for property name validation schemas.',
    );
  }
  if (schema.dependentSchemas !== undefined) {
    throw new Error(
      'Unsupported IR pattern: dependentSchemas cannot be represented in Zod. ' +
        'Zod has no native equivalent for conditional schema requirements.',
    );
  }
  if (schema.dependentRequired !== undefined) {
    throw new Error(
      'Unsupported IR pattern: dependentRequired cannot be represented in Zod. ' +
        'Zod has no native equivalent for conditional required properties.',
    );
  }
  // unevaluatedProperties: boolean `false` maps to z.strictObject() semantics
  // (already the default). Only schema-valued form is unsupported.
  if (
    schema.unevaluatedProperties !== undefined &&
    typeof schema.unevaluatedProperties !== 'boolean'
  ) {
    throw new Error(
      'Unsupported IR pattern: schema-valued unevaluatedProperties cannot be represented in Zod. ' +
        'Only boolean unevaluatedProperties (strict object semantics) is supported.',
    );
  }
  rejectConditionalApplicators(schema, 'Zod');
}

function rejectUnsupportedArrayKeywords(schema: CastrSchema): void {
  if (schema.unevaluatedItems !== undefined) {
    throw new Error(
      'Unsupported IR pattern: unevaluatedItems cannot be represented in Zod. ' +
        'Zod has no native equivalent for unevaluated item validation.',
    );
  }
  if (schema.minContains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: minContains cannot be represented in Zod. ' +
        'Zod has no native equivalent for contains-based validation.',
    );
  }
  if (schema.maxContains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: maxContains cannot be represented in Zod. ' +
        'Zod has no native equivalent for contains-based array validation.',
    );
  }
  if (schema.contains !== undefined) {
    throw new Error(
      'Unsupported IR pattern: contains cannot be represented in Zod. ' +
        'Zod has no native equivalent for contains-based array validation.',
    );
  }
}

function rejectConditionalApplicators(schema: CastrSchema, format: string): void {
  if (schema.if !== undefined) {
    throw new Error(
      `Unsupported IR pattern: if/then/else conditional applicators cannot be represented in ${format}. ` +
        `${format} has no native equivalent for JSON Schema conditional validation.`,
    );
  }
  if (schema.then !== undefined) {
    throw new Error(
      `Unsupported IR pattern: if/then/else conditional applicators cannot be represented in ${format}. ` +
        `${format} has no native equivalent for JSON Schema conditional validation.`,
    );
  }
  if (schema.else !== undefined) {
    throw new Error(
      `Unsupported IR pattern: if/then/else conditional applicators cannot be represented in ${format}. ` +
        `${format} has no native equivalent for JSON Schema conditional validation.`,
    );
  }
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
