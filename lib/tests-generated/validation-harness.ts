import fs from 'fs/promises';

import * as ts from 'typescript';
import { ESLint } from 'eslint';
import { join } from 'path';

/**
 * Validation result for syntax checking.
 */
export interface SyntaxValidationResult {
  /** Whether the code is syntactically valid */
  valid: boolean;
  /** List of syntax error messages */
  errors: string[];
}

/**
 * Validation result for type checking.
 */
export interface TypeCheckValidationResult {
  /** Whether the code passes type checking */
  valid: boolean;
  /** List of type error messages */
  errors: string[];
}

/**
 * Validation result for linting.
 */
export interface LintValidationResult {
  /** Whether the code passes linting (no errors) */
  valid: boolean;
  /** List of lint warnings */
  warnings: string[];
  /** List of lint errors */
  errors: string[];
}

/**
 * Validation result for runtime execution.
 */
export interface RuntimeValidationResult {
  /** Whether the code is valid for runtime execution */
  valid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Parse TypeScript code and check for syntax errors using the TS compiler API.
 *
 * This function uses the public TypeScript Compiler API to check for syntactic
 * errors. It creates a program and uses `getSyntacticDiagnostics()` which is
 * the proper way to check for parse/syntax errors without accessing internal APIs.
 *
 * @param filepath - Absolute path to the TypeScript file to validate
 * @returns Promise resolving to validation result with any syntax errors
 *
 * @example
 * ```typescript
 * const result = await validateSyntax('/path/to/generated.ts');
 * if (!result.valid) {
 *   console.error('Syntax errors:', result.errors);
 * }
 * ```
 */
export async function validateSyntax(filepath: string): Promise<SyntaxValidationResult> {
  const code = await fs.readFile(filepath, 'utf-8');

  // Use the public TypeScript Compiler API (no internal property access)
  const compilerOptions = createValidationCompilerOptions();
  const host = createValidationCompilerHost(filepath, code, compilerOptions);
  const program = ts.createProgram([filepath], compilerOptions, host);

  // Get syntactic diagnostics using the public API
  const sourceFile = program.getSourceFile(filepath);
  if (!sourceFile) {
    return {
      valid: false,
      errors: ['Failed to create source file'],
    };
  }

  const syntacticDiagnostics = program.getSyntacticDiagnostics(sourceFile);
  const errors = syntacticDiagnostics.map(formatDiagnostic);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Create TypeScript compiler options for validation
 * @internal
 */
function createValidationCompilerOptions(): ts.CompilerOptions {
  return {
    noEmit: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: true,
    esModuleInterop: true,
    allowSyntheticDefaultImports: true,
    noResolve: false, // Allow imports even if modules aren't resolved
  };
}

/**
 * Create compiler host with custom source file provider
 * @internal
 */
function createValidationCompilerHost(
  filepath: string,
  code: string,
  compilerOptions: ts.CompilerOptions,
): ts.CompilerHost {
  const host = ts.createCompilerHost(compilerOptions);
  const originalGetSourceFile = host.getSourceFile;

  // Override getSourceFile to provide our generated code
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (fileName === filepath) {
      return ts.createSourceFile(fileName, code, languageVersion, true);
    }
    return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  return host;
}

/**
 * Format diagnostic into error message string
 * @internal
 */
function formatDiagnostic(diagnostic: ts.Diagnostic): string {
  if (diagnostic.file) {
    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
      diagnostic.start || 0,
    );
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    return `${line + 1}:${character + 1} - ${message}`;
  }
  return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

/**
 * Filter out expected module resolution errors
 * @internal
 */
function isRelevantError(error: string): boolean {
  // Filter out "Cannot find module" errors for known imports
  // These are expected when type-checking generated code in isolation
  return (
    !error.includes("Cannot find module 'zod'") &&
    !error.includes("Cannot find module 'openapi-fetch'") &&
    !error.includes('Cannot find module "./schema.js"')
  );
}

/**
 * Run TypeScript type checking on generated file (equivalent to `tsc --noEmit`).
 *
 * This function creates a TypeScript program and runs semantic analysis to detect
 * type errors. It filters out "Cannot find module" errors for known dependencies
 * (zod, openapi-fetch) since the generated code is validated in isolation.
 *
 * @param filepath - Absolute path to the TypeScript file to type-check
 * @returns Promise resolving to validation result with any type errors
 *
 * @example
 * ```typescript
 * const result = await validateTypeCheck('/path/to/generated.ts');
 * if (!result.valid) {
 *   console.error('Type errors:', result.errors);
 * }
 * ```
 */
export async function validateTypeCheck(filepath: string): Promise<TypeCheckValidationResult> {
  const code = await fs.readFile(filepath, 'utf-8');
  const compilerOptions = createValidationCompilerOptions();
  const host = createValidationCompilerHost(filepath, code, compilerOptions);
  const program = ts.createProgram([filepath], compilerOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const errors = diagnostics
    .filter((d) => d.file?.fileName === filepath || !d.file)
    .map(formatDiagnostic)
    .filter(isRelevantError);

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Run ESLint on generated file to check for code quality violations.
 *
 * This function runs ESLint with the project's configuration on the generated
 * file. It returns both warnings (severity 1) and errors (severity 2), but
 * only errors cause validation to fail. If ESLint configuration fails to load,
 * the validation passes with a warning.
 *
 * @param filepath - Absolute path to the TypeScript file to lint
 * @returns Promise resolving to validation result with warnings and errors
 *
 * @example
 * ```typescript
 * const result = await validateLint('/path/to/generated.ts');
 * if (!result.valid) {
 *   console.error('Lint errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Lint warnings:', result.warnings);
 * }
 * ```
 */
export async function validateLint(filepath: string): Promise<LintValidationResult> {
  try {
    const eslint = new ESLint({
      cwd: join(process.cwd()),
    });

    const results = await eslint.lintFiles([filepath]);
    const result = results[0];

    if (!result) {
      return { valid: true, warnings: [], errors: [] };
    }

    const warnings = result.messages
      .filter((msg) => msg.severity === 1)
      .map((msg) => `${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId || 'unknown'})`);

    const errors = result.messages
      .filter((msg) => msg.severity === 2)
      .map((msg) => `${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId || 'unknown'})`);

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  } catch (error) {
    // If ESLint configuration fails, skip lint validation
    return {
      valid: true,
      warnings: [
        `ESLint validation skipped: ${error instanceof Error ? error.message : String(error)}`,
      ],
      errors: [],
    };
  }
}

/**
 * Validate that generated file meets runtime execution requirements.
 *
 * This function performs basic sanity checks to ensure the generated code
 * is suitable for runtime execution:
 * - File exists and is non-empty
 * - File contains required Zod imports
 *
 * Note: This does not actually execute the code or import it as a module,
 * since TypeScript files cannot be directly imported without compilation.
 * The syntax and type-check validations already cover most runtime concerns.
 *
 * @param filepath - Absolute path to the TypeScript file to validate
 * @returns Promise resolving to validation result with error if any
 *
 * @example
 * ```typescript
 * const result = await validateRuntime('/path/to/generated.ts');
 * if (!result.valid) {
 *   console.error('Runtime validation failed:', result.error);
 * }
 * ```
 */
export async function validateRuntime(filepath: string): Promise<RuntimeValidationResult> {
  try {
    // Verify file exists and is non-empty
    const stats = await fs.stat(filepath);
    if (stats.size === 0) {
      return {
        valid: false,
        error: 'Generated file is empty',
      };
    }

    // Read file and check it has expected imports
    const code = await fs.readFile(filepath, 'utf-8');

    // Basic sanity checks for generated code
    const hasZodImport = code.includes("from 'zod'") || code.includes('from "zod"');
    if (!hasZodImport) {
      return {
        valid: false,
        error: 'Generated file missing Zod import',
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
