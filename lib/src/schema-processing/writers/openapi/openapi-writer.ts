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
import { writeOpenApiComponents } from './components/openapi-writer.components.js';
import { writeOpenApiPaths } from './operations/openapi-writer.operations.js';
import type { CastrDocument, IRSecurityRequirement } from '../../ir/index.js';

/**
 * Extended OpenAPI 3.1 object type that includes fields missing from the library types.
 * jsonSchemaDialect is a valid OAS 3.1.0 field but not included in openapi3-ts types.
 */
type OpenAPIObjectExtended = OpenAPIObject & {
  jsonSchemaDialect?: string;
};

function getSortedMapEntries<T>(map: Map<string, T>): [string, T][] {
  return [...map.entries()].sort(([leftName], [rightName]) => leftName.localeCompare(rightName));
}

function compareSecurityRequirements(
  left: IRSecurityRequirement,
  right: IRSecurityRequirement,
): number {
  return left.schemeName.localeCompare(right.schemeName);
}

/**
 * Converts IR security requirements to OpenAPI SecurityRequirementObject[].
 *
 * @param security - The IR security requirements
 * @returns OpenAPI security requirement objects
 *
 * @internal
 */
function writeDocumentSecurity(security: IRSecurityRequirement[]): SecurityRequirementObject[] {
  const sortedSecurity = [...security].sort(compareSecurityRequirements);
  return sortedSecurity.map((req) => ({
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
export function writeOpenApi(ir: CastrDocument): OpenAPIObjectExtended {
  const result: OpenAPIObjectExtended = {
    openapi: ir.openApiVersion,
    info: ir.info,
    paths: writeOpenApiPaths(ir.operations),
  };

  // Add optional document-level fields
  addOptionalFields(result, ir);

  return result;
}

/**
 * Adds document-level metadata fields to the OpenAPI result object.
 *
 * @internal
 */
function addDocumentMetadata(result: OpenAPIObjectExtended, ir: CastrDocument): void {
  if (ir.jsonSchemaDialect !== undefined) {
    result.jsonSchemaDialect = ir.jsonSchemaDialect;
  }
  if (ir.servers.length > 0) {
    result.servers = ir.servers;
  }
  if (ir.tags !== undefined && ir.tags.length > 0) {
    result.tags = ir.tags;
  }
  if (ir.externalDocs !== undefined) {
    result.externalDocs = ir.externalDocs;
  }
}

/**
 * Adds content sections (webhooks, components, security) to the OpenAPI result object.
 *
 * @internal
 */
function addDocumentContent(result: OpenAPIObjectExtended, ir: CastrDocument): void {
  if (ir.webhooks !== undefined && ir.webhooks.size > 0) {
    result.webhooks = Object.fromEntries(getSortedMapEntries(ir.webhooks));
  }
  if (ir.components.length > 0) {
    result.components = writeOpenApiComponents(ir.components);
  }
  if (ir.security !== undefined && ir.security.length > 0) {
    result.security = writeDocumentSecurity(ir.security);
  }
}

/**
 * Adds optional fields to the OpenAPI result object.
 *
 * @internal
 */
function addOptionalFields(result: OpenAPIObjectExtended, ir: CastrDocument): void {
  addDocumentMetadata(result, ir);
  addDocumentContent(result, ir);
}
