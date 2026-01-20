/**
 * Zod Writer - Composition Schemas
 *
 * Handles generation of Zod schemas for composition types (oneOf, anyOf, allOf).
 *
 * @module zod-writer.composition
 * @internal
 */

import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
import type { TemplateContextOptions } from '../../context/template-context.js';
import type { CastrSchemaContext, IRCompositionMemberContext } from '../../ir/context.js';

type SchemaWriter = (
  context: CastrSchemaContext,
  options?: TemplateContextOptions,
) => WriterFunction;

/**
 * Write composition schemas (oneOf, anyOf, allOf).
 *
 * - oneOf + discriminator: Uses z.discriminatedUnion() for optimized lookup
 * - oneOf: Uses z.xor() for exclusive union (exactly one must match)
 * - anyOf: Uses z.union() for inclusive union (at least one must match)
 * - allOf: Uses .and() chain for intersection
 *
 * @internal
 */
export function writeCompositionSchema(
  context: CastrSchemaContext,
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  const schema = context.schema;
  if (schema.oneOf) {
    // Check for discriminator - use discriminatedUnion for O(1) lookup
    if (schema.discriminator?.propertyName) {
      writeDiscriminatedUnionSchema(
        schema.oneOf,
        schema.discriminator.propertyName,
        writer,
        writeSchema,
        options,
      );
    } else {
      writeXorSchema(schema.oneOf, writer, writeSchema, options);
    }
  } else if (schema.anyOf) {
    writeUnionSchema(schema.anyOf, writer, writeSchema, options);
  } else if (schema.allOf) {
    writeIntersectionSchema(schema.allOf, writer, writeSchema, options);
  }
}

/**
 * Write discriminated union schema for oneOf with discriminator.
 *
 * z.discriminatedUnion() uses the discriminator property for O(1) lookup
 * instead of trying each schema sequentially. This is more efficient for
 * large unions.
 *
 * @internal
 */
function writeDiscriminatedUnionSchema(
  schemas: CastrSchema[],
  discriminatorKey: string,
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (schemas.length === 0) {
    writer.write('z.never()');
    return;
  }

  if (schemas.length === 1) {
    writeSingleCompositionMember(schemas[0], 'oneOf', writer, writeSchema, options);
    return;
  }

  writer.write(`z.discriminatedUnion("${discriminatorKey}", [`);
  schemas.forEach((subSchema, index) => {
    if (subSchema) {
      writeSingleCompositionMember(subSchema, 'oneOf', writer, writeSchema, options);
      if (index < schemas.length - 1) {
        writer.write(', ');
      }
    }
  });
  writer.write('])');
}

/**
 * Write exclusive union schema for oneOf using z.xor().
 *
 * z.xor() validates that exactly one schema matches (XOR semantics).
 * This correctly implements OpenAPI's oneOf semantics where the data
 * must validate against exactly one of the schemas, not multiple.
 *
 * @internal
 */
function writeXorSchema(
  schemas: CastrSchema[],
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (schemas.length === 0) {
    writer.write('z.never()');
    return;
  }

  if (schemas.length === 1) {
    // Single schema - no XOR needed, just write the schema directly
    writeSingleCompositionMember(schemas[0], 'oneOf', writer, writeSchema, options);
    return;
  }

  writer.write('z.xor([');
  schemas.forEach((subSchema, index) => {
    if (subSchema) {
      writeSingleCompositionMember(subSchema, 'oneOf', writer, writeSchema, options);
      if (index < schemas.length - 1) {
        writer.write(', ');
      }
    }
  });
  writer.write('])');
}

/**
 * Write inclusive union schema for anyOf using z.union().
 *
 * z.union() validates that at least one schema matches (OR semantics).
 * This correctly implements OpenAPI's anyOf semantics where the data
 * can validate against one or more of the schemas.
 *
 * @internal
 */
function writeUnionSchema(
  schemas: CastrSchema[],
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (schemas.length === 0) {
    writer.write('z.never()');
    return;
  }

  if (schemas.length === 1) {
    writeSingleCompositionMember(schemas[0], 'anyOf', writer, writeSchema, options);
    return;
  }

  writer.write('z.union([');
  schemas.forEach((subSchema, index) => {
    if (subSchema) {
      writeSingleCompositionMember(subSchema, 'anyOf', writer, writeSchema, options);
      if (index < schemas.length - 1) {
        writer.write(', ');
      }
    }
  });
  writer.write('])');
}

/**
 * Write intersection schema for allOf.
 * @internal
 */
function writeIntersectionSchema(
  schemas: CastrSchema[],
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (schemas.length === 0) {
    writer.write('z.unknown()');
    return;
  }

  const validSchemas = schemas.filter((s): s is CastrSchema => !!s);
  if (validSchemas.length === 0) {
    writer.write('z.unknown()');
    return;
  }

  // Write first schema
  writeSingleCompositionMember(validSchemas[0], 'allOf', writer, writeSchema, options);

  // Chain .and() for remaining schemas
  for (let i = 1; i < validSchemas.length; i++) {
    writer.write('.and(');
    writeSingleCompositionMember(validSchemas[i], 'allOf', writer, writeSchema, options);
    writer.write(')');
  }
}

function writeSingleCompositionMember(
  schema: CastrSchema | undefined,
  type: 'oneOf' | 'anyOf' | 'allOf',
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (!schema) {
    return;
  }
  const memberContext: IRCompositionMemberContext = {
    contextType: 'compositionMember',
    compositionType: type,
    schema,
  };
  writeSchema(memberContext, options)(writer);
}
