import type { CodeBlockWriter, WriterFunction } from 'ts-morph';
import type { CastrSchema } from '../context/ir-schema.js';
import { parseComponentRef } from '../shared/ref-resolution.js';
import { isValidJsIdentifier } from '../shared/utils/identifier-utils.js';

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
    if (schema.$ref) {
      const { componentName } = parseComponentRef(schema.$ref);
      writer.write(componentName);
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
      default:
        writer.write('unknown');
    }
  };
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
