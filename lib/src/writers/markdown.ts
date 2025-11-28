import type { IRDocument, IROperation, IRSchema } from '../context/ir-schema.js';

/**
 * Generate Markdown documentation from IR.
 *
 * Demonstrates the use of the IR for generating documentation.
 *
 * @param ir - The IRDocument to generate documentation for
 * @returns Markdown string
 */
export function writeMarkdown(ir: IRDocument): string {
  const lines: string[] = [];

  writeHeader(ir, lines);
  writeOperations(ir, lines);
  writeEnums(ir, lines);

  return lines.join('\n');
}

function writeHeader(ir: IRDocument, lines: string[]): void {
  lines.push(`# ${ir.info.title}`);
  if (ir.info.description) {
    lines.push('');
    lines.push(ir.info.description);
  }
  lines.push('');
  lines.push(`**Version:** ${ir.info.version}`);
  lines.push('');
}

function writeOperations(ir: IRDocument, lines: string[]): void {
  lines.push('## Operations');
  lines.push('');

  for (const op of ir.operations) {
    lines.push(`### ${op.summary || op.operationId}`);
    lines.push('');
    lines.push(`\`${op.method.toUpperCase()} ${op.path}\``);
    lines.push('');
    if (op.description) {
      lines.push(op.description);
      lines.push('');
    }

    writeParameters(op, lines);
    writeResponses(op, lines);
  }
}

function writeParameters(op: IROperation, lines: string[]): void {
  if (op.parameters.length === 0) {
    return;
  }

  lines.push('#### Parameters');
  lines.push('');
  lines.push('| Name | In | Type | Required | Description |');
  lines.push('| ---- | -- | ---- | -------- | ----------- |');
  for (const param of op.parameters) {
    const type = getTypeName(param.schema);
    const required = param.required ? 'Yes' : 'No';
    const desc = param.description || '';
    lines.push(`| ${param.name} | ${param.in} | ${type} | ${required} | ${desc} |`);
  }
  lines.push('');
}

function writeResponses(op: IROperation, lines: string[]): void {
  if (op.responses.length === 0) {
    return;
  }

  lines.push('#### Responses');
  lines.push('');
  lines.push('| Status | Description | Schema |');
  lines.push('| ------ | ----------- | ------ |');
  for (const resp of op.responses) {
    let schema = 'None';
    if (resp.schema) {
      schema = getTypeName(resp.schema);
    } else if (resp.content) {
      schema = 'See Content';
    }
    lines.push(`| ${resp.statusCode} | ${resp.description || ''} | ${schema} |`);
  }
  lines.push('');
}

function writeEnums(ir: IRDocument, lines: string[]): void {
  if (ir.enums.size === 0) {
    return;
  }

  lines.push('## Enums');
  lines.push('');
  for (const enumDef of ir.enums.values()) {
    lines.push(`### ${enumDef.name}`);
    lines.push('');
    if (enumDef.description) {
      lines.push(enumDef.description);
      lines.push('');
    }
    lines.push('Values:');
    for (const val of enumDef.values) {
      lines.push(`- \`${String(val)}\``);
    }
    lines.push('');
  }
}

function getTypeName(schema: IRSchema): string {
  if (schema.$ref) {
    return schema.$ref.split('/').pop() || 'Ref';
  }
  if (schema.type) {
    return getTypeFromTypeField(schema.type, schema.items);
  }
  if (schema.allOf) {
    return 'Intersection';
  }
  if (schema.oneOf) {
    return 'Union';
  }
  if (schema.anyOf) {
    return 'Union';
  }
  return 'any';
}

function getTypeFromTypeField(type: string | string[], items?: IRSchema | IRSchema[]): string {
  if (Array.isArray(type)) {
    return type.join(' | ');
  }
  if (type === 'array' && items) {
    const itemType = Array.isArray(items) ? items.map(getTypeName).join(', ') : getTypeName(items);
    return `Array<${itemType}>`;
  }
  return type;
}
