/**
 * @file ESLint rule: no-magic-string-comparison
 *
 * Bans direct equality comparisons against string literals in product code.
 * This enforces ADR-026's prohibition on magic-string comparisons
 * (e.g. `type === 'object'`, `kind === 'schema'`).
 *
 * **Allowed (not reported):**
 * - `typeof x === 'string'` — JS typeof narrowing is legitimate
 * - `x === 42`, `x === true`, `x === null` — non-string literals
 * - `.length === 0` — numeric comparison
 *
 * **Reported:**
 * - `type === 'object'` — magic string, use imported constants
 * - `'null' !== type` — magic string on either side
 * - `format == 'int'` — loose equality with magic string
 *
 * @see docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md
 */
import type { Rule } from 'eslint';

const EQUALITY_OPERATORS = new Set(['===', '!==', '==', '!=']);

/** Structural type for AST nodes received from BinaryExpression.left / .right */
interface ExpressionNode {
  type: string;
  value?: string | number | boolean | RegExp | bigint | null | undefined;
  operator?: string;
}

/**
 * Returns true if the given node is a string literal (not numeric, boolean, or null).
 */
function isStringLiteral(node: ExpressionNode): boolean {
  return node.type === 'Literal' && typeof node.value === 'string';
}

/**
 * Returns true if the given node is a `typeof` unary expression.
 */
function isTypeofExpression(node: ExpressionNode): boolean {
  return node.type === 'UnaryExpression' && node.operator === 'typeof';
}

/**
 * Returns true if this is a legitimate `typeof x === 'string'` narrowing pattern.
 * One side must be a string literal and the other must be a typeof expression.
 */
function isTypeofNarrowing(left: ExpressionNode, right: ExpressionNode): boolean {
  return (
    (isStringLiteral(left) && isTypeofExpression(right)) ||
    (isStringLiteral(right) && isTypeofExpression(left))
  );
}

export const noMagicStringComparison: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow direct equality comparisons against string literals (ADR-026). Use imported constants instead.',
    },
    messages: {
      noMagicStringComparison:
        'Magic-string comparison banned (ADR-026). Use imported constants, not string literals. typeof checks are allowed.',
    },
    schema: [],
  },
  create(context) {
    return {
      BinaryExpression(node): void {
        if (!EQUALITY_OPERATORS.has(node.operator)) {
          return;
        }

        const hasStringLiteral = isStringLiteral(node.left) || isStringLiteral(node.right);
        if (!hasStringLiteral) {
          return;
        }

        if (isTypeofNarrowing(node.left, node.right)) {
          return;
        }

        context.report({ node, messageId: 'noMagicStringComparison' });
      },
    };
  },
};
