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
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';

/**
 * Check if an expression is a reference to 'z' or 'z.namespace'.
 * Handles `z` (identifier) and `z.iso` (property access).
 * @internal
 */
export function isZodOrZodNamespace(expr: Node, resolver: ZodImportResolver): boolean {
  // Case 1: Simple 'z' identifier
  if (Node.isIdentifier(expr) && resolver.resolveToZodImport(expr)) {
    return true;
  }

  // Case 2: Namespace like 'z.iso'
  if (Node.isPropertyAccessExpression(expr)) {
    const lhs = expr.getExpression();
    return Node.isIdentifier(lhs) && resolver.resolveToZodImport(lhs);
  }

  return false;
}

export function isDirectZodCall(expr: Node, resolver: ZodImportResolver): boolean {
  if (!Node.isPropertyAccessExpression(expr)) {
    return false;
  }
  // Check if the object being called is 'z' or 'z.iso'
  const obj = expr.getExpression();
  return isZodOrZodNamespace(obj, resolver);
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
 * @param resolver - Resolver for checking zod import identity
 * @returns True if this is a z.xxx() call
 *
 * @internal
 */
export function isZodCall(node: Node, resolver: ZodImportResolver): node is CallExpression {
  if (!Node.isCallExpression(node)) {
    return false;
  }

  const expr = node.getExpression();

  // Direct z.xxx() or z.iso.xxx()
  if (isDirectZodCall(expr, resolver)) {
    return true;
  }

  // Chained: z.xxx().yyy()
  const inner = getInnerCall(expr);
  if (inner) {
    return isZodCall(inner, resolver);
  }

  return false;
}

function extractBaseFromCall(
  call: CallExpression,
  resolver: ZodImportResolver,
): string | undefined {
  const expr = call.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }

  const obj = expr.getExpression();

  // Case 1: z.string() -> obj is 'z', method is 'string'
  if (Node.isIdentifier(obj) && resolver.resolveToZodImport(obj)) {
    return expr.getName();
  }

  // Case 2: z.iso.date() -> obj is 'z.iso', method is 'date' -> return 'iso.date'
  if (Node.isPropertyAccessExpression(obj)) {
    const root = obj.getExpression();
    if (Node.isIdentifier(root) && resolver.resolveToZodImport(root)) {
      return `${obj.getName()}.${expr.getName()}`;
    }
  }

  return undefined;
}

/**
 * Get the base Zod method name from a call expression.
 *
 * @param call - A Zod call expression
 * @param resolver - Resolver for checking zod import identity
 * @returns The base method name (e.g., 'string', 'object', 'iso.date') or undefined
 *
 * @internal
 */
export function getZodBaseMethod(
  call: CallExpression,
  resolver: ZodImportResolver,
): string | undefined {
  let current: Node = call;

  // Walk down to find z.xxx()
  while (Node.isCallExpression(current)) {
    const base = extractBaseFromCall(current, resolver);
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
