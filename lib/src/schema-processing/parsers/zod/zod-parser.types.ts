/**
 * Zod Parser Type Definitions
 *
 * Type definitions for the Zod → IR parser. These types define the
 * structure of parse results, recommendations, and errors.
 *
 * @module parsers/zod/types
 * @see {@link parseZodSource} for the main entry point
 *
 * @example
 * ```typescript
 * import type { ZodParseResult, ZodParseError } from './zod-parser.types.js';
 *
 * const result: ZodParseResult = await parseZodSource(source);
 * if (result.errors.length > 0) {
 *   console.error('Parse errors:', result.errors);
 * }
 * ```
 */

import type { CastrSchema, CastrDocument } from '../../ir/index.js';
import type { Node } from 'ts-morph';
import type { ZodImportResolver } from './registry/zod-import-resolver.js';

/**
 * Callback type for recursive schema parsing.
 *
 * Used to break circular dependencies between parser modules.
 * Each parser accepts this callback instead of importing the core dispatcher.
 *
 * @internal
 */
export type ZodSchemaParser = (node: Node, resolver?: ZodImportResolver) => CastrSchema | undefined;

/**
 * Error codes for Zod parser failures.
 *
 * These codes enable programmatic error handling and provide
 * specific guidance for each failure mode.
 *
 * @public
 */
export type ZodParseErrorCode =
  /** Zod 3 syntax detected (e.g., .nonempty(), .nonnegative()) */
  | 'ZOD3_SYNTAX'
  /** Dynamic or computed schema that cannot be statically analyzed */
  | 'DYNAMIC_SCHEMA'
  /** General parse error */
  | 'PARSE_ERROR'
  /** Unsupported Zod feature */
  | 'UNSUPPORTED_FEATURE';

/**
 * A parse error encountered during Zod source analysis.
 *
 * Provides actionable error messages with location information
 * and specific error codes for programmatic handling.
 *
 * @example
 * ```typescript
 * const error: ZodParseError = {
 *   message: "Zod 3 method '.nonempty()' is not supported. Use '.min(1)' instead.",
 *   code: 'ZOD3_SYNTAX',
 *   location: { line: 5, column: 20 },
 * };
 * ```
 *
 * @public
 */
export interface ZodParseError {
  /**
   * Human-readable error message with actionable guidance.
   */
  message: string;

  /**
   * Error classification code for programmatic handling.
   */
  code: ZodParseErrorCode;

  /**
   * Source location where the error occurred.
   * May be undefined for errors not tied to specific source location.
   */
  location?: {
    /** 1-indexed line number */
    line: number;
    /** 1-indexed column number */
    column: number;
  };
}

/**
 * Fields that can be recommended for metadata enrichment.
 *
 * @public
 */
export type ZodRecommendationField = 'title' | 'description';

/**
 * A recommendation for improving schema metadata.
 *
 * When Zod schemas lack metadata (e.g., no `.describe()` call),
 * the parser generates deterministic recommendations rather than
 * AI-generated content.
 *
 * @example
 * ```typescript
 * const recommendation: ZodParseRecommendation = {
 *   schemaName: 'User',
 *   field: 'description',
 *   reason: "No .describe() found. Consider adding: z.object({...}).describe('User account information')",
 * };
 * ```
 *
 * @public
 */
export interface ZodParseRecommendation {
  /**
   * Name of the schema this recommendation applies to.
   */
  schemaName: string;

  /**
   * The metadata field that could be improved.
   */
  field: ZodRecommendationField;

  /**
   * Explanation of why this recommendation is made and how to address it.
   */
  reason: string;

  /**
   * Suggested value if derivable (e.g., from variable name).
   */
  suggestedValue?: string;
}

/**
 * Result of parsing Zod source code into IR.
 *
 * Contains the parsed IR document, any recommendations for improvement,
 * and any errors encountered during parsing.
 *
 * @example Success case
 * ```typescript
 * const result = await parseZodSource(`
 *   export const UserSchema = z.object({
 *     name: z.string(),
 *   });
 * `);
 *
 * if (result.errors.length === 0) {
 *   console.log('Parsed schemas:', result.ir.components.length);
 *   console.log('Recommendations:', result.recommendations.length);
 * }
 * ```
 *
 * @example Error case
 * ```typescript
 * const result = await parseZodSource(`
 *   export const OldSchema = z.string().nonempty(); // Zod 3!
 * `);
 *
 * if (result.errors.length > 0) {
 *   for (const error of result.errors) {
 *     console.error(`[${error.code}] ${error.message}`);
 *   }
 * }
 * ```
 *
 * @public
 */
export interface ZodParseResult {
  /**
   * The parsed Intermediate Representation document.
   *
   * Contains components (schemas) extracted from the Zod source.
   * Will have empty components if parsing failed.
   */
  ir: CastrDocument;

  /**
   * Recommendations for improving schema metadata.
   *
   * Generated when schemas lack descriptions or other metadata.
   * These are suggestions, not errors.
   */
  recommendations: ZodParseRecommendation[];

  /**
   * Errors encountered during parsing.
   *
   * If non-empty, the IR may be incomplete or invalid.
   * Errors are ordered by source location when available.
   */
  errors: ZodParseError[];
}

/**
 * Options for the Zod parser.
 *
 * @public
 */
export interface ZodParseOptions {
  /**
   * Whether to generate recommendations for missing metadata.
   *
   * @defaultValue true
   */
  generateRecommendations?: boolean;

  /**
   * Whether to fail fast on first error or collect all errors.
   *
   * @defaultValue false (collect all errors)
   */
  failFast?: boolean;
}
