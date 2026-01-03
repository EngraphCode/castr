/**
 * IR Builder - Component Builders
 *
 * Handles construction of IR components for parameters, responses, request bodies, and security schemes.
 *
 * @module ir-builder.components
 * @internal
 */

import type {
  ParameterObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas31';
import type { IRComponent, IRSecuritySchemeComponent } from './ir-schema.js';
import type { IRBuildContext } from './ir-builder.types.js';
import { buildSingleParameter } from './ir-builder.parameters.js';
import { buildSingleResponse } from './ir-builder.responses.js';
import { buildIRRequestBody } from './ir-builder.request-body.js';

export function buildSecurityComponents(
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

export function buildParameterComponents(
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

export function buildResponseComponents(
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

export function buildRequestBodyComponents(
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
