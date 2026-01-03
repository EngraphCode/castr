/**
 * IR Builder - Component Schema Extraction
 *
 * Handles extraction of schemas from OpenAPI components section.
 * Focused on component-level schema extraction and organization.
 *
 * @module ir-builder.schemas
 * @internal
 */

import type {
  ComponentsObject,
  OpenAPIObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import type { IRComponent } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import type { IRComponentSchemaContext } from './ir-context.js';
import { buildCastrSchema } from './ir-builder.core.js';
import { detectCircularReferences } from './ir-builder.circular.js';

/**
 * Build IR components from OpenAPI components object.
 *
 * Extracts schemas from the components section, converting each to an
 * IRComponent structure with full schema information and metadata.
 * Detects circular references after building all schemas.
 *
 * @param components - OpenAPI components object (may be undefined)
 * @returns Array of IR components with circular references detected
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
 * const irComponents = buildCastrSchemas(components);
 * // Returns array with 2 IRComponent objects
 * ```
 *
 * @public
 */
export function buildCastrSchemas(components: ComponentsObject | undefined): IRComponent[] {
  if (!components) {
    return [];
  }

  const irComponents: IRComponent[] = [];

  if (components.schemas) {
    irComponents.push(...buildSchemaComponents(components.schemas));
  }

  if (components.securitySchemes) {
    irComponents.push(...buildSecurityComponents(components.securitySchemes));
  }

  if (components.parameters) {
    irComponents.push(...buildParameterComponents(components.parameters));
  }

  if (components.responses) {
    irComponents.push(...buildResponseComponents(components.responses));
  }

  if (components.requestBodies) {
    irComponents.push(...buildRequestBodyComponents(components.requestBodies));
  }

  // Detect and populate circular references (only for schema components)
  detectCircularReferences(irComponents);

  return irComponents;
}

import { sanitizeIdentifier } from '../shared/utils/string-utils.js';

/**
 * Build component schema context (from #/components/schemas/{name}).
 *
 * Component schemas are NEVER optional - they define types, not instances.
 *
 * @param name - Component name
 * @param schema - OpenAPI schema object
 * @param doc - Full OpenAPI document (for reference resolution)
 * @returns Component schema context
 */
export function buildComponentSchema(
  name: string,
  schema: SchemaObject | ReferenceObject,
  doc: OpenAPIObject,
): IRComponentSchemaContext {
  const context: IRBuildContext = {
    doc,
    path: ['#', 'components', 'schemas', name],
    required: true, // Component schemas are always "required" (never .optional())
  };

  const irSchema = buildCastrSchema(schema, context);

  return {
    contextType: 'component',
    name: sanitizeIdentifier(name),
    schema: irSchema,
    metadata: irSchema.metadata,
  };
}

function buildSchemaComponents(
  schemas: Record<string, SchemaObject | ReferenceObject>,
): IRComponent[] {
  // We need a dummy doc for now as buildSchemaComponents signature doesn't include it.
  // In a real scenario, we should pass the doc down.
  // However, buildCastrSchemas doesn't take the doc either.
  // For now, we'll use the dummy doc as before, but ideally we should update the signature.
  // Wait, the original code used a dummy doc:
  // doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
  const dummyDoc: OpenAPIObject = {
    openapi: '3.1.0',
    info: { title: '', version: '' },
    paths: {},
  };

  return Object.entries(schemas).map(([name, schema]) => {
    const componentContext = buildComponentSchema(name, schema, dummyDoc);

    return {
      type: 'schema',
      name: componentContext.name,
      schema: componentContext.schema,
      metadata: componentContext.metadata,
    };
  });
}

import {
  buildSecurityComponents,
  buildParameterComponents,
  buildResponseComponents,
  buildRequestBodyComponents,
} from './ir-builder.components.js';
