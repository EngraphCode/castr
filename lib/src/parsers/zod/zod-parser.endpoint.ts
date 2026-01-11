/**
 * Zod Endpoint Parsing
 *
 * Parses `defineEndpoint({...})` declarations into endpoint definitions
 * and builds `CastrOperation` structures for OpenAPI generation.
 *
 * @module parsers/zod/endpoint
 *
 * @example
 * ```typescript
 * const definition = parseEndpointDefinition(`defineEndpoint({
 *   method: 'get',
 *   path: '/users/{id}',
 *   parameters: { path: { id: 'z.string()' } },
 *   response: { 200: 'UserSchema' },
 * })`);
 *
 * const operation = buildCastrOperationFromEndpoint(definition);
 * ```
 */

import { Node } from 'ts-morph';
import type {
  CastrOperation,
  CastrParameter,
  CastrResponse,
  CastrSchema,
  IRRequestBody,
} from '../../context/ir-schema.js';
import { createZodProject } from './zod-ast.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';
import { parseObjectZod } from './zod-parser.object.js';
import type {
  EndpointDefinition,
  EndpointParameters,
  EndpointResponses,
  ParameterLocation,
} from './zod-parser.endpoint.types.js';

// ============================================================================
// Parsing helpers
// ============================================================================

/**
 * Extract string value from an AST node.
 * @internal
 */
function extractStringValue(node: Node): string | undefined {
  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }
  return undefined;
}

/**
 * Extract boolean value from an AST node.
 * @internal
 */
function extractBooleanValue(node: Node): boolean | undefined {
  if (Node.isTrueLiteral(node)) {
    return true;
  }
  if (Node.isFalseLiteral(node)) {
    return false;
  }
  return undefined;
}

/**
 * Extract string array from an AST node.
 * @internal
 */
function extractStringArray(node: Node): string[] | undefined {
  if (!Node.isArrayLiteralExpression(node)) {
    return undefined;
  }

  const result: string[] = [];
  for (const element of node.getElements()) {
    const value = extractStringValue(element);
    if (value !== undefined) {
      result.push(value);
    }
  }
  return result;
}

/**
 * Extract parameters object from an AST node.
 * @internal
 */
