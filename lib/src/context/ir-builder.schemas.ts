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
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SchemaObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';
import type { IRComponent, IRSecuritySchemeComponent } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { buildIRSchema } from './ir-builder.core.js';
import { buildSingleParameter } from './ir-builder.parameters.js';
import { buildSingleResponse } from './ir-builder.responses.js';
import { buildIRRequestBody } from './ir-builder.request-body.js';
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
 * const irComponents = buildIRSchemas(components);
 * // Returns array with 2 IRComponent objects
 * ```
 *
 * @public
 */
export function buildIRSchemas(components: ComponentsObject | undefined): IRComponent[] {
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

function buildSchemaComponents(
  schemas: Record<string, SchemaObject | ReferenceObject>,
): IRComponent[] {
  return Object.entries(schemas).map(([name, schema]) => {
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

function buildSecurityComponents(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
): IRSecuritySchemeComponent[] {
  return Object.entries(securitySchemes).map(([name, scheme]) => {
    return {
      type: 'securityScheme',
      name,
      scheme,
    };
  });
}

function buildParameterComponents(
  parameters: Record<string, ParameterObject | ReferenceObject>,
): IRComponent[] {
  return Object.entries(parameters).map(([name, param]) => {
    // Create a temporary context for the parameter
    const context: IRBuildContext = {
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
      path: ['#', 'components', 'parameters', name],
      required: false,
    };
    return {
      type: 'parameter',
      name,
      parameter: buildSingleParameter(param, context),
    };
  });
}

function buildResponseComponents(
  responses: Record<string, ResponseObject | ReferenceObject>,
): IRComponent[] {
  return Object.entries(responses).map(([name, response]) => {
    // Create a temporary context for the response
    const context: IRBuildContext = {
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
      path: ['#', 'components', 'responses', name],
      required: false,
    };
    // For responses, we need a status code, but components don't have one.
    // We use 'default' or a placeholder as it's a reusable component.
    return {
      type: 'response',
      name,
      response: buildSingleResponse('default', response, context),
    };
  });
}

function buildRequestBodyComponents(
  requestBodies: Record<string, RequestBodyObject | ReferenceObject>,
): IRComponent[] {
  return Object.entries(requestBodies).map(([name, requestBody]) => {
    // Create a temporary context for the requestBody
    const context: IRBuildContext = {
      doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
      path: ['#', 'components', 'requestBodies', name],
      required: false,
    };
    return {
      type: 'requestBody',
      name,
      requestBody: buildIRRequestBody(requestBody, context),
    };
  });
}
