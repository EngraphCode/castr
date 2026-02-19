// eslint.config.ts
import type { Linter } from 'eslint';
import { defineConfig } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { configs as tsEslintConfigs } from 'typescript-eslint';
import tsParser from '@typescript-eslint/parser';
import { configs as sonarjsConfigs } from 'eslint-plugin-sonarjs';
import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';
import { noMagicStringComparison } from './eslint-rules/no-magic-string-comparison.js';

const baseDir = path.dirname(fileURLToPath(import.meta.url));

/* -------------------------------------------------------------------------- */
/* Base setup                                                                 */
/* -------------------------------------------------------------------------- */

const baseLanguageOptions: Linter.LanguageOptions = {
  globals: { ...globals.node, ...globals.es2022 },
};

const baseIgnores = [
  '**/dist/**',
  '**/node_modules/**',
  '**/build/**',
  '**/.turbo/**',
  '**/coverage/**',
  '**/*.typegen.ts',
  '**/*.d.ts',
  'bin.cjs',
  'examples/**',
  '**/*.md',
  '**/*.json',
  '**/*.yaml',
  '**/*.yml',
  '**/.prettierignore',
  '**/.eslintignore',
  '**/.vscode/**',
  '**/package.json',
  '**/pnpm-lock.yaml',
  '**/.DS_Store',
  '**/*.hbs',
  '**/tests-generated/.tmp/**',
  // Generated fixture outputs - not source code
  '**/tests-transforms/__fixtures__/normalized/**/zod*.ts',
];

const testGlobs = [
  '**/*.test.{ts,tsx}',
  '**/*.spec.{ts,tsx}',
  '**/test-*.ts',
  '**/__tests__/**',
  '**/tests-snapshot/**/*.ts',
  '**/tests-transforms/**/*.ts',
  '**/characterisation/**/*.ts',
];

const baseConfig = [
  eslint.configs.recommended,
  importX.flatConfigs.recommended,
  sonarjsConfigs.recommended,
  prettierRecommended,
] as const;

/* -------------------------------------------------------------------------- */
/* Presets                                                                    */
/* -------------------------------------------------------------------------- */

const tsUntypedPresets = [
  importX.flatConfigs.typescript,
  ...tsEslintConfigs.strict,
  ...tsEslintConfigs.stylistic,
] as const;

/* -------------------------------------------------------------------------- */
/* Rules                                                                      */
/* -------------------------------------------------------------------------- */

const baseRules: Linter.RulesRecord = {
  'no-console': 'error',
  'no-debugger': 'error',
  'no-empty': 'error',
  'no-empty-function': 'error',
  'no-constant-condition': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
};

const untypedTsRules: Linter.RulesRecord = {
  'no-unused-vars': 'off',
  '@typescript-eslint/no-unused-vars': ['error', {}],
  '@typescript-eslint/no-explicit-any': ['error', { fixToUnknown: true }],
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'never' }],
  '@typescript-eslint/consistent-type-imports': [
    'error',
    { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
  ],
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-non-null-assertion': 'error',
  '@typescript-eslint/no-restricted-types': [
    'error',
    {
      types: {
        'Record<string, unknown>': {
          message:
            'Avoid Record<string, unknown>. It destroys type information. Refactor or use a defined type.',
        },
      },
    },
  ],
  complexity: ['error', 8],
  'sonarjs/cognitive-complexity': ['error', 8],
  'max-lines': ['error', { max: 220, skipBlankLines: true, skipComments: true }],
  'max-lines-per-function': ['error', { max: 45, skipBlankLines: true, skipComments: true }],
  'max-statements': ['error', 20],
  'max-depth': ['error', 3],

  curly: 'error',
  'prettier/prettier': 'error',
};

const typedTsRules: Linter.RulesRecord = {
  'import-x/no-namespace': 'error',
  'import-x/no-cycle': 'error',
  'import-x/no-self-import': 'error',
  'import-x/no-useless-path-segments': 'error',
  'import-x/no-named-as-default': 'error',
  '@typescript-eslint/await-thenable': 'error',
  '@typescript-eslint/no-unsafe-assignment': 'error',
  '@typescript-eslint/no-unsafe-return': 'error',
  '@typescript-eslint/no-unsafe-member-access': 'error',
  '@typescript-eslint/no-unsafe-argument': 'error',
  '@typescript-eslint/no-unsafe-call': 'error',
  '@typescript-eslint/no-deprecated': 'error',
  '@typescript-eslint/consistent-return': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/require-await': 'error',
  '@typescript-eslint/explicit-function-return-type': [
    'error',
    {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowDirectConstAssertionInArrowFunctions: true,
    },
  ],
};

const testRules: Linter.RulesRecord = {
  // Allow 'as' type assertions in test files
  '@typescript-eslint/consistent-type-assertions': ['error', { assertionStyle: 'as' }],
  'max-lines': ['error', 1000],
  'max-lines-per-function': ['error', 500],
  'max-statements': ['error', 50],
  'max-depth': ['error', 5],
  'no-console': 'off',
  complexity: 'off',
  'sonarjs/cognitive-complexity': 'off',
  // Allow http:// in test assertions - fixtures (official OpenAPI examples) use http:// URLs
  'sonarjs/no-clear-text-protocols': 'off',
};

/* -------------------------------------------------------------------------- */
/* Export                                                                     */
/* -------------------------------------------------------------------------- */

