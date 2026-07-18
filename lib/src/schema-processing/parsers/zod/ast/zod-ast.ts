/**
 * Zod AST Utilities
 *
 * ts-morph based utilities for parsing Zod source code.
 * This module provides the foundation for AST-based Zod parsing,
 * replacing fragile regex patterns (ADR-026).
 *
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
import { extractLiteralValue, type ZodMethodCall } from './zod-ast.literals.js';

// Re-export constants so existing consumers don't break
export {
  ZOD_PRIMITIVES,
  ZOD_COMPOSITIONS,
  ZOD_OBJECT_METHOD,
  ZOD_STRICT_OBJECT_METHOD,
  ZOD_LOOSE_OBJECT_METHOD,
  isZodObjectBaseMethod,
  type ZodPrimitiveType,
  type ZodCompositionType,
} from '../zod-constants.js';

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

// ZodMethodCall lives in the static-capture leaf so fail-fast helpers can
// use it without an import cycle; re-exported below with the extraction API.

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

/**
 * Extract a {@link ZodMethodCall} from a call expression whose callee is a
 * property access (e.g. the `.optional()` link of a chain).
 * Returns undefined when the callee is not a property access.
 *
 * @public
 */
export function extractMethodFromCall(call: CallExpression): ZodMethodCall | undefined {
  const expr = call.getExpression();
  if (!Node.isPropertyAccessExpression(expr)) {
    return undefined;
  }

  const methodName = expr.getName();
  const argNodes = call.getArguments();
  const args = argNodes.map((arg) => extractLiteralValue(arg));

  return { name: methodName, argNodes, args };
}

/**
 * Result of locating the outermost chained composition-operator call
 * (`.and()` / `.or()`) within a method chain.
 *
 * @public
 */
export interface OperatorChainSplit {
  /** The outermost `.<operator>(...)` call expression. */
  operatorCall: CallExpression;
  /** Chained methods applied after the operator call, in source order. */
  trailingMethods: ZodMethodCall[];
}

/**
 * Collect one chain link's method call into the trailing-methods list.
 * @internal
 */
function collectTrailingMethod(call: CallExpression, trailingMethods: ZodMethodCall[]): void {
  const method = extractMethodFromCall(call);
  if (method) {
    trailingMethods.unshift(method);
  }
}

/**
 * Walk a call chain from the outside in, locating the outermost
 * `claimOperator` call and collecting the methods chained after it.
 *
 * Returns undefined when the chain contains no `claimOperator` link — or
 * when any `declineOperators` link sits outermore, because the parser
 * owning that composition operator must claim the chain instead. The
 * claim operator is checked before the decline set, so callers may pass
 * the full owning-operator set (their own operator included) as
 * `declineOperators`.
 *
 * @public
 */
export function splitChainAroundOperator(
  node: CallExpression,
  claimOperator: string,
  declineOperators: ReadonlySet<string>,
): OperatorChainSplit | undefined {
  const trailingMethods: ZodMethodCall[] = [];
  let current: Node = node;

  while (Node.isCallExpression(current)) {
    const expr = current.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) {
      return undefined;
    }
    const methodName = expr.getName();
    if (methodName === claimOperator) {
      return { operatorCall: current, trailingMethods };
    }
    if (declineOperators.has(methodName)) {
      return undefined;
    }
    collectTrailingMethod(current, trailingMethods);
    current = expr.getExpression();
  }

  return undefined;
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

// ============================================================================
// Literal extraction and fail-fast reporting
// ============================================================================

export {
  extractLiteralValue,
  extractStaticJsonValue,
  describeNodeLocation,
  describeZodExpression,
  throwUnsupportedMemberSchema,
  throwUnsupportedMethodArgument,
  requireNumericArgument,
  requireStringArgument,
  type ZodMethodCall,
} from './zod-ast.literals.js';

// ============================================================================
// findZodSchemaDeclarations
// ============================================================================

export { findZodSchemaDeclarations } from './zod-ast.declarations.js';

// ============================================================================
// extractObjectProperties
// ============================================================================

export { extractObjectProperties } from './zod-ast.object-props.js';
