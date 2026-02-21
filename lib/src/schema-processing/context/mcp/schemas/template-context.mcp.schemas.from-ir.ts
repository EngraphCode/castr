/**
 * IR-based MCP tool schema builder functions.
 *
 * These functions read from `CastrDocument` and `CastrOperation` instead of
 * raw OpenAPI objects, following the "IR is single source of truth" principle.
 *
 * @module template-context.mcp.schemas.from-ir
 */

import type { Schema as JsonSchema } from 'ajv';
import type { CastrSchema, CastrDocument, CastrOperation } from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';
import type { MutableJsonSchema } from '../../../conversion/json-schema/index.js';
import { isRecord } from '../../../../shared/type-utils/types.js';
import {
  collectParameterGroupsFromIR,
  createParameterSectionSchemaFromIR,
  type IRParameterAccumulator,
} from '../template-context.mcp.parameters.js';
import {
  resolveRequestBodySchemaFromIR,
  resolvePrimarySuccessResponseSchemaFromIR,
} from '../template-context.mcp.responses.js';
import { inlineJsonSchemaRefsFromIR } from './template-context.mcp.inline-json-schema.js';
import type { McpToolSchemaResult } from './template-context.mcp.schemas.js';

const SCHEMA_TYPE_OBJECT = 'object' as const;
const SCHEMA_KEY_METADATA = 'metadata' as const;
const SCHEMA_KEY_REF = '$ref' as const;
const INPUT_SECTION_PATH = 'path' as const;
const INPUT_SECTION_QUERY = 'query' as const;
const INPUT_SECTION_HEADERS = 'headers' as const;
const INPUT_SECTION_BODY = 'body' as const;

/**
 * Check if a schema is or could be an object type.
 * Handles explicit type, array types, and composition schemas.
 */
const isLikelyObjectSchema = (schema: MutableJsonSchema): boolean => {
  // Explicit object type
  const schemaType: unknown = schema['type'];
  if (schemaType === SCHEMA_TYPE_OBJECT) {
    return true;
  }
  if (Array.isArray(schemaType)) {
    const schemaTypes = new Set(schemaType);
    if (schemaTypes.has(SCHEMA_TYPE_OBJECT)) {
      return true;
    }
  }

  if ('allOf' in schema || 'oneOf' in schema || 'anyOf' in schema) {
    return false;
  }

  return false;
};

/**
 * Wrap a JSON schema to ensure it's always an object type.
 * Required for MCP ToolSchema which mandates outputSchema.type === 'object'.
 */
const wrapSchemaFromIR = (schema: MutableJsonSchema | undefined): MutableJsonSchema => {
  if (schema === undefined) {
    return { type: SCHEMA_TYPE_OBJECT };
  }

  // Pass through $ref schemas - they should have been inlined before this point
  // If we still have refs, pass through (caller should inline first)
  if (SCHEMA_KEY_REF in schema) {
    return schema;
  }

  // If already an object type, return as-is
  if (isLikelyObjectSchema(schema)) {
    return schema;
  }

  // Wrap non-object schemas (primitives, arrays, compositions without type)
  return {
    type: SCHEMA_TYPE_OBJECT,
    properties: { value: schema },
  };
};

/**
 * Wrap a JSON schema to ensure it's always an object type.
 * Accepts Ajv JsonSchema values (object or boolean) and normalizes to object.
 */
const wrapJsonSchemaFromIR = (schema: JsonSchema | undefined): MutableJsonSchema => {
  if (schema === undefined) {
    return { type: SCHEMA_TYPE_OBJECT };
  }

  if (typeof schema === 'boolean') {
    return {
      type: SCHEMA_TYPE_OBJECT,
      properties: { value: schema },
    };
  }

  return wrapSchemaFromIR(schema);
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

function convertArrayToJsonSchema(values: readonly unknown[]): unknown[] {
  const converted: unknown[] = [];
  for (const value of values) {
    converted.push(isCastrSchemaForMcp(value) ? castrSchemaToJsonSchemaForMcp(value) : value);
  }
  return converted;
}

function convertSchemaFieldValue(value: unknown): unknown {
  if (value instanceof CastrSchemaProperties) {
    return convertPropertiesToJsonSchema(value);
  }
  if (isCastrSchemaForMcp(value)) {
    return castrSchemaToJsonSchemaForMcp(value);
  }
  if (Array.isArray(value)) {
    return convertArrayToJsonSchema(value);
  }
  return value;
}

function getRecordEntries(value: unknown): [string, unknown][] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value);
}

/**
 * Convert CastrSchema to MutableJsonSchema for MCP output.
 * Strips IR metadata while preserving schema structure.
 * Handles CastrSchemaProperties (Map) for properties field.
 */
const castrSchemaToJsonSchemaForMcp = (schema: CastrSchema): MutableJsonSchema => {
  const result: MutableJsonSchema = {};

  for (const [key, value] of getRecordEntries(schema)) {
    if (key !== SCHEMA_KEY_METADATA && value !== undefined) {
      result[key] = convertSchemaFieldValue(value);
    }
  }

  return result;
};

/**
 * Create input schema from IR operation.
 */
function createInputSchemaFromIR(ir: CastrDocument, operation: CastrOperation): MutableJsonSchema {
  const parameterGroups = collectParameterGroupsFromIR(operation);
  const requestBody = resolveRequestBodySchemaFromIR(operation);

  const properties: Record<string, MutableJsonSchema> = {};
  const requiredSections = new Set<string>();

  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_PATH, parameterGroups.path);
  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_QUERY, parameterGroups.query);
  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_HEADERS, parameterGroups.header);

  if (requestBody) {
    const bodyJsonSchema = castrSchemaToJsonSchemaForMcp(requestBody.schema);
    properties[INPUT_SECTION_BODY] = wrapSchemaFromIR(bodyJsonSchema);
    if (requestBody.required) {
      requiredSections.add(INPUT_SECTION_BODY);
    }
  }

  const required = requiredSections.size > 0 ? [...requiredSections] : undefined;
  const inputSchemaObject: MutableJsonSchema = {
    type: SCHEMA_TYPE_OBJECT,
    properties,
    ...(required ? { required } : {}),
  };

  const wrapped = wrapSchemaFromIR(inputSchemaObject);
  const inlined = inlineJsonSchemaRefsFromIR(wrapped, ir);
  return wrapJsonSchemaFromIR(inlined);
}

/**
 * Create output schema from IR operation.
 * Inlines refs first, then wraps to ensure object type.
 */
function createOutputSchemaFromIR(
  ir: CastrDocument,
  successSchema: CastrSchema,
): MutableJsonSchema {
  const asJsonSchema = castrSchemaToJsonSchemaForMcp(successSchema);
  // Inline refs first to resolve $ref schemas
  const inlined = inlineJsonSchemaRefsFromIR(asJsonSchema, ir);
  // Then wrap to ensure it's an object type (required by MCP ToolSchema)
  return wrapJsonSchemaFromIR(inlined);
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
  const successSchema = resolvePrimarySuccessResponseSchemaFromIR(operation);
  const outputSchema = successSchema ? createOutputSchemaFromIR(ir, successSchema) : undefined;

  return {
    inputSchema,
    ...(outputSchema ? { outputSchema } : {}),
  };
};
