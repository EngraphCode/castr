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

const COMPONENT_TYPE_SCHEMA = 'schema' as const;
const COMPONENT_TYPE_SECURITY_SCHEME = 'securityScheme' as const;
const COMPONENT_TYPE_PARAMETER = 'parameter' as const;
const COMPONENT_TYPE_RESPONSE = 'response' as const;
const COMPONENT_TYPE_HEADER = 'header' as const;
const COMPONENT_TYPE_LINK = 'link' as const;
const COMPONENT_TYPE_CALLBACK = 'callback' as const;
const COMPONENT_TYPE_PATH_ITEM = 'pathItem' as const;
const COMPONENT_TYPE_EXAMPLE = 'example' as const;

/**
 * Type guard for schema components.
 * @internal
 */
function isSchemaComponent(component: IRComponent): component is CastrSchemaComponent {
  return component.type === COMPONENT_TYPE_SCHEMA;
}

/**
 * Type guard for security scheme components.
 * @internal
 */
function isSecuritySchemeComponent(component: IRComponent): component is IRSecuritySchemeComponent {
  return component.type === COMPONENT_TYPE_SECURITY_SCHEME;
}

/**
 * Type guard for parameter components.
 * @internal
 */
function isParameterComponent(component: IRComponent): component is CastrParameterComponent {
  return component.type === COMPONENT_TYPE_PARAMETER;
}

/**
 * Type guard for response components.
 * @internal
 */
function isResponseComponent(component: IRComponent): component is CastrResponseComponent {
  return component.type === COMPONENT_TYPE_RESPONSE;
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

/**
 * Adds a header component to the result.
 * @internal
 */
function addHeaderComponent(
  result: ComponentsObject,
  component: IRComponent & { type: 'header' },
): void {
  if (result.headers === undefined) {
    result.headers = {};
  }
  result.headers[component.name] = component.header;
}

/**
 * Adds a link component to the result.
 * @internal
 */
function addLinkComponent(
  result: ComponentsObject,
  component: IRComponent & { type: 'link' },
): void {
  if (result.links === undefined) {
    result.links = {};
  }
  result.links[component.name] = component.link;
}

/**
 * Adds a callback component to the result.
 * @internal
 */
function addCallbackComponent(
  result: ComponentsObject,
  component: IRComponent & { type: 'callback' },
): void {
  if (result.callbacks === undefined) {
    result.callbacks = {};
  }
  result.callbacks[component.name] = component.callback;
}

/**
 * Adds a path item component to the result.
 * @internal
 */
function addPathItemComponent(
  result: ComponentsObject,
  component: IRComponent & { type: 'pathItem' },
): void {
  if (result.pathItems === undefined) {
    result.pathItems = {};
  }
  result.pathItems[component.name] = component.pathItem;
}

/**
 * Adds an example component to the result.
 * @internal
 */
function addExampleComponent(
  result: ComponentsObject,
  component: IRComponent & { type: 'example' },
): void {
  if (result.examples === undefined) {
    result.examples = {};
  }
  result.examples[component.name] = component.example;
}

/**
 * Type guard for header components.
 * @internal
 */
function isHeaderComponent(component: IRComponent): component is IRComponent & { type: 'header' } {
  return component.type === COMPONENT_TYPE_HEADER;
}

/**
 * Type guard for link components.
 * @internal
 */
function isLinkComponent(component: IRComponent): component is IRComponent & { type: 'link' } {
  return component.type === COMPONENT_TYPE_LINK;
}

/**
 * Type guard for callback components.
 * @internal
 */
function isCallbackComponent(
  component: IRComponent,
): component is IRComponent & { type: 'callback' } {
  return component.type === COMPONENT_TYPE_CALLBACK;
}

/**
 * Type guard for pathItem components.
 * @internal
 */
function isPathItemComponent(
  component: IRComponent,
): component is IRComponent & { type: 'pathItem' } {
  return component.type === COMPONENT_TYPE_PATH_ITEM;
}

/**
 * Type guard for example components.
 * @internal
 */
function isExampleComponent(
  component: IRComponent,
): component is IRComponent & { type: 'example' } {
  return component.type === COMPONENT_TYPE_EXAMPLE;
}

/**
 * Dispatch table mapping component types to their handler functions.
 * Each handler narrows the type via a type guard before delegating.
 * @internal
 */
const COMPONENT_TYPE_HANDLERS: Record<
  IRComponent['type'],
  (result: ComponentsObject, component: IRComponent) => void
> = {
  schema: (result, component) => {
    if (isSchemaComponent(component)) {
      addSchemaComponent(result, component);
    }
  },
  securityScheme: (result, component) => {
    if (isSecuritySchemeComponent(component)) {
      addSecuritySchemeComponent(result, component);
    }
  },
  parameter: (result, component) => {
    if (isParameterComponent(component)) {
      addParameterComponent(result, component);
    }
  },
  response: (result, component) => {
    if (isResponseComponent(component)) {
      addResponseComponent(result, component);
    }
  },
  header: (result, component) => {
    if (isHeaderComponent(component)) {
      addHeaderComponent(result, component);
    }
  },
  link: (result, component) => {
    if (isLinkComponent(component)) {
      addLinkComponent(result, component);
    }
  },
  callback: (result, component) => {
    if (isCallbackComponent(component)) {
      addCallbackComponent(result, component);
    }
  },
  pathItem: (result, component) => {
    if (isPathItemComponent(component)) {
      addPathItemComponent(result, component);
    }
  },
  example: (result, component) => {
    if (isExampleComponent(component)) {
      addExampleComponent(result, component);
    }
  },
  requestBody: () => {
    // requestBody components are not yet surfaced in OpenAPI output
  },
};

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
    COMPONENT_TYPE_HANDLERS[component.type](result, component);
  }

  return result;
}
