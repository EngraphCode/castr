import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
import { parseComponentRef } from '../../shared/ref-resolution.js';
import { isValidJsIdentifier } from '../../shared/utils/identifier-utils.js';

export function writeTypeDefinition(schema: CastrSchema): WriterFunction {
  return (writer) => {
    writeTypeBody(schema)(writer);
    if (schema.metadata?.nullable) {
      writer.write(' | null');
    }
  };
}

function writeTypeBody(schema: CastrSchema): WriterFunction {
  return (writer) => {
    // Handle references first
    if (schema.$ref) {
      const { componentName } = parseComponentRef(schema.$ref);
      writer.write(componentName);
      return;
    }

    // Handle composition schemas (allOf → intersection, oneOf/anyOf → union)
    if (schema.allOf) {
      writeIntersection(schema.allOf, writer);
      return;
    }
    if (schema.oneOf ?? schema.anyOf) {
      writeUnion(schema.oneOf ?? schema.anyOf ?? [], writer);
      return;
    }

    switch (schema.type) {
      case 'string':
        writer.write('string');
        break;
      case 'number':
      case 'integer':
        writer.write('number');
        break;
      case 'boolean':
        writer.write('boolean');
        break;
      case 'array':
        writeArrayType(schema, writer);
        break;
      case 'object':
        writeObjectType(schema, writer);
        break;
      case 'null':
        writer.write('null');
        break;
      default:
        writer.write('unknown');
    }
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
 * Write union type for oneOf/anyOf composition.
 * oneOf/anyOf: [A, B] → A | B
 */
function writeUnion(schemas: CastrSchema[], writer: CodeBlockWriter): void {
  if (schemas.length === 0) {
    writer.write('unknown');
    return;
  }
  schemas.forEach((s, i) => {
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

function writeObjectType(schema: CastrSchema, writer: CodeBlockWriter): void {
  writer.inlineBlock(() => {
    if (schema.properties) {
      for (const [key, prop] of schema.properties.entries()) {
        writeProperty(key, prop, writer);
      }
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
