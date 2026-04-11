import type {
  CastrAdditionalOperation,
  CastrDocument,
  CastrOperation,
  CastrSchema,
} from '../../../ir/index.js';
import type { MutableJsonSchema } from '../../../conversion/json-schema/index.js';
import { assertOperationSupportsItemSchemaTargetCapabilities } from '../../../compatibility/item-schema-target-capabilities.js';
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
import {
  castrSchemaToJsonSchemaForMcp,
  wrapJsonSchemaFromIR,
  wrapSchemaFromIR,
} from './template-context.mcp.schemas.json-schema.js';
import type { McpToolSchemaResult } from './template-context.mcp.schemas.js';

const SCHEMA_TYPE_OBJECT = 'object';
const INPUT_SECTION_PATH = 'path';
const INPUT_SECTION_QUERY = 'query';
const INPUT_SECTION_QUERY_STRING = 'queryString';
const INPUT_SECTION_HEADERS = 'headers';
const INPUT_SECTION_BODY = 'body';

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
 * Create input schema from IR operation.
 */
function createInputSchemaFromIR(
  ir: CastrDocument,
  operation: CastrOperation | CastrAdditionalOperation,
): MutableJsonSchema {
  const parameterGroups = collectParameterGroupsFromIR(operation);
  const requestBody = resolveRequestBodySchemaFromIR(operation, ir);

  const properties: Record<string, MutableJsonSchema> = {};
  const requiredSections = new Set<string>();

  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_PATH, parameterGroups.path);
  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_QUERY, parameterGroups.query);
  assignSectionFromIR(
    properties,
    requiredSections,
    INPUT_SECTION_QUERY_STRING,
    parameterGroups.queryString,
  );
  assignSectionFromIR(properties, requiredSections, INPUT_SECTION_HEADERS, parameterGroups.header);

  if (requestBody) {
    const bodyJsonSchema = castrSchemaToJsonSchemaForMcp(requestBody.schema);
    properties[INPUT_SECTION_BODY] = wrapSchemaFromIR(bodyJsonSchema);
    if (requestBody.required) {
      requiredSections.add(INPUT_SECTION_BODY);
    }
  }

  if (Object.keys(properties).length === 0) {
    return {
      type: SCHEMA_TYPE_OBJECT,
      additionalProperties: false,
    };
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

function createOutputSchemaFromIR(
  ir: CastrDocument,
  successSchema: CastrSchema,
): MutableJsonSchema {
  const asJsonSchema = castrSchemaToJsonSchemaForMcp(successSchema);
  const inlined = inlineJsonSchemaRefsFromIR(asJsonSchema, ir);
  return wrapJsonSchemaFromIR(inlined);
}

export const buildMcpToolSchemasFromIR = (
  ir: CastrDocument,
  operation: CastrOperation | CastrAdditionalOperation,
): Omit<McpToolSchemaResult, 'security'> => {
  assertOperationSupportsItemSchemaTargetCapabilities(ir, operation, 'MCP');

  const inputSchema = createInputSchemaFromIR(ir, operation);
  const successSchema = resolvePrimarySuccessResponseSchemaFromIR(operation, ir);
  const outputSchema = successSchema ? createOutputSchemaFromIR(ir, successSchema) : undefined;

  return {
    inputSchema,
    ...(outputSchema ? { outputSchema } : {}),
  };
};
