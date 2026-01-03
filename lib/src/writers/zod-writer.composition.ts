/**
 * Zod Writer - Composition Schemas
 *
 * Handles generation of Zod schemas for composition types (oneOf, anyOf, allOf).
 *
 * @module zod-writer.composition
 * @internal
 */

import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../context/ir-schema.js';
import type { TemplateContextOptions } from '../context/template-context.js';
import type { CastrSchemaContext, IRCompositionMemberContext } from '../context/ir-context.js';

type SchemaWriter = (
  context: CastrSchemaContext,
  options?: TemplateContextOptions,
) => WriterFunction;

/**
 * Write composition schemas (oneOf, anyOf, allOf).
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
    writeUnionSchema(schema.oneOf, 'oneOf', writer, writeSchema, options);
  } else if (schema.anyOf) {
    writeUnionSchema(schema.anyOf, 'anyOf', writer, writeSchema, options);
  } else if (schema.allOf) {
    writeIntersectionSchema(schema.allOf, writer, writeSchema, options);
  }
}

/**
 * Write union schema for oneOf/anyOf.
 * @internal
 */
function writeUnionSchema(
  schemas: CastrSchema[],
  type: 'oneOf' | 'anyOf',
  writer: CodeBlockWriter,
  writeSchema: SchemaWriter,
  options?: TemplateContextOptions,
): void {
  if (schemas.length === 0) {
    writer.write('z.never()');
    return;
  }

  if (schemas.length === 1) {
    writeSingleCompositionMember(schemas[0], type, writer, writeSchema, options);
    return;
  }

  writer.write('z.union([');
  schemas.forEach((subSchema, index) => {
    if (subSchema) {
      writeSingleCompositionMember(subSchema, type, writer, writeSchema, options);
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
