/**
 * @file Tests for the no-magic-string-comparison ESLint rule.
 *
 * Uses @typescript-eslint/rule-tester with Vitest to verify:
 * - String literal comparisons are reported (magic strings)
 * - typeof narrowing is not reported
 * - Numeric, boolean, and null literals are not reported
 *
 * @see lib/eslint-rules/no-magic-string-comparison.ts
 */
import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noMagicStringComparison } from './no-magic-string-comparison.js';

// Wire Vitest into RuleTester lifecycle
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

ruleTester.run('no-magic-string-comparison', noMagicStringComparison, {
  valid: [
    // typeof narrowing — always allowed
    { code: "typeof x === 'string'" },
    { code: "typeof x !== 'object'" },
    { code: "'string' === typeof x" },
    { code: "typeof foo === 'undefined'" },
    { code: "typeof bar !== 'function'" },

    // Numeric literals — not string comparisons
    { code: 'x === 42' },
    { code: 'x === 0' },
    { code: 'x.length === 0' },
    { code: 'x === 0x5f' },
    { code: 'count !== 1' },

    // Boolean literals — not string comparisons
    { code: 'x === true' },
    { code: 'x === false' },
    { code: 'x !== true' },

    // null literal — not a string comparison
    { code: 'x === null' },
    { code: 'x !== null' },

    // Non-equality operators — not checked
    { code: "x > 'a'" },
    { code: "x < 'z'" },
    { code: "x >= 'a'" },

    // No literals at all
    { code: 'x === y' },
    { code: 'a !== b' },
  ],

  invalid: [
    // Direct magic-string comparisons — strict equality
    {
      code: "kind === 'schema'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "type === 'object'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "'null' !== type",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "x !== 'hello'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },

    // Loose equality — also banned
    {
      code: "format == 'int'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "'text' != encoding",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },

    // Common ADR-026 violation patterns from semantic-parsing.issues.md
    {
      code: "type === 'string'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "type === 'array'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "type === 'number'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "type === 'integer'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
    {
      code: "location === 'path'",
      errors: [{ messageId: 'noMagicStringComparison' }],
    },
  ],
});
