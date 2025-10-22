import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { configs as tsEslintConfigs } from "typescript-eslint";
import { configs as sonarjsConfigs } from "eslint-plugin-sonarjs";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import eslint from "@eslint/js";

const baseDirectory = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(
    // Base ESLint recommended rules
    eslint.configs.recommended,

    // TypeScript recommended rules with type checking
    tsEslintConfigs.recommendedTypeChecked,

    // Sonarjs recommended rules for code complexity and quality
    sonarjsConfigs.recommended,

    {
        // Global language options for TypeScript + React
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: baseDirectory,
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },

    {
        // Global ignores
        ignores: ["**/dist/**", "**/node_modules/**", "**/*.typegen.ts", "**/coverage/**", "**/*.d.ts"],
    },

    {
        // React files
        files: ["**/*.{ts,tsx}"],
        plugins: {
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
        },
        rules: {
            // React rules
            ...reactPlugin.configs.recommended.rules,
            ...reactHooksPlugin.configs.recommended.rules,
            "react/react-in-jsx-scope": "off", // Not needed in React 18+
            "react/prop-types": "off", // Using TypeScript

            // TypeScript rules
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports", fixStyle: "inline-type-imports" },
            ],

            // Sonarjs complexity
            "sonarjs/cognitive-complexity": ["warn", 30],

            // Code quality
            "no-console": "warn",
            "no-debugger": "error",
            "no-empty": ["error", { allowEmptyCatch: true }],
            "prefer-const": "error",
            "no-var": "error",

            // Allow eslint-disable comments
            "no-warning-comments": "off",
        },
    },

    {
        // Specific file overrides (from original config)
        files: ["src/toasts.ts", "src/Playground/Playground.machine.ts"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    }
);
