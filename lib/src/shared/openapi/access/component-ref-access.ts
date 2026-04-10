import {
  type OpenAPIDocument,
  type ParameterObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResponseObject,
  isReferenceObject,
} from '../../openapi-types.js';
import { parseComponentRef } from '../../ref-resolution.js';

const OPENAPI_COMPONENT_TYPE_PARAMETERS = 'parameters';
const OPENAPI_COMPONENT_TYPE_RESPONSES = 'responses';
const OPENAPI_COMPONENT_TYPE_REQUEST_BODIES = 'requestBodies';

/**
 * Type guard assertion that value is not a ReferenceObject.
 */
export function assertNotReference<T>(
  value: T | ReferenceObject,
  context: string,
): asserts value is T {
  if (isReferenceObject(value)) {
    throw new Error(
      `Unexpected $ref in ${context}: ${value.$ref}. ` +
        `Ensure you called SwaggerParser.dereference() before code generation`,
    );
  }
}

/**
 * Get a parameter from components.parameters by $ref.
 */
export function getParameterByRef(
  doc: OpenAPIDocument,
  ref: string,
): ParameterObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);
  if (componentType !== OPENAPI_COMPONENT_TYPE_PARAMETERS) {
    throw new Error(`Expected parameter $ref, got: ${ref}`);
  }

  if (!doc.components?.parameters) {
    throw new Error(
      `Parameter '${componentName}' not found: doc.components.parameters is undefined`,
    );
  }

  const parameter = doc.components.parameters[componentName];
  if (!parameter) {
    throw new Error(`Parameter '${componentName}' not found in doc.components.parameters`);
  }

  return parameter;
}

/**
 * Get a response from components.responses by $ref.
 */
export function getResponseByRef(
  doc: OpenAPIDocument,
  ref: string,
): ResponseObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);
  if (componentType !== OPENAPI_COMPONENT_TYPE_RESPONSES) {
    throw new Error(`Expected response $ref, got: ${ref}`);
  }

  if (!doc.components?.responses) {
    throw new Error(`Response '${componentName}' not found: doc.components.responses is undefined`);
  }

  const response = doc.components.responses[componentName];
  if (!response) {
    throw new Error(`Response '${componentName}' not found in doc.components.responses`);
  }

  return response;
}

/**
 * Get a request body from components.requestBodies by $ref.
 */
export function getRequestBodyByRef(
  doc: OpenAPIDocument,
  ref: string,
): RequestBodyObject | ReferenceObject {
  const { componentType, componentName } = parseComponentRef(ref);
  if (componentType !== OPENAPI_COMPONENT_TYPE_REQUEST_BODIES) {
    throw new Error(`Expected requestBody $ref, got: ${ref}`);
  }

  if (!doc.components?.requestBodies) {
    throw new Error(
      `RequestBody '${componentName}' not found: doc.components.requestBodies is undefined`,
    );
  }

  const requestBody = doc.components.requestBodies[componentName];
  if (!requestBody) {
    throw new Error(`RequestBody '${componentName}' not found in doc.components.requestBodies`);
  }

  return requestBody;
}
