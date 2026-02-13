/**
 * Endpoint AST Value Extractors
 *
 * Low-level AST value extraction functions for endpoint parsing.
 * Extracts strings, booleans, arrays, and parameter objects from AST nodes.
 *
 * @module parsers/zod/zod-parser.endpoint.extractors
 */

import type { Node } from 'ts-morph';
import { Node as NodeClass } from 'ts-morph';
import type {
  ParameterLocation,
  EndpointParameters,
  EndpointResponses,
} from './zod-parser.endpoint.types.js';

// Valid parameter locations for type narrowing
const VALID_LOCATIONS: readonly ParameterLocation[] = ['path', 'query', 'header', 'cookie'];

/**
 * Type guard for valid parameter locations.
 * @internal
 */
export function isParameterLocation(value: string): value is ParameterLocation {
  return VALID_LOCATIONS.some((loc) => loc === value);
}

/**
 * Strips surrounding quotes from a text value using AST context.
 * @internal
 */
export function stripQuotes(text: string): string {
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
export function extractStringValue(node: Node): string | undefined {
  if (NodeClass.isStringLiteral(node)) {
    return node.getLiteralValue();
  }
  return undefined;
}

/**
 * Extract boolean value from an AST node.
 * @internal
 */
export function extractBooleanValue(node: Node): boolean | undefined {
  if (NodeClass.isTrueLiteral(node)) {
    return true;
  }
  if (NodeClass.isFalseLiteral(node)) {
    return false;
  }
  return undefined;
}

/**
 * Extract string array from an AST node.
 * @internal
 */
export function extractStringArray(node: Node): string[] | undefined {
  if (!NodeClass.isArrayLiteralExpression(node)) {
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
export function extractLocationParams(locationValue: Node): Record<string, string> | undefined {
  if (!NodeClass.isObjectLiteralExpression(locationValue)) {
    return undefined;
  }

  const locationParams: Record<string, string> = {};

  for (const paramProp of locationValue.getProperties()) {
    if (!NodeClass.isPropertyAssignment(paramProp)) {
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
 * Extract a single location entry from a property assignment.
 * @internal
 */
export function extractLocationEntry(
  prop: Node,
): [ParameterLocation, Record<string, string>] | undefined {
  if (!NodeClass.isPropertyAssignment(prop)) {
    return undefined;
  }

  const locationName = prop.getName();
  if (!isParameterLocation(locationName)) {
    return undefined;
  }

  const locationValue = prop.getInitializer();
  if (!locationValue) {
    return undefined;
  }

  const locationResult = extractLocationParams(locationValue);
  if (!locationResult) {
    return undefined;
  }

  return [locationName, locationResult];
}

/**
 * Extract parameters object from an AST node.
 * @internal
 */
export function extractParametersObject(node: Node): EndpointParameters | undefined {
  if (!NodeClass.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const parameters: EndpointParameters = {};

  for (const prop of node.getProperties()) {
    const entry = extractLocationEntry(prop);
    if (entry) {
      parameters[entry[0]] = entry[1];
    }
  }

  return Object.keys(parameters).length > 0 ? parameters : undefined;
}

/**
 * Extract a single response entry from a property assignment.
 * @internal
 */
function extractResponseEntry(prop: Node): [string, string] | undefined {
  if (!NodeClass.isPropertyAssignment(prop)) {
    return undefined;
  }
  const statusCode = prop.getName();
  const responseInit = prop.getInitializer();
  if (!responseInit) {
    return undefined;
  }
  return [statusCode, stripQuotes(responseInit.getText())];
}

/**
 * Extract responses object from an AST node.
 * @internal
 */
export function extractResponsesObject(node: Node): EndpointResponses | undefined {
  if (!NodeClass.isObjectLiteralExpression(node)) {
    return undefined;
  }

  const responses: EndpointResponses = {};

  for (const prop of node.getProperties()) {
    const entry = extractResponseEntry(prop);
    if (entry) {
      responses[entry[0]] = entry[1];
    }
  }

  return Object.keys(responses).length > 0 ? responses : undefined;
}
