/**
 * Zod Endpoint Parsing
 *
 * Parses `defineEndpoint({...})` declarations into endpoint definitions.
 * Builder functions are in `zod-parser.endpoint.builder.ts`.
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
import { createZodProject } from './zod-ast.js';
import type {
  EndpointDefinition,
  EndpointParameters,
  EndpointResponses,
  ParameterLocation,
} from './zod-parser.endpoint.types.js';

// Re-export builder function for API consistency
export { buildCastrOperationFromEndpoint } from './zod-parser.endpoint.builder.js';

// Valid parameter locations for type narrowing
const VALID_LOCATIONS: readonly ParameterLocation[] = ['path', 'query', 'header', 'cookie'];

/**
 * Type guard for valid parameter locations.
 * @internal
 */
function isParameterLocation(value: string): value is ParameterLocation {
  return VALID_LOCATIONS.some((loc) => loc === value);
}

/**
 * Strips surrounding quotes from a text value using AST context.
 * Replaces regex: /^['"]|['"]$/g
 * @internal
 */
function stripQuotes(text: string): string {
  if (text.length < 2) {
    return text;
  }
  const first = text.charAt(0);
  const last = text.charAt(text.length - 1);
  if ((first === '"' || first === "'") && first === last) {
    return text.slice(1, -1);
  }
  return text;
}

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
 * Extract a single location's parameters from an object literal.
 * @internal
 */
function extractLocationParams(locationValue: Node): Record<string, string> | undefined {
  if (!Node.isObjectLiteralExpression(locationValue)) {
    return undefined;
  }

  const locationParams: Record<string, string> = {};

  for (const paramProp of locationValue.getProperties()) {
    if (!Node.isPropertyAssignment(paramProp)) {
      continue;
    }

    const paramName = paramProp.getName();
    const paramInit = paramProp.getInitializer();

    if (paramInit) {
      locationParams[paramName] = stripQuotes(paramInit.getText());
    }
  }

  return Object.keys(locationParams).length > 0 ? locationParams : undefined;
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

    const locationName = prop.getName();
    if (!isParameterLocation(locationName)) {
      continue;
    }

    const locationValue = prop.getInitializer();
    if (!locationValue) {
      continue;
    }

    const locationParams = extractLocationParams(locationValue);
    if (locationParams) {
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

    const statusCode = stripQuotes(prop.getName());
    const responseInit = prop.getInitializer();

    if (responseInit) {
      responses[statusCode] = stripQuotes(responseInit.getText());
    }
  }

  return Object.keys(responses).length > 0 ? responses : undefined;
}

/**
 * Valid HTTP methods for endpoints.
 */
const VALID_METHODS: readonly EndpointDefinition['method'][] = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
];

/**
 * Type guard for valid HTTP methods.
 * @internal
 */
function isValidMethod(value: string): value is EndpointDefinition['method'] {
  return VALID_METHODS.some((m) => m === value);
}

/**
 * State accumulator for parsed config properties.
 * @internal
 */
interface ParsedConfigState {
  method: EndpointDefinition['method'] | undefined;
  path: string | undefined;
  summary: string | undefined;
  description: string | undefined;
  tags: string[] | undefined;
  deprecated: boolean | undefined;
  operationId: string | undefined;
  parameters: EndpointParameters | undefined;
  body: string | undefined;
  responses: EndpointResponses | undefined;
}

/**
 * Create initial empty state.
 * @internal
 */
function createInitialState(): ParsedConfigState {
  return {
    method: undefined,
    path: undefined,
    summary: undefined,
    description: undefined,
    tags: undefined,
    deprecated: undefined,
    operationId: undefined,
    parameters: undefined,
    body: undefined,
    responses: undefined,
  };
}

/**
 * Extract and validate method from property.
 * @internal
 */
function extractMethod(propInit: Node): EndpointDefinition['method'] | undefined {
  const val = extractStringValue(propInit);
  if (val && isValidMethod(val)) {
    return val;
  }
  return undefined;
}

/**
 * Process a property assignment and update state.
 * @internal
 */
function processProperty(state: ParsedConfigState, propName: string, propInit: Node): void {
  switch (propName) {
    case 'parameters':
      state.parameters = extractParametersObject(propInit);
      break;
    case 'response':
      state.responses = extractResponsesObject(propInit);
      break;
    case 'method':
      state.method = extractMethod(propInit);
      break;
    case 'path':
      state.path = extractStringValue(propInit);
      break;
    case 'summary':
      state.summary = extractStringValue(propInit);
      break;
    case 'description':
      state.description = extractStringValue(propInit);
      break;
    case 'operationId':
      state.operationId = extractStringValue(propInit);
      break;
    case 'body':
      state.body = stripQuotes(propInit.getText());
      break;
    case 'tags':
      state.tags = extractStringArray(propInit);
      break;
    case 'deprecated':
      state.deprecated = extractBooleanValue(propInit);
      break;
  }
}

/**
 * Build the final endpoint definition from parsed state.
 * @internal
 */
function buildEndpointResult(state: ParsedConfigState): EndpointDefinition | undefined {
  if (!state.method || !state.path || !state.responses) {
    return undefined;
  }

  const result: EndpointDefinition = {
    method: state.method,
    path: state.path,
    responses: state.responses,
  };

  if (state.summary !== undefined) {
    result.summary = state.summary;
  }
  if (state.description !== undefined) {
    result.description = state.description;
  }
  if (state.tags !== undefined) {
    result.tags = state.tags;
  }
  if (state.deprecated !== undefined) {
    result.deprecated = state.deprecated;
  }
  if (state.operationId !== undefined) {
    result.operationId = state.operationId;
  }
  if (state.parameters !== undefined) {
    result.parameters = state.parameters;
  }
  if (state.body !== undefined) {
    result.body = state.body;
  }

  return result;
}

/**
 * Parse the config object from a defineEndpoint call.
 * @internal
 */
function parseConfigObject(configArg: Node): EndpointDefinition | undefined {
  if (!Node.isObjectLiteralExpression(configArg)) {
    return undefined;
  }

  const state = createInitialState();

  for (const prop of configArg.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }

    const propInit = prop.getInitializer();
    if (propInit) {
      processProperty(state, prop.getName(), propInit);
    }
  }

  return buildEndpointResult(state);
}

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

  const callExpr = init.getExpression();
  if (!Node.isIdentifier(callExpr) || callExpr.getText() !== 'defineEndpoint') {
    return undefined;
  }

  const args = init.getArguments();
  if (args.length === 0 || !args[0]) {
    return undefined;
  }

  return parseConfigObject(args[0]);
}
