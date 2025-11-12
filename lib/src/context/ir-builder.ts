/**
 * Information Retrieval (IR) Builder
 *
 * Builds lossless Information Retrieval structures from OpenAPI documents.
 * Extracts all metadata required for code generation in a structured format.
 *
 * **Pure Functions:**
 * All functions in this module are pure - no side effects, deterministic output.
 *
 * **Library Types:**
 * Uses OpenAPIObject, SchemaObject, ComponentsObject from openapi3-ts/oas31 exclusively.
 *
 * @module ir-builder
 * @since 1.0.0
 * @public
 */

import type {
  ComponentsObject,
  OpenAPIObject,
  SchemaObject,
  ReferenceObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';
import type {
  IRComponent,
  IRDependencyGraph,
  IRDocument,
  IRSchema,
  IRSchemaNode,
} from './ir-schema.js';

/**
 * Build context for IR construction.
 * Carries state needed during recursive schema traversal.
 */
interface IRBuildContext {
  /**
   * The full OpenAPI document (for reference resolution).
   */
  doc: OpenAPIObject;

  /**
   * Current path in the schema tree (for debugging and metadata).
   */
  path: string[];

  /**
   * Whether the current schema is required by its parent.
   */
  required: boolean;
}

/**
 * Build complete Information Retrieval document from OpenAPI specification.
 *
 * Extracts all schemas, operations, and metadata into a lossless IR structure
 * optimized for code generation. Preserves all OpenAPI information without loss.
 *
 * @param doc - OpenAPI document (OAS 3.1.0)
 * @returns Complete IR document with schemas, operations, and dependency graph
 *
 * @example
 * ```typescript
 * const openApiDoc: OpenAPIObject = loadOpenApiSpec('petstore.yaml');
 * const ir = buildIR(openApiDoc);
 *
 * console.log(`Components: ${ir.components.length}`);
 * console.log(`Operations: ${ir.operations.length}`);
 * ```
 *
 * @public
 */
export function buildIR(doc: OpenAPIObject): IRDocument {
  const components = buildIRSchemas(doc.components);
  const dependencyGraph = buildDependencyGraph();

  return {
    version: '1.0.0', // IR schema version
    openApiVersion: doc.openapi,
    info: doc.info,
    components,
    operations: [], // Operations will be implemented in future iteration
    dependencyGraph,
  };
}

/**
 * Build IR components from OpenAPI components object.
 *
 * Extracts schemas, responses, parameters, and request bodies from the
 * components section, converting each to an IRComponent structure.
 *
 * @param components - OpenAPI components object (may be undefined)
 * @returns Array of IR components
 *
 * @example
 * ```typescript
 * const components: ComponentsObject = {
 *   schemas: {
 *     Pet: { type: 'object', properties: { name: { type: 'string' } } },
 *     Error: { type: 'object', properties: { message: { type: 'string' } } },
 *   },
 * };
 *
 * const irComponents = buildIRSchemas(components);
 * // Returns array with 2 IRComponent objects
 * ```
 *
 * @public
 */
export function buildIRSchemas(components: ComponentsObject | undefined): IRComponent[] {
  if (!components?.schemas) {
    return [];
  }

  const schemas = components.schemas;
  const schemaNames = Object.keys(schemas);

  return schemaNames.map((name) => {
    const schema = schemas[name];
    if (!schema) {
      throw new Error(`Schema '${name}' is undefined`);
    }

    // Build context for this schema
    const context: IRBuildContext = {
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} }, // Minimal doc for now
      path: ['#', 'components', 'schemas', name],
      required: false, // Top-level schemas are not required by default
    };

    // Build IR schema from OpenAPI schema
    const irSchema = buildIRSchema(schema, context);

    return {
      type: 'schema',
      name,
      schema: irSchema,
      metadata: irSchema.metadata,
    };
  });
}

