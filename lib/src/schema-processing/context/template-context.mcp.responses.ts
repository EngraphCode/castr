/**
 * MCP Response Helpers
 *
 * This file contains functions for extracting request body and response schemas
 * from CastrOperation for MCP tool generation.
 *
 * The IR-based functions read from pre-resolved IR data, eliminating the need
 * to access raw OpenAPI for reference resolution.
 *
 * Legacy OpenAPI-dependent functions have been removed (IR-3.6 cleanup).
 *
 * @module template-context.mcp.responses
 */

import type { CastrOperation, CastrSchema, CastrResponse } from '../ir/schema.js';

const isRequestContentTypeSupported = (mediaType: string): boolean =>
  mediaType === '*/*' ||
  mediaType.includes('json') ||
  mediaType.includes('x-www-form-urlencoded') ||
  mediaType.includes('form-data') ||
  mediaType.includes('octet-stream') ||
  mediaType.includes('text/');

const isResponseContentTypeSupported = (mediaType: string): boolean =>
  mediaType.includes('json') || mediaType.includes('text/') || mediaType === '*/*';

/**
 * Extracts request body schema from a CastrOperation using the IR.
 *
 * This function reads from `operation.requestBody` which is pre-resolved by the
 * IR builder, eliminating the need to access raw OpenAPI for ref resolution.
 *
 * @param operation - The CastrOperation (or partial with requestBody)
 * @returns Schema and required flag, or undefined if no request body
 *
 * @example
 * ```typescript
 * const result = resolveRequestBodySchemaFromIR(operation);
 * if (result) {
 *   console.log(result.schema, result.required);
 * }
 * ```
 */
export const resolveRequestBodySchemaFromIR = (
  operation: Pick<CastrOperation, 'requestBody'>,
): { schema: CastrSchema; required: boolean } | undefined => {
  const { requestBody } = operation;
  if (!requestBody) {
    return undefined;
  }

  const mediaTypes = Object.keys(requestBody.content);
  const matchingMediaType = mediaTypes.find(isRequestContentTypeSupported);

  if (!matchingMediaType) {
    return undefined;
  }

  const mediaType = requestBody.content[matchingMediaType];
  if (!mediaType?.schema) {
    return undefined;
  }

  return {
    schema: mediaType.schema,
    required: requestBody.required,
  };
};

/**
 * Extracts the primary 2xx response schema from response content.
 */
const extractResponseSchemaFromIR = (response: CastrResponse): CastrSchema | undefined => {
  // Direct schema takes precedence
  if (response.schema) {
    return response.schema;
  }

  // Check content for supported media types
  if (response.content) {
    const mediaTypes = Object.keys(response.content);
    const matchingMediaType = mediaTypes.find(isResponseContentTypeSupported);

    if (matchingMediaType) {
      return response.content[matchingMediaType]?.schema;
    }
  }

  return undefined;
};

/**
 * Extracts the primary success response schema from a CastrOperation using the IR.
 *
 * This function reads from `operation.responses` which is pre-resolved by the
 * IR builder. It finds the first 2xx response with a supported content type.
 *
 * @param operation - The CastrOperation (or partial with responses)
 * @returns The first 2xx response schema, or undefined if none found
 *
 * @example
 * ```typescript
 * const schema = resolvePrimarySuccessResponseSchemaFromIR(operation);
 * if (schema) {
 *   // Use schema for output schema generation
 * }
 * ```
 */
export const resolvePrimarySuccessResponseSchemaFromIR = (
  operation: Pick<CastrOperation, 'responses'>,
): CastrSchema | undefined => {
  const { responses } = operation;

  // Sort responses by status code to get lowest 2xx first
  const sortedResponses = [...responses].sort((a, b) => {
    const aNum = Number(a.statusCode);
    const bNum = Number(b.statusCode);
    return aNum - bNum;
  });

  for (const response of sortedResponses) {
    const numeric = Number(response.statusCode);
    if (!Number.isInteger(numeric) || numeric < 200 || numeric >= 300) {
      continue;
    }

    const schema = extractResponseSchemaFromIR(response);
    if (schema) {
      return schema;
    }
  }

  return undefined;
};
