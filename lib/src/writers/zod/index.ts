import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type {
  CastrSchemaContext,
  IRPropertySchemaContext,
  IRArrayItemsContext,
} from '../../ir/context.js';

import { writeCompositionSchema } from './composition.js';
import { parseComponentRef } from '../../shared/ref-resolution.js';
import { isValidJsIdentifier } from '../../shared/utils/identifier-utils.js';

export function writeZodSchema(
  context: CastrSchemaContext,
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer) => {
    const schema = context.schema;
    if (schema.metadata?.circularReferences && schema.metadata.circularReferences.length > 0) {
      writer.write('z.lazy(() => ');
      writeSchemaBody(context, options)(writer);
      writer.write(')');
    } else {
      writeSchemaBody(context, options)(writer);
    }
  };
}

function writeSchemaBody(
  context: CastrSchemaContext,
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer) => {
    const schema = context.schema;

    // Check for enums
    if (schema.enum && schema.enum.length > 0) {
      writeEnumSchema(context, writer);
    } else if (schema.oneOf || schema.anyOf || schema.allOf) {
      writeCompositionSchema(context, writer, writeZodSchema, options);
    } else {
      writeSchemaType(context, writer, options);
    }

    // Apply Zod chain modifiers
    writeSchemaChain(context, writer);
  };
}

function writeSchemaType(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;

  // Handle references FIRST - write the component name directly
  if (schema.$ref) {
    const { componentName } = parseComponentRef(schema.$ref);
    writer.write(componentName);
    return;
  }

  if (!writePrimitiveSchema(schema, writer)) {
    switch (schema.type) {
      case 'array':
        writeArraySchema(context, writer, options);
        break;
      case 'object':
        writeObjectSchema(context, writer, options);
        break;
      default:
        // Fallback to unknown - should only happen for truly unknown types
        writer.write('z.unknown()');
    }
  }
}

/**
 * Write Zod chain modifiers (validations, defaults, presence) to the schema.
 * @internal
 */
function writeSchemaChain(context: CastrSchemaContext, writer: CodeBlockWriter): void {
  const schema = context.schema;
  if (!schema.metadata?.zodChain) {
    return;
  }

  const { validations, defaults } = schema.metadata.zodChain;
  validations.forEach((v) => writer.write(v));
  defaults.forEach((d) => writer.write(d));

  // Presence logic based on context
  const isOptionalProperty = context.contextType === 'property' && context.optional;
  const isOptionalParameter = context.contextType === 'parameter' && !context.required;

  if (isOptionalProperty || isOptionalParameter) {
    writer.write('.optional()');
  }

  // Nullability logic based on metadata
  if (schema.metadata.nullable) {
    writer.write('.nullable()');
  }
}

function writePrimitiveSchema(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  switch (schema.type) {
    case 'string':
      writer.write('z.string()');
      return true;
    case 'number':
    case 'integer':
      writer.write('z.number()');
      return true;
    case 'boolean':
      writer.write('z.boolean()');
      return true;
    default:
      return false;
  }
}

function writeArraySchema(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;
  writer.write('z.array(');
  if (schema.items && !Array.isArray(schema.items)) {
    const itemsContext: IRArrayItemsContext = {
      contextType: 'arrayItems',
      schema: schema.items,
    };
    writeZodSchema(itemsContext, options)(writer);
  } else {
    writer.write('z.unknown()');
  }
  writer.write(')');
}

function writeObjectSchema(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;
  writer
    .write('z.object(')
    .inlineBlock(() => {
      if (schema.properties) {
        writeProperties(schema, writer, options);
      }
    })
    .write(')');

  writeAdditionalProperties(schema, writer, options);
}

function writeProperties(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  if (!schema.properties) {
    return;
  }

  for (const [key, prop] of schema.properties.entries()) {
    // Quote property names that aren't valid JS identifiers
    const quotedKey = isValidJsIdentifier(key) ? key : `'${key}'`;
    writer.write(`${quotedKey}: `);

    const isRequired = schema.required?.includes(key) ?? false;
    const propContext: IRPropertySchemaContext = {
      contextType: 'property',
      name: key,
      schema: prop,
      optional: !isRequired,
    };

    writeZodSchema(propContext, options)(writer);
    writer.write(',').newLine();
  }
}

function writeAdditionalProperties(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
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

function writeEnumSchema(context: CastrSchemaContext, writer: CodeBlockWriter): void {
  const schema = context.schema;
  if (!schema.enum || schema.enum.length === 0) {
    return;
  }

  // Check if all values are strings
  const allStrings = schema.enum.every((v) => typeof v === 'string');

  if (schema.enum.length === 1) {
    const value = schema.enum[0];
    writer.write('z.literal(');
    if (typeof value === 'string') {
      writer.quote(value);
    } else {
      writer.write(String(value));
    }
    writer.write(')');
  } else if (allStrings) {
    writer.write('z.enum([');
    const enumValues = schema.enum;
    enumValues.forEach((v, i) => {
      writer.quote(String(v));
      if (i < enumValues.length - 1) {
        writer.write(', ');
      }
    });
    writer.write('])');
  } else {
    writer.write('z.union([');
    const enumValues = schema.enum;
    enumValues.forEach((v, i) => {
      writer.write('z.literal(');
      if (typeof v === 'string') {
        writer.quote(v);
      } else {
        writer.write(String(v));
      }
      writer.write(')');
      if (i < enumValues.length - 1) {
        writer.write(', ');
      }
    });
    writer.write('])');
  }
}
