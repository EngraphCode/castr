/**
 * Zod AST Declaration Helpers
 *
 * Utilities for finding Zod schema declarations in source files.
 * Extracted from zod-ast.ts to reduce file size.
 *
 * @module parsers/zod/ast/declarations
 */

import { Node, type SourceFile, type CallExpression } from 'ts-morph';
import { isZodCall } from './zod-ast.helpers.js';

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

  for (const stmt of sourceFile.getStatements()) {
    if (!Node.isVariableStatement(stmt)) {
      continue;
    }

    for (const decl of stmt.getDeclarationList().getDeclarations()) {
      const init = decl.getInitializer();
      if (init && Node.isCallExpression(init) && isZodCall(init)) {
        results.push({ name: decl.getName(), initializer: init });
      }
    }
  }

  return results;
}
