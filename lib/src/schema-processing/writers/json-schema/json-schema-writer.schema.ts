/**
 * JSON Schema writer — converts CastrSchema (IR) to pure JSON Schema 2020-12.
 *
 * Core JSON Schema field logic is delegated to the shared json-schema-fields
 * module.  Unlike the OpenAPI writer, this module does NOT add OAS-specific
 * extensions (xml, externalDocs, discriminator).
 */

import type { CastrSchema } from '../../ir/index.js';
import { assertSchemaSupportsIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import type {
  JsonSchemaObject,
  WriteBooleanCapableSchemaFn,
  WriteSchemaFn,
} from '../shared/json-schema-fields.js';
import { writeAllJsonSchemaFields } from '../shared/json-schema-fields.js';

/**
 * Converts an IR schema to a pure JSON Schema 2020-12 object.
 *
 * Handles all schema types (primitives, objects, arrays, composition) and
 * preserves constraints, formats, and metadata. Nullable schemas are converted
 * to JSON Schema type arrays (e.g., `['string', 'null']`).
 *
 * Unlike the OpenAPI writer, this does NOT write OAS-only extension fields
 * (xml, externalDocs, discriminator).
 *
 * @param schema - The IR schema to convert
 * @returns A valid JSON Schema 2020-12 object
 *
 * @example
 * ```typescript
 * const irSchema: CastrSchema = {
 *   type: 'string',
 *   format: 'email',
 *   metadata: { nullable: true, ... },
 * };
 *
 * const jsonSchema = writeJsonSchema(irSchema);
 * // { type: ['string', 'null'], format: 'email' }
 * ```
 *
 * @public
 */
export function writeJsonSchema(schema: CastrSchema): JsonSchemaObject | boolean {
  if (schema.booleanSchema !== undefined) {
    return schema.booleanSchema;
  }
  return writeJsonSchemaObject(schema);
}

/**
 * Internal writer that satisfies the `WriteSchemaFn` signature.
 *
 * Used as the recursive callback for `writeAllJsonSchemaFields` at
 * object-form-only positions. Boolean schemas are handled at the public
 * `writeJsonSchema` boundary and at boolean-capable keyword positions
 * (`if`/`then`/`else`, `contentSchema`), so a `booleanSchema` node
 * reaching this function means the position cannot represent it — that is
 * rejected explicitly rather than silently emitted as `{}`.
 *
 * @internal
 */
function writeJsonSchemaObject(schema: CastrSchema): JsonSchemaObject {
  rejectBooleanSchemaAtObjectFormPosition(schema);
  assertSchemaSupportsIntegerTargetCapabilities(schema, 'JSON Schema 2020-12');
  return writeJsonSchemaObjectShape(schema, writeJsonSchemaObject, writeJsonSchema);
}

/**
 * Verbatim recursion for statically-unreachable conditional branches.
 *
 * The capability preflight (`compatibility/integer-target-capabilities`)
 * skips `then`/`else` branches that can never constrain instances
 * (JSON Schema 2020-12 core §10.2.2: absent `if`, or a literal boolean `if`
 * that fixes the outcome). The writer applies the same rule for coherence:
 * the branch is emitted verbatim — dropping it would break losslessness —
 * but the capability assertion is not re-rooted into content whose
 * capability demands can never apply. Everything else (boolean-schema
 * position policy, field emission, example normalisation) is identical to
 * the asserting recursion.
 *
 * @returns The emitted branch content — a JSON Schema object, or a boolean
 * for `booleanSchema` IR nodes (the branch positions are boolean-capable)
 * @internal
 */
function writeUnreachableBranchJsonSchema(schema: CastrSchema): JsonSchemaObject | boolean {
  if (schema.booleanSchema !== undefined) {
    return schema.booleanSchema;
  }
  return writeUnreachableBranchJsonSchemaObject(schema);
}

/**
 * Object-form-only counterpart of {@link writeUnreachableBranchJsonSchema}.
 * @internal
 */
function writeUnreachableBranchJsonSchemaObject(schema: CastrSchema): JsonSchemaObject {
  rejectBooleanSchemaAtObjectFormPosition(schema);
  return writeJsonSchemaObjectShape(
    schema,
    writeUnreachableBranchJsonSchemaObject,
    writeUnreachableBranchJsonSchema,
  );
}

/**
 * Reject a `booleanSchema` node at an object-form-only position.
 * @internal
 */
function rejectBooleanSchemaAtObjectFormPosition(schema: CastrSchema): void {
  if (schema.booleanSchema !== undefined) {
    const objectForm = schema.booleanSchema ? '`{}`' : '`{ "not": {} }`';
    throw new Error(
      `Boolean JSON Schema \`${String(schema.booleanSchema)}\` reached an object-form-only ` +
        `position in the JSON Schema writer; emitting \`{}\` here would silently change its ` +
        `semantics. Use the equivalent object form ${objectForm} at this position.`,
    );
  }
}

/**
 * Shared emission body for both the asserting and the verbatim recursions.
 *
 * Statically-unreachable conditional branches always route through the
 * verbatim recursion, whichever recursion reaches them.
 *
 * @internal
 */
function writeJsonSchemaObjectShape(
  schema: CastrSchema,
  writeObject: WriteSchemaFn,
  writeBooleanCapable: WriteBooleanCapableSchemaFn,
): JsonSchemaObject {
  const result: JsonSchemaObject = {};

  if (schema.$ref !== undefined) {
    // 2020-12 applies $ref siblings, so sibling fields are written too.
    result.$ref = schema.$ref;
  }

  writeAllJsonSchemaFields(
    schema,
    result,
    writeObject,
    writeBooleanCapable,
    writeUnreachableBranchJsonSchema,
  );
  normaliseExampleForJsonSchema(result);

  return result;
}

/**
 * Normalise `example`/`examples` for pure JSON Schema 2020-12 output.
 *
 * JSON Schema 2020-12 defines `examples` (array) as the standard keyword.
 * The singular `example` keyword is an OAS extension and must not appear in
 * pure JSON Schema output. If only `example` is present, fold it into
 * `examples`. If both are present, `examples` takes precedence and `example`
 * is suppressed.
 *
 * @internal
 */
function normaliseExampleForJsonSchema(result: JsonSchemaObject): void {
  if (result.example === undefined) {
    return;
  }

  if (result.examples === undefined) {
    result.examples = [result.example];
  }

  delete result.example;
}
