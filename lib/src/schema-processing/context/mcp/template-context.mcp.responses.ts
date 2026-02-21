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

import { includes, split, toLower, trim } from 'lodash-es';
import type { CastrSchema, CastrOperation, CastrResponse } from '../../ir/index.js';

const MEDIA_TYPE_WILDCARD_TYPE = '*' as const;
const MEDIA_TYPE_WILDCARD_SUBTYPE = '*' as const;
const MEDIA_TYPE_SEPARATOR = '/' as const;
const MEDIA_TYPE_PARAMETER_SEPARATOR = ';' as const;
const MEDIA_TYPE_TEXT_TYPE = 'text' as const;
const MEDIA_TYPE_APPLICATION_TYPE = 'application' as const;
const MEDIA_TYPE_MULTIPART_TYPE = 'multipart' as const;
const JSON_SUBTYPE_TOKEN = 'json' as const;
const SUBTYPE_FORM_URLENCODED = 'x-www-form-urlencoded' as const;
const SUBTYPE_FORM_DATA = 'form-data' as const;
const SUBTYPE_OCTET_STREAM = 'octet-stream' as const;

interface ParsedMediaType {
  type: string;
  subtype: string;
}

function parseMediaType(mediaType: string): ParsedMediaType | undefined {
  const withParams = split(mediaType, MEDIA_TYPE_PARAMETER_SEPARATOR);
  const mediaTypeToken = trim(withParams[0] ?? '');
  const normalizedToken = toLower(mediaTypeToken);
  const parts = split(normalizedToken, MEDIA_TYPE_SEPARATOR);

  if (parts.length !== 2) {
    return undefined;
  }

  const type = parts[0] ?? '';
  const subtype = parts[1] ?? '';
  if (type.length === 0 || subtype.length === 0) {
    return undefined;
  }

  return { type, subtype };
}

function isWildcardMediaType(mediaType: ParsedMediaType): boolean {
  return (
    mediaType.type === MEDIA_TYPE_WILDCARD_TYPE && mediaType.subtype === MEDIA_TYPE_WILDCARD_SUBTYPE
  );
}

function isJsonSubtype(subtype: string): boolean {
  return includes(subtype, JSON_SUBTYPE_TOKEN);
}

function isTextType(mediaType: ParsedMediaType): boolean {
  return mediaType.type === MEDIA_TYPE_TEXT_TYPE;
}

function isMultipartFormData(mediaType: ParsedMediaType): boolean {
  return mediaType.type === MEDIA_TYPE_MULTIPART_TYPE && mediaType.subtype === SUBTYPE_FORM_DATA;
}

function isSupportedApplicationSubtype(mediaType: ParsedMediaType): boolean {
  if (mediaType.type !== MEDIA_TYPE_APPLICATION_TYPE) {
    return false;
  }
  return (
    mediaType.subtype === SUBTYPE_FORM_URLENCODED || mediaType.subtype === SUBTYPE_OCTET_STREAM
  );
}

const isRequestContentTypeSupported = (mediaType: string): boolean => {
  const parsed = parseMediaType(mediaType);
  if (!parsed) {
    return false;
  }

  return (
    isWildcardMediaType(parsed) ||
    isTextType(parsed) ||
    isJsonSubtype(parsed.subtype) ||
    isMultipartFormData(parsed) ||
    isSupportedApplicationSubtype(parsed)
  );
};

const isResponseContentTypeSupported = (mediaType: string): boolean => {
  const parsed = parseMediaType(mediaType);
  if (!parsed) {
    return false;
  }

  if (isWildcardMediaType(parsed)) {
    return true;
  }
  if (isTextType(parsed)) {
    return true;
  }
  return isJsonSubtype(parsed.subtype);
};

/**
 * Extracts request body schema from a CastrOperation using the IR.
 *
 * This function reads from `operation.requestBody` which is pre-resolved by the
 * IR builder, eliminating the need to access raw OpenAPI for ref resolution.
 *
 * @param operation - The CastrOperation (or partial with requestBody)
 * @returns Schema and required flag, or undefined if no request body
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
  if (response.schema) {
    return response.schema;
  }

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
 */
export const resolvePrimarySuccessResponseSchemaFromIR = (
  operation: Pick<CastrOperation, 'responses'>,
): CastrSchema | undefined => {
  const { responses } = operation;

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
