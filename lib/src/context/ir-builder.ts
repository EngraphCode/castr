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
 * Uses OpenAPIObject from openapi3-ts/oas31 exclusively.
 *
 * @module ir-builder
 * @since 1.0.0
 * @public
 */

import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type {
  IRComponent,
  IRDependencyGraph,
  IRDocument,
  IREnum,
  IROperation,
  IRRequestBody,
  IRResponse,
  IRResponseComponent,
  IRSchema,
} from './ir-schema.js';
import { buildIRSchemas } from './ir-builder.schemas.js';
import { buildIROperations } from './ir-builder.operations.js';

// Re-export core functions for backwards compatibility
export { buildIRSchema, buildIRSchemaNode } from './ir-builder.core.js';
export { buildIRSchemas } from './ir-builder.schemas.js';

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
  const operations = buildIROperations(doc);
  const dependencyGraph = buildDependencyGraph();

  const enums = extractEnums(components, operations);

  return {
    version: '1.0.0', // IR schema version
    openApiVersion: doc.openapi,
    info: doc.info,
    servers: doc.servers ?? [],
    components,
    operations,
    dependencyGraph,
    enums,
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

/**
 * Extract all enums from components and operations.
 *
 * Traverses the entire IR to find all enum definitions and collects them
 * into a centralized catalog.
 *
 * @param components - IR components
 * @param operations - IR operations
 * @returns Map of enum names to enum definitions
 *
 * @internal
 */
function extractEnums(components: IRComponent[], operations: IROperation[]): Map<string, IREnum> {
  return new EnumExtractor().extract(components, operations);
}

class EnumExtractor {
  private enums = new Map<string, IREnum>();
  private visited = new Set<IRSchema>();

  extract(components: IRComponent[], operations: IROperation[]): Map<string, IREnum> {
    this.traverseComponents(components);
    this.traverseOperations(operations);
    return this.enums;
  }

  private traverseComponents(components: IRComponent[]): void {
    for (const component of components) {
      this.visitComponent(component);
    }
  }

  private visitComponent(component: IRComponent): void {
    if (component.type === 'schema') {
      this.visitSchema(component.schema, component.name);
    } else if (component.type === 'parameter') {
      this.visitSchema(component.parameter.schema, component.parameter.name);
    } else if (component.type === 'response') {
      this.visitResponseComponent(component);
    } else if (component.type === 'requestBody') {
      this.visitRequestBody(component.requestBody);
    }
  }

  private visitResponseComponent(component: IRResponseComponent): void {
    if (component.response.schema) {
      this.visitSchema(component.response.schema, component.name);
    }
    this.visitResponse(component.response);
  }

  private traverseOperations(operations: IROperation[]): void {
    for (const operation of operations) {
      this.visitOperation(operation);
    }
  }

  private visitOperation(operation: IROperation): void {
    for (const param of operation.parameters) {
      this.visitSchema(param.schema, param.name);
    }
    if (operation.requestBody) {
      this.visitRequestBody(operation.requestBody);
    }
    for (const response of operation.responses) {
      this.visitResponse(response);
    }
  }

  private visitRequestBody(requestBody: IRRequestBody): void {
    for (const key of Object.keys(requestBody.content)) {
      const media = requestBody.content[key];
      if (media) {
        this.visitSchema(media.schema);
      }
    }
  }

  private visitResponse(response: IRResponse): void {
    if (response.schema) {
      this.visitSchema(response.schema);
    }
    this.visitResponseContent(response);
    this.visitResponseHeaders(response);
  }

  private visitResponseContent(response: IRResponse): void {
    if (response.content) {
      for (const key of Object.keys(response.content)) {
        const media = response.content[key];
        if (media) {
          this.visitSchema(media.schema);
        }
      }
    }
  }

  private visitResponseHeaders(response: IRResponse): void {
    if (response.headers) {
      for (const key of Object.keys(response.headers)) {
        const header = response.headers[key];
        if (header) {
          this.visitSchema(header);
        }
      }
    }
  }

  private visitSchema(schema: IRSchema, nameHint?: string): void {
    if (this.visited.has(schema)) {
      return;
    }
    this.visited.add(schema);

    if (schema.enum && schema.enum.length > 0) {
      this.registerEnum(schema, nameHint);
    }

    this.traverseSchemaChildren(schema);
  }

  private registerEnum(schema: IRSchema, nameHint?: string): void {
    const name = nameHint || `Enum_${this.enums.size + 1}`;
    const enumDef: IREnum = {
      name,
      values: schema.enum ?? [],
      schema,
    };
    if (schema.description) {
      enumDef.description = schema.description;
    }
    this.enums.set(name, enumDef);
  }

  private traverseSchemaChildren(schema: IRSchema): void {
    this.visitSchemaProperties(schema);
    this.visitSchemaItems(schema);
    this.traverseComposition(schema);
  }

  private visitSchemaProperties(schema: IRSchema): void {
    if (schema.properties) {
      for (const [propName, propSchema] of schema.properties.entries()) {
        this.visitSchema(propSchema, propName);
      }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      this.visitSchema(schema.additionalProperties);
    }
  }

  private visitSchemaItems(schema: IRSchema): void {
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item: IRSchema) => this.visitSchema(item));
      } else {
        this.visitSchema(schema.items);
      }
    }
  }

  private traverseComposition(schema: IRSchema): void {
    if (schema.allOf) {
      schema.allOf.forEach((s: IRSchema) => this.visitSchema(s));
    }
    if (schema.oneOf) {
      schema.oneOf.forEach((s: IRSchema) => this.visitSchema(s));
    }
    if (schema.anyOf) {
      schema.anyOf.forEach((s: IRSchema) => this.visitSchema(s));
    }
    if (schema.not) {
      this.visitSchema(schema.not);
    }
  }
}
