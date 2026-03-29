/**
 * Zod Writer — 2020-12 Array Keyword Refinements.
 *
 * Semantic `.refine()` output for JSON Schema 2020-12 array keywords
 * (`contains`, `minContains`, `maxContains`, `unevaluatedItems`).
 *
 * @see principles.md § Input-Output Pair Compatibility Model
 * @module zod-refinements-array
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';

/**
 * Write Zod `.refine()` calls for 2020-12 array keywords.
 *
 * @internal
 */
export function writeArrayRefinements(schema: CastrSchema, writer: CodeBlockWriter): void {
  writeContainsRefinement(schema, writer);
  writeUnevaluatedItemsRefinement(schema, writer);
}

function writeContainsRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.contains === undefined) {
    return;
  }
  const containsType = schema.contains.type ?? 'unknown';
  const min = schema.minContains ?? 1;
  const max = schema.maxContains;

  if (max !== undefined) {
    writer.write(
      `.refine(` +
        `(arr) => { ` +
        `const count = arr.filter(item => typeof item === '${containsType}').length; ` +
        `return count >= ${min} && count <= ${max}; ` +
        `}, ` +
        `{ message: 'contains: array must contain between ${min} and ${max} items matching the schema' }` +
        `)`,
    );
  } else {
    writer.write(
      `.refine(` +
        `(arr) => arr.filter(item => typeof item === '${containsType}').length >= ${min}, ` +
        `{ message: 'contains: array must contain at least ${min} item(s) matching the schema' }` +
        `)`,
    );
  }
}

function writeUnevaluatedItemsRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.unevaluatedItems === undefined) {
    return;
  }
  if (typeof schema.unevaluatedItems === 'boolean') {
    writeUnevaluatedItemsBooleanRefinement(schema, writer);
    return;
  }
  writeUnevaluatedItemsSchemaRefinement(schema, writer);
}

function writeUnevaluatedItemsBooleanRefinement(
  schema: CastrSchema,
  writer: CodeBlockWriter,
): void {
  // unevaluatedItems: true means allow any additional items — no refinement needed
  if (schema.unevaluatedItems === true) {
    return;
  }
  const prefixCount = schema.prefixItems?.length ?? 0;
  writer.write(
    `.refine(` +
      `(arr) => arr.length <= ${prefixCount}, ` +
      `{ message: 'unevaluatedItems: no additional items allowed beyond prefixItems' }` +
      `)`,
  );
}

function writeUnevaluatedItemsSchemaRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  const prefixCount = schema.prefixItems?.length ?? 0;
  const schemaType =
    typeof schema.unevaluatedItems === 'object'
      ? (schema.unevaluatedItems.type ?? 'unknown')
      : 'unknown';
  writer.write(
    `.refine(` +
      `(arr) => arr.slice(${prefixCount}).every(item => typeof item === '${schemaType}'), ` +
      `{ message: 'unevaluatedItems: items beyond prefixItems must satisfy schema constraint' }` +
      `)`,
  );
}
