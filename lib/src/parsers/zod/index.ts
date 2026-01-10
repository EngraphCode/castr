/**
 * Zod Parser Module
 *
 * Parses Zod 4 source code into the canonical Intermediate Representation (IR).
 * Implements strict validation with fail-fast behavior for Zod 3 syntax and
 * dynamic schemas.
 *
 * @module parsers/zod
 *
 * @example
 * ```typescript
 * import { parseZodSource } from '@engraph/castr/parsers/zod';
 *
 * const result = await parseZodSource(`
 *   export const UserSchema = z.object({
 *     id: z.string().uuid(),
 *     name: z.string().min(1),
 *   });
 * `);
 *
 * console.log(result.ir.components); // [{ type: 'schema', name: 'User', ... }]
 * ```
 *
 * @packageDocumentation
 */

// Type exports
export type {
  ZodParseResult,
  ZodParseError,
  ZodParseErrorCode,
  ZodParseRecommendation,
  ZodRecommendationField,
  ZodParseOptions,
} from './zod-parser.types.js';

// Main parser exports
export { parseZodSource, extractSchemaName } from './zod-parser.js';

// Detection exports
export { detectZod3Syntax, detectDynamicSchemas, isZod3Method } from './zod-parser.detection.js';

// Primitive parsing exports
export { parsePrimitiveZod } from './zod-parser.primitives.js';

// Object parsing exports
export { parseObjectZod } from './zod-parser.object.js';

// AST utilities (Session 2.3 - ADR-026)
export {
  createZodProject,
  isZodCall,
  getZodMethodChain,
  extractObjectProperties,
  findZodSchemaDeclarations,
  type ZodMethodChainInfo,
  type ZodMethodCall,
} from './zod-ast.js';
