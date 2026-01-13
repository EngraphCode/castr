/**
 * IR-based MCP tool schema builder functions.
 *
 * These functions read from `CastrDocument` and `CastrOperation` instead of
 * raw OpenAPI objects, following the "IR is single source of truth" principle.
 *
 * @module template-context.mcp.schemas.from-ir
 */

import type { Schema as JsonSchema } from 'ajv';
import type { CastrDocument, CastrOperation, CastrSchema } from '../ir/schema.js';
import { CastrSchemaProperties } from '../ir/schema-properties.js';
import type { MutableJsonSchema } from '../conversion/json-schema/keyword-helpers.js';
import {
  collectParameterGroupsFromIR,
  createParameterSectionSchemaFromIR,
  type IRParameterAccumulator,
} from './template-context.mcp.parameters.js';
import {
  resolveRequestBodySchemaFromIR,
  resolvePrimarySuccessResponseSchemaFromIR,
} from './template-context.mcp.responses.js';
import { inlineJsonSchemaRefsFromIR } from './template-context.mcp.inline-json-schema.js';
import type { McpToolSchemaResult } from './template-context.mcp.schemas.js';

/**
 * Check if a schema is or could be an object type.
 * Handles explicit type, array types, and composition schemas.
 */
const isLikelyObjectSchema = (schema: MutableJsonSchema): boolean => {
  // Explicit object type
  const schemaType: unknown = schema['type'];
  if (schemaType === 'object') {
    return true;
  }
  if (Array.isArray(schemaType) && schemaType.includes('object')) {
    return true;
  }

  // Composition schemas (allOf, oneOf, anyOf) that contain objects
  // are likely object schemas - wrap them to be safe for MCP
  if ('allOf' in schema || 'oneOf' in schema || 'anyOf' in schema) {
    // For MCP, compositions must be wrapped in an object type
    // because the MCP SDK requires outputSchema.type === 'object'
    return false; // Force wrapping of compositions
  }

  return false;
};

/**
 * Wrap a JSON schema to ensure it's always an object type.
 * Required for MCP ToolSchema which mandates outputSchema.type === 'object'.
 */
const wrapSchemaFromIR = (schema: MutableJsonSchema | undefined): MutableJsonSchema => {
  if (schema === undefined) {
    return { type: 'object' };
  }

  // Pass through $ref schemas - they should have been inlined before this point
  // If we still have refs, pass through (caller should inline first)
  if ('$ref' in schema) {
    return schema;
  }

  // If already an object type, return as-is
  if (isLikelyObjectSchema(schema)) {
    return schema;
  }

  // Wrap non-object schemas (primitives, arrays, compositions without type)
  return {
    type: 'object',
    properties: { value: schema },
  };
};

/**
 * Assign an IR parameter section to the input schema properties.
 */
const assignSectionFromIR = (
  targetProperties: Record<string, MutableJsonSchema>,
  requiredSections: Set<string>,
  sectionName: string,
  group: IRParameterAccumulator | undefined,
): void => {
  if (!group) {
    return;
  }

  const schemaObject = createParameterSectionSchemaFromIR(group);
  targetProperties[sectionName] = wrapSchemaFromIR(schemaObject);

  if (group.required.size > 0) {
    requiredSections.add(sectionName);
  }
};

/**
 * Type guard for CastrSchema values.
 */
const isCastrSchemaForMcp = (value: unknown): value is CastrSchema =>
  typeof value === 'object' && value !== null && 'metadata' in value;

/**
 * Convert CastrSchemaProperties (Map) to plain object for JSON Schema.
 */
const convertPropertiesToJsonSchema = (
  properties: CastrSchemaProperties,
): Record<string, MutableJsonSchema> => {
  const result: Record<string, MutableJsonSchema> = {};
  for (const [propName, propSchema] of properties.entries()) {
    result[propName] = castrSchemaToJsonSchemaForMcp(propSchema);
  }
  return result;
};

/**
 * Convert CastrSchema to MutableJsonSchema for MCP output.
 * Strips IR metadata while preserving schema structure.
 * Handles CastrSchemaProperties (Map) for properties field.
 */
