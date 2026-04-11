import { trim, trimStart } from 'lodash-es';
import { toIdentifier } from '../../../shared/utils/identifier-utils.js';
import { getHttpMethodIdentifier } from '../../../shared/openapi/http-methods.js';
import { isReferenceObject } from '../../../shared/openapi-types.js';
import {
  allOperations,
  type CastrAdditionalOperation,
  type CastrDocument,
  type IRComponent,
  type CastrOperation,
} from '../../ir/index.js';

/**
 * Extract inline request body schema from an operation.
 * Returns the schema component if an inline schema is found, null otherwise.
 */
function extractRequestBodySchema(
  operation: CastrOperation | CastrAdditionalOperation,
  sanitizedOpId: string,
): IRComponent | null {
  if (!operation.requestBody) {
    return null;
  }

  // Find first inline (non-$ref) schema in media types
  for (const media of Object.values(operation.requestBody.content)) {
    if (isReferenceObject(media)) {
      continue;
    }
    if (media.schema && !media.schema.$ref) {
      // It's an inline schema - extract as named component
      // Note: When multiple media types exist (e.g., JSON + XML), we extract
      // the first encountered. Typically application/json is primary.
      const name = `${sanitizedOpId}_Body`;

      return {
        type: 'schema',
        name,
        schema: media.schema,
        metadata: media.schema.metadata,
      };
    }
  }

  return null;
}

function getInlineSchemaOperationIdentifier(
  operation: CastrOperation | CastrAdditionalOperation,
): string {
  const operationId = operation.operationId === undefined ? '' : trim(operation.operationId);
  if (operationId && operationId.length > 0) {
    return toIdentifier(operationId);
  }

  const pathIdentifier = trimStart(toIdentifier(operation.path), '_');
  const normalizedPathIdentifier = pathIdentifier.length > 0 ? pathIdentifier : 'root';
  return `${getHttpMethodIdentifier(operation.method)}_${normalizedPathIdentifier}`;
}

/**
 * Extract inline schemas from IR operations and promote them to named components.
 * This allows generating named exports for request bodies, parameters, etc.
 *
 * Currently extracts:
 * - Request body schemas (inline, non-$ref)
 *
 * Parameters and response schemas are handled differently:
 * - Parameters are inlined as EndpointParameter.schema
 * - Responses are inlined as EndpointDefinition.response
 *
 * @param ir - The IR document
 * @returns Array of new IR components representing inline schemas
 */
export function extractInlineSchemas(ir: CastrDocument): IRComponent[] {
  const components: IRComponent[] = [];

  for (const op of allOperations(ir)) {
    const sanitizedOpId = getInlineSchemaOperationIdentifier(op);

    const bodyComponent = extractRequestBodySchema(op, sanitizedOpId);
    if (bodyComponent) {
      components.push(bodyComponent);
    }
  }

  return components;
}
