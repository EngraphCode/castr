/**
 * MCP Schema Helpers
 *
 * This file contains pure helper functions for wrapping schemas for MCP tools.
 * These functions work with abstract schema objects and don't require OpenAPI access.
 *
 * Legacy OpenAPI-dependent functions have been removed (IR-3.6 cleanup).
 * Use `template-context.mcp.schemas.from-ir.ts` for IR-based schema building.
 *
 * @module template-context.mcp.schemas
 */

import type { Schema as JsonSchema } from 'ajv';
import type { SchemaObject as OpenApiSchemaObject } from 'openapi3-ts/oas31';
import type { OperationSecurityMetadata } from '../conversion/json-schema/security/extract-operation-security.js';

const SCHEMA_TYPE_OBJECT = 'object' as const;

const isObjectSchema = (schema: OpenApiSchemaObject | undefined): schema is OpenApiSchemaObject => {
  if (!schema) {
    return false;
  }

  if (schema.type === SCHEMA_TYPE_OBJECT) {
    return true;
  }

  if (Array.isArray(schema.type)) {
    const schemaTypes = new Set(schema.type);
    return schemaTypes.has(SCHEMA_TYPE_OBJECT);
  }

  return false;
};

const wrapSchema = (schema: OpenApiSchemaObject | undefined): OpenApiSchemaObject => {
  if (schema === undefined) {
    return {
      type: SCHEMA_TYPE_OBJECT,
    } satisfies OpenApiSchemaObject;
  }

  if (isObjectSchema(schema)) {
    return schema;
  }

  return {
    type: SCHEMA_TYPE_OBJECT,
    properties: {
      value: schema,
    },
  } satisfies OpenApiSchemaObject;
};

export const buildInputSchemaObject = (
  schema: OpenApiSchemaObject | undefined,
): OpenApiSchemaObject => wrapSchema(schema);

export const buildOutputSchemaObject = (
  schema: OpenApiSchemaObject | undefined,
): OpenApiSchemaObject => wrapSchema(schema);

export interface McpToolSchemaResult {
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  security: OperationSecurityMetadata;
}
