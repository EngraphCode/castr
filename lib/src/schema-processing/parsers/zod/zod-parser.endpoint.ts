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
import { DEFINE_ENDPOINT_IDENTIFIER } from './zod-constants.js';
import type {
  EndpointDefinition,
  EndpointParameters,
  EndpointResponses,
} from './zod-parser.endpoint.types.js';
import {
  extractStringValue,
  extractBooleanValue,
  extractStringArray,
  extractParametersObject,
  extractResponsesObject,
} from './zod-parser.endpoint.extractors.js';

// Re-export builder function for API consistency
export { buildCastrOperationFromEndpoint } from './zod-parser.endpoint.builder.js';

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
 * Dispatch table mapping endpoint config property names to their extractors.
 * Each handler reads the property value from the AST node and updates state.
 * @internal
 */
const PROPERTY_EXTRACTORS: Readonly<
  Record<string, (state: ParsedConfigState, propInit: Node) => void>
> = {
  parameters: (state, propInit) => {
    state.parameters = extractParametersObject(propInit);
  },
  response: (state, propInit) => {
    state.responses = extractResponsesObject(propInit);
  },
  method: (state, propInit) => {
    state.method = extractMethod(propInit);
  },
  path: (state, propInit) => {
    state.path = extractStringValue(propInit);
  },
  summary: (state, propInit) => {
    state.summary = extractStringValue(propInit);
  },
  description: (state, propInit) => {
    state.description = extractStringValue(propInit);
  },
  operationId: (state, propInit) => {
    state.operationId = extractStringValue(propInit);
  },
  body: (state, propInit) => {
    state.body = extractStringValue(propInit);
  },
  tags: (state, propInit) => {
    state.tags = extractStringArray(propInit);
  },
  deprecated: (state, propInit) => {
    state.deprecated = extractBooleanValue(propInit);
  },
};

/**
 * Process a property assignment and update state.
 * @internal
 */
function processProperty(state: ParsedConfigState, propName: string, propInit: Node): void {
  const extractor = PROPERTY_EXTRACTORS[propName];
  if (extractor) {
    extractor(state, propInit);
  }
}

/**
 * Adds optional fields to an endpoint definition.
 * @internal
 */
function addOptionalEndpointFields(result: EndpointDefinition, state: ParsedConfigState): void {
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

  addOptionalEndpointFields(result, state);

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
  const configArg = extractDefineEndpointArg(expression);
  if (!configArg) {
    return undefined;
  }
  return parseConfigObject(configArg);
}

/**
 * Find the initializer call expression from the project source.
 * @internal
 */
function findDefineEndpointInit(expression: string): Node | undefined {
  const { sourceFile } = createZodProject(`const __endpoint = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  return init;
}

/**
 * Extract the config argument from a defineEndpoint expression.
 * @internal
 */
function extractDefineEndpointArg(expression: string): Node | undefined {
  const init = findDefineEndpointInit(expression);
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const callExpr = init.getExpression();
  // eslint-disable-next-line no-restricted-syntax -- ADR-026 § "Amendment — Identifier.getText()": ts-morph Identifier has no getName(); getText() is the only API
  if (!Node.isIdentifier(callExpr) || callExpr.getText() !== DEFINE_ENDPOINT_IDENTIFIER) {
    return undefined;
  }

  const args = init.getArguments();
  if (args.length === 0 || !args[0]) {
    return undefined;
  }

  return args[0];
}
