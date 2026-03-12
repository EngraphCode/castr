/**
 * Zod Object Property Extraction
 *
 * Extracts property definitions from z.object() calls using ts-morph AST.
 * Handles PropertyAssignment and GetAccessorDeclaration nodes.
 *
 * @module parsers/zod/zod-ast.object-props
 */

import type { CallExpression, ObjectLiteralExpression, ReturnStatement } from 'ts-morph';
import { Node } from 'ts-morph';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import { getZodBaseMethod, getInnerCall } from './zod-ast.helpers.js';
import { isZodObjectBaseMethod } from '../zod-constants.js';

function findObjectCallInChain(
  call: CallExpression,
  resolver: ZodImportResolver,
): CallExpression | undefined {
  let objectCall: CallExpression | undefined = call;

  while (objectCall) {
    const method = getZodBaseMethod(objectCall, resolver);
    if (method && isZodObjectBaseMethod(method)) {
      return objectCall;
    }

    const inner = getInnerCall(objectCall.getExpression());
    if (inner) {
      objectCall = inner;
    } else {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Extract a property entry from a PropertyAssignment node.
 * @internal
 */
function extractFromPropertyAssignment(prop: Node): [string, Node] | undefined {
  if (!Node.isPropertyAssignment(prop)) {
    return undefined;
  }
  const name = prop.getName();
  const init = prop.getInitializer();

  if (init && (Node.isCallExpression(init) || Node.isIdentifier(init))) {
    return [name, init];
  }
  return undefined;
}

/**
 * Extract a property entry from a GetAccessorDeclaration node.
 * @internal
 */
function extractFromGetAccessor(prop: Node): [string, Node] | undefined {
  if (!Node.isGetAccessorDeclaration(prop)) {
    return undefined;
  }
  const name = prop.getName();
  const body = prop.getBody();
  if (!body || !Node.isBlock(body)) {
    return undefined;
  }

  const returnStat = body
    .getStatements()
    .find((s): s is ReturnStatement => Node.isReturnStatement(s));
  if (!returnStat) {
    return undefined;
  }

  const expr = returnStat.getExpression();
  if (!expr) {
    return undefined;
  }

  return [name, expr];
}

function extractPropertyEntry(prop: Node): [string, Node] | undefined {
  return extractFromPropertyAssignment(prop) ?? extractFromGetAccessor(prop);
}

function getObjectLiteralArgument(
  call: CallExpression,
): Map<string, Node> | ObjectLiteralExpression | undefined {
  const objectLiteral = call.getArguments()[0];
  if (!objectLiteral) {
    return new Map<string, Node>();
  }

  return Node.isObjectLiteralExpression(objectLiteral) ? objectLiteral : undefined;
}

/**
 * Extract properties from a z.object() call.
 *
 * @param call - A z.object() call expression
 * @param resolver - Resolver for checking zod import identity
 * @returns Map of property name to property schema call, or undefined
 *
 * @public
 */
export function extractObjectProperties(
  call: CallExpression,
  resolver: ZodImportResolver,
): Map<string, Node> | undefined {
  const objectCall = findObjectCallInChain(call, resolver);
  if (!objectCall) {
    return undefined;
  }

  const objectLiteral = getObjectLiteralArgument(objectCall);
  if (objectLiteral instanceof Map) {
    return objectLiteral;
  }
  if (!objectLiteral) {
    return undefined;
  }

  const properties = new Map<string, Node>();

  for (const prop of objectLiteral.getProperties()) {
    const entry = extractPropertyEntry(prop);
    if (entry) {
      properties.set(entry[0], entry[1]);
    }
  }

  return properties;
}
