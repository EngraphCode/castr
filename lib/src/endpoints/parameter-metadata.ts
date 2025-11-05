import type { SchemaObject, ParameterObject, ExampleObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { SchemaConstraints } from './definition.types.js';

/**
 * Parameter metadata extracted from OpenAPI objects.
 * Uses library types directly - no custom types.
 *
 * Combines fields from ParameterObject and SchemaObject using Pick patterns.
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#parameter-object OpenAPI Parameter Object}
 * @see {@link https://spec.openapis.org/oas/v3.1.0#schema-object OpenAPI Schema Object}
 */
export type ParameterMetadata = Pick<
  ParameterObject,
  'description' | 'deprecated' | 'example' | 'examples'
> &
  Pick<SchemaObject, 'default'> & {
    /** Schema validation constraints (subset of SchemaObject) */
    constraints?: SchemaConstraints;
  };

/**
 * Extract description from parameter, trimming whitespace.
 * Returns undefined for empty/whitespace-only descriptions.
 *
 * @param param - Parameter object with optional description
 * @returns Trimmed description or undefined
 * @internal
 */
export function extractDescription(param: ParameterObject): string | undefined {
  const trimmed = param.description?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

/**
 * Extract deprecated flag from parameter.
 * Returns undefined instead of false (only include when explicitly deprecated).
 *
 * @param param - Parameter object with optional deprecated flag
 * @returns true if deprecated, undefined otherwise
 * @internal
 */
export function extractDeprecated(param: ParameterObject): boolean | undefined {
  return param.deprecated === true ? true : undefined;
}

/**
 * Type guard: checks if value is an object with a 'value' property.
 * Used to narrow ExampleObject after filtering out ReferenceObjects.
 *
 * @param value - Unknown value to check
 * @returns True if value has a value property
 * @internal
 */
function hasExampleValue(value: unknown): value is { value: unknown } {
  return typeof value === 'object' && value !== null && 'value' in value;
}

/**
 * Extract example value from an examples object's 'default' entry.
 * Handles the case where Scalar upgrades examples to object format with named keys.
 *
 * @param examplesObj - Examples object from ParameterObject or SchemaObject
 * @returns Example value from 'default' entry, or undefined
 * @internal
 */
function extractDefaultExample(
  examplesObj: ParameterObject['examples'] | SchemaObject['examples'],
): unknown | undefined {
  if (!examplesObj) {
    return undefined;
  }

  // In OpenAPI 3.1, examples is an object with string keys
  // Access the 'default' property if it exists
  if (typeof examplesObj === 'object' && 'default' in examplesObj) {
    const defaultEntry = examplesObj['default'];
    if (!defaultEntry || isReferenceObject(defaultEntry)) {
      return undefined;
    }

    if (hasExampleValue(defaultEntry)) {
      return defaultEntry.value;
    }
  }

  return undefined;
}

/**
 * Extract example value from parameter or schema.
 *
 * OpenAPI 3.1 supports both `example` (single value) and `examples` (named examples).
 * Scalar's upgrade converts all examples to the `examples` object format with a 'default' key.
 *
 * Priority order:
 * 1. parameter.example (inline single example)
 * 2. parameter.examples['default'].value (Scalar sets this during upgrade)
 * 3. schema.example (inline single example)
 * 4. schema.examples['default'].value (Scalar sets this during upgrade)
 *
 * @param param - Parameter object with optional example/examples
 * @param schema - Schema object with optional example/examples
 * @returns Example value or undefined
 * @internal
 */
export function extractExample(param: ParameterObject, schema: SchemaObject): unknown | undefined {
  // Check parameter.example (inline single example)
  if (param.example !== undefined) {
    return param.example;
  }

  // Check parameter.examples['default'].value (Scalar upgrade format)
  const paramExample = extractDefaultExample(param.examples);
  if (paramExample !== undefined) {
    return paramExample;
  }

  // Check schema.example (inline single example)
  if (schema.example !== undefined) {
    return schema.example;
  }

  // Check schema.examples['default'].value (Scalar upgrade format)
  return extractDefaultExample(schema.examples);
}

/**
 * Extract default value from schema.
 *
 * @param schema - Schema object with optional default
 * @returns Default value or undefined
 * @internal
 */
export function extractDefault(schema: SchemaObject): unknown | undefined {
  return schema.default;
}

/**
 * Extract numeric constraints from schema.
 * @internal
 */
function extractNumericConstraints(schema: SchemaObject, target: Partial<SchemaConstraints>): void {
  if (schema.minimum !== undefined) {
    target.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    target.maximum = schema.maximum;
  }
  if (schema.exclusiveMinimum !== undefined) {
    target.exclusiveMinimum = schema.exclusiveMinimum;
  }
  if (schema.exclusiveMaximum !== undefined) {
    target.exclusiveMaximum = schema.exclusiveMaximum;
  }
}

/**
 * Extract string constraints from schema.
 * @internal
 */
function extractStringConstraints(schema: SchemaObject, target: Partial<SchemaConstraints>): void {
  if (schema.minLength !== undefined) {
    target.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    target.maxLength = schema.maxLength;
  }
  if (schema.pattern !== undefined) {
    target.pattern = schema.pattern;
  }
  if (schema.format !== undefined) {
    target.format = schema.format;
  }
}

/**
 * Extract array constraints from schema.
 * @internal
 */
function extractArrayConstraints(schema: SchemaObject, target: Partial<SchemaConstraints>): void {
  if (schema.minItems !== undefined) {
    target.minItems = schema.minItems;
  }
  if (schema.maxItems !== undefined) {
    target.maxItems = schema.maxItems;
  }
  if (schema.uniqueItems !== undefined) {
    target.uniqueItems = schema.uniqueItems;
  }
}

/**
 * Extract enum constraint from schema.
 * @internal
 */
function extractEnumConstraint(schema: SchemaObject, target: Partial<SchemaConstraints>): void {
  if (schema.enum !== undefined) {
    target.enum = schema.enum;
  }
}

/**
 * Extract schema constraints from OpenAPI schema object.
 *
 * Extracts validation rules including numeric bounds (minimum, maximum),
 * string constraints (minLength, maxLength, pattern), array constraints
 * (minItems, maxItems, uniqueItems), enums, and format hints.
 *
 * Uses library types (SchemaConstraints is Pick<SchemaObject, ...>) - no custom types.
 *
 * @param schema - Schema object to extract constraints from
 * @returns Constraints object with validation rules, or undefined if no constraints
 *
 * @example Extract numeric constraints
 * ```typescript
 * const schema = { type: 'integer', minimum: 0, maximum: 100 };
 * const constraints = extractSchemaConstraints(schema);
 * // { minimum: 0, maximum: 100 }
 * ```
 *
 * @example Extract string constraints
 * ```typescript
 * const schema = {
 *   type: 'string',
 *   minLength: 3,
 *   maxLength: 50,
 *   pattern: '^[a-z]+$'
 * };
 * const constraints = extractSchemaConstraints(schema);
 * // { minLength: 3, maxLength: 50, pattern: '^[a-z]+$' }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#schema-object OpenAPI Schema Object}
 * @public
 */
export function extractSchemaConstraints(schema: SchemaObject): SchemaConstraints | undefined {
  const result: Partial<SchemaConstraints> = {};

  extractNumericConstraints(schema, result);
  extractStringConstraints(schema, result);
  extractArrayConstraints(schema, result);
  extractEnumConstraint(schema, result);

  return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Extract parameter metadata from OpenAPI parameter object.
 *
 * Extracts official OpenAPI fields including description, deprecated flag,
 * examples, default values, and schema constraints for rich SDK generation.
 * Follows OpenAPI specification for parameter and schema objects.
 *
 * **Priority order for fields:**
 * - Example: parameter.example > schema.example
 * - Description: Always from parameter
 * - Default: Always from schema
 * - Constraints: Always from schema
 *
 * @param param - Parameter object from OpenAPI spec
 * @param schema - Resolved schema object for constraint extraction
 * @returns Parameter metadata object with all extracted fields (empty if none)
 *
 * @example Basic parameter metadata
 * ```typescript
 * const param = {
 *   name: 'userId',
 *   in: 'path',
 *   description: 'User identifier',
 *   required: true
 * };
 * const schema = { type: 'string' };
 * const metadata = extractParameterMetadata(param, schema);
 * // { description: 'User identifier' }
 * ```
 *
 * @example Complete metadata with constraints
 * ```typescript
 * const param = {
 *   name: 'age',
 *   in: 'query',
 *   description: 'User age',
 *   example: 25
 * };
 * const schema = {
 *   type: 'integer',
 *   minimum: 0,
 *   maximum: 120,
 *   default: 18
 * };
 * const metadata = extractParameterMetadata(param, schema);
 * // {
 * //   description: 'User age',
 * //   example: 25,
 * //   default: 18,
 * //   constraints: { minimum: 0, maximum: 120 }
 * // }
 * ```
 *
 * @see {@link https://spec.openapis.org/oas/v3.1.0#parameter-object OpenAPI Parameter Object}
 * @see {@link extractSchemaConstraints}
 * @public
 */
/**
 * Extract and filter examples from parameter, removing unresolved references.
 * In bundled specs, references should be resolved, but we filter defensively.
 *
 * @param param - Parameter object with optional examples
 * @returns Resolved examples object or undefined
 * @internal
 */
export function extractExamples(param: ParameterObject): Record<string, ExampleObject> | undefined {
  if (param.examples === undefined) {
    return undefined;
  }

  // Filter out ReferenceObjects, keeping only resolved ExampleObjects
  const entries = Object.entries(param.examples).filter(
    (entry): entry is [string, ExampleObject] => !isReferenceObject(entry[1]),
  );

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

/**
 * Extract parameter metadata from OpenAPI parameter and schema objects.
 *
 * This is a pure assembly function that delegates to specialized extractors.
 * Each field is extracted by a dedicated pure function for testability.
 *
 * @param param - Parameter object from OpenAPI spec
 * @param schema - Resolved schema object for constraint extraction
 * @returns Parameter metadata object with all extracted fields
 *
 * @see {@link extractDescription}
 * @see {@link extractDeprecated}
 * @see {@link extractExample}
 * @see {@link extractExamples}
 * @see {@link extractDefault}
 * @see {@link extractSchemaConstraints}
 * @public
 */
export function extractParameterMetadata(
  param: ParameterObject,
  schema: SchemaObject,
): ParameterMetadata {
  const metadata: ParameterMetadata = {};

  const description = extractDescription(param);
  if (description !== undefined) {
    metadata.description = description;
  }

  const deprecated = extractDeprecated(param);
  if (deprecated !== undefined) {
    metadata.deprecated = deprecated;
  }

  const example = extractExample(param, schema);
  if (example !== undefined) {
    metadata.example = example;
  }

  const examples = extractExamples(param);
  if (examples !== undefined) {
    metadata.examples = examples;
  }

  const defaultValue = extractDefault(schema);
  if (defaultValue !== undefined) {
    metadata.default = defaultValue;
  }

  const constraints = extractSchemaConstraints(schema);
  if (constraints !== undefined) {
    metadata.constraints = constraints;
  }

  return metadata;
}
