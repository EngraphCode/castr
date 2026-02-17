/**
 * OpenAPI request/response body writers — converts IR body types to OpenAPI objects.
 *
 * Extracted from openapi-writer.operations.ts to keep file size within limits.
 *
 * @module
 */

import type {
  RequestBodyObject,
  ResponsesObject,
  ResponseObject,
  HeaderObject,
  MediaTypeObject,
} from 'openapi3-ts/oas31';

import type {
  IRRequestBody,
  CastrResponse,
  IRMediaType,
  IRResponseHeader,
} from '../../ir/schema.js';

import { writeOpenApiSchema } from './openapi-writer.schema.js';

const STATUS_DEFAULT = 'default' as const;

function getSortedRecordEntries<T>(record: Record<string, T>): [string, T][] {
  const sortedKeys = Object.keys(record).sort((left, right) => left.localeCompare(right));
  const sortedEntries: [string, T][] = [];

  for (const key of sortedKeys) {
    const value = record[key];
    if (value !== undefined) {
      sortedEntries.push([key, value]);
    }
  }

  return sortedEntries;
}

function isThreeDigitStatusCode(value: string): boolean {
  if (value.length !== 3) {
    return false;
  }

  for (const char of value) {
    if (char < '0' || char > '9') {
      return false;
    }
  }

  return true;
}

function compareResponseStatusCodes(left: string, right: string): number {
  if (left === STATUS_DEFAULT) {
    return right === STATUS_DEFAULT ? 0 : 1;
  }
  if (right === STATUS_DEFAULT) {
    return -1;
  }

  const leftIsThreeDigit = isThreeDigitStatusCode(left);
  const rightIsThreeDigit = isThreeDigitStatusCode(right);

  if (leftIsThreeDigit && rightIsThreeDigit) {
    return Number.parseInt(left, 10) - Number.parseInt(right, 10);
  }
  if (leftIsThreeDigit) {
    return -1;
  }
  if (rightIsThreeDigit) {
    return 1;
  }

  return left.localeCompare(right);
}

/**
 * Builds content object from media type map.
 * @internal
 */
function buildContentFromMediaTypes(
  contentMap: Record<string, IRMediaType>,
): Record<string, MediaTypeObject> {
  const content: Record<string, MediaTypeObject> = {};
  for (const [mediaType, mediaTypeObj] of getSortedRecordEntries(contentMap)) {
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
 * Converts an IRRequestBody to OpenAPI RequestBodyObject.
 * @internal
 */
export function writeRequestBody(requestBody: IRRequestBody): RequestBodyObject {
  const content: Record<string, MediaTypeObject> = {};

  for (const [mediaType, mediaTypeObj] of getSortedRecordEntries(requestBody.content)) {
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
    for (const [name, header] of getSortedRecordEntries(response.headers)) {
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
export function writeResponses(responses: CastrResponse[]): ResponsesObject {
  const result: ResponsesObject = {};
  const sortedResponses = [...responses].sort((left, right) =>
    compareResponseStatusCodes(left.statusCode, right.statusCode),
  );
  for (const response of sortedResponses) {
    result[response.statusCode] = writeResponse(response);
  }
  return result;
}
