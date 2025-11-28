/**
 * IR Builder - Core Schema Primitives
 *
 * Foundational schema building functions used by all IR builder modules.
 * This is the bottom layer of the IR builder architecture - it has no
 * dependencies on other IR builder modules.
 *
 * **Pure Functions:**
 * All functions are pure - deterministic output, no side effects.
 *
 * **Library Types:**
 * Uses SchemaObject, ReferenceObject from openapi3-ts/oas31 exclusively.
 *
 * @module ir-builder.core
 * @internal
 */

import type { SchemaObject, ReferenceObject } from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type { IRSchema, IRSchemaNode } from './ir-schema.js';
import { IRSchemaProperties } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';

/**
 * Build IR schema from OpenAPI SchemaObject or ReferenceObject.
 * Recursively processes primitives, objects, arrays, compositions, and references.
 * Core schema building function used throughout the IR builder.
 *
 * @param schema - OpenAPI schema or reference
 * @param context - Build context with document and path information
 * @returns IR schema with full metadata
 * @internal
 */
export function buildIRSchema(
  schema: SchemaObject | ReferenceObject,
  context: IRBuildContext,
): IRSchema {
  // Handle $ref - preserve reference, metadata is computed later
  if (isReferenceObject(schema)) {
    // For references, create a minimal schema object for metadata building
    const emptySchema: SchemaObject = {};
    const metadata = buildIRSchemaNode(emptySchema, context);

    return {
      $ref: schema.$ref,
      metadata,
    };
  }

  // Build schema metadata
  const metadata = buildIRSchemaNode(schema, context);

  // Build base IR schema with primitive properties
  const irSchema = buildBaseIRSchema(schema, metadata);

  // Add complex schema properties
  addObjectProperties(schema, context, irSchema);
  addArrayItems(schema, context, irSchema);
  addCompositionSchemas(schema, context, irSchema);

  return irSchema;
}

/**
 * Build IR schema node metadata (required, nullable, validations, dependencies).
 * Used during code generation to produce appropriate Zod schemas.
 *
 * @param schema - OpenAPI schema object
 * @param context - Build context
 * @returns IR schema node metadata
 * @internal
 */
export function buildIRSchemaNode(schema: SchemaObject, context: IRBuildContext): IRSchemaNode {
  // Determine nullability from OAS 3.1 type arrays
  const nullable = Array.isArray(schema.type) && schema.type.includes('null');

  return {
    required: context.required,
    nullable,
    ...(schema.description !== undefined && { description: schema.description }),
    ...(schema.default !== undefined && { default: schema.default }),
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    zodChain: {
      presence: context.required ? 'required' : 'optional',
      validations: [],
      defaults: [],
    },
    circularReferences: [],
  };
}

/**
 * Build base IR schema with primitive properties.
 * @internal
 */
function buildBaseIRSchema(schema: SchemaObject, metadata: IRSchemaNode): IRSchema {
  const irSchema: IRSchema = { metadata };
  addTypeInfo(schema, irSchema);
  addDocumentation(schema, irSchema);
  addConstraints(schema, irSchema);
  return irSchema;
}

/** @internal */
function addTypeInfo(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.type !== undefined) {
    irSchema.type = schema.type;
  }
  if (schema.format !== undefined) {
    irSchema.format = schema.format;
  }
}

/** @internal */
function addDocumentation(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.description !== undefined) {
    irSchema.description = schema.description;
  }
  if (schema.default !== undefined) {
    irSchema.default = schema.default;
  }
  if (schema.example !== undefined) {
    irSchema.example = schema.example;
  }
  if (schema.examples !== undefined) {
    irSchema.examples = schema.examples;
  }
}

/** @internal */
/** @internal */
function addConstraints(schema: SchemaObject, irSchema: IRSchema): void {
  addNumericConstraints(schema, irSchema);
  addStringConstraints(schema, irSchema);
  addArrayConstraints(schema, irSchema);

  // Preserve enum values (critical for data integrity)
  if (schema.enum !== undefined && Array.isArray(schema.enum)) {
    irSchema.enum = Array.from(schema.enum);
  }
}

/** @internal */
function addNumericConstraints(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.minimum !== undefined) {
    irSchema.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    irSchema.maximum = schema.maximum;
  }
  if (schema.exclusiveMinimum !== undefined) {
    irSchema.exclusiveMinimum = schema.exclusiveMinimum;
  }
  if (schema.exclusiveMaximum !== undefined) {
    irSchema.exclusiveMaximum = schema.exclusiveMaximum;
  }
  if (schema.multipleOf !== undefined) {
    irSchema.multipleOf = schema.multipleOf;
  }
}

/** @internal */
function addStringConstraints(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.minLength !== undefined) {
    irSchema.minLength = schema.minLength;
  }
  if (schema.maxLength !== undefined) {
    irSchema.maxLength = schema.maxLength;
  }
  if (schema.pattern !== undefined) {
    irSchema.pattern = schema.pattern;
  }
}

/** @internal */
function addArrayConstraints(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.minItems !== undefined) {
    irSchema.minItems = schema.minItems;
  }
  if (schema.maxItems !== undefined) {
    irSchema.maxItems = schema.maxItems;
  }
  if (schema.uniqueItems !== undefined) {
    irSchema.uniqueItems = schema.uniqueItems;
  }
}

/**
 * Add object properties to IR schema (recursively builds property schemas).
 * @internal
 */
function addObjectProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: IRSchema,
): void {
  if (!schema.properties) {
    return;
  }

  const requiredFields = schema.required ?? [];
  const propsRecord: Record<string, IRSchema> = {};

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const isRequired = requiredFields.includes(propName);
    const propContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'properties', propName],
      required: isRequired,
    };

    propsRecord[propName] = buildIRSchema(propSchema, propContext);
  }

  irSchema.properties = new IRSchemaProperties(propsRecord);
  irSchema.required = requiredFields;
}

/**
 * Add array items to IR schema (recursively builds items schema).
 * @internal
 */
function addArrayItems(schema: SchemaObject, context: IRBuildContext, irSchema: IRSchema): void {
  if (!schema.items) {
    return;
  }

  const itemsContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'items'],
    required: false,
  };

  irSchema.items = buildIRSchema(schema.items, itemsContext);
}

/**
 * Add composition schemas (allOf, oneOf, anyOf) - recursively builds members.
 * @internal
 */
function addCompositionSchemas(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: IRSchema,
): void {
  if (schema.allOf) {
    irSchema.allOf = schema.allOf.map((subSchema, index) => {
      const subContext: IRBuildContext = {
        ...context,
        path: [...context.path, 'allOf', String(index)],
        required: false,
      };
      return buildIRSchema(subSchema, subContext);
    });
  }

  if (schema.oneOf) {
    irSchema.oneOf = schema.oneOf.map((subSchema, index) => {
      const subContext: IRBuildContext = {
        ...context,
        path: [...context.path, 'oneOf', String(index)],
        required: false,
      };
      return buildIRSchema(subSchema, subContext);
    });
  }

  if (schema.anyOf) {
    irSchema.anyOf = schema.anyOf.map((subSchema, index) => {
      const subContext: IRBuildContext = {
        ...context,
        path: [...context.path, 'anyOf', String(index)],
        required: false,
      };
      return buildIRSchema(subSchema, subContext);
    });
  }
}
