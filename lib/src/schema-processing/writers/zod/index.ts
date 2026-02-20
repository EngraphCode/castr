import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { SchemaObjectType } from 'openapi3-ts/oas31';
import type { CastrSchema } from '../../ir/schema.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type { CastrSchemaContext, IRArrayItemsContext } from '../../ir/context.js';

import { writeAdditionalProperties } from './additional-properties.js';
import { writeCompositionSchema } from './composition.js';
import { writeEnumSchema } from './enums.js';
import { writeConstSchema } from './literals.js';
import { writeMetadata } from './metadata.js';
import { writePrimitiveSchema, filterRedundantValidations } from './primitives.js';
import {
  formatPropertyKey,
  buildPropertyContext,
  shouldUseGetterSyntax,
  getSortedPropertyEntries,
} from './properties.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';
import { safeSchemaName } from '../../../shared/utils/identifier-utils.js';
import { isOptionalSchemaContext } from './context-utils.js';

const SCHEMA_TYPE_NULL = 'null' as const;

export function writeZodSchema(
  context: CastrSchemaContext,
  options?: TemplateContextOptions,
): WriterFunction {
  return (writer) => {
    writeSchemaBody(context, options)(writer);
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
    // Apply metadata via .meta() (Zod 4)
    writeMetadata(schema, writer);
  };
}

function writeSchemaType(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;

  // Handle $ref - use safeSchemaName to avoid shadowing built-in globals like Error
  if (schema.$ref) {
    const { componentName } = parseComponentRef(schema.$ref);
    writer.write(safeSchemaName(componentName));
    return;
  }

  // Handle const values with z.literal() - BEFORE type switch
  if (schema.const !== undefined) {
    writeConstSchema(schema.const, writer);
    return;
  }

  // Handle empty schema {} → z.unknown() (OAS 3.1: represents "any value")
  if (schema.type === undefined) {
    writer.write('z.unknown()');
    return;
  }

  // Handle OAS 3.1 type arrays (e.g., ['string', 'null'] or ['number', 'boolean'])
  if (Array.isArray(schema.type)) {
    writeTypeArraySchema(schema.type, context, writer, options);
    return;
  }

  // Dispatch to primitive or complex type handler
  if (!writePrimitiveSchema(schema, writer)) {
    writeComplexTypeSchema(schema.type, context, writer, options);
  }
}

/**
 * Write complex type schemas (array, object, null) that primitives.ts doesn't handle.
 * @internal
 */
function writeComplexTypeSchema(
  type: string,
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  switch (type) {
    case 'array':
      writeArraySchema(context, writer, options);
      break;
    case 'object':
      writeObjectSchema(context, writer, options);
      break;
    case 'null':
      writer.write('z.null()');
      break;
    default:
      // FAIL-FAST: Unknown types must throw, not silently degrade
      throw new Error(
        `Unsupported schema type: ${type}. Writer cannot produce valid Zod for this IR pattern.`,
      );
  }
}

/**
 * Handle OAS 3.1 type arrays (e.g., ['string', 'null']).
 * @internal
 */
function writeTypeArraySchema(
  types: SchemaObjectType[],
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  // Filter out null types - handle both string 'null' AND literal null (runtime data may have either)
  const nonNullTypes = types.filter(
    (typeEntry): typeEntry is SchemaObjectType =>
      typeEntry !== SCHEMA_TYPE_NULL && typeEntry != null,
  );
  const hasNull = types.some((typeEntry) => typeEntry === SCHEMA_TYPE_NULL || typeEntry == null);

  if (nonNullTypes.length === 0) {
    // Only null type - output z.null() directly
    writer.write('z.null()');
    return;
  }

  if (nonNullTypes.length === 1) {
    // Single non-null type - write it directly, nullable handled in chain
    const singleType = nonNullTypes[0];
    // Guard: we just checked length === 1, but TypeScript needs this
    if (singleType !== undefined) {
      writeSingleTypeFromArray(singleType, context, writer, options);
    }
  } else {
    // Multiple types - create union
    writer.write('z.union([');
    nonNullTypes.forEach((t, i) => {
      if (i > 0) {
        writer.write(', ');
      }
      writeSingleTypeFromArray(t, context, writer, options);
    });
    writer.write('])');
  }

  // Add .nullable() if null was in the type array
  if (hasNull) {
    writer.write('.nullable()');
  }
}

/**
 * Write a single type from a type array, creating appropriate context.
 * @internal
 */
function writeSingleTypeFromArray(
  type: SchemaObjectType,
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  options?: TemplateContextOptions,
): void {
  // Create a new schema with just this type
  const typeSchema: CastrSchema = {
    ...context.schema,
    type,
  };
  const typeContext: CastrSchemaContext = {
    ...context,
    schema: typeSchema,
  };
  writeSchemaType(typeContext, writer, options);
}

/**
 * Write Zod chain modifiers (validations, defaults, presence) to the schema.
 *
 * Filters out validations that are redundant because they're already built into
 * Zod 4 format functions (e.g., z.int() already includes integer validation,
 * z.email() already includes email validation).
 *
 * @internal
 */
function writeSchemaChain(context: CastrSchemaContext, writer: CodeBlockWriter): void {
  const schema = context.schema;
  if (!schema.metadata?.zodChain) {
    return;
  }

  const { validations, defaults } = schema.metadata.zodChain;

  // Filter out validations that are redundant for Zod 4 format functions
  const filteredValidations = filterRedundantValidations(validations, schema);
  filteredValidations.forEach((v) => writer.write(v));
  defaults.forEach((d) => writer.write(d));

  // Write .optional() for optional properties and parameters
  if (isOptionalSchemaContext(context)) {
    writer.write('.optional()');
  }

  // Nullability logic based on metadata
  // Skip if type is array - nullability is already handled in writeTypeArraySchema
  // Skip if type is 'null' - we never want z.null().nullable()
  if (schema.metadata.nullable && !Array.isArray(schema.type) && schema.type !== SCHEMA_TYPE_NULL) {
    writer.write('.nullable()');
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

  writeAdditionalProperties(schema, writer, options, writeZodSchema);
}

function writeProperties(
  schema: CastrSchema,
  writer: CodeBlockWriter,
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
      writeSchemaBody(propContext, options)(writer);
      writer.write('; },').newLine();
    } else {
      // Normal property assignment
      writer.write(`${quotedKey}: `);
      writeZodSchema(propContext, options)(writer);
      writer.write(',').newLine();
    }
  }
}
