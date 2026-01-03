import {
  isReferenceObject,
  type OpenAPIObject,
  type OperationObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResponseObject,
  type SchemaObject,
} from 'openapi3-ts/oas31';
import {
  getRequestBodyByRef,
  getResponseByRef,
  resolveSchemaRef,
  assertNotReference,
} from '../shared/component-access.js';

const isRequestContentTypeSupported = (mediaType: string): boolean =>
  mediaType === '*/*' ||
  mediaType.includes('json') ||
  mediaType.includes('x-www-form-urlencoded') ||
  mediaType.includes('form-data') ||
  mediaType.includes('octet-stream') ||
  mediaType.includes('text/');

const isResponseContentTypeSupported = (mediaType: string): boolean =>
  mediaType.includes('json') || mediaType.includes('text/') || mediaType === '*/*';

const dereferenceRequestBody = (
  document: OpenAPIObject,
  value: RequestBodyObject | ReferenceObject,
): RequestBodyObject => {
  if (!isReferenceObject(value)) {
    return value;
  }

  const resolved = getRequestBodyByRef(document, value.$ref);
  assertNotReference(resolved, `requestBody ${value.$ref}`);
  return resolved;
};

const dereferenceResponse = (
  document: OpenAPIObject,
  value: ResponseObject | ReferenceObject,
): ResponseObject => {
  if (!isReferenceObject(value)) {
    return value;
  }

  const resolved = getResponseByRef(document, value.$ref);
  assertNotReference(resolved, `response ${value.$ref}`);
  return resolved;
};

export const resolveRequestBodySchemaObject = (
  document: OpenAPIObject,
  operation: OperationObject,
): { schema: SchemaObject; required: boolean } | undefined => {
  if (!operation.requestBody) {
    return undefined;
  }

  const resolved = dereferenceRequestBody(document, operation.requestBody);
  const mediaTypes = Object.keys(resolved.content ?? {});
  const matchingMediaType = mediaTypes.find(isRequestContentTypeSupported);

  if (!matchingMediaType) {
    return undefined;
  }

  const schema = resolved.content?.[matchingMediaType]?.schema;
  if (!schema) {
    return undefined;
  }

  return {
    schema: resolveSchemaRef(document, schema),
    required: resolved.required ?? false,
  };
};

const extractResponseSchemaObject = (
  document: OpenAPIObject,
  response: ResponseObject | ReferenceObject,
): SchemaObject | undefined => {
  const resolved = dereferenceResponse(document, response);
  const mediaTypes = Object.keys(resolved.content ?? {});
  const matchingMediaType = mediaTypes.find(isResponseContentTypeSupported);

  if (!matchingMediaType) {
    return undefined;
  }

  const schema = resolved.content?.[matchingMediaType]?.schema;
  if (!schema) {
    return undefined;
  }

  return resolveSchemaRef(document, schema);
};

export const resolvePrimarySuccessResponseSchema = (
  document: OpenAPIObject,
  operation: OperationObject,
): SchemaObject | undefined => {
  const responses: Record<string, ResponseObject | ReferenceObject | undefined> =
    operation.responses ?? {};
  const statusCodes = Object.keys(responses).sort((a, b) => Number(a) - Number(b));

  for (const statusCode of statusCodes) {
    const numeric = Number(statusCode);
    if (!Number.isInteger(numeric) || numeric < 200 || numeric >= 300) {
      continue;
    }

    const response = responses[statusCode];
    if (!response) {
      continue;
    }

    const schema = extractResponseSchemaObject(document, response);
    if (schema) {
      return schema;
    }
  }

  return undefined;
};
