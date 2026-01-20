/**
 * OpenAPI operations writer — converts CastrOperation[] to OpenAPI PathsObject.
 *
 * This module handles the conversion of IR operation definitions to valid
 * OpenAPI 3.1 PathsObject. Operations are grouped by path, then by HTTP method.
 *
 * @module
 */

import type {
  PathsObject,
  PathItemObject,
  OperationObject,
  ParameterObject,
  RequestBodyObject,
  ResponsesObject,
  ResponseObject,
  HeaderObject,
  SecurityRequirementObject,
  MediaTypeObject,
} from 'openapi3-ts/oas31';

import type {
  CastrOperation,
  CastrParameter,
  IRRequestBody,
  CastrResponse,
  IRSecurityRequirement,
  IRMediaType,
  IRResponseHeader,
} from '../../ir/schema.js';

import { writeOpenApiSchema } from './openapi-writer.schema.js';

/**
 * Converts a CastrParameter to OpenAPI ParameterObject.
 * @internal
 */
function writeParameter(param: CastrParameter): ParameterObject {
  const result: ParameterObject = {
    name: param.name,
    in: param.in,
    required: param.required,
    schema: writeOpenApiSchema(param.schema),
  };

  if (param.description !== undefined) {
    result.description = param.description;
  }
  if (param.deprecated !== undefined) {
    result.deprecated = param.deprecated;
  }
  if (param.example !== undefined) {
    result.example = param.example;
  }
  if (param.style !== undefined) {
    result.style = param.style;
  }
  if (param.explode !== undefined) {
    result.explode = param.explode;
  }
  if (param.allowReserved !== undefined) {
    result.allowReserved = param.allowReserved;
  }

  return result;
}

/**
 * Converts an IRRequestBody to OpenAPI RequestBodyObject.
 * @internal
 */
function writeRequestBody(requestBody: IRRequestBody): RequestBodyObject {
  const content: Record<string, MediaTypeObject> = {};

  for (const [mediaType, mediaTypeObj] of Object.entries(requestBody.content)) {
    content[mediaType] = {
      schema: writeOpenApiSchema(mediaTypeObj.schema),
    };
    if (mediaTypeObj.example !== undefined) {
      content[mediaType].example = mediaTypeObj.example;
    }
    if (mediaTypeObj.examples !== undefined) {
      content[mediaType].examples = mediaTypeObj.examples;
    }
    if (mediaTypeObj.encoding !== undefined) {
      content[mediaType].encoding = mediaTypeObj.encoding;
    }
  }

  const result: RequestBodyObject = {
    required: requestBody.required,
    content,
  };

  if (requestBody.description !== undefined) {
    result.description = requestBody.description;
  }

  return result;
}

/**
 * Builds content object from media type map.
 * @internal
 */
function buildContentFromMediaTypes(
  contentMap: Record<string, IRMediaType>,
): Record<string, MediaTypeObject> {
  const content: Record<string, MediaTypeObject> = {};
  for (const [mediaType, mediaTypeObj] of Object.entries(contentMap)) {
    content[mediaType] = {
      schema: writeOpenApiSchema(mediaTypeObj.schema),
    };
    if (mediaTypeObj.example !== undefined) {
      content[mediaType].example = mediaTypeObj.example;
    }
    if (mediaTypeObj.examples !== undefined) {
      content[mediaType].examples = mediaTypeObj.examples;
    }
    if (mediaTypeObj.encoding !== undefined) {
      content[mediaType].encoding = mediaTypeObj.encoding;
    }
  }
  return content;
}

/**
 * Converts an IRResponseHeader to OpenAPI HeaderObject.
 * Preserves all header fields including description, required, deprecated.
 * @internal
 */
function writeResponseHeader(header: IRResponseHeader): HeaderObject {
  const headerObj: HeaderObject = {
    schema: writeOpenApiSchema(header.schema),
  };

  if (header.description !== undefined) {
    headerObj.description = header.description;
  }
  if (header.required !== undefined) {
    headerObj.required = header.required;
  }
  if (header.deprecated !== undefined) {
    headerObj.deprecated = header.deprecated;
  }
  if (header.example !== undefined) {
    headerObj.example = header.example;
  }
  if (header.examples !== undefined) {
    headerObj.examples = header.examples;
  }

  return headerObj;
}

/**
 * Converts a single CastrResponse to OpenAPI ResponseObject.
 * @internal
 */
function writeResponse(response: CastrResponse): ResponseObject {
  const responseObj: ResponseObject = {
    description: response.description ?? '',
  };

  if (response.schema !== undefined) {
    responseObj.content = {
      'application/json': {
        schema: writeOpenApiSchema(response.schema),
      },
    };
  } else if (response.content !== undefined) {
    responseObj.content = buildContentFromMediaTypes(response.content);
  }

  if (response.headers !== undefined) {
    responseObj.headers = {};
    for (const [name, header] of Object.entries(response.headers)) {
      responseObj.headers[name] = writeResponseHeader(header);
    }
  }

  if (response.links !== undefined) {
    responseObj.links = response.links;
  }

  return responseObj;
}

