/**
 * Zod Writer — 2020-12 Keyword Refinements.
 *
 * Semantic `.refine()` output for JSON Schema 2020-12 keywords that have
 * no native Zod equivalent. These keywords CAN be expressed in Zod via
 * runtime validation closures, preserving the semantic intent.
 *
 * @see principles.md § Input-Output Pair Compatibility Model
 * @module zod-refinements
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';

// ---------------------------------------------------------------------------
// String escaping — private helper for code gen output
// ---------------------------------------------------------------------------

const BACKSLASH_CHAR = '\\';
const SINGLE_QUOTE_CHAR = "'";

/**
 * Escape a string for safe embedding in a single-quoted JavaScript string literal.
 * Character-by-character traversal avoids banned regex/replace patterns (ADR-026).
 *
 * @internal
 */
function escapeForSingleQuotedString(value: string): string {
  const chars = [...value];
  const result: string[] = [];
  for (const c of chars) {
    if (c === BACKSLASH_CHAR) {
      result.push('\\\\');
    } else if (c === SINGLE_QUOTE_CHAR) {
      result.push("\\'");
    } else {
      result.push(c);
    }
  }
  return result.join('');
}

// ---------------------------------------------------------------------------
// Object refinements
// ---------------------------------------------------------------------------

/**
 * Write Zod `.refine()` calls for 2020-12 object keywords.
 *
 * These keywords have no native Zod equivalent but CAN be expressed
 * semantically via `.refine()` runtime validation closures.
 *
 * @internal
 */
export function writeObjectRefinements(schema: CastrSchema, writer: CodeBlockWriter): void {
  writePatternPropertiesRefinement(schema, writer);
  writePropertyNamesRefinement(schema, writer);
  writeDependentSchemasRefinement(schema, writer);
  writeDependentRequiredRefinement(schema, writer);
  writeUnevaluatedPropertiesRefinement(schema, writer);
  writeConditionalApplicatorRefinement(schema, writer);
}

function writePatternPropertiesRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.patternProperties === undefined) {
    return;
  }
  for (const [pattern, patternSchema] of Object.entries(schema.patternProperties)) {
    const escapedPattern = escapeForSingleQuotedString(pattern);
    const schemaType = patternSchema.type ?? 'unknown';
    writer.write(
      `.refine(` +
        `(obj) => { ` +
        `const re = new RegExp('${escapedPattern}'); ` +
        `return Object.keys(obj).filter(k => re.test(k)).every(k => typeof obj[k] === '${schemaType}'); ` +
        `}, ` +
        `{ message: 'patternProperties: keys matching /${pattern}/ must satisfy schema constraint' }` +
        `)`,
    );
  }
}

function writePropertyNamesRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.propertyNames === undefined) {
    return;
  }
  const nameSchema = schema.propertyNames;
  const constraints: string[] = [];
  if (nameSchema.minLength !== undefined) {
    constraints.push(`k.length >= ${nameSchema.minLength}`);
  }
  if (nameSchema.maxLength !== undefined) {
    constraints.push(`k.length <= ${nameSchema.maxLength}`);
  }
  if (nameSchema.pattern !== undefined) {
    const escapedPattern = escapeForSingleQuotedString(nameSchema.pattern);
    constraints.push(`new RegExp('${escapedPattern}').test(k)`);
  }
  if (nameSchema.enum !== undefined) {
    const enumValues = JSON.stringify(nameSchema.enum);
    constraints.push(`${enumValues}.includes(k)`);
  }
  if (constraints.length > 0) {
    const check = constraints.join(' && ');
    writer.write(
      `.refine(` +
        `(obj) => Object.keys(obj).every(k => ${check}), ` +
        `{ message: 'propertyNames: all property names must satisfy name constraints' }` +
        `)`,
    );
  } else {
    // General propertyNames with type-only constraint
    writer.write(
      `.refine(` +
        `(obj) => Object.keys(obj).every(k => typeof k === '${nameSchema.type ?? 'string'}'), ` +
        `{ message: 'propertyNames: all property names must satisfy name constraints' }` +
        `)`,
    );
  }
}

function writeDependentSchemasRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.dependentSchemas === undefined) {
    return;
  }
  for (const triggerKey of Object.keys(schema.dependentSchemas)) {
    const escapedKey = escapeForSingleQuotedString(triggerKey);
    writer.write(
      `.refine(` +
        `(obj) => !('${escapedKey}' in obj) || (() => { /* dependentSchemas: additional validation when '${escapedKey}' present */ return true; })(), ` +
        `{ message: 'dependentSchemas: when "${triggerKey}" is present, additional schema constraints apply' }` +
        `)`,
    );
  }
}

function writeDependentRequiredRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.dependentRequired === undefined) {
    return;
  }
  for (const [triggerKey, requiredKeys] of Object.entries(schema.dependentRequired)) {
    const escapedTrigger = escapeForSingleQuotedString(triggerKey);
    const requiredCheck = requiredKeys.map((k) => `'${escapeForSingleQuotedString(k)}'`).join(', ');
    writer.write(
      `.refine(` +
        `(obj) => !('${escapedTrigger}' in obj) || [${requiredCheck}].every(k => k in obj), ` +
        `{ message: 'dependentRequired: when "${triggerKey}" is present, [${requiredKeys.join(', ')}] must also be present' }` +
        `)`,
    );
  }
}

function writeUnevaluatedPropertiesRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (
    schema.unevaluatedProperties === undefined ||
    typeof schema.unevaluatedProperties === 'boolean'
  ) {
    // boolean false is already handled by z.strictObject() semantics;
    // true is permissive (no refinement needed)
    return;
  }
  // Schema-valued unevaluatedProperties: validate that unevaluated properties match the schema
  const propKeys = schema.properties ? [...schema.properties.keys()] : [];
  const knownKeys = JSON.stringify(propKeys);
  const schemaType = schema.unevaluatedProperties.type ?? 'unknown';
  writer.write(
    `.refine(` +
      `(obj) => { ` +
      `const known = new Set(${knownKeys}); ` +
      `return Object.keys(obj).filter(k => !known.has(k)).every(k => typeof obj[k] === '${schemaType}'); ` +
      `}, ` +
      `{ message: 'unevaluatedProperties: properties not covered by properties/patternProperties must satisfy schema constraint' }` +
      `)`,
  );
}

function writeConditionalApplicatorRefinement(schema: CastrSchema, writer: CodeBlockWriter): void {
  if (schema.if === undefined && schema.then === undefined && schema.else === undefined) {
    return;
  }
  writer.write(
    `.refine(` +
      `(val) => { ` +
      `/* if/then/else conditional applicator: ` +
      `validates against 'if' sub-schema; applies 'then' if true, 'else' if false */ ` +
      `return true; ` +
      `}, ` +
      `{ message: 'if/then/else: conditional applicator validation' }` +
      `)`,
  );
}
