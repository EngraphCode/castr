import type { CodeBlockWriter } from 'ts-morph';

import { parseComponentRef } from '../../../../shared/ref-resolution.js';
import { safeSchemaName } from '../../../../shared/utils/identifier-utils.js';
import {
  type CastrSchema,
  getIntegerSemantics,
  isPrimitive,
  whyConstDoesNotDecideAlone,
} from '../../../ir/index.js';

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
  // A model another reader built can hold a const beside a keyword that also decides.
  const reason = whyConstDoesNotDecideAlone(schema);
  if (reason !== undefined) {
    throw new Error(`A const ${reason} is not written in TypeScript: the literal would drop it.`);
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

/**
 * Handle boolean schemas in TypeScript output.
 * Returns `true` if the schema was written.
 *
 * - `false` schema → `never` (nothing validates)
 * - `true` schema → `unknown` (accept everything)
 *
 * @internal
 */
export function writeBooleanSchemaType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.booleanSchema === undefined) {
    return false;
  }
  if (schema.booleanSchema === false) {
    writer.write('never');
    return true;
  }
  // booleanSchema: true — accept any value.
  // `unknown` is the TypeScript type that accepts all values while remaining type-safe.
  writer.write('unknown');
  return true;
}

/**
 * Write an `enum` as the union of its members' literal types: what the Zod writer's
 * `z.enum` or union of `z.literal` accepts. Returns `true` if the schema was written.
 *
 * @internal
 */
export function writeEnumType(schema: CastrSchema, writer: CodeBlockWriter): boolean {
  if (schema.enum === undefined || schema.enum.length === 0) {
    return false;
  }
  // A model another reader built can hold an enum beside a keyword that also decides.
  if (schema.const !== undefined) {
    throw new Error(
      'An enum beside a const is not written in TypeScript: the union of the ' +
        "enum's literals would drop the const.",
    );
  }
  if (getIntegerSemantics(schema) !== undefined) {
    throw new Error(
      'An enum of 64-bit integers is not written in TypeScript: their type is bigint, ' +
        'and the members are held as numbers.',
    );
  }
  if (!schema.enum.every(isPrimitive)) {
    throw new Error(
      'An enum with a member that is an object or an array is not written in TypeScript: ' +
        'a literal type names a primitive value only.',
    );
  }
  writer.write(schema.enum.map((member) => JSON.stringify(member)).join(' | '));
  return true;
}

/**
 * Whether a schema is written with `|` or `&` at its top, so that it needs parentheses
 * where it is an array's items: `A & B[]` is A and an array of B.
 *
 * @internal
 */
export function isUnionOrIntersection(schema: CastrSchema): boolean {
  return (
    isUnion(schema) ||
    schema.allOf !== undefined ||
    schema.dependentRequired !== undefined ||
    schema.dependentSchemas !== undefined
  );
}

/**
 * Whether a schema is written as a union of types, so that it needs parentheses where
 * it is an array's items or one member of an intersection.
 *
 * @internal
 */
export function isUnion(schema: CastrSchema): boolean {
  return (
    schema.metadata?.nullable === true ||
    (schema.enum?.length ?? 0) > 1 ||
    schema.oneOf !== undefined ||
    schema.anyOf !== undefined
  );
}
