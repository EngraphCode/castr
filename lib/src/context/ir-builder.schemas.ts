/**
 * IR Builder - Component Schema Extraction
 *
 * Handles extraction of schemas from OpenAPI components section.
 * Focused on component-level schema extraction and organization.
 *
 * @module ir-builder.schemas
 * @internal
 */

import type { ComponentsObject } from 'openapi3-ts/oas31';
import type { IRComponent } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { buildIRSchema } from './ir-builder.core.js';

/**
 * Build IR components from OpenAPI components object.
 *
 * Extracts schemas from the components section, converting each to an
 * IRComponent structure with full schema information and metadata.
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
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
      path: ['#', 'components', 'schemas', name],
      required: false,
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
