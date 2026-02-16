/**
 * Zod AST Declaration Helpers
 *
 * Utilities for finding Zod schema declarations in source files.
 * Extracted from zod-ast.ts to reduce file size.
 *
 * @module parsers/zod/ast/declarations
 */

import { Node, type SourceFile, type CallExpression } from 'ts-morph';
import type { ZodImportResolver } from './zod-import-resolver.js';
import { isZodCall } from './zod-ast.helpers.js';

/**
 * Extract Zod declarations from a single variable statement.
 * @internal
 */
function findZodDeclarationsInStatement(
  stmt: Node,
  results: { name: string; initializer: CallExpression }[],
  resolver: ZodImportResolver,
): void {
  if (!Node.isVariableStatement(stmt)) {
    return;
  }

  for (const decl of stmt.getDeclarationList().getDeclarations()) {
    const init = decl.getInitializer();
    if (init && Node.isCallExpression(init) && isZodCall(init, resolver)) {
      results.push({ name: decl.getName(), initializer: init });
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

  for (const stmt of sourceFile.getStatements()) {
    findZodDeclarationsInStatement(stmt, results, resolver);
  }

  return results;
}
