/**
 * Zod Import Resolver
 *
 * Encapsulates zod module identity checking using source-file object identity.
 * Replaces fragile string comparisons (`=== 'zod'`) with an exact semantic
 * check: `decl.getSourceFile() === this.zodDeclFile`.
 *
 * This class holds a reference to the known synthetic zod declaration file
 * and provides methods to determine whether identifiers trace back to it.
 *
 * @module parsers/zod/import-resolver
 *
 * @example
 * ```typescript
 * import { createZodProject } from './zod-ast.js';
 *
 * const { resolver} = createZodProject(`
 *   import { z } from 'zod';
 *   const schema = z.string();
 * `);
 *
 * // Check if an identifier resolves to zod
 * const zId = findIdentifier(sourceFile, 'z');
 * resolver.resolveToZodImport(zId); // true
 * ```
 */

import type { Identifier, Node as TsMorphNode, SourceFile } from 'ts-morph';
import { Node } from 'ts-morph';

/**
 * Resolves zod import identity using source-file object identity.
 *
 * Holds a reference to the known zod declaration file and checks whether
 * identifiers trace back to it — an exact semantic check that replaces
 * fragile string comparisons per ADR-026.
 *
 * @example
 * ```typescript
 * const resolver = new ZodImportResolver(zodDeclFile);
 *
 * // Identifier imported from 'zod' → true
 * resolver.resolveToZodImport(zIdentifier); // true
 *
 * // Identifier from a different module → false
 * resolver.resolveToZodImport(otherIdentifier); // false
 * ```
 *
 * @public
 */
export class ZodImportResolver {
  /**
   * Create a new resolver bound to a specific zod declaration file.
   *
   * @param zodDeclFile - The synthetic or real zod declaration source file.
   *   Identity checks compare declaration source files against this reference.
   */
  constructor(private readonly zodDeclFile: SourceFile) {}

  /**
   * Check whether an identifier resolves to an import from the zod module.
   *
   * Uses ts-morph symbol resolution to trace the identifier back to its
   * import declaration, then compares source-file identity against the
   * known zod declaration file.
   *
   * @param identifier - An Identifier AST node to check
   * @returns `true` if the identifier is imported from zod
   *
   * @example
   * ```typescript
   * // Given: import { z } from 'zod';
   * // The `z` identifier in `z.string()` will return true
   * resolver.resolveToZodImport(zIdentifier); // true
   *
   * // Given: const z = {};
   * // The `z` identifier will return false
   * resolver.resolveToZodImport(zIdentifier); // false
   * ```
   */
  resolveToZodImport(identifier: Identifier): boolean {
    const symbol = identifier.getSymbol();
    if (!symbol) {
      return false;
    }

    // Check aliased symbols (e.g., `import { z as myZ }`)
    const aliasedSymbol = symbol.getAliasedSymbol();
    const symbolToCheck = aliasedSymbol ?? symbol;

    // Source-file object identity: an exact semantic check.
    // No string comparisons — directly checks whether the declaration
    // lives in the known zod declaration file.
    return symbolToCheck
      .getDeclarations()
      .some((decl) => decl.getSourceFile() === this.zodDeclFile);
  }

  /**
   * Check whether a PropertyAccessExpression accesses a Zod namespace.
   *
   * Checks `z.xxx` patterns by verifying the left-hand `z` identifier
   * resolves to the zod module import.
   *
   * @param node - An AST node to check
   * @returns `true` if this is a `z.xxx` access where `z` is from zod
   *
   * @example
   * ```typescript
   * // Given: import { z } from 'zod'; z.string()
   * // The PropertyAccessExpression `z.string` returns true
   * resolver.isZodNamespaceAccess(propAccessNode); // true
   * ```
   */
  isZodNamespaceAccess(node: TsMorphNode): boolean {
    if (!Node.isPropertyAccessExpression(node)) {
      return false;
    }

    const expression = node.getExpression();

    // Case 1: z.xxx — expression is an Identifier
    if (Node.isIdentifier(expression)) {
      return this.resolveToZodImport(expression);
    }

    // Case 2: z.iso.xxx — expression is a PropertyAccessExpression
    // Check if the inner expression's LHS resolves to zod
    if (Node.isPropertyAccessExpression(expression)) {
      const innerExpr = expression.getExpression();
      if (Node.isIdentifier(innerExpr)) {
        return this.resolveToZodImport(innerExpr);
      }
    }

    return false;
  }
}
