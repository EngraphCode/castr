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

import type { ComponentsObject, OpenAPIObject, PathItemObject } from 'openapi3-ts/oas31';
import { buildCastrSchemas, extractEnums } from './schemas/index.js';
import { buildCastrOperations, buildIRSecurity } from './operations/index.js';
import { isRecord } from '../../../shared/type-utils/types.js';
import { buildDependencyGraph, extractOriginalSchemaKeys } from './components/index.js';
import type { CastrDocument, IRComponent } from '../../ir/index.js';

// Re-export core functions for backwards compatibility
export type { IRBuildContext } from './builder.types.js';
export { buildCastrSchema, buildCastrSchemaNode } from './builder.core.js';
export { buildCastrSchemas } from './schemas/index.js';

/**
 * Build optional document-level fields for the IR.
 * @internal
 */
function buildOptionalDocumentFields(doc: OpenAPIObject): Partial<CastrDocument> {
  const optionalFields: Partial<CastrDocument> = {};

  if (doc.security) {
    optionalFields.security = buildIRSecurity(doc.security);
  }
  if (doc.tags) {
    optionalFields.tags = doc.tags;
  }
  if (doc.externalDocs) {
    optionalFields.externalDocs = doc.externalDocs;
  }

  const webhooks = extractWebhooks(doc);
  if (webhooks) {
    optionalFields.webhooks = webhooks;
  }

  if ('jsonSchemaDialect' in doc && typeof doc.jsonSchemaDialect === 'string') {
    optionalFields.jsonSchemaDialect = doc.jsonSchemaDialect;
  }

  return optionalFields;
}

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
  const components = buildCastrSchemas(doc.components);
  components.push(...extractXExtSchemas(doc));
  components.push(...extractAdditionalComponents(doc));

  const schemaNames = buildSchemaNames(components);
  const originalSchemaKeys = extractOriginalSchemaKeys(doc);
  const operations = buildCastrOperations(doc);
  const dependencyGraph = buildDependencyGraph(originalSchemaKeys, doc);
  const enums = extractEnums(components, operations);

  return {
    version: '1.0.0',
    openApiVersion: doc.openapi,
    info: doc.info,
    servers: doc.servers ?? [],
    components,
    operations,
    dependencyGraph,
    schemaNames,
    enums,
    ...buildOptionalDocumentFields(doc),
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
    if (!isComponentsObject(extComponents)) {
      continue;
    }

    // Build components from this x-ext location
    const irComponents = buildCastrSchemas(extComponents);
    allXExtComponents.push(...irComponents);
  }

  return allXExtComponents;
}

function isComponentsObject(value: unknown): value is ComponentsObject {
  return isRecord(value);
}

/**
 * Extract additional component types (links, callbacks, pathItems, headers).
 *
 * These component types are supported in OpenAPI but not yet fully processed
 * into rich IR types. For now, we store them as raw OpenAPI objects.
 *
 * @param doc - OpenAPI document
 * @returns Array of IR components for links, callbacks, pathItems, headers
 *
 * @internal
 */
function extractAdditionalComponents(doc: OpenAPIObject): IRComponent[] {
  const components = doc.components;
  if (!components) {
    return [];
  }

  const result: IRComponent[] = [];

  // Extract each component type
  extractHeaders(components, result);
  extractLinks(components, result);
  extractCallbacks(components, result);
  extractPathItems(components, result);
  extractExamples(components, result);

  return result;
}

function extractHeaders(components: ComponentsObject, result: IRComponent[]): void {
  if (!components.headers) {
    return;
  }
  for (const [name, header] of Object.entries(components.headers)) {
    result.push({ type: 'header', name, header });
  }
}

function extractLinks(components: ComponentsObject, result: IRComponent[]): void {
  if (!components.links) {
    return;
  }
  for (const [name, link] of Object.entries(components.links)) {
    result.push({ type: 'link', name, link });
  }
}

function extractCallbacks(components: ComponentsObject, result: IRComponent[]): void {
  if (!components.callbacks) {
    return;
  }
  for (const [name, callback] of Object.entries(components.callbacks)) {
    result.push({ type: 'callback', name, callback });
  }
}

function extractPathItems(components: ComponentsObject, result: IRComponent[]): void {
  if (!('pathItems' in components) || !components.pathItems) {
    return;
  }
  for (const [name, pathItem] of Object.entries(components.pathItems)) {
    result.push({ type: 'pathItem', name, pathItem });
  }
}

function extractExamples(components: ComponentsObject, result: IRComponent[]): void {
  if (!components.examples) {
    return;
  }
  for (const [name, example] of Object.entries(components.examples)) {
    result.push({ type: 'example', name, example });
  }
}

/**
 * Extract webhooks from OpenAPI 3.1.x document.
 *
 * Webhooks are PathItem objects keyed by webhook name.
 *
 * @param doc - OpenAPI document
 * @returns Map of webhook names to PathItem objects, or undefined if none
 *
 * @internal
 */
function extractWebhooks(doc: OpenAPIObject): Map<string, PathItemObject> | undefined {
  // Webhooks only exist in OpenAPI 3.1.x
  if (!('webhooks' in doc) || !doc.webhooks) {
    return undefined;
  }

  const webhooks = new Map<string, PathItemObject>();

  for (const [name, pathItem] of Object.entries(doc.webhooks)) {
    // Filter out references - we only want resolved PathItemObjects
    if (pathItem && !('$ref' in pathItem)) {
      webhooks.set(name, pathItem);
    }
  }

  return webhooks.size > 0 ? webhooks : undefined;
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
  const COMPONENT_TYPE_SCHEMA = 'schema' as const;
  return components.filter((c) => c.type === COMPONENT_TYPE_SCHEMA).map((c) => c.name);
}