const castrSchemaToJsonSchemaForMcp = (schema: CastrSchema): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, value] of Object.entries(schema)) {
    if (key === 'metadata') {
      continue;
    }

    // Handle CastrSchemaProperties (Map) for properties field
    if (value instanceof CastrSchemaProperties) {
      result[key] = convertPropertiesToJsonSchema(value);
    } else if (isCastrSchemaForMcp(value)) {
      result[key] = castrSchemaToJsonSchemaForMcp(value);
    } else if (Array.isArray(value)) {
      // Handle arrays (e.g., allOf, oneOf, anyOf)
      result[key] = value.map((item: unknown) =>
        isCastrSchemaForMcp(item) ? castrSchemaToJsonSchemaForMcp(item) : item,
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Schema values pass through unchanged
      result[key] = value;
    }
  }

  return result;
};

/**
 * Create input schema from IR operation.
 */
// eslint-disable-next-line sonarjs/function-return-type -- Returns consistent JsonSchema type
function createInputSchemaFromIR(ir: CastrDocument, operation: CastrOperation): JsonSchema {
  const parameterGroups = collectParameterGroupsFromIR(operation);
  const requestBody = resolveRequestBodySchemaFromIR(operation);

  const properties: Record<string, MutableJsonSchema> = {};
  const requiredSections = new Set<string>();

  assignSectionFromIR(properties, requiredSections, 'path', parameterGroups.path);
  assignSectionFromIR(properties, requiredSections, 'query', parameterGroups.query);
  assignSectionFromIR(properties, requiredSections, 'headers', parameterGroups.header);

  if (requestBody) {
    const bodyJsonSchema = castrSchemaToJsonSchemaForMcp(requestBody.schema);
    properties['body'] = wrapSchemaFromIR(bodyJsonSchema);
    if (requestBody.required) {
      requiredSections.add('body');
    }
  }

  const required = requiredSections.size > 0 ? [...requiredSections] : undefined;
  const inputSchemaObject: MutableJsonSchema = {
    type: 'object',
    properties,
    ...(required ? { required } : {}),
  };

  const wrapped = wrapSchemaFromIR(inputSchemaObject);
  return inlineJsonSchemaRefsFromIR(wrapped, ir);
}

/**
 * Create output schema from IR operation.
 * Inlines refs first, then wraps to ensure object type.
 */
// eslint-disable-next-line sonarjs/function-return-type -- Returns JsonSchema | undefined consistently
function createOutputSchemaFromIR(
  ir: CastrDocument,
  operation: CastrOperation,
): JsonSchema | undefined {
  const successSchema = resolvePrimarySuccessResponseSchemaFromIR(operation);
  if (!successSchema) {
    return undefined;
  }

  const asJsonSchema = castrSchemaToJsonSchemaForMcp(successSchema);
  // Inline refs first to resolve $ref schemas
  const inlined = inlineJsonSchemaRefsFromIR(asJsonSchema, ir);
  // Then wrap to ensure it's an object type (required by MCP ToolSchema)
  return wrapSchemaFromIR(inlined);
}

/**
 * Builds MCP tool schemas from a CastrDocument and CastrOperation.
 *
 * This function reads from the IR instead of raw OpenAPI, eliminating
 * the need to access `OpenAPIObject` for schema resolution.
 *
 * @param ir - The CastrDocument containing component schemas
 * @param operation - The CastrOperation containing parameters, request body, and responses
 * @returns MCP tool schema result with input/output schemas
 *
 * @example
 * ```typescript
 * const result = buildMcpToolSchemasFromIR(irDocument, operation);
 * // { inputSchema: {...}, outputSchema: {...} }
 * ```
 */
export const buildMcpToolSchemasFromIR = (
  ir: CastrDocument,
  operation: CastrOperation,
): Omit<McpToolSchemaResult, 'security'> => {
  const inputSchema = createInputSchemaFromIR(ir, operation);
  const outputSchema = createOutputSchemaFromIR(ir, operation);

  return {
    inputSchema,
    ...(outputSchema ? { outputSchema } : {}),
  };
};
