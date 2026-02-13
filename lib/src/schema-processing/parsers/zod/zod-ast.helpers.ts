/**
 * Zod AST Core Helpers
 *
 * Fundamental AST utilities for identifying Zod calls.
 * Extracted to avoid dependency cycles.
 *
 * @module parsers/zod/ast/helpers
 */

import type { CallExpression } from 'ts-morph';
import { Node } from 'ts-morph';

/**
 * Check if an expression is a reference to 'z' or 'z.namespace'.
 * Handles `z` (identifier) and `z.iso` (property access).
 * @internal
 */
export function isZodOrZodNamespace(expr: Node): boolean {
  // Case 1: Simple 'z' identifier
  if (Node.isIdentifier(expr) && expr.getText() === 'z') {
    return true;
  }

  // Case 2: Namespace like 'z.iso'
  if (Node.isPropertyAccessExpression(expr)) {
    const lhs = expr.getExpression();
    return Node.isIdentifier(lhs) && lhs.getText() === 'z';
  }

  return false;
}

export function isDirectZodCall(expr: Node): boolean {
  if (!Node.isPropertyAccessExpression(expr)) {
    return false;
  }
  // Check if the object being called is 'z' or 'z.iso'
  const obj = expr.getExpression();
  return isZodOrZodNamespace(obj);
}

export function getInnerCall(expr: Node): CallExpression | undefined {
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }
  const inner = expr.getExpression();
  if (Node.isCallExpression(inner)) {
    return inner;
  }
  return undefined;
}

/**
 * Check if a node is a call to z.xxx().
 *
 * @param node - AST node to check
 * @returns True if this is a z.xxx() call
 *
 * @internal
 */
export function isZodCall(node: Node): node is CallExpression {
  if (!Node.isCallExpression(node)) {
    return false;
  }

  const expr = node.getExpression();

  // Direct z.xxx() or z.iso.xxx()
  if (isDirectZodCall(expr)) {
    return true;
  }

  // Chained: z.xxx().yyy()
  const inner = getInnerCall(expr);
  if (inner) {
    return isZodCall(inner);
  }

  return false;
}

function extractBaseFromCall(call: CallExpression): string | undefined {
  const expr = call.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }

  const obj = expr.getExpression();

  // Case 1: z.string() -> obj is 'z', method is 'string'
  if (Node.isIdentifier(obj) && obj.getText() === 'z') {
    return expr.getName();
  }

  // Case 2: z.iso.date() -> obj is 'z.iso', method is 'date' -> return 'iso.date'
  if (Node.isPropertyAccessExpression(obj)) {
    const root = obj.getExpression();
    if (Node.isIdentifier(root) && root.getText() === 'z') {
      return `${obj.getName()}.${expr.getName()}`;
    }
  }

  return undefined;
}

/**
 * Get the base Zod method name from a call expression.
 *
 * @param call - A Zod call expression
 * @returns The base method name (e.g., 'string', 'object', 'iso.date') or undefined
 *
 * @internal
 */
export function getZodBaseMethod(call: CallExpression): string | undefined {
  let current: Node = call;

  // Walk down to find z.xxx()
  while (Node.isCallExpression(current)) {
    const base = extractBaseFromCall(current);
    if (base) {
      return base;
    }

    // Keep walking down the chain
    const inner = getInnerCall(current.getExpression());
    if (inner) {
      current = inner;
      continue;
    }

    break;
  }

  return undefined;
}