function extractParametersObject(node: Node): EndpointParameters | undefined {
  if (!Node.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const parameters: EndpointParameters = {};

  for (const prop of node.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }

    const locationName = prop.getName() as ParameterLocation;
    const locationValue = prop.getInitializer();

    if (!locationValue || !Node.isObjectLiteralExpression(locationValue)) {
      continue;
    }

    const locationParams: Record<string, string> = {};

    for (const paramProp of locationValue.getProperties()) {
      if (!Node.isPropertyAssignment(paramProp)) {
        continue;
      }

      const paramName = paramProp.getName();
      const paramInit = paramProp.getInitializer();

      if (paramInit) {
        // Get the raw text of the schema expression
        locationParams[paramName] = paramInit.getText().replace(/^['"]|['"]$/g, '');
      }
    }

    if (Object.keys(locationParams).length > 0) {
      parameters[locationName] = locationParams;
    }
  }

  return Object.keys(parameters).length > 0 ? parameters : undefined;
}

/**
 * Extract responses object from an AST node.
 * @internal
 */
function extractResponsesObject(node: Node): EndpointResponses | undefined {
  if (!Node.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const responses: EndpointResponses = {};

  for (const prop of node.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }

    const statusCode = prop.getName().replace(/^['"]|['"]$/g, '');
    const responseInit = prop.getInitializer();

    if (responseInit) {
      responses[statusCode] = responseInit.getText().replace(/^['"]|['"]$/g, '');
    }
  }

  return Object.keys(responses).length > 0 ? responses : undefined;
}

// ============================================================================
// Main parsing function
// ============================================================================

/**
 * Parse a `defineEndpoint({...})` expression into an endpoint definition.
 *
 * @param expression - Source code containing a defineEndpoint call
 * @returns Parsed endpoint definition or undefined if not valid
 *
 * @example
 * ```typescript
 * const def = parseEndpointDefinition(`defineEndpoint({
 *   method: 'get',
 *   path: '/users',
 *   response: { 200: 'UserSchema' },
 * })`);
 * ```
 *
 * @public
 */
export function parseEndpointDefinition(expression: string): EndpointDefinition | undefined {
  const project = createZodProject(`const __endpoint = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  // Check it's a defineEndpoint call
  const callExpr = init.getExpression();
  if (!Node.isIdentifier(callExpr) || callExpr.getText() !== 'defineEndpoint') {
    return undefined;
  }

  // Get the first argument (the config object)
  const args = init.getArguments();
  if (args.length === 0) {
    return undefined;
  }

  const configArg = args[0];
  if (!configArg || !Node.isObjectLiteralExpression(configArg)) {
    return undefined;
  }

  // Extract properties
  let method: EndpointDefinition['method'] | undefined;
  let path: string | undefined;
  let summary: string | undefined;
  let description: string | undefined;
  let tags: string[] | undefined;
  let deprecated: boolean | undefined;
  let operationId: string | undefined;
  let parameters: EndpointParameters | undefined;
  let body: string | undefined;
  let responses: EndpointResponses | undefined;

  for (const prop of configArg.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }

    const propName = prop.getName();
    const propInit = prop.getInitializer();

    if (!propInit) {
      continue;
    }

    switch (propName) {
      case 'method':
        method = extractStringValue(propInit) as EndpointDefinition['method'];
        break;
      case 'path':
        path = extractStringValue(propInit);
        break;
      case 'summary':
        summary = extractStringValue(propInit);
        break;
      case 'description':
        description = extractStringValue(propInit);
        break;
      case 'operationId':
        operationId = extractStringValue(propInit);
        break;
      case 'tags':
        tags = extractStringArray(propInit);
        break;
      case 'deprecated':
        deprecated = extractBooleanValue(propInit);
        break;
      case 'parameters':
        parameters = extractParametersObject(propInit);
        break;
      case 'body':
        body = propInit.getText().replace(/^['"]|['"]$/g, '');
        break;
      case 'response':
        responses = extractResponsesObject(propInit);
        break;
    }
  }

  // Validate required fields
  if (!method || !path || !responses) {
    return undefined;
  }

  const result: EndpointDefinition = {
    method,
    path,
    responses,
  };

  // Only add optional properties if they are defined
  if (summary !== undefined) {
    result.summary = summary;
  }
  if (description !== undefined) {
    result.description = description;
  }
  if (tags !== undefined) {
    result.tags = tags;
  }
  if (deprecated !== undefined) {
    result.deprecated = deprecated;
  }
  if (operationId !== undefined) {
    result.operationId = operationId;
  }
  if (parameters !== undefined) {
    result.parameters = parameters;
  }
  if (body !== undefined) {
    result.body = body;
  }

  return result;
}

// ============================================================================
// CastrOperation building
// ============================================================================

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
 * Parse a schema expression into a CastrSchema.
 * @internal
 */
function parseSchemaExpression(expression: string): CastrSchema {
  // Try primitive first
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  // Try object
  const object = parseObjectZod(expression);
  if (object) {
    return object;
  }

  // Return a reference for named schemas
  return {
    $ref: `#/components/schemas/${expression.replace(/Schema$/, '')}`,
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
  const parameters: CastrParameter[] = [];
  const parametersByLocation: CastrOperation['parametersByLocation'] = {
    path: [],
    query: [],
    header: [],
    cookie: [],
  };

  // Build parameters
  if (definition.parameters) {
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
  }

  // Build request body
  let requestBody: IRRequestBody | undefined;
  if (definition.body) {
    const bodySchema = parseSchemaExpression(definition.body);
    requestBody = {
      required: true,
      content: {
        'application/json': {
          schema: bodySchema,
        },
      },
    };
  }

  // Build responses
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

  // Only add optional properties if they are defined
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

  return operation;
}
