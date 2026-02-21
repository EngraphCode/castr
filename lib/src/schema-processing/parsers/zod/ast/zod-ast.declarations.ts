/**
 * Zod AST Declaration Helpers
 *
 * Utilities for finding Zod schema declarations in source files.
 * Extracted from zod-ast.ts to reduce file size.
 *
 * @module parsers/zod/ast/declarations
 */

import { Node, type SourceFile, type CallExpression } from 'ts-morph';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import { isZodCall } from './zod-ast.helpers.js';
import { ZOD_METHOD_AND } from '../zod-constants.js';

function resolveAndChainRootIdentifier(call: CallExpression): Node | undefined {
  const expr = call.getExpression();
  if (!Node.isPropertyAccessExpression(expr) || expr.getName() !== ZOD_METHOD_AND) {
    return undefined;
  }

  const left = expr.getExpression();
  if (Node.isIdentifier(left)) {
    return left;
  }

  if (Node.isCallExpression(left)) {
    return resolveAndChainRootIdentifier(left);
  }

  return undefined;
}

function isIdentifierRootedAndDeclaration(
  initializer: CallExpression,
  knownSchemaNames: ReadonlySet<string>,
): boolean {
  const rootIdentifier = resolveAndChainRootIdentifier(initializer);
  if (!rootIdentifier || !Node.isIdentifier(rootIdentifier)) {
    return false;
  }

  const symbolName = rootIdentifier.getSymbol()?.getName();
  if (!symbolName) {
    return false;
  }

  return knownSchemaNames.has(symbolName);
}

/**
 * Extract Zod declarations from a single variable statement.
 * @internal
 */
function findZodDeclarationsInStatement(
  stmt: Node,
  results: { name: string; initializer: CallExpression }[],
  resolver: ZodImportResolver,
  knownSchemaNames: Set<string>,
): void {
  if (!Node.isVariableStatement(stmt)) {
    return;
  }

  for (const decl of stmt.getDeclarationList().getDeclarations()) {
    const init = decl.getInitializer();
    if (!init || !Node.isCallExpression(init)) {
      continue;
    }

    if (isZodCall(init, resolver) || isIdentifierRootedAndDeclaration(init, knownSchemaNames)) {
      const declarationName = decl.getName();
      results.push({ name: declarationName, initializer: init });
      knownSchemaNames.add(declarationName);
    }
  }
}

/**
 * Find all top-level Zod schema declarations in a source file.
 *
 * @param sourceFile - ts-morph SourceFile
 * @param resolver - Resolver for checking zod import identity
 * @returns Array of variable declarations with Zod schemas
 *
 * @public
 */
export function findZodSchemaDeclarations(
  sourceFile: SourceFile,
  resolver: ZodImportResolver,
): { name: string; initializer: CallExpression }[] {
  const results: { name: string; initializer: CallExpression }[] = [];
  const knownSchemaNames = new Set<string>();

  for (const stmt of sourceFile.getStatements()) {
    findZodDeclarationsInStatement(stmt, results, resolver, knownSchemaNames);
  }

  return results;
}
