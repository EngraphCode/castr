import type { CastrDocument, IRComponent, CastrOperation } from '../ir/schema.js';
import { toIdentifier } from '../shared/utils/identifier-utils.js';

/**
 * Extract inline request body schema from an operation.
 * Returns the schema component if an inline schema is found, null otherwise.
 */
function extractRequestBodySchema(
  operation: CastrOperation,
  sanitizedOpId: string,
): IRComponent | null {
  if (!operation.requestBody) {
    return null;
  }

  // Find first inline (non-$ref) schema in media types
  for (const media of Object.values(operation.requestBody.content)) {
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

  for (const op of ir.operations) {
    const operationId = op.operationId || `${op.method}${op.path}`;
    const sanitizedOpId = toIdentifier(operationId);

    const bodyComponent = extractRequestBodySchema(op, sanitizedOpId);
    if (bodyComponent) {
      components.push(bodyComponent);
    }
  }

  return components;
}
