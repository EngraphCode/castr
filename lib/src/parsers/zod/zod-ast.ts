/**
 * Zod AST Utilities
 *
 * ts-morph based utilities for parsing Zod source code.
 * This module provides the foundation for AST-based Zod parsing,
 * replacing fragile regex patterns (ADR-026).
 *
 * @module parsers/zod/ast
 *
 * @example
 * ```typescript
 * import { createZodProject, findZodCalls, getZodMethodChain } from './zod-ast.js';
 *
 * const project = createZodProject(`
 *   export const UserSchema = z.object({ name: z.string().min(1) });
 * `);
 *
 * const calls = findZodCalls(project.getSourceFiles()[0]);
 * ```
 */

import type { CallExpression, ReturnStatement } from 'ts-morph';
import { Project, Node } from 'ts-morph';

/**
 * Recognized Zod base types.
 * @internal
 */
export const ZOD_PRIMITIVES = [
  'string',
  'number',
  'boolean',
  'null',
  'undefined',
  'bigint',
  'date',
  'symbol',
  'void',
  'any',
  'unknown',
  'never',
  // Zod 4 Primitives
  'int',
  'int32',
  'int64',
  'float32',
  'float64',
  'iso.date',
  'iso.datetime',
  'iso.time',
  'iso.duration',
  'uuidv4',
  'base64',
  'base64url',
  'email',
  'url',
  'uuid',
  'ipv4',
  'ipv6',
  'cidrv4',
  'cidrv6',
  'jwt',
  'e164',
  'hostname',
  'literal',
] as const;

export type ZodPrimitiveType = (typeof ZOD_PRIMITIVES)[number];

/**
 * Recognized Zod composition types.
 * @internal
 */
export const ZOD_COMPOSITIONS = [
  'object',
  'array',
  'union',
  'intersection',
  'discriminatedUnion',
  'lazy',
  'xor',
] as const;

export type ZodCompositionType = (typeof ZOD_COMPOSITIONS)[number];

/**
 * Method chain information extracted from Zod AST.
 */
export interface ZodMethodChainInfo {
  /** Base method name (e.g., 'string', 'object') */
  baseMethod: string;
  /** All chained method calls in order */
  chainedMethods: ZodMethodCall[];
  /** Raw argument nodes from the base call */
  baseArgNodes: Node[];
  /** Parsed argument values from the base call (for composition types) */
  baseArgs: unknown[];
  /** The AST node of the base call expression */
  baseCallNode?: CallExpression | undefined;
}

/**
 * A single method call in a Zod chain.
 */
export interface ZodMethodCall {
  /** Method name (e.g., 'min', 'optional', 'email') */
  name: string;
  /** Raw argument nodes */
  argNodes: Node[];
  /** Parsed argument values (for simple literals) */
  args: unknown[];
}

/**
 * Create a ts-morph Project from Zod source code.
 *
 * @param source - Zod source code string
 * @returns ts-morph Project with the source file
 *
 * @public
 */
export function createZodProject(source: string): Project {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      target: 99, // ESNext
      module: 99, // ESNext
    },
  });

  project.createSourceFile('input.ts', source);
  return project;
}

// ============================================================================
// Helper functions for isZodCall - split for reduced complexity
// ============================================================================

import {
  isZodCall,
  getZodBaseMethod,
  isZodOrZodNamespace,
  isDirectZodCall,
  getInnerCall,
} from './zod-ast.helpers.js';

export { isZodCall, getZodBaseMethod, isZodOrZodNamespace, isDirectZodCall, getInnerCall };

// ============================================================================
// Helpers for getZodMethodChain
// ============================================================================

function extractMethodFromCall(call: CallExpression): ZodMethodCall | undefined {
  const expr = call.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }

  const methodName = expr.getName();
  const argNodes = call.getArguments();
  const args = argNodes.map((arg) => extractLiteralValue(arg));

  return { name: methodName, argNodes, args };
}

function shouldStopChainWalk(expr: Node): boolean {
  if (!Node.isPropertyAccessExpression(expr)) {
    return true;
  }
  const obj = expr.getExpression();
  return isZodOrZodNamespace(obj);
}

/**
 * Extract the full method chain from a Zod call expression.
 *
 * @param call - A Zod call expression
 * @returns Method chain information
 *
 * @public
 */
export function getZodMethodChain(call: CallExpression): ZodMethodChainInfo | undefined {
  const baseMethod = getZodBaseMethod(call);
  if (!baseMethod) {
    return undefined;
  }

  const { chainedMethods, baseCall } = walkMethodChain(call);
  const { baseArgNodes, baseArgs } = extractBaseArgs(baseCall);

  return { baseMethod, chainedMethods, baseArgNodes, baseArgs, baseCallNode: baseCall };
}

