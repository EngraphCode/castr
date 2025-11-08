import type { Schema as JsonSchema } from 'ajv';
import { convertOpenApiSchemaToJsonSchema } from '../conversion/json-schema/convert-schema.js';
import type { HttpMethod } from '../endpoints/definition.types.js';
import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  SchemaObject,
} from 'openapi3-ts/oas31';
import {
  collectParameterGroups,
  createParameterSectionSchema,
  type ParameterAccumulator,
} from './template-context.mcp.parameters.js';
import {
  resolvePrimarySuccessResponseSchema,
  resolveRequestBodySchemaObject,
} from './template-context.mcp.responses.js';
import type { OperationSecurityMetadata } from '../conversion/json-schema/security/extract-operation-security.js';
import { resolveOperationSecurity } from '../conversion/json-schema/security/extract-operation-security.js';

const isObjectSchema = (schema: SchemaObject | undefined): schema is SchemaObject => {
  if (!schema) {
    return false;
  }

  if (schema.type === 'object') {
    return true;
  }

  if (Array.isArray(schema.type)) {
    return schema.type.includes('object');
  }

  return false;
};

const wrapSchema = (schema: SchemaObject | undefined): SchemaObject => {
  if (schema === undefined) {
    return {
      type: 'object',
    } satisfies SchemaObject;
  }

  if (isObjectSchema(schema)) {
    return schema;
  }

  return {
    type: 'object',
    properties: {
      value: schema,
    },
  } satisfies SchemaObject;
};

export const buildInputSchemaObject = (schema: SchemaObject | undefined): SchemaObject =>
  wrapSchema(schema);

export const buildOutputSchemaObject = (schema: SchemaObject | undefined): SchemaObject =>
  wrapSchema(schema);

const assignSection = (
  targetProperties: Record<string, SchemaObject>,
  requiredSections: Set<string>,
  sectionName: string,
  group?: ParameterAccumulator,
): void => {
  if (!group) {
    return;
  }

  const schemaObject = createParameterSectionSchema(group);
  targetProperties[sectionName] = buildInputSchemaObject(schemaObject);

  if (group.required.size > 0) {
    requiredSections.add(sectionName);
  }
};

/* eslint-disable sonarjs/function-return-type */
function createInputSchema(
  document: OpenAPIObject,
  pathParameters: readonly (ParameterObject | ReferenceObject)[] | undefined,
  operation: OperationObject,
): JsonSchema {
  const parameterGroups = collectParameterGroups(document, pathParameters, operation.parameters);
  const requestBody = resolveRequestBodySchemaObject(document, operation);

  const properties: Record<string, SchemaObject> = {};
  const requiredSections = new Set<string>();

  assignSection(properties, requiredSections, 'path', parameterGroups.path);
  assignSection(properties, requiredSections, 'query', parameterGroups.query);
  assignSection(properties, requiredSections, 'headers', parameterGroups.header);

  if (requestBody) {
    properties.body = buildInputSchemaObject(requestBody.schema);
    if (requestBody.required) {
      requiredSections.add('body');
    }
  }

  const inputSchemaObject: SchemaObject = {
    type: 'object',
    properties,
    required: requiredSections.size > 0 ? [...requiredSections] : undefined,
  };

  const wrapped = buildInputSchemaObject(inputSchemaObject);
  const converted: JsonSchema = convertOpenApiSchemaToJsonSchema(wrapped);
  return converted;
}

function createOutputSchema(
  document: OpenAPIObject,
  operation: OperationObject,
): JsonSchema | undefined {
  const successSchema = resolvePrimarySuccessResponseSchema(document, operation);
  const converted: JsonSchema | undefined = successSchema
    ? convertOpenApiSchemaToJsonSchema(buildOutputSchemaObject(successSchema))
    : undefined;

  return converted;
}
/* eslint-enable sonarjs/function-return-type */

const getOperationFromPathItem = (
  pathItem: PathItemObject,
  method: HttpMethod,
): OperationObject | undefined => {
  switch (method) {
    case 'get':
      return pathItem.get;
    case 'post':
      return pathItem.post;
    case 'put':
      return pathItem.put;
    case 'patch':
      return pathItem.patch;
    case 'delete':
      return pathItem.delete;
    case 'head':
      return pathItem.head;
    case 'options':
      return pathItem.options;
    default:
      return undefined;
  }
};

export interface McpToolSchemaResult {
  inputSchema: JsonSchema;
  outputSchema?: JsonSchema;
  security: OperationSecurityMetadata;
}

export const buildMcpToolSchemas = ({
  document,
  path,
  method,
}: {
  document: OpenAPIObject;
  path: string;
  method: HttpMethod;
}): McpToolSchemaResult => {
  const pathItem = document.paths?.[path];
  if (!pathItem) {
    throw new Error(`Missing path item for ${path}`);
  }

  const operation = getOperationFromPathItem(pathItem, method);
  if (!operation) {
    throw new Error(`Missing operation for ${method.toUpperCase()} ${path}`);
  }

  return {
    inputSchema: createInputSchema(document, pathItem.parameters, operation),
    outputSchema: createOutputSchema(document, operation),
    security: resolveOperationSecurity({
      document,
      operationSecurity: operation.security,
    }),
  };
};
