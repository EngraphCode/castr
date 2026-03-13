import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../ir/index.js';
import { getIntegerSemantics } from '../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';
import { isValidJsIdentifier } from '../../../shared/utils/identifier-utils.js';

export function writeTypeDefinition(schema: CastrSchema): WriterFunction {
  return (writer) => {
    assertSchemaSupportsIntegerTargetCapabilities(schema, 'TypeScript');
    writeTypeBody(schema)(writer);
    if (schema.metadata?.nullable) {
      writer.write(' | null');
    }
  };
}

/**
 * Write a $ref type name.
 * @internal
 */
function writeRefType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.$ref) {
    const { componentName } = parseComponentRef(schema.$ref);
    writer.write(componentName);
    return true;
  }
  return false;
}

/**
 * Write composition types (allOf → intersection, oneOf/anyOf → union).
 * @internal
 */
function writeCompositionType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.allOf) {
    writeIntersection(schema.allOf, writer);
    return true;
  }
  if (schema.oneOf ?? schema.anyOf) {
    writeUnion(schema.oneOf ?? schema.anyOf ?? [], writer);
    return true;
  }
  return false;
}

function resolveScalarTypeToken(schema: CastrSchema): string | undefined {
  if (getIntegerSemantics(schema) !== undefined) {
    return 'bigint';
  }

  switch (schema.type) {
    case 'string':
      return 'string';
    case 'number':
    case 'integer':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    default:
      return undefined;
  }
}

/**
 * Write a primitive/structured type from the schema type field.
 * @internal
 */
function writePrimitiveType(schema: CastrSchema, writer: CodeBlockWriter): void {
  const scalarTypeToken = resolveScalarTypeToken(schema);
  if (scalarTypeToken !== undefined) {
    writer.write(scalarTypeToken);
    return;
  }

  switch (schema.type) {
    case 'array':
      writeArrayType(schema, writer);
      break;
    case 'object':
      writeObjectType(schema, writer);
      break;
    default:
      writer.write('unknown');
  }
}

function writeTypeBody(schema: CastrSchema): WriterFunction {
  return (writer) => {
    if (writeRefType(schema, writer)) {
      return;
    }
    if (writeCompositionType(schema, writer)) {
      return;
    }
    writePrimitiveType(schema, writer);
  };
}

/**
 * Write intersection type for allOf composition.
 * allOf: [A, B] → A & B
 */
function writeIntersection(schemas: CastrSchema[], writer: CodeBlockWriter): void {
  if (schemas.length === 0) {
    writer.write('unknown');
    return;
  }
  schemas.forEach((s, i) => {
    if (i > 0) {
      writer.write(' & ');
    }
    // Wrap complex types in parentheses for correct precedence
    const needsParens = Boolean(s.oneOf ?? s.anyOf);
    if (needsParens) {
      writer.write('(');
    }
    writeTypeBody(s)(writer);
    if (needsParens) {
      writer.write(')');
    }
  });
}

/**
 * Resolve a $ref to its TypeScript type name.
 * @internal
 */
function resolveRefTypeString(schema: CastrSchema): string | undefined {
  if (!schema.$ref) {
    return undefined;
  }
  const { componentName } = parseComponentRef(schema.$ref);
  return componentName;
}

/**
 * Resolve a composition schema (allOf/oneOf/anyOf) to its TypeScript type string.
 * @internal
 */
function resolveCompositionTypeString(schema: CastrSchema): string | undefined {
  if (schema.allOf) {
    return schema.allOf.map((s) => resolveSchemaTypeString(s)).join(' & ');
  }
  const unionMembers = schema.oneOf ?? schema.anyOf;
  if (unionMembers) {
    return unionMembers.map((s) => resolveSchemaTypeString(s)).join(' | ');
  }
  return undefined;
}

/**
 * Resolve a primitive or structured type to its TypeScript type string.
 * @internal
 */
function resolvePrimitiveTypeString(schema: CastrSchema): string {
  const scalarTypeToken = resolveScalarTypeToken(schema);
  if (scalarTypeToken !== undefined) {
    return scalarTypeToken;
  }

  switch (schema.type) {
    case 'array':
      return resolveArrayTypeString(schema);
    case 'object':
      return resolveObjectTypeString(schema);
    default:
      return 'unknown';
  }
}

/**
 * Resolve an object type to a string that captures its shape.
 * Includes sorted property keys so different object shapes produce distinct strings.
 * @internal
 */
function resolveObjectTypeString(schema: CastrSchema): string {
  if (!schema.properties) {
    return 'object';
  }
  const keys = [...schema.properties.keys()].sort((a, b) => a.localeCompare(b));
  return `{${keys.join(',')}}`;
}

/**
 * Resolve an array type to its TypeScript type string.
 * @internal
 */
function resolveArrayTypeString(schema: CastrSchema): string {
  if (schema.items && !Array.isArray(schema.items)) {
    return `${resolveSchemaTypeString(schema.items)}[]`;
  }
  return 'unknown[]';
}

/**
 * Resolve a schema to its TypeScript type string, for deduplication purposes.
 *
 * Lightweight version of `writeTypeBody` that produces a string instead of
 * writing to a CodeBlockWriter. Used to detect and remove duplicate types
 * in unions (e.g., `number | number | number` → `number`).
 *
 * @internal
 */
function resolveSchemaTypeString(schema: CastrSchema): string {
  return (
    resolveRefTypeString(schema) ??
    resolveCompositionTypeString(schema) ??
    resolvePrimitiveTypeString(schema)
  );
}

/**
 * Write union type for oneOf/anyOf composition.
 * oneOf/anyOf: [A, B] → A | B
 *
 * Deduplicates type strings to avoid `number | number | number` from
 * numeric literal unions. Each unique TypeScript type appears only once.
 */
function writeUnion(schemas: CastrSchema[], writer: CodeBlockWriter): void {
  if (schemas.length === 0) {
    writer.write('unknown');
    return;
  }

  // Deduplicate: keep only the first schema for each unique type string
  const seen = new Set<string>();
  const uniqueSchemas: CastrSchema[] = [];

  for (const s of schemas) {
    const typeStr = resolveSchemaTypeString(s);
    if (!seen.has(typeStr)) {
      seen.add(typeStr);
      uniqueSchemas.push(s);
    }
  }

  uniqueSchemas.forEach((s, i) => {
    if (i > 0) {
      writer.write(' | ');
    }
    writeTypeBody(s)(writer);
  });
}

function writeArrayType(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.items && !Array.isArray(schema.items)) {
    writeTypeDefinition(schema.items)(writer);
    writer.write('[]');
  } else {
    writer.write('unknown[]');
  }
}

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (!schema.properties) {
    return [];
  }

  return [...schema.properties.entries()].sort(([leftKey], [rightKey]) =>
    leftKey.localeCompare(rightKey),
  );
}

function writeObjectType(schema: CastrSchema, writer: CodeBlockWriter): void {
  writer.inlineBlock(() => {
    for (const [key, prop] of getSortedPropertyEntries(schema)) {
      writeProperty(key, prop, writer);
    }
  });
}

function writeProperty(key: string, prop: CastrSchema, writer: CodeBlockWriter): void {
  if (prop.description) {
    writer.write(`/** ${prop.description} */ `);
  }
  const isOptional = !prop.metadata.required;
  // Quote property names that aren't valid JS identifiers
  const quotedKey = isValidJsIdentifier(key) ? key : `'${key}'`;
  writer.write(`${quotedKey}${isOptional ? '?' : ''}: `);
  writeTypeDefinition(prop)(writer);
  writer.write(';').newLine();
}
