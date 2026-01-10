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

import type { SourceFile, CallExpression } from 'ts-morph';
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

  // Direct z.xxx()
  if (Node.isPropertyAccessExpression(expr)) {
    const obj = expr.getExpression();
    if (Node.isIdentifier(obj) && obj.getText() === 'z') {
      return true;
    }
  }

  // Chained: z.xxx().yyy()
  if (Node.isPropertyAccessExpression(expr)) {
    const inner = expr.getExpression();
    if (Node.isCallExpression(inner)) {
      return isZodCall(inner);
    }
  }

  return false;
}

/**
 * Get the base Zod method name from a call expression.
 *
 * @param call - A Zod call expression
 * @returns The base method name (e.g., 'string', 'object') or undefined
 *
 * @internal
 */
export function getZodBaseMethod(call: CallExpression): string | undefined {
  let current: Node = call;

  // Walk down to find z.xxx()
  while (Node.isCallExpression(current)) {
    const expr = current.getExpression();

    if (Node.isPropertyAccessExpression(expr)) {
      const obj = expr.getExpression();

      // Found z.xxx()
      if (Node.isIdentifier(obj) && obj.getText() === 'z') {
        return expr.getName();
      }

      // Keep walking down the chain
      if (Node.isCallExpression(obj)) {
        current = obj;
        continue;
      }
    }

    break;
  }

  return undefined;
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

  const chainedMethods: ZodMethodCall[] = [];

  // Build chain by walking from outermost call inward
  let current: Node = call;

  while (Node.isCallExpression(current)) {
    const expr = current.getExpression();

    if (Node.isPropertyAccessExpression(expr)) {
      const methodName = expr.getName();
      const obj = expr.getExpression();

      // Skip the base z.xxx() call
      if (Node.isIdentifier(obj) && obj.getText() === 'z') {
        break;
      }

      // Extract arguments
      const argNodes = current.getArguments();
      const args = argNodes.map((arg) => extractLiteralValue(arg));

      // Insert at beginning (we're walking backwards)
      chainedMethods.unshift({ name: methodName, argNodes, args });

      if (Node.isCallExpression(obj)) {
        current = obj;
        continue;
      }
    }

    break;
  }

  return { baseMethod, chainedMethods };
}

/**
 * Extract a literal value from an AST node.
 *
 * @param node - AST node
 * @returns Extracted value or undefined
 *
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

  // Handle regex literals - return pattern as string
  if (Node.isRegularExpressionLiteral(node)) {
    const text = node.getText();
    // Extract pattern from /pattern/flags
    const lastSlash = text.lastIndexOf('/');
    if (lastSlash > 0) {
      return text.slice(1, lastSlash);
    }
  }

  // Can't extract complex values
  return undefined;
}

/**
 * Find all top-level Zod schema declarations in a source file.
 *
 * @param sourceFile - ts-morph SourceFile
 * @returns Array of variable declarations with Zod schemas
 *
 * @public
 */
export function findZodSchemaDeclarations(
  sourceFile: SourceFile,
): { name: string; initializer: CallExpression }[] {
  const results: { name: string; initializer: CallExpression }[] = [];

  // Find variable declarations
  const varDecls = sourceFile.getVariableDeclarations();

  for (const decl of varDecls) {
    const init = decl.getInitializer();
    if (init && Node.isCallExpression(init) && isZodCall(init)) {
      results.push({
        name: decl.getName(),
        initializer: init,
      });
    }
  }

  return results;
}

/**
 * Extract properties from a z.object() call.
 *
 * @param call - A z.object() call expression
 * @returns Map of property name to property schema call, or undefined
 *
 * @public
 */
export function extractObjectProperties(
  call: CallExpression,
): Map<string, CallExpression> | undefined {
  const baseMethod = getZodBaseMethod(call);
  if (baseMethod !== 'object') {
    return undefined;
  }

  const args = call.getArguments();
  if (args.length === 0) {
    return new Map();
  }

  // Find the z.object({...}) call in the chain
  let objectCall: CallExpression | undefined = call;
  while (objectCall) {
    const method = getZodBaseMethod(objectCall);
    if (method === 'object') {
      break;
    }

    const expr = objectCall.getExpression();
    if (Node.isPropertyAccessExpression(expr)) {
      const inner = expr.getExpression();
      if (Node.isCallExpression(inner)) {
        objectCall = inner;
        continue;
      }
    }
    objectCall = undefined;
  }

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

  const properties = new Map<string, CallExpression>();

  for (const prop of objectLiteral.getProperties()) {
    if (Node.isPropertyAssignment(prop)) {
      let name = prop.getName();
      // Strip quotes from property names like 'my-prop' or "my-prop"
      if (
        (name.startsWith("'") && name.endsWith("'")) ||
        (name.startsWith('"') && name.endsWith('"'))
      ) {
        name = name.slice(1, -1);
      }
      const init = prop.getInitializer();

      if (init && Node.isCallExpression(init) && isZodCall(init)) {
        properties.set(name, init);
      }
    }
  }

  return properties;
}
