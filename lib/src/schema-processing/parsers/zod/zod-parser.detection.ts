/**
 * Zod 3 Syntax Detection
 *
 * Detects Zod 3 syntax patterns that are not compatible with Zod 4.
 * Uses ts-morph AST traversal (no regex) per ADR-026.
 *
 * @module parsers/zod/detection
 *
 * @example
 * ```typescript
 * import { detectZod3Syntax, isZod3Method } from './zod-parser.detection.js';
 *
 * // Check a single method name
 * if (isZod3Method('nonempty')) {
 *   console.log('Zod 3 method detected!');
 * }
 *
 * // Scan source code for Zod 3 patterns
 * const errors = detectZod3Syntax(sourceCode);
 * for (const error of errors) {
 *   console.error(`[${error.code}] ${error.message}`);
 * }
 * ```
 */

import type { CallExpression, ObjectLiteralExpression, SourceFile } from 'ts-morph';
import { Node } from 'ts-morph';
import type { ZodParseError } from './zod-parser.types.js';
import type { ZodImportResolver } from './registry/zod-import-resolver.js';
import {
  createZodProject,
  isZodCall,
  getZodMethodChain,
  ZOD_OBJECT_METHOD,
} from './ast/zod-ast.js';

/**
 * Zod 3 methods that are not available in Zod 4.
 * Maps deprecated method names to their Zod 4 replacements.
 * @internal
 */
const ZOD3_METHODS: ReadonlyMap<string, string> = new Map([
  ['nonempty', '.min(1)'],
  ['nonnegative', '.min(0)'],
  ['nonpositive', '.max(0)'],
]);

/**
 * Check if a method name is a deprecated Zod 3 method.
 * @public
 */
export function isZod3Method(methodName: string): boolean {
  return ZOD3_METHODS.has(methodName);
}

/**
 * Get the Zod 4 replacement for a Zod 3 method.
 * @internal
 */
function getZod4Replacement(methodName: string): string | undefined {
  return ZOD3_METHODS.get(methodName);
}

/**
 * Check if a call expression is part of a larger chain.
 * Used to skip inner calls when we only want to process outermost calls.
 * @internal
 */
function isInnerChainCall(node: CallExpression): boolean {
  const parent = node.getParent();
  if (parent && Node.isPropertyAccessExpression(parent)) {
    const grandparent = parent.getParent();
    return grandparent !== undefined && Node.isCallExpression(grandparent);
  }
  return false;
}

/**
 * Check a single chained method for Zod 3 or discouraged patterns.
 * @internal
 */
function checkMethodForIssues(
  method: { name: string },
  node: Node,
  sourceFile: SourceFile,
  errors: ZodParseError[],
): void {
  if (isZod3Method(method.name)) {
    const replacement = getZod4Replacement(method.name);
    const lineAndCol = sourceFile.getLineAndColumnAtPos(node.getStart());

    errors.push({
      message: `Zod 3 method '.${method.name}()' is not supported in Zod 4. Use '${replacement ?? method.name}' instead.`,
      code: 'ZOD3_SYNTAX',
      location: { line: lineAndCol.line, column: lineAndCol.column },
    });
  }

  if (isDiscouragedRefinement(method.name)) {
    const replacement = getDiscouragedReplacement(method.name);
    const lineAndCol = sourceFile.getLineAndColumnAtPos(node.getStart());

    errors.push({
      message: `Refinement '.${method.name}()' effectively creates a new primitive type. Use '${replacement}' instead.`,
      code: 'ZOD3_SYNTAX',
      location: { line: lineAndCol.line, column: lineAndCol.column },
    });
  }
}

/**
 * Scan source code for Zod 3 syntax patterns using ts-morph AST.
 * @public
 */
export function detectZod3Syntax(source: string): ZodParseError[] {
  const errors: ZodParseError[] = [];
  const { sourceFile, resolver } = createZodProject(source);

  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node) || !isZodCall(node, resolver) || isInnerChainCall(node)) {
      return;
    }

    const chain = getZodMethodChain(node, resolver);
    if (!chain) {
      return;
    }

    for (const method of chain.chainedMethods) {
      checkMethodForIssues(method, node, sourceFile, errors);
    }
  });

  return errors;
}