/**
 * Converts CastrResponse[] to OpenAPI ResponsesObject.
 * @internal
 */
function writeResponses(responses: CastrResponse[]): ResponsesObject {
  const result: ResponsesObject = {};
  for (const response of responses) {
    result[response.statusCode] = writeResponse(response);
  }
  return result;
}

/**
 * Converts IRSecurityRequirement[] to OpenAPI SecurityRequirementObject[].
 * @internal
 */
function writeSecurity(security: IRSecurityRequirement[]): SecurityRequirementObject[] {
  return security.map((req) => ({
    [req.schemeName]: req.scopes,
  }));
}

/**
 * Writes optional operation metadata fields.
 * @internal
 */
function writeOperationMetadata(operation: CastrOperation, result: OperationObject): void {
  if (operation.operationId !== undefined) {
    result.operationId = operation.operationId;
  }
  if (operation.summary !== undefined) {
    result.summary = operation.summary;
  }
  if (operation.description !== undefined) {
    result.description = operation.description;
  }
  if (operation.tags !== undefined && operation.tags.length > 0) {
    result.tags = operation.tags;
  }
  if (operation.deprecated !== undefined) {
    result.deprecated = operation.deprecated;
  }
  if (operation.externalDocs !== undefined) {
    result.externalDocs = operation.externalDocs;
  }
  if (operation.callbacks !== undefined) {
    result.callbacks = operation.callbacks;
  }
  if (operation.servers !== undefined && operation.servers.length > 0) {
    result.servers = operation.servers;
  }
}

/**
 * Converts a CastrOperation to OpenAPI OperationObject.
 * @internal
 */
function writeOperation(operation: CastrOperation): OperationObject {
  const result: OperationObject = {
    responses: writeResponses(operation.responses),
  };

  writeOperationMetadata(operation, result);

  if (operation.parameters.length > 0) {
    result.parameters = operation.parameters.map(writeParameter);
  }

  if (operation.requestBody !== undefined) {
    result.requestBody = writeRequestBody(operation.requestBody);
  }

  if (operation.security !== undefined && operation.security.length > 0) {
    result.security = writeSecurity(operation.security);
  }

  return result;
}

/**
 * Assigns an operation to a path item based on method.
 * @internal
 */
function assignOperationToPath(
  pathItem: PathItemObject,
  op: OperationObject,
  method: string,
): void {
  switch (method) {
    case 'get':
      pathItem.get = op;
      break;
    case 'post':
      pathItem.post = op;
      break;
    case 'put':
      pathItem.put = op;
      break;
    case 'patch':
      pathItem.patch = op;
      break;
    case 'delete':
      pathItem.delete = op;
      break;
    case 'head':
      pathItem.head = op;
      break;
    case 'options':
      pathItem.options = op;
      break;
    case 'trace':
      pathItem.trace = op;
      break;
  }
}

/**
 * Converts IR operations to an OpenAPI PathsObject.
 *
 * Groups operations by path, then adds each operation under its HTTP method.
 *
 * @param operations - The IR operations to convert
 * @returns A valid OpenAPI 3.1 PathsObject
 *
 * @example
 * ```typescript
 * const operations: CastrOperation[] = [
 *   { method: 'get', path: '/users', operationId: 'getUsers', ... },
 *   { method: 'post', path: '/users', operationId: 'createUser', ... },
 * ];
 *
 * const paths = writeOpenApiPaths(operations);
 * // {
 * //   '/users': {
 * //     get: { operationId: 'getUsers', ... },
 * //     post: { operationId: 'createUser', ... },
 * //   },
 * // }
 * ```
 *
 * @public
 */
export function writeOpenApiPaths(operations: CastrOperation[]): PathsObject {
  const result: PathsObject = {};

  for (const operation of operations) {
    const pathKey = operation.path;
    const existingPathItem = result[pathKey];
    const pathItem: PathItemObject = existingPathItem ?? {};

    const op = writeOperation(operation);
    assignOperationToPath(pathItem, op, operation.method);

    // Add PathItem-level fields (only if not already set by previous operation on same path)
    if (operation.pathItemSummary && !pathItem.summary) {
      pathItem.summary = operation.pathItemSummary;
    }
    if (operation.pathItemDescription && !pathItem.description) {
      pathItem.description = operation.pathItemDescription;
    }
    if (operation.pathItemServers && !pathItem.servers) {
      pathItem.servers = operation.pathItemServers;
    }
    // Preserve path-level parameter refs instead of expanding them
    if (operation.pathItemParameterRefs && !pathItem.parameters) {
      pathItem.parameters = operation.pathItemParameterRefs.map((ref) => ({ $ref: ref }));
    }

    result[pathKey] = pathItem;
  }

  return result;
}
