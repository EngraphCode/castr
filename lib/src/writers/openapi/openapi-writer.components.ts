/**
 * OpenAPI components writer — converts IR components to OpenAPI ComponentsObject.
 *
 * This module handles the conversion of IR component definitions (schemas,
 * security schemes, parameters, responses) to valid OpenAPI 3.1 ComponentsObject.
 *
 * @module
 */

import type { ComponentsObject, ParameterObject, ResponseObject } from 'openapi3-ts/oas31';

import type {
  IRComponent,
  CastrSchemaComponent,
  IRSecuritySchemeComponent,
  CastrParameterComponent,
  CastrResponseComponent,
} from '../../ir/schema.js';

import { writeOpenApiSchema } from './openapi-writer.schema.js';

/**
 * Type guard for schema components.
 * @internal
 */
function isSchemaComponent(component: IRComponent): component is CastrSchemaComponent {
  return component.type === 'schema';
}

/**
 * Type guard for security scheme components.
 * @internal
 */
function isSecuritySchemeComponent(component: IRComponent): component is IRSecuritySchemeComponent {
  return component.type === 'securityScheme';
}

/**
 * Type guard for parameter components.
 * @internal
 */
function isParameterComponent(component: IRComponent): component is CastrParameterComponent {
  return component.type === 'parameter';
}

/**
 * Type guard for response components.
 * @internal
 */
function isResponseComponent(component: IRComponent): component is CastrResponseComponent {
  return component.type === 'response';
}

/**
 * Converts a parameter component to OpenAPI ParameterObject.
 * @internal
 */
function writeParameterComponent(component: CastrParameterComponent): ParameterObject {
  const param: ParameterObject = {
    name: component.parameter.name,
    in: component.parameter.in,
    required: component.parameter.required,
    schema: writeOpenApiSchema(component.parameter.schema),
  };
  if (component.parameter.description !== undefined) {
    param.description = component.parameter.description;
  }
  return param;
}

/**
 * Converts a response component to OpenAPI ResponseObject.
 * @internal
 */
function writeResponseComponent(component: CastrResponseComponent): ResponseObject {
  const response: ResponseObject = {
    description: component.response.description ?? '',
  };
  if (component.response.schema !== undefined) {
    response.content = {
      'application/json': {
        schema: writeOpenApiSchema(component.response.schema),
      },
    };
  }
  return response;
}

/**
 * Adds a schema component to the result.
 * @internal
 */
function addSchemaComponent(result: ComponentsObject, component: CastrSchemaComponent): void {
  if (result.schemas === undefined) {
    result.schemas = {};
  }
  result.schemas[component.name] = writeOpenApiSchema(component.schema);
}

/**
 * Adds a security scheme component to the result.
 * @internal
 */
function addSecuritySchemeComponent(
  result: ComponentsObject,
  component: IRSecuritySchemeComponent,
): void {
  if (result.securitySchemes === undefined) {
    result.securitySchemes = {};
  }
  result.securitySchemes[component.name] = component.scheme;
}

/**
 * Adds a parameter component to the result.
 * @internal
 */
function addParameterComponent(result: ComponentsObject, component: CastrParameterComponent): void {
  if (result.parameters === undefined) {
    result.parameters = {};
  }
  result.parameters[component.name] = writeParameterComponent(component);
}

/**
 * Adds a response component to the result.
 * @internal
 */
function addResponseComponent(result: ComponentsObject, component: CastrResponseComponent): void {
  if (result.responses === undefined) {
    result.responses = {};
  }
  result.responses[component.name] = writeResponseComponent(component);
}

function addAdditionalComponents(result: ComponentsObject, component: IRComponent): void {
  if (component.type === 'header') {
    if (result.headers === undefined) {
      result.headers = {};
    }
    result.headers[component.name] = component.header;
  } else if (component.type === 'link') {
    if (result.links === undefined) {
      result.links = {};
    }
    result.links[component.name] = component.link;
  } else if (component.type === 'callback') {
    if (result.callbacks === undefined) {
      result.callbacks = {};
    }
    result.callbacks[component.name] = component.callback;
  } else if (component.type === 'pathItem') {
    if (result.pathItems === undefined) {
      result.pathItems = {};
    }
    result.pathItems[component.name] = component.pathItem;
  } else if (component.type === 'example') {
    if (result.examples === undefined) {
      result.examples = {};
    }
    result.examples[component.name] = component.example;
  }
}

/**
 * Converts IR components to an OpenAPI ComponentsObject.
 *
 * Groups components by type (schemas, securitySchemes, parameters, responses)
 * and converts each to the appropriate OpenAPI structure.
 *
 * @param components - The IR components to convert
 * @returns A valid OpenAPI 3.1 ComponentsObject
 *
 * @example
 * ```typescript
 * const irComponents: IRComponent[] = [
 *   { type: 'schema', name: 'User', schema: { type: 'object', ... }, ... },
 *   { type: 'securityScheme', name: 'bearerAuth', scheme: { ... } },
 * ];
 *
 * const oasComponents = writeOpenApiComponents(irComponents);
 * // {
 * //   schemas: { User: { type: 'object' } },
 * //   securitySchemes: { bearerAuth: { ... } },
 * // }
 * ```
 *
 * @public
 */
export function writeOpenApiComponents(components: IRComponent[]): ComponentsObject {
  const result: ComponentsObject = {};

  for (const component of components) {
    if (isSchemaComponent(component)) {
      addSchemaComponent(result, component);
    } else if (isSecuritySchemeComponent(component)) {
      addSecuritySchemeComponent(result, component);
    } else if (isParameterComponent(component)) {
      addParameterComponent(result, component);
    } else if (isResponseComponent(component)) {
      addResponseComponent(result, component);
    } else {
      addAdditionalComponents(result, component);
    }
  }

  return result;
}
