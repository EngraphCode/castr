import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';
import { getIntegerSemantics, isConstrainedMap } from '../../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../../compatibility/integer-target-capabilities.js';
import { isValidJsIdentifier } from '../../../../shared/utils/identifier-utils.js';
import {
  rejectDynamicReferenceKeywords,
  rejectUnsupportedObjectKeywords,
  rejectUnsupportedArrayKeywords,
  resolveSchemaTypeString,
} from './fail-fast.js';
import {
  isUnion,
  isUnionOrIntersection,
  writeBooleanSchemaType,
  writeConstType,
  writeEnumType,
  writeRefType,
} from './leaf-types.js';
import { writeDependentRequiredUnions, writeDependentSchemasUnions } from './dependent-keywords.js';
import {
  DEPENDENT_REQUIRED_BESIDE_A_TYPESCRIPT_MAP,
  SCHEMA_VALUED_ADDITIONAL_PROPERTIES_OUTSIDE_THE_ROW,
  writeTypeScriptConstrainedMap,
} from '../../shared/map-nodes.js';

export function writeTypeDefinition(schema: CastrSchema): WriterFunction {
  return (writer) => {
    assertSchemaSupportsIntegerTargetCapabilities(schema, 'TypeScript');
    writeTypeBody(schema)(writer);
    if (schema.metadata?.nullable) {
      writer.write(' | null');
    }
  };
}

/** Write composition types (allOf → intersection, oneOf/anyOf → union). @internal */
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

/** Write a primitive/structured type from the schema type field. @internal */
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
    if (writeBooleanSchemaType(schema, writer)) {
      return;
    }
    rejectDynamicReferenceKeywords(schema);
    if (
      writeEnumType(schema, writer) ||
      writeRefType(schema, writer) ||
      writeConstType(schema, writer)
    ) {
      return;
    }
    if (writeCompositionType(schema, writer)) {
      return;
    }
    writePrimitiveType(schema, writer);
  };
}

/** Write intersection type. allOf: [A, B] → A & B */
function writeIntersection(schemas: CastrSchema[], writer: CodeBlockWriter): void {
  if (schemas.length === 0) {
    writer.write('unknown');
    return;
  }
  schemas.forEach((s, i) => {
    if (i > 0) {
      writer.write(' & ');
    }
    const needsParens = isUnion(s);
    if (needsParens) {
      writer.write('(');
    }
    writeTypeBody(s)(writer);
    if (needsParens) {
      writer.write(')');
    }
  });
}

/** Write union type. oneOf/anyOf: [A, B] → A | B. Deduplicates type strings. */
function writeUnion(schemas: CastrSchema[], writer: CodeBlockWriter): void {
  if (schemas.length === 0) {
    writer.write('unknown');
    return;
  }
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
  rejectUnsupportedArrayKeywords(schema);
  if (schema.prefixItems !== undefined) {
    writer.write('[');
    schema.prefixItems.forEach((item, index) => {
      if (index > 0) {
        writer.write(', ');
      }
      writeTypeDefinition(item)(writer);
    });
    writer.write(']');
    return;
  }
  if (schema.items && !Array.isArray(schema.items)) {
    // `A | B[]` is A or an array of B, so a union or an intersection is kept whole.
    const [open, close] = isUnionOrIntersection(schema.items) ? ['(', ')[]'] : ['', '[]'];
    writer.write(open);
    writeTypeDefinition(schema.items)(writer);
    writer.write(close);
  } else {
    writer.write('unknown[]');
  }
}

function getSortedPropertyEntries(schema: CastrSchema): [string, CastrSchema][] {
  if (!schema.properties) {
    return [];
  }
  return [...schema.properties.entries()].sort(([a], [b]) => a.localeCompare(b));
}

// An object whose unknown keys must satisfy a schema: written as a constrained map
// (specification Appendix B.2) or refused, so no constraint is ever dropped.
function writeMapType(schema: CastrSchema, values: CastrSchema, writer: CodeBlockWriter): void {
  if (!isConstrainedMap(schema)) {
    throw new Error(SCHEMA_VALUED_ADDITIONAL_PROPERTIES_OUTSIDE_THE_ROW);
  }
  if (schema.dependentRequired !== undefined) {
    throw new Error(DEPENDENT_REQUIRED_BESIDE_A_TYPESCRIPT_MAP);
  }
  writer.write(writeTypeScriptConstrainedMap(writeTypeDefinition(values)));
}

function writeObjectType(schema: CastrSchema, writer: CodeBlockWriter): void {
  rejectUnsupportedObjectKeywords(schema);
  const values = schema.additionalProperties;
  if (values !== undefined && typeof values !== 'boolean') {
    writeMapType(schema, values, writer);
    return;
  }
  const hasDependentRequired = schema.dependentRequired !== undefined;
  const hasDependentSchemas = schema.dependentSchemas !== undefined;
  if (!hasDependentRequired && !hasDependentSchemas) {
    writeObjectInlineBlock(schema, writer);
    return;
  }
  // Emit: BaseObject & (PresentBranch | AbsentBranch) & ...
  writeObjectInlineBlock(schema, writer);
  if (hasDependentRequired) {
    writeDependentRequiredUnions(schema, writer, writeProperty);
  }
  if (hasDependentSchemas) {
    writeDependentSchemasUnions(schema, writer, writeProperty);
  }
}

function writeObjectInlineBlock(schema: CastrSchema, writer: CodeBlockWriter): void {
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
  const quotedKey = isValidJsIdentifier(key) ? key : `'${key}'`;
  const isOptional = !prop.metadata.required;
  writer.write(`${quotedKey}${isOptional ? '?' : ''}: `);
  writeTypeDefinition(prop)(writer);
  writer.write(';').newLine();
}
