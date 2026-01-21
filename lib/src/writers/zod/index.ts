import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { SchemaObjectType } from 'openapi3-ts/oas31';
import type { CastrSchema } from '../../ir/schema.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type {
  CastrSchemaContext,
  IRPropertySchemaContext,
  IRArrayItemsContext,
} from '../../ir/context.js';

import { writeCompositionSchema } from './composition.js';
import { writeMetadata } from './metadata.js';
import { writePrimitiveSchema, filterRedundantValidations } from './primitives.js';
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

  // Handle references FIRST - write the component name directly
  if (schema.$ref) {
    const { componentName } = parseComponentRef(schema.$ref);
    writer.write(componentName);
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

  if (!writePrimitiveSchema(schema, writer)) {
    switch (schema.type) {
      case 'array':
        writeArraySchema(context, writer, options);
        break;
      case 'object':
        writeObjectSchema(context, writer, options);
        break;
      case 'null':
        // Defensive: handle null type if it reaches here (should be caught by writePrimitiveSchema)
        writer.write('z.null()');
        break;
      default:
        // FAIL-FAST: Unknown types must throw, not silently degrade
        throw new Error(
          `Unsupported schema type: ${String(schema.type)}. ` +
            `Writer cannot produce valid Zod for this IR pattern.`,
        );
    }
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
  const nonNullTypes = types.filter((t): t is SchemaObjectType => t !== 'null' && t != null);
  const hasNull = types.some((t) => t === 'null' || t == null);

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

  const isOptionalProperty = context.contextType === 'property' && context.optional;
  const isOptionalParameter = context.contextType === 'parameter' && !context.required;
  if (isOptionalProperty || isOptionalParameter) {
    writer.write('.optional()');
  }

  // Nullability logic based on metadata
  // Skip if type is array - nullability is already handled in writeTypeArraySchema
  if (schema.metadata.nullable && !Array.isArray(schema.type)) {
    writer.write('.nullable()');
  }
}

/**
 * Write z.literal() for const values.
 * @internal
 */
function writeConstSchema(value: unknown, writer: CodeBlockWriter): void {
  writer.write('z.literal(');
  writer.write(JSON.stringify(value));
  writer.write(')');
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
    const isRequired = schema.required?.includes(key) ?? false;
    const propContext: IRPropertySchemaContext = {
      contextType: 'property',
      name: key,
      schema: prop,
      optional: !isRequired,
    };

    // Detect if this property causes circular references
    // Case 1: Property schema directly has circularReferences (self-referencing)
    // Case 2: Containing schema has circularReferences AND property has a $ref (mutual refs)
    const propHasCircularRef =
      prop.metadata?.circularReferences && prop.metadata.circularReferences.length > 0;
    const parentHasCircularRef =
      schema.metadata?.circularReferences && schema.metadata.circularReferences.length > 0;
    const propHasRef = hasSchemaReference(prop);

    const useGetterSyntax = propHasCircularRef || (parentHasCircularRef && propHasRef);

    if (useGetterSyntax) {
      // Use Zod 4 getter syntax for circular references
      // This allows: get children() { return z.array(Category); }
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

/**
 * Check if a schema contains a $ref (directly or in array items).
 * @internal
 */
function hasSchemaReference(schema: CastrSchema): boolean {
  // Direct $ref
  if (schema.$ref) {
    return true;
  }

  // Check array items for $ref
  if (schema.items && !Array.isArray(schema.items) && schema.items.$ref) {
    return true;
  }

  return false;
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
