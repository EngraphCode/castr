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
 * import { createZodProject, getZodMethodChain } from './zod-ast.js';
 *
 * const { sourceFile, resolver } = createZodProject(`
 *   export const UserSchema = z.object({ name: z.string().min(1) });
 * `);
 * ```
 */

import type { CallExpression, SourceFile } from 'ts-morph';
import { Project, Node } from 'ts-morph';
import { ZodImportResolver } from '../registry/zod-import-resolver.js';
import { buildZodDeclarationSource } from '../registry/zod-decl-builder.js';

// Re-export constants so existing consumers don't break
export {
  ZOD_PRIMITIVES,
  ZOD_COMPOSITIONS,
  ZOD_OBJECT_METHOD,
  type ZodPrimitiveType,
  type ZodCompositionType,
} from '../zod-constants.js';

/** Symbol name for the global `undefined` identifier, used for semantic comparison. */
const GLOBAL_UNDEFINED_SYMBOL_NAME = 'undefined';

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
 * Result of creating a Zod project.
 *
 * Bundles the ts-morph Project, the input source file, and a
 * {@link ZodImportResolver} that can determine whether identifiers
 * trace back to the zod module.
 *
 * @public
 */
export interface ZodProjectResult {
  /** The ts-morph Project containing all source files. */
  project: Project;
  /** The input source file (always `getSourceFiles()[0]`). */
  sourceFile: SourceFile;
  /** Resolver for checking zod import identity via source-file object identity. */
  resolver: ZodImportResolver;
}

/**
 * Create a ts-morph Project from Zod source code.
 *
 * Returns a {@link ZodProjectResult} containing the project, the input
 * source file, and a {@link ZodImportResolver} for zod identity checks.
 *
 * @param source - Zod source code string
 * @returns Project result with source file and import resolver
 *
 * @public
 */
export function createZodProject(source: string): ZodProjectResult {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: {
      strict: true,
      target: 99, // ESNext
      module: 99, // ESNext
      moduleResolution: 2, // Node — required for resolving bare 'zod' specifier
    },
  });

  // Always prepend a synthetic zod import so the resolver can trace
  // `z` identifiers back to the zod module. Expression-wrapping
  // callers (e.g. parsePrimitiveZod) pass code without imports; full-source
  // callers include their own imports — duplicate imports are harmless for
  // ts-morph symbol resolution (the compiler merges them).
  const ZOD_IMPORT = "import { z } from 'zod';\n";
  const normalizedSource = ZOD_IMPORT + source;

  // Create input.ts first so getSourceFiles()[0] returns the user's source file.
  const sourceFile = project.createSourceFile('input.ts', normalizedSource);

  // Add a synthetic zod declaration generated from ZOD_PRIMITIVES and
  // ZOD_COMPOSITIONS — the same arrays that drive the parser. This ensures
  // the declaration stays in sync with what the parser recognizes.
  const zodDeclFile = project.createSourceFile(
    'node_modules/zod/index.d.ts',
    buildZodDeclarationSource(),
  );

  const resolver = new ZodImportResolver(zodDeclFile);

  return { project, sourceFile, resolver };
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
export { ZodImportResolver } from '../registry/zod-import-resolver.js';

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

function shouldStopChainWalk(expr: Node, resolver: ZodImportResolver): boolean {
  if (!Node.isPropertyAccessExpression(expr)) {
    return true;
  }
  const obj = expr.getExpression();
  return isZodOrZodNamespace(obj, resolver);
}

/**
 * Extract the full method chain from a Zod call expression.
 *
 * @param call - A Zod call expression
 * @param resolver - Resolver for checking zod import identity
 * @returns Method chain information
 *
 * @public
 */
export function getZodMethodChain(
  call: CallExpression,
  resolver: ZodImportResolver,
): ZodMethodChainInfo | undefined {
  const baseMethod = getZodBaseMethod(call, resolver);
  if (!baseMethod) {
    return undefined;
  }

  const { chainedMethods, baseCall } = walkMethodChain(call, resolver);
  const { baseArgNodes, baseArgs } = extractBaseArgs(baseCall);

  return { baseMethod, chainedMethods, baseArgNodes, baseArgs, baseCallNode: baseCall };
}

/**
 * Walk the method chain and find the base call.
 * @internal
 */
function walkMethodChain(
  call: CallExpression,
  resolver: ZodImportResolver,
): {
  chainedMethods: ZodMethodCall[];
  baseCall: CallExpression | undefined;
} {
  const chainedMethods: ZodMethodCall[] = [];
  let current: Node = call;
  let baseCall: CallExpression | undefined;

  while (Node.isCallExpression(current)) {
    const expr = current.getExpression();

    if (shouldStopChainWalk(expr, resolver)) {
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
 *
 * For `CallExpression` nodes (inner Zod calls like `z.string()` inside
 * `z.union([z.string(), z.number()])`), returns the AST `Node` directly
 * rather than serializing to text. Downstream consumers use `baseArgNodes`
 * for composition types and `parseZodSchemaFromNode` to process them.
 *
 * @internal
 */
function extractCompositionArg(node: Node): unknown {
  if (Node.isArrayLiteralExpression(node)) {
    // Recursively extract each element - handles nested Zod calls
    return node.getElements().map((el) => extractCompositionArg(el));
  }
  if (Node.isCallExpression(node)) {
    // Return the AST node directly — consumers use parseZodSchemaFromNode
    // to process inner Zod calls. Never serialize to text (ADR-026).
    return node;
  }
  return extractLiteralValue(node);
}

/**
 * Try to extract a numeric or string literal value.
 * @internal
 */
function tryExtractTypedLiteral(node: Node): { value: unknown; found: boolean } {
  if (Node.isStringLiteral(node)) {
    return { value: node.getLiteralValue(), found: true };
  }
  if (Node.isNumericLiteral(node)) {
    return { value: node.getLiteralValue(), found: true };
  }
  return { value: undefined, found: false };
}

/**
 * Try to extract a boolean, null, or undefined literal value.
 * @internal
 */
function tryExtractSpecialLiteral(node: Node): { value: unknown; found: boolean } {
  if (Node.isTrueLiteral(node)) {
    return { value: true, found: true };
  }
  if (Node.isFalseLiteral(node)) {
    return { value: false, found: true };
  }
  if (Node.isNullLiteral(node)) {
    return { value: null, found: true };
  }
  if (Node.isIdentifier(node) && node.getSymbol()?.getName() === GLOBAL_UNDEFINED_SYMBOL_NAME) {
    return { value: undefined, found: true };
  }
  return { value: undefined, found: false };
}

/**
 * Try to extract a simple literal value (string, number, boolean, null, undefined).
 * @internal
 */
function tryExtractSimpleLiteral(node: Node): { value: unknown; found: boolean } {
  const typed = tryExtractTypedLiteral(node);
  if (typed.found) {
    return typed;
  }
  return tryExtractSpecialLiteral(node);
}

/**
 * Extract a regex literal body from a RegularExpressionLiteral node.
 *
 * Uses `getLiteralValue()` which returns the parsed `RegExp` object,
 * then reads `.source` to get the pattern body — a semantic API
 * that avoids manual string parsing of the `/body/flags` format.
 *
 * @internal
 */
function extractRegexBody(node: Node): string | undefined {
  if (Node.isRegularExpressionLiteral(node)) {
    const regex: RegExp = node.getLiteralValue();
    return regex.source;
  }
  return undefined;
}

/**
 * Extract a literal value from an AST node.
 * @param node - AST node
 * @returns Extracted value or undefined
 * @internal
 */
export function extractLiteralValue(node: Node): unknown {
  const simple = tryExtractSimpleLiteral(node);
  if (simple.found) {
    return simple.value;
  }
  return extractRegexBody(node);
}

// ============================================================================
// findZodSchemaDeclarations
// ============================================================================

export { findZodSchemaDeclarations } from './zod-ast.declarations.js';

// ============================================================================
// extractObjectProperties
// ============================================================================

export { extractObjectProperties } from './zod-ast.object-props.js';
