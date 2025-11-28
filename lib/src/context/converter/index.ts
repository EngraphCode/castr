import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { IRDocument, IRComponent } from '../ir-schema.js';
import { convertSchema } from './schema.js';
import { convertParameter } from './parameter.js';
import { convertResponse } from './response.js';
import { convertRequestBody } from './content.js';
import { convertOperations } from './operation.js';

/**
 * Converts an IRDocument back to an OpenAPIObject.
 * This enables round-trip fidelity testing and proves the IR is lossless.
 *
 * @param ir - The IRDocument to convert
 * @returns The reconstructed OpenAPIObject
 */
export function convertIRToOpenAPI(ir: IRDocument): OpenAPIObject {
  const components = convertComponents(ir.components);
  return {
    openapi: ir.openApiVersion,
    info: ir.info,
    ...(Object.keys(components).length > 0 ? { components } : {}),
    paths: convertOperations(ir.operations),
  };
}

function convertComponents(components: IRComponent[]): NonNullable<OpenAPIObject['components']> {
  const result: NonNullable<OpenAPIObject['components']> = {};

  for (const component of components) {
    if (component.type === 'schema') {
      addSchema(component, result);
    } else if (component.type === 'securityScheme') {
      addSecurityScheme(component, result);
    } else if (component.type === 'parameter') {
      addParameter(component, result);
    } else if (component.type === 'response') {
      addResponse(component, result);
    } else if (component.type === 'requestBody') {
      addRequestBody(component, result);
    }
  }

  return result;
}

function addSchema(
  component: IRComponent & { type: 'schema' },
  result: NonNullable<OpenAPIObject['components']>,
): void {
  result.schemas = result.schemas || {};
  result.schemas[component.name] = convertSchema(component.schema);
}

function addSecurityScheme(
  component: IRComponent & { type: 'securityScheme' },
  result: NonNullable<OpenAPIObject['components']>,
): void {
  result.securitySchemes = result.securitySchemes || {};
  result.securitySchemes[component.name] = component.scheme;
}

function addParameter(
  component: IRComponent & { type: 'parameter' },
  result: NonNullable<OpenAPIObject['components']>,
): void {
  result.parameters = result.parameters || {};
  result.parameters[component.name] = convertParameter(component.parameter);
}

function addResponse(
  component: IRComponent & { type: 'response' },
  result: NonNullable<OpenAPIObject['components']>,
): void {
  result.responses = result.responses || {};
  result.responses[component.name] = convertResponse(component.response);
}

function addRequestBody(
  component: IRComponent & { type: 'requestBody' },
  result: NonNullable<OpenAPIObject['components']>,
): void {
  result.requestBodies = result.requestBodies || {};
  result.requestBodies[component.name] = convertRequestBody(component.requestBody);
}
