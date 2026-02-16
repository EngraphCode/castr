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
import type { CastrSchema, CastrSchemaNode } from '../../ir/schema.js';
import { CastrSchemaProperties } from '../../ir/schema.js';
import type { IRBuildContext } from './builder.types.js';
import type { IRPropertySchemaContext, IRCompositionMemberContext } from '../../ir/context.js';
import { addConstraints } from './builder.constraints.js';
import { addOpenAPIExtensions } from './builder.json-schema-2020-12.js';

import { updateZodChain } from './builder.zod-chain.js';

const SCHEMA_TYPE_NULL = 'null' as const;

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
export function buildCastrSchema(
  schema: SchemaObject | ReferenceObject,
  context: IRBuildContext,
): CastrSchema {
  // Handle $ref - preserve reference, metadata is computed later
  if (isReferenceObject(schema)) {
    // For references, create a minimal schema object for metadata building
    const emptySchema: SchemaObject = {};
    const metadata = buildCastrSchemaNode(emptySchema, context);

    return {
      $ref: schema.$ref,
      metadata,
    };
  }

  // Build schema metadata
  const metadata = buildCastrSchemaNode(schema, context);

  // Build base IR schema with primitive properties
  const irSchema = buildBaseCastrSchema(schema, metadata);

  // Add complex schema properties
  addObjectProperties(schema, context, irSchema);
  addAdditionalProperties(schema, context, irSchema);
  addArrayItems(schema, context, irSchema);
  addCompositionSchemas(schema, context, irSchema);

  // Add OpenAPI extensions and JSON Schema 2020-12 keywords
  addOpenAPIExtensions(schema, context, irSchema, buildCastrSchema);

  // Update Zod chain with validations from constraints
  updateZodChain(irSchema);

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
export function buildCastrSchemaNode(
  schema: SchemaObject,
  context: IRBuildContext,
): CastrSchemaNode {
  // Determine nullability from OAS 3.1 type arrays
  const nullable =
    Array.isArray(schema.type) && schema.type.some((typeEntry) => typeEntry === SCHEMA_TYPE_NULL);

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
      // Zod 4 syntax: '.optional()' is a method, not a property
      // For required fields: no modifier needed (empty string)
      // For optional fields: '.optional()' method call
      presence: context.required ? '' : '.optional()',
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
function buildBaseCastrSchema(schema: SchemaObject, metadata: CastrSchemaNode): CastrSchema {
  const irSchema: CastrSchema = { metadata };
  addTypeInfo(schema, irSchema);
  addDocumentation(schema, irSchema);
  addConstraints(schema, irSchema);
  return irSchema;
}

/** @internal */
function addTypeInfo(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.type !== undefined) {
    irSchema.type = schema.type;
  } else if (schema.properties || schema.additionalProperties) {
    irSchema.type = 'object';
  }
  if (schema.format !== undefined) {
    irSchema.format = schema.format;
  }
}

/** @internal */
function addDocumentation(schema: SchemaObject, irSchema: CastrSchema): void {
  if (schema.title !== undefined) {
    irSchema.title = schema.title;
  }
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

/**
 * Build property schema context.
 *
 * Properties may be optional based on the parent object's required array.
 *
 * @param name - Property name
 * @param schema - OpenAPI schema object
 * @param parentRequired - Array of required property names from parent
 * @param parentContext - Parent build context
 * @returns Property schema context
 */
export function buildPropertySchema(
  name: string,
  schema: SchemaObject | ReferenceObject,
  parentRequired: string[],
  parentContext: IRBuildContext,
): IRPropertySchemaContext {
  const isRequired = parentRequired.some((requiredName) => requiredName === name);
  const context: IRBuildContext = {
    ...parentContext,
    path: [...parentContext.path, 'properties', name],
    required: isRequired,
  };

  const irSchema = buildCastrSchema(schema, context);

  return {
    contextType: 'property',
    name,
    schema: irSchema,
    optional: !isRequired,
  };
}

/**
 * Build composition member context.
 *
 * Composition members are structural alternatives and are NEVER optional.
 *
 * @param schema - Member schema
 * @param compositionType - Type of composition (oneOf, anyOf, allOf)
 * @param index - Index in the composition array
 * @param parentContext - Parent build context
 * @returns Composition member context
 */
export function buildCompositionMember(
  schema: SchemaObject | ReferenceObject,
  compositionType: 'oneOf' | 'anyOf' | 'allOf',
  index: number,
  parentContext: IRBuildContext,
): IRCompositionMemberContext {
  const context: IRBuildContext = {
    ...parentContext,
    path: [...parentContext.path, compositionType, String(index)],
    required: true, // Composition members are structural - never .optional()
  };

  const irSchema = buildCastrSchema(schema, context);

  return {
    contextType: 'compositionMember',
    compositionType,
    schema: irSchema,
  };
}

/**
 * Add object properties to IR schema (recursively builds property schemas).
 * @internal
 */
function addObjectProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
): void {
  if (!schema.properties) {
    return;
  }

  const requiredFields = schema.required ?? [];
  const propsRecord: Record<string, CastrSchema> = {};

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const propertyContext = buildPropertySchema(propName, propSchema, requiredFields, context);
    propsRecord[propName] = propertyContext.schema;
  }

  irSchema.properties = new CastrSchemaProperties(propsRecord);
  irSchema.required = requiredFields;
}

/**
 * Add additional properties to IR schema.
 * @internal
 */
function addAdditionalProperties(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
): void {
  if (schema.additionalProperties === undefined) {
    return;
  }

  if (typeof schema.additionalProperties === 'boolean') {
    irSchema.additionalProperties = schema.additionalProperties;
  } else {
    const additionalContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'additionalProperties'],
      required: false,
    };
    irSchema.additionalProperties = buildCastrSchema(
      schema.additionalProperties,
      additionalContext,
    );
  }
}

/**
 * Add array items to IR schema (recursively builds items schema).
 * @internal
 */
function addArrayItems(schema: SchemaObject, context: IRBuildContext, irSchema: CastrSchema): void {
  if (!schema.items) {
    return;
  }

  const itemsContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'items'],
    required: false,
  };

  irSchema.items = buildCastrSchema(schema.items, itemsContext);
}

/**
 * Add composition schemas (allOf, oneOf, anyOf) - recursively builds members.
 * @internal
 */
function addCompositionSchemas(
  schema: SchemaObject,
  context: IRBuildContext,
  irSchema: CastrSchema,
): void {
  if (schema.allOf) {
    irSchema.allOf = schema.allOf.map((subSchema, index) => {
      const memberContext = buildCompositionMember(subSchema, 'allOf', index, context);
      return memberContext.schema;
    });
  }

  if (schema.oneOf) {
    irSchema.oneOf = schema.oneOf.map((subSchema, index) => {
      const memberContext = buildCompositionMember(subSchema, 'oneOf', index, context);
      return memberContext.schema;
    });
  }

  if (schema.anyOf) {
    irSchema.anyOf = schema.anyOf.map((subSchema, index) => {
      const memberContext = buildCompositionMember(subSchema, 'anyOf', index, context);
      return memberContext.schema;
    });
  }
}
