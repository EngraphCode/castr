import type { CodeBlockWriter } from 'ts-morph';

import { parseComponentRef } from '../../../../shared/ref-resolution.js';
import { safeSchemaName } from '../../../../shared/utils/identifier-utils.js';
import type { CastrSchema } from '../../../ir/index.js';

/**
 * Write a `const` as its literal type, the one value it names: what the Zod writer's
 * `z.literal` accepts. Returns `true` if the schema was written.
 *
 * @internal
 */
export function writeConstType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.const === undefined) {
    return false;
  }
  writer.write(JSON.stringify(schema.const));
  return true;
}

/**
 * Write a `$ref` as the name of the type it refers to. Returns `true` if the schema was
 * written.
 *
 * @internal
 */
export function writeRefType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.$ref) {
    const { componentName } = parseComponentRef(schema.$ref);
    writer.write(safeSchemaName(componentName));
    return true;
  }
  return false;
}
