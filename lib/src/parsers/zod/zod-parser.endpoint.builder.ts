/**
 * CastrOperation Builder for Zod Endpoints
 *
 * Builds `CastrOperation` structures from parsed `EndpointDefinition` objects.
 * Separated from parsing logic for single responsibility and reduced file size.
 *
 * @module parsers/zod/endpoint.builder
 */

import type {
  CastrOperation,
  CastrParameter,
  CastrResponse,
  CastrSchema,
  IRRequestBody,
} from '../../context/ir-schema.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';
import { parseObjectZod } from './zod-parser.object.js';
import type { EndpointDefinition, ParameterLocation } from './zod-parser.endpoint.types.js';

/**
 * Create default schema metadata.
 * @internal
 */
function createDefaultMetadata(): CastrSchema['metadata'] {
  return {
    required: true,
    nullable: false,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

/**
 * Strips trailing "Schema" suffix from a schema name to create a reference name.
 * @internal
 */
function stripSchemaSuffix(expression: string): string {
  if (expression.endsWith('Schema')) {
    return expression.slice(0, -6);
  }
  return expression;
}

/**
 * Parse a schema expression into a CastrSchema.
 * @internal
 */
function parseSchemaExpression(expression: string): CastrSchema {
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  const object = parseObjectZod(expression);
  if (object) {
    return object;
  }

  // Return a reference for named schemas
  return {
    $ref: `#/components/schemas/${stripSchemaSuffix(expression)}`,
    metadata: createDefaultMetadata(),
  };
}

/**
 * Build CastrParameter from a parameter definition.
 * @internal
 */
function buildParameter(
  name: string,
  schemaExpression: string,
  location: ParameterLocation,
): CastrParameter {
  const schema = parseSchemaExpression(schemaExpression);
  const isOptional = schemaExpression.includes('.optional()');

  return {
    name,
    in: location,
    required: location === 'path' ? true : !isOptional,
    schema,
  };
}

/**
 * Build CastrResponse from a response definition.
 * @internal
 */
function buildResponse(statusCode: string, schemaExpression: string): CastrResponse {
  const schema = parseSchemaExpression(schemaExpression);

  return {
    statusCode,
    schema,
  };
}

/**
 * Build all parameters from a definition.
 * @internal
 */
function buildAllParameters(definition: EndpointDefinition): {
  parameters: CastrParameter[];
  parametersByLocation: CastrOperation['parametersByLocation'];
} {
  const parameters: CastrParameter[] = [];
  const parametersByLocation: CastrOperation['parametersByLocation'] = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };

  if (!definition.parameters) {
    return { parameters, parametersByLocation };
  }

  const locations: ParameterLocation[] = ['path', 'query', 'header', 'cookie'];

  for (const location of locations) {
    const locationParams = definition.parameters[location];
    if (!locationParams) {
      continue;
    }

    for (const [name, schemaExpr] of Object.entries(locationParams)) {
      const param = buildParameter(name, schemaExpr, location);
      parameters.push(param);
      parametersByLocation[location].push(param);
    }
  }

  return { parameters, parametersByLocation };
}

/**
 * Build request body from a definition.
 * @internal
 */
function buildRequestBody(definition: EndpointDefinition): IRRequestBody | undefined {
  if (!definition.body) {
    return undefined;
  }

  const bodySchema = parseSchemaExpression(definition.body);
  return {
    required: true,
    content: {
      'application/json': {
        schema: bodySchema,
      },
    },
  };
}

/**
 * Add optional properties to an operation.
 * @internal
 */
function addOptionalProperties(
  operation: CastrOperation,
  definition: EndpointDefinition,
  requestBody: IRRequestBody | undefined,
): void {
  if (definition.operationId !== undefined) {
    operation.operationId = definition.operationId;
  }
  if (definition.summary !== undefined) {
    operation.summary = definition.summary;
  }
  if (definition.description !== undefined) {
    operation.description = definition.description;
  }
  if (definition.tags !== undefined) {
    operation.tags = definition.tags;
  }
  if (definition.deprecated !== undefined) {
    operation.deprecated = definition.deprecated;
  }
  if (requestBody !== undefined) {
    operation.requestBody = requestBody;
  }
}

/**
 * Build a `CastrOperation` from a parsed endpoint definition.
 *
 * @param definition - Parsed endpoint definition
 * @returns Complete CastrOperation structure
 *
 * @example
 * ```typescript
 * const operation = buildCastrOperationFromEndpoint({
 *   method: 'get',
 *   path: '/users/{id}',
 *   parameters: { path: { id: 'z.string()' } },
 *   responses: { '200': 'UserSchema' },
 * });
 * ```
 *
 * @public
 */
export function buildCastrOperationFromEndpoint(definition: EndpointDefinition): CastrOperation {
  const { parameters, parametersByLocation } = buildAllParameters(definition);
  const requestBody = buildRequestBody(definition);

  const responses: CastrResponse[] = Object.entries(definition.responses).map(
    ([statusCode, schemaExpr]) => buildResponse(statusCode, schemaExpr),
  );

  const operation: CastrOperation = {
    method: definition.method,
    path: definition.path,
    parameters,
    parametersByLocation,
    responses,
  };

  addOptionalProperties(operation, definition, requestBody);

  return operation;
}