export default defineConfig(
  { ignores: baseIgnores },

  // @ts-expect-error temporary type gap between ESLint 9 and TS-ESLint 8
  ...baseConfig,

  { languageOptions: baseLanguageOptions, rules: baseRules },

  // Untyped checks everywhere
  ...tsUntypedPresets,
  { files: ['**/*.{ts,tsx,mts,cts}'], rules: untypedTsRules },

  // Test file relaxations
  { files: testGlobs, rules: testRules },

  // Scripts / configs / CLI / logger / generated
  {
    files: ['**/*.config.{ts,js}', 'scripts/**/*.{ts,js,mts,mjs}'],
    rules: {
      'no-console': 'off',
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },
  { files: ['**/cli.{ts,js,cjs}'], rules: { 'no-console': 'off' } },
  { files: ['**/logger.{ts,js}', '**/utils/logger.ts'], rules: { 'no-console': 'off' } },
  { files: ['**/generated/**'], rules: { curly: 'off' } },

  // Typed checks only for src/**
  {
    files: ['src/**/*.{ts,tsx,mts,cts}'],
    ignores: [...testGlobs, '**/*.d.ts', '**/dist/**', '**/generated/**', '**/node_modules/**'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { projectService: true, tsconfigRootDir: baseDir },
    },
    rules: typedTsRules,
  },

  // Test fixtures
  {
    files: ['tests-fixtures/**/*.{ts,tsx}'],
    rules: {
      'max-lines': ['error', { max: 500, skipBlankLines: true, skipComments: true }],
    },
  },

  // ---------------------------------------------------------------------------
  // ADR-026: Strict enforcement — no string/regex heuristics in product code
  // ---------------------------------------------------------------------------
  //
  // See: docs/architectural_decision_records/ADR-026-no-string-manipulation-for-parsing.md
  //
  // DESIGN PRINCIPLES:
  //   1. Enforcement applies to ALL src/**/*.ts — no file-level exemptions
  //   2. Moving files between directories cannot bypass lint
  //   3. All selectors are 'error' — no warnings, no 'off'
  //   4. Test files are excluded (tests may assert on string content)
  //   5. typeof narrowing (typeof x === 'type') is allowed (=== and !== only)
  //   6. Array literal .includes() is allowed; string .includes() is banned
  //   7. Identifier.getText() is allowed after Node.isIdentifier() narrowing
  //      (see ADR-026 § "Amendment — Identifier.getText()")
  //
  {
    files: ['src/**/*.ts'],
    ignores: [...testGlobs],
    rules: {
      'no-restricted-syntax': [
        'error',

        // --- Regex ---
        {
          selector: 'Literal[regex]',
          message: 'Regex literals banned (ADR-026). Use ts-morph AST, not regex.',
        },
        {
          selector: 'NewExpression[callee.name="RegExp"]',
          message: 'RegExp constructor banned (ADR-026). Use ts-morph AST, not regex.',
        },

        // --- getText() ---
        {
          selector: "CallExpression[callee.property.name='getText']",
          message:
            'getText() banned (ADR-026). Use symbol resolution or semantic APIs (getName, getLiteralValue). Exception: Identifier.getText() after Node.isIdentifier() — see ADR-026 § "Amendment — Identifier.getText()".',
        },

        // --- String pattern matching ---
        {
          selector: "CallExpression[callee.property.name='startsWith']",
          message: 'startsWith() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='endsWith']",
          message: 'endsWith() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='indexOf']",
          message: 'indexOf() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='lastIndexOf']",
          message:
            'lastIndexOf() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector:
            "CallExpression[callee.property.name='includes'][callee.object.type!='ArrayExpression']",
          message:
            'includes() banned on strings (ADR-026). Array literal .includes() is permitted.',
        },

        // --- String manipulation ---
        {
          selector: "CallExpression[callee.property.name='slice']",
          message: 'slice() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='substring']",
          message: 'substring() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='substr']",
          message: 'substr() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='split']",
          message: 'split() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='replace']",
          message: 'replace() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='replaceAll']",
          message: 'replaceAll() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },

        // --- String transformation ---
        {
          selector: "CallExpression[callee.property.name='toLowerCase']",
          message:
            'toLowerCase() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='toUpperCase']",
          message:
            'toUpperCase() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='trim']",
          message: 'trim() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='trimStart']",
          message: 'trimStart() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='trimEnd']",
          message: 'trimEnd() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },

        // --- Regex-adjacent string methods ---
        {
          selector: "CallExpression[callee.property.name='match']",
          message: 'match() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
        {
          selector: "CallExpression[callee.property.name='search']",
          message: 'search() banned (ADR-026). Use centralized utilities or semantic analysis.',
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // ADR-026: Magic-string literal comparisons — custom typed rule
  // ---------------------------------------------------------------------------
  //
  // ESLint's `no-restricted-syntax` Literal selectors cannot distinguish string
  // from numeric/boolean values. This custom rule checks `typeof node.value`
  // to catch only genuine magic-string comparisons while allowing typeof
  // narrowing, numeric, boolean, and null comparisons.
  //
  {
    files: ['src/**/*.ts'],
    ignores: [...testGlobs],
    plugins: {
      castr: {
        rules: {
          'no-magic-string-comparison': noMagicStringComparison,
        },
      },
    },
    rules: {
      'castr/no-magic-string-comparison': 'error',
    },
  },

  // eslint-rules tests: RuleTester.run() creates describe/it dynamically —
  // sonarjs/no-empty-test-file cannot detect this pattern statically.
  {
    files: ['eslint-rules/**/*.test.ts'],
    rules: {
      'sonarjs/no-empty-test-file': 'off',
    },
  },
);
