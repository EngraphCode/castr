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
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/engraph/castr/blob/main/docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md#${name}`,
);

type MessageIds = 'noMagicStringComparison';

const EQUALITY_OPERATORS = new Set(['===', '!==', '==', '!=']);

/**
 * Returns true if the given node is a string literal (not numeric, boolean, or null).
 */
function isStringLiteral(node: TSESTree.BinaryExpression['left']): boolean {
  return node.type === 'Literal' && typeof node.value === 'string';
}

/**
 * Returns true if the given node is a `typeof` unary expression.
 */
function isTypeofExpression(node: TSESTree.BinaryExpression['left']): boolean {
  return node.type === 'UnaryExpression' && node.operator === 'typeof';
}

/**
 * Returns true if this is a legitimate `typeof x === 'string'` narrowing pattern.
 * One side must be a string literal and the other must be a typeof expression.
 */
function isTypeofNarrowing(
  left: TSESTree.BinaryExpression['left'],
  right: TSESTree.BinaryExpression['right'],
): boolean {
  return (
    (isStringLiteral(left) && isTypeofExpression(right)) ||
    (isStringLiteral(right) && isTypeofExpression(left))
  );
}

export const noMagicStringComparison = createRule<[], MessageIds>({
  name: 'no-magic-string-comparison',
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
  defaultOptions: [],
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
});