/**
 * Zod refinements that should be used as primitives instead.
 * @internal
 */
const DISCOURAGED_REFINEMENTS: ReadonlyMap<string, string> = new Map([
  ['email', 'z.email()'],
  ['url', 'z.url()'],
  ['uuid', 'z.uuid()'],
  ['datetime', 'z.iso.datetime()'],
  ['int', 'z.int()'],
]);

function isDiscouragedRefinement(methodName: string): boolean {
  return DISCOURAGED_REFINEMENTS.has(methodName);
}

function getDiscouragedReplacement(methodName: string): string | undefined {
  return DISCOURAGED_REFINEMENTS.get(methodName);
}

/**
 * Find the z.object() call in a chain of method calls.
 * @internal
 */
function findObjectCallInChain(
  node: CallExpression,
  resolver: ZodImportResolver,
): CallExpression | undefined {
  let current: CallExpression | undefined = node;

  while (current) {
    const expr = current.getExpression();
    if (!Node.isPropertyAccessExpression(expr)) {
      return undefined;
    }

    const obj = expr.getExpression();
    if (
      Node.isIdentifier(obj) &&
      resolver.resolveToZodImport(obj) &&
      expr.getName() === ZOD_OBJECT_METHOD
    ) {
      return current;
    }

    if (Node.isCallExpression(obj)) {
      current = obj;
      continue;
    }

    return undefined;
  }

  return undefined;
}

/**
 * Check an object literal for computed property keys.
 * @internal
 */
function checkForComputedKeys(
  objectLiteral: ObjectLiteralExpression,
  sourceFile: SourceFile,
  errors: ZodParseError[],
): void {
  for (const prop of objectLiteral.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }

    const nameNode = prop.getNameNode();
    if (!Node.isComputedPropertyName(nameNode)) {
      continue;
    }

    const lineAndCol = sourceFile.getLineAndColumnAtPos(prop.getStart());
    errors.push({
      message:
        'Computed property keys in z.object() cannot be statically analyzed. Use literal property names instead.',
      code: 'DYNAMIC_SCHEMA',
      location: { line: lineAndCol.line, column: lineAndCol.column },
    });
  }
}

/**
 * Check an object literal for spread assignments.
 * @internal
 */
function checkForSpreadAssignments(
  objectLiteral: ObjectLiteralExpression,
  sourceFile: SourceFile,
  errors: ZodParseError[],
): void {
  for (const prop of objectLiteral.getProperties()) {
    if (!Node.isSpreadAssignment(prop)) {
      continue;
    }

    const lineAndCol = sourceFile.getLineAndColumnAtPos(prop.getStart());
    errors.push({
      message:
        'Spread operators in z.object() cannot be statically analyzed. Define all properties inline instead.',
      code: 'DYNAMIC_SCHEMA',
      location: { line: lineAndCol.line, column: lineAndCol.column },
    });
  }
}

/**
 * Scan source code for dynamic schema patterns that cannot be statically analyzed.
 * Uses ts-morph AST to detect computed property keys and spread operators.
 * @public
 */
export function detectDynamicSchemas(source: string): ZodParseError[] {
  const errors: ZodParseError[] = [];
  const { sourceFile, resolver } = createZodProject(source);

  sourceFile.forEachDescendant((node) => {
    if (!Node.isCallExpression(node) || !isZodCall(node, resolver)) {
      return;
    }

    const chain = getZodMethodChain(node, resolver);
    if (!chain || chain.baseMethod !== ZOD_OBJECT_METHOD) {
      return;
    }

    const objectCall = findObjectCallInChain(node, resolver);
    if (!objectCall) {
      return;
    }

    const args = objectCall.getArguments();
    const objectLiteral = args[0];
    if (!objectLiteral || !Node.isObjectLiteralExpression(objectLiteral)) {
      return;
    }

    checkForComputedKeys(objectLiteral, sourceFile, errors);
    checkForSpreadAssignments(objectLiteral, sourceFile, errors);
  });

  return errors;
}
