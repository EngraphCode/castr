/**
 * TypeScript Writer — Dependent Keyword Discriminated Unions.
 *
 * Semantic TypeScript output for JSON Schema 2020-12 dependent keywords
 * that CAN be represented in TypeScript via discriminated union types.
 *
 * - `dependentRequired`: "when property X is present, properties [Y, Z] become required"
 *   → union of (trigger present & deps required) | (trigger absent via never)
 *
 * - `dependentSchemas`: "when property X is present, apply schema Y"
 *   → union of (trigger present & dependent schema) | (trigger absent via never)
 *
 * Per the Input-Output Pair Compatibility Model: these keywords ARE expressible
 * in TypeScript and are NOT genuinely impossible.
 *
 * @module type-writer.dependent-keywords
 * @internal
 */

import type { CodeBlockWriter } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';

/**
 * Write a property declaration for a schema property.
 * Duplicated signature to avoid circular dependency with type-writer.ts.
 * @internal
 */
type PropertyWriter = (key: string, prop: CastrSchema, writer: CodeBlockWriter) => void;

/**
 * Emit per-trigger discriminated union branches for dependentRequired.
 *
 * For `dependentRequired: { email: ['emailVerified'] }`, emits:
 * `& ({ email: string; emailVerified: boolean } | { email?: never })`
 *
 * @internal
 */
export function writeDependentRequiredUnions(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  writeProperty: PropertyWriter,
): void {
  const sorted = Object.keys(schema.dependentRequired ?? {}).sort((a, b) => a.localeCompare(b));
  for (const triggerKey of sorted) {
    const depKeys = schema.dependentRequired?.[triggerKey] ?? [];
    writer.write(' & (');
    // Present branch: trigger + dependent keys all required
    writer.inlineBlock(() => {
      writeRequiredProperty(schema, triggerKey, writer, writeProperty);
      const sortedDeps = [...depKeys].sort((a, b) => a.localeCompare(b));
      for (const depKey of sortedDeps) {
        writeRequiredProperty(schema, depKey, writer, writeProperty);
      }
    });
    writer.write(' | ');
    // Absent branch: trigger is never
    writer.inlineBlock(() => {
      writer.write(`${triggerKey}?: never;`).newLine();
    });
    writer.write(')');
  }
}

/**
 * Emit per-trigger discriminated union branches for dependentSchemas.
 *
 * For `dependentSchemas: { creditCard: { properties: { billingAddress: ... } } }`, emits:
 * `& ({ creditCard: string; billingAddress: string } | { creditCard?: never })`
 *
 * @internal
 */
export function writeDependentSchemasUnions(
  schema: CastrSchema,
  writer: CodeBlockWriter,
  writeProperty: PropertyWriter,
): void {
  const sorted = Object.keys(schema.dependentSchemas ?? {}).sort((a, b) => a.localeCompare(b));
  for (const triggerKey of sorted) {
    const depSchema = schema.dependentSchemas?.[triggerKey];
    writer.write(' & (');
    // Present branch: trigger required + dependent schema properties
    writer.inlineBlock(() => {
      writeRequiredProperty(schema, triggerKey, writer, writeProperty);
      if (depSchema?.properties) {
        const sortedEntries = [...depSchema.properties.entries()].sort(([a], [b]) =>
          a.localeCompare(b),
        );
        for (const [key, prop] of sortedEntries) {
          writeProperty(key, prop, writer);
        }
      }
    });
    writer.write(' | ');
    // Absent branch: trigger is never
    writer.inlineBlock(() => {
      writer.write(`${triggerKey}?: never;`).newLine();
    });
    writer.write(')');
  }
}

/**
 * Write a property as required by overriding its metadata.
 * Used for both trigger properties and dependent-required properties.
 * @internal
 */
function writeRequiredProperty(
  schema: CastrSchema,
  key: string,
  writer: CodeBlockWriter,
  writeProperty: PropertyWriter,
): void {
  const prop = schema.properties?.get(key);
  if (prop) {
    const overridden: CastrSchema = {
      ...prop,
      metadata: { ...prop.metadata, required: true },
    };
    writeProperty(key, overridden, writer);
  } else {
    writer.write(`${key}: unknown;`).newLine();
  }
}
