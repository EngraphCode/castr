/**
 * Intermediate Representation (IR) Builder
 *
 * Builds lossless Intermediate Representation structures from OpenAPI documents.
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

import type { ComponentsObject, OpenAPIObject } from 'openapi3-ts/oas31';
import type {
  IRComponent,
  CastrDocument,
  IREnum,
  CastrOperation,
  IRRequestBody,
  CastrResponse,
  CastrResponseComponent,
  CastrSchema,
} from '../../ir/schema.js';
import { buildCastrSchemas } from './builder.schemas.js';
import { buildCastrOperations, buildIRSecurity } from './builder.operations.js';
import { isRecord } from '../../shared/types.js';
import { buildDependencyGraph, extractOriginalSchemaKeys } from './builder.dependency-graph.js';

// Re-export core functions for backwards compatibility
export { buildCastrSchema, buildCastrSchemaNode } from './builder.core.js';
export { buildCastrSchemas } from './builder.schemas.js';

/**
 * Build complete Intermediate Representation document from OpenAPI specification.
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
export function buildIR(doc: OpenAPIObject): CastrDocument {
  // Build components from standard location
  const components = buildCastrSchemas(doc.components);

  // Also extract schemas from x-ext vendor extension (Scalar multi-file bundling)
  const xExtComponents = extractXExtSchemas(doc);
  components.push(...xExtComponents);

  // Extract schema names from IR components (sanitized names for code generation)
  const schemaNames = buildSchemaNames(components);

  // Extract original schema keys from OpenAPI doc for dependency graph
  // These are the raw keys that match the actual document structure
  const originalSchemaKeys = extractOriginalSchemaKeys(doc);

  const operations = buildCastrOperations(doc);
  const dependencyGraph = buildDependencyGraph(originalSchemaKeys, doc);

  const enums = extractEnums(components, operations);

  // Build global security from document-level security array
  const globalSecurity = doc.security ? buildIRSecurity(doc.security) : undefined;

  return {
    version: '1.0.0', // IR schema version
    openApiVersion: doc.openapi,
    info: doc.info,
    servers: doc.servers ?? [],
    components,
    operations,
    dependencyGraph,
    schemaNames,
    enums,
    ...(globalSecurity ? { security: globalSecurity } : {}),
  };
}

/**
 * Extract schemas from x-ext vendor extension locations.
 *
 * Scalar's bundler stores external file schemas in doc['x-ext'][hash].components.schemas.
 * This function finds all such schemas and converts them to IR components.
 *
 * @param doc - OpenAPI document that may contain x-ext extensions
 * @returns Array of IR components from x-ext locations
 *
 * @internal
 */
function extractXExtSchemas(doc: OpenAPIObject): IRComponent[] {
  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return [];
  }

  const allXExtComponents: IRComponent[] = [];

  for (const extContent of Object.values(xExt)) {
    if (!isRecord(extContent)) {
      continue;
    }

    const extComponents = extContent['components'];
    if (!isRecord(extComponents)) {
      continue;
    }

    // Build components from this x-ext location
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Safe cast: isRecord validates it's an object with string keys
    const irComponents = buildCastrSchemas(extComponents as ComponentsObject);
    allXExtComponents.push(...irComponents);
  }

  return allXExtComponents;
}

/**
 * Extract schema names from IR components.
 *
 * Filters components to find only schema-type components and extracts their names.
 *
 * @param components - IR components from the document
 * @returns Array of schema names (not full $ref paths)
 *
 * @internal
 */
function buildSchemaNames(components: IRComponent[]): string[] {
  return components.filter((c) => c.type === 'schema').map((c) => c.name);
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
function extractEnums(
  components: IRComponent[],
  operations: CastrOperation[],
): Map<string, IREnum> {
  return new EnumExtractor().extract(components, operations);
}

class EnumExtractor {
  private enums = new Map<string, IREnum>();
  private visited = new Set<CastrSchema>();

  extract(components: IRComponent[], operations: CastrOperation[]): Map<string, IREnum> {
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

  private visitResponseComponent(component: CastrResponseComponent): void {
    if (component.response.schema) {
      this.visitSchema(component.response.schema, component.name);
    }
    this.visitResponse(component.response);
  }

  private traverseOperations(operations: CastrOperation[]): void {
    for (const operation of operations) {
      this.visitOperation(operation);
    }
  }

  private visitOperation(operation: CastrOperation): void {
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

  private visitResponse(response: CastrResponse): void {
    if (response.schema) {
      this.visitSchema(response.schema);
    }
    this.visitResponseContent(response);
    this.visitResponseHeaders(response);
  }

  private visitResponseContent(response: CastrResponse): void {
    if (response.content) {
      for (const key of Object.keys(response.content)) {
        const media = response.content[key];
        if (media) {
          this.visitSchema(media.schema);
        }
      }
    }
  }

  private visitResponseHeaders(response: CastrResponse): void {
    if (response.headers) {
      for (const key of Object.keys(response.headers)) {
        const header = response.headers[key];
        if (header) {
          this.visitSchema(header);
        }
      }
    }
  }

  private visitSchema(schema: CastrSchema, nameHint?: string): void {
    if (this.visited.has(schema)) {
      return;
    }
    this.visited.add(schema);

    if (schema.enum && schema.enum.length > 0) {
      this.registerEnum(schema, nameHint);
    }

    this.traverseSchemaChildren(schema);
  }

  private registerEnum(schema: CastrSchema, nameHint?: string): void {
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

  private traverseSchemaChildren(schema: CastrSchema): void {
    this.visitSchemaProperties(schema);
    this.visitSchemaItems(schema);
    this.traverseComposition(schema);
  }

  private visitSchemaProperties(schema: CastrSchema): void {
    if (schema.properties) {
      for (const [propName, propSchema] of schema.properties.entries()) {
        this.visitSchema(propSchema, propName);
      }
    }
    if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
      this.visitSchema(schema.additionalProperties);
    }
  }

  private visitSchemaItems(schema: CastrSchema): void {
    if (schema.items) {
      if (Array.isArray(schema.items)) {
        schema.items.forEach((item: CastrSchema) => this.visitSchema(item));
      } else {
        this.visitSchema(schema.items);
      }
    }
  }

  private traverseComposition(schema: CastrSchema): void {
    if (schema.allOf) {
      schema.allOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.oneOf) {
      schema.oneOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.anyOf) {
      schema.anyOf.forEach((s: CastrSchema) => this.visitSchema(s));
    }
    if (schema.not) {
      this.visitSchema(schema.not);
    }
  }
}