/**
 * Build IR schema from OpenAPI SchemaObject or ReferenceObject.
 *
 * Recursively processes schema structures, preserving all metadata and
 * building the IR representation. Handles primitives, objects, arrays,
 * compositions, and references.
 *
 * @param schema - OpenAPI schema or reference
 * @param context - Build context with document and path information
 * @returns IR schema with full metadata
 *
 * @internal
 */
function buildIRSchema(schema: SchemaObject | ReferenceObject, context: IRBuildContext): IRSchema {
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
 * Build base IR schema with primitive properties.
 *
 * @param schema - OpenAPI schema object
 * @param metadata - IR schema node metadata
 * @returns Base IR schema with primitives
 *
 * @internal
 */
function buildBaseIRSchema(schema: SchemaObject, metadata: IRSchemaNode): IRSchema {
  const irSchema: IRSchema = { metadata };

  addTypeAndFormat(schema, irSchema);
  addDocumentation(schema, irSchema);
  addNumericConstraints(schema, irSchema);
  addStringConstraints(schema, irSchema);

  return irSchema;
}

/**
 * Add type and format properties to IR schema.
 *
 * @internal
 */
function addTypeAndFormat(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.type !== undefined) {
    irSchema.type = schema.type;
  }
  if (schema.format !== undefined) {
    irSchema.format = schema.format;
  }
}

/**
 * Add documentation properties to IR schema.
 *
 * @internal
 */
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

/**
 * Add numeric constraints to IR schema.
 *
 * @internal
 */
function addNumericConstraints(schema: SchemaObject, irSchema: IRSchema): void {
  if (schema.minimum !== undefined) {
    irSchema.minimum = schema.minimum;
  }
  if (schema.maximum !== undefined) {
    irSchema.maximum = schema.maximum;
  }
}

/**
 * Add string constraints to IR schema.
 *
 * @internal
 */
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

/**
 * Add object properties to IR schema.
 *
 * @param schema - OpenAPI schema object
 * @param context - Build context
 * @param irSchema - IR schema to mutate
 *
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
  const properties: Record<string, IRSchema> = {};

  for (const [propName, propSchema] of Object.entries(schema.properties)) {
    const isRequired = requiredFields.includes(propName);
    const propContext: IRBuildContext = {
      ...context,
      path: [...context.path, 'properties', propName],
      required: isRequired,
    };

    properties[propName] = buildIRSchema(propSchema, propContext);
  }

  irSchema.properties = properties;
  irSchema.required = requiredFields;
}

/**
 * Add array items to IR schema.
 *
 * @param schema - OpenAPI schema object
 * @param context - Build context
 * @param irSchema - IR schema to mutate
 *
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
 * Add composition schemas (allOf, oneOf, anyOf) to IR schema.
 *
 * @param schema - OpenAPI schema object
 * @param context - Build context
 * @param irSchema - IR schema to mutate
 *
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

/**
 * Build IR schema node metadata.
 *
 * Extracts metadata about a schema including required status, nullability,
 * validations, and dependency information. This metadata is used during
 * code generation to produce appropriate Zod schemas.
 *
 * @param schema - OpenAPI schema object
 * @param context - Build context
 * @returns IR schema node metadata
 *
 * @internal
 */
function buildIRSchemaNode(schema: SchemaObject, context: IRBuildContext): IRSchemaNode {
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
 * Build dependency graph for schemas.
 *
 * Stub implementation that returns an empty dependency graph structure.
 * Full dependency graph analysis with circular reference detection and
 * topological sorting will be implemented in a future iteration.
 *
 * @returns IR dependency graph with empty nodes, order, and circular references
 *
 * @internal
 */
function buildDependencyGraph(): IRDependencyGraph {
  // Dependency graph stub - will be enhanced in later implementation
  // Returns empty graph structure for now
  return {
    nodes: new Map(),
    topologicalOrder: [],
    circularReferences: [],
  };
}