/**
 * Walk the method chain and find the base call.
 * @internal
 */
function walkMethodChain(call: CallExpression): {
  chainedMethods: ZodMethodCall[];
  baseCall: CallExpression | undefined;
} {
  const chainedMethods: ZodMethodCall[] = [];
  let current: Node = call;
  let baseCall: CallExpression | undefined;

  while (Node.isCallExpression(current)) {
    const expr = current.getExpression();

    if (shouldStopChainWalk(expr)) {
      baseCall = current;
      break;
    }

    const method = extractMethodFromCall(current);
    if (method) {
      chainedMethods.unshift(method);
    }

    const inner = getInnerCall(expr);
    if (inner) {
      current = inner;
    } else {
      break;
    }
  }

  return { chainedMethods, baseCall };
}

/**
 * Extract arguments from the base call.
 * @internal
 */
function extractBaseArgs(baseCall: CallExpression | undefined): {
  baseArgNodes: Node[];
  baseArgs: unknown[];
} {
  if (!baseCall) {
    return { baseArgNodes: [], baseArgs: [] };
  }
  const baseArgNodes = baseCall.getArguments();
  const baseArgs = baseArgNodes.map((arg) => extractCompositionArg(arg));
  return { baseArgNodes, baseArgs };
}

/**
 * Extract composition argument value (handles inner Zod calls).
 * @internal
 */
function extractCompositionArg(node: Node): unknown {
  if (Node.isArrayLiteralExpression(node)) {
    // Recursively extract each element - handles nested Zod calls
    return node.getElements().map((el) => extractCompositionArg(el));
  }
  if (Node.isCallExpression(node)) {
    return node.getText();
  }
  return extractLiteralValue(node);
}

/**
 * Extract a literal value from an AST node.
 * @param node - AST node
 * @returns Extracted value or undefined
 * @internal
 */
export function extractLiteralValue(node: Node): unknown {
  if (Node.isStringLiteral(node)) {
    return node.getLiteralValue();
  }
  if (Node.isNumericLiteral(node)) {
    return node.getLiteralValue();
  }
  if (Node.isTrueLiteral(node)) {
    return true;
  }
  if (Node.isFalseLiteral(node)) {
    return false;
  }
  if (Node.isNullLiteral(node)) {
    return null;
  }
  if (Node.isIdentifier(node) && node.getText() === 'undefined') {
    return undefined;
  }
  if (Node.isRegularExpressionLiteral(node)) {
    const text = node.getText();
    const lastSlash = text.lastIndexOf('/');
    if (lastSlash > 0) {
      return text.slice(1, lastSlash);
    }
  }
  return undefined;
}

// ============================================================================
// findZodSchemaDeclarations
// ============================================================================

export { findZodSchemaDeclarations } from './zod-ast.declarations.js';

// ============================================================================
// Helpers for extractObjectProperties - split for reduced complexity
// ============================================================================

function findObjectCallInChain(call: CallExpression): CallExpression | undefined {
  let objectCall: CallExpression | undefined = call;

  while (objectCall) {
    const method = getZodBaseMethod(objectCall);
    if (method === 'object') {
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

function stripQuotes(name: string): string {
  if (
    (name.startsWith("'") && name.endsWith("'")) ||
    (name.startsWith('"') && name.endsWith('"'))
  ) {
    return name.slice(1, -1);
  }
  return name;
}

function extractPropertyEntry(prop: Node): [string, Node] | undefined {
  if (Node.isPropertyAssignment(prop)) {
    const name = stripQuotes(prop.getName());
    const init = prop.getInitializer();

    if (init && (Node.isCallExpression(init) || Node.isIdentifier(init))) {
      return [name, init];
    }
  }

  if (Node.isGetAccessorDeclaration(prop)) {
    const name = stripQuotes(prop.getName());
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

  return undefined;
}

/**
 * Extract properties from a z.object() call.
 *
 * @param call - A z.object() call expression
 * @returns Map of property name to property schema call, or undefined
 *
 * @public
 */
export function extractObjectProperties(call: CallExpression): Map<string, Node> | undefined {
  const baseMethod = getZodBaseMethod(call);
  if (baseMethod !== 'object') {
    return undefined;
  }

  const objectCall = findObjectCallInChain(call);
  if (!objectCall) {
    return undefined;
  }

  const objectArgs = objectCall.getArguments();
  if (objectArgs.length === 0) {
    return new Map();
  }

  const objectLiteral = objectArgs[0];
  if (!objectLiteral || !Node.isObjectLiteralExpression(objectLiteral)) {
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
