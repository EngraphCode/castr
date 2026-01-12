/**
 * OpenAPI document writer — converts CastrDocument (IR) to OpenAPI 3.1.
 *
 * This is the main entry point for generating OpenAPI specifications from
 * the canonical Intermediate Representation. Assembles all document sections
 * using the specialized sub-writers.
 *
 * @module
 */

import type { OpenAPIObject, SecurityRequirementObject } from 'openapi3-ts/oas31';

import type { CastrDocument, IRSecurityRequirement } from '../../context/ir-schema.js';

import { writeOpenApiComponents } from './openapi-writer.components.js';
import { writeOpenApiPaths } from './openapi-writer.operations.js';

/**
 * Converts IR security requirements to OpenAPI SecurityRequirementObject[].
 *
 * @param security - The IR security requirements
 * @returns OpenAPI security requirement objects
 *
 * @internal
 */
function writeDocumentSecurity(security: IRSecurityRequirement[]): SecurityRequirementObject[] {
  return security.map((req) => ({
    [req.schemeName]: req.scopes,
  }));
}

/**
 * Generates an OpenAPI 3.1 document from the canonical IR.
 *
 * This is the main entry point for the OpenAPI writer. It takes a CastrDocument
 * (the canonical intermediate representation) and produces a valid OpenAPI 3.1.0
 * specification object.
 *
 * @param ir - The CastrDocument intermediate representation
 * @returns A valid OpenAPI 3.1 document object
 *
 * @example
 * ```typescript
 * import { buildIR } from './context/ir-builder.js';
 * import { writeOpenApi } from './writers/openapi/openapi-writer.js';
 *
 * const ir = buildIR(openApiDoc);
 * const regenerated = writeOpenApi(ir);
 *
 * // regenerated is a valid OpenAPI 3.1.0 document
 * console.log(regenerated.openapi); // '3.1.0'
 * ```
 *
 * @see {@link writeOpenApiComponents} for component conversion
 * @see {@link writeOpenApiPaths} for operation/path conversion
 * @see {@link writeOpenApiSchema} for schema conversion
 *
 * @public
 */
export function writeOpenApi(ir: CastrDocument): OpenAPIObject {
  const result: OpenAPIObject = {
    openapi: '3.1.0',
    info: ir.info,
    paths: writeOpenApiPaths(ir.operations),
  };

  // Add servers if present
  if (ir.servers.length > 0) {
    result.servers = ir.servers;
  }

  // Add components if present
  if (ir.components.length > 0) {
    result.components = writeOpenApiComponents(ir.components);
  }

  // Add document-level security if present
  if (ir.security !== undefined && ir.security.length > 0) {
    result.security = writeDocumentSecurity(ir.security);
  }

  return result;
}
