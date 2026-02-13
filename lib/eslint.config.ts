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
  '**/tests-roundtrip/__fixtures__/normalized/**/zod*.ts',
];

const testGlobs = [
  '**/*.test.{ts,tsx}',
  '**/*.spec.{ts,tsx}',
  '**/test-*.ts',
  '**/__tests__/**',
  '**/tests-snapshot/**/*.ts',
  '**/tests-roundtrip/**/*.ts',
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

  // ADR-026: No regex for schema parsing - enforce via ESLint
  // Parsers must use ts-morph AST, not regex patterns
  // Writers must not use regex patterns
  // No regex allowed in source code
  {
    files: ['src/**/*.ts'],
    ignores: testGlobs,
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[regex]',
          message:
            'Regex literals are banned in parsers (ADR-026). Use ts-morph for AST-based parsing.',
        },
        {
          selector: 'NewExpression[callee.name="RegExp"]',
          message:
            'RegExp constructor is banned in parsers (ADR-026). Use ts-morph for AST-based parsing.',
        },
      ],
    },
  },

  // We don't allow string manipulation in source code, this avoids agents
  // trying to use string matching to implement parsers
  // Session 3.3a: String manipulation detection
  // Configured as ERRORS - no warnings policy
  // Scoped to schema-processing/ only - utilities like shared/ may use strings legitimately
  // See: .agent/plans/string-manipulation-remediation.md
  {
    files: ['src/schema-processing/**/*.ts'],
    ignores: testGlobs,
    rules: {
      'no-restricted-syntax': [
        'off',
        // String pattern matching methods
        {
          selector: "CallExpression[callee.property.name='startsWith']",
          message:
            'String startsWith() banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "CallExpression[callee.property.name='endsWith']",
          message:
            'String endsWith() banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector:
            "CallExpression[callee.property.name='includes'][callee.object.type!='ArrayExpression']",
          message:
            'String includes() banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "CallExpression[callee.property.name='indexOf']",
          message:
            'String indexOf() banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "CallExpression[callee.property.name='lastIndexOf']",
          message:
            'String lastIndexOf() banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        // String manipulation methods
        {
          selector: "CallExpression[callee.property.name='slice']",
          message:
            'String slice() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='substring']",
          message:
            'String substring() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='substr']",
          message:
            'String substr() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='split']",
          message:
            'String split() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='replace']",
          message:
            'String replace() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='replaceAll']",
          message:
            'String replaceAll() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        // String transformation methods
        {
          selector: "CallExpression[callee.property.name='toLowerCase']",
          message:
            'String toLowerCase() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='toUpperCase']",
          message:
            'String toUpperCase() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='trim']",
          message:
            'String trim() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='trimStart']",
          message:
            'String trimStart() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        {
          selector: "CallExpression[callee.property.name='trimEnd']",
          message:
            'String trimEnd() banned (Session 3.3a). Use semantic analysis, not string manipulation.',
        },
        // Regex-adjacent string methods
        {
          selector: "CallExpression[callee.property.name='match']",
          message:
            'String match() banned (Session 3.3a). Use semantic analysis, not regex matching.',
        },
        {
          selector: "CallExpression[callee.property.name='search']",
          message:
            'String search() banned (Session 3.3a). Use semantic analysis, not regex matching.',
        },
        // ts-morph getText() anti-pattern
        {
          selector: "CallExpression[callee.property.name='getText']",
          message:
            'getText() for comparison banned (Session 3.3a). Use symbol resolution, not text comparison.',
        },
        // String literal comparisons
        {
          selector: "BinaryExpression[operator='==='][right.type='Literal'][right.value]",
          message:
            'String literal comparison banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "BinaryExpression[operator='==='][left.type='Literal'][left.value]",
          message:
            'String literal comparison banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "BinaryExpression[operator='=='][right.type='Literal'][right.value]",
          message:
            'String literal comparison banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
        {
          selector: "BinaryExpression[operator='=='][left.type='Literal'][left.value]",
          message:
            'String literal comparison banned (Session 3.3a). Use semantic analysis, not string matching.',
        },
      ],
    },
  },
);
