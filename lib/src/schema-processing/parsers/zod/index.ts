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
export {
  type ZodParseResult,
  type ZodParseError,
  type ZodParseErrorCode,
  type ZodParseRecommendation,
  type ZodRecommendationField,
  type ZodParseOptions,
  type ZodSchemaParser,
} from './zod-parser.types.js';

// Main parser exports
export { parseZodSource, extractSchemaName } from './zod-parser.js';

// Detection exports
export { detectZod3Syntax, detectDynamicSchemas, isZod3Method } from './zod-parser.detection.js';

// Primitive parsing exports
export { parsePrimitiveZod } from './types/index.js';

// Object parsing exports
export { parseObjectZod } from './types/index.js';

// Composition parsing exports (Session 2.3)
export { parseCompositionZodFromNode } from './composition/index.js';

// Union parsing exports (Session 2.3)
export { parseUnionZodFromNode } from './composition/index.js';

// Intersection parsing exports (Session 2.3)
export {
  parseIntersectionZodFromNode,
  parseChainedIntersectionFromNode,
} from './composition/index.js';

// Reference parsing exports (Session 2.3)
export { parseReferenceZodFromNode } from './registry/index.js';

// Endpoint parsing exports (Session 2.4)
export { parseEndpointDefinition, buildCastrOperationFromEndpoint } from './endpoints/index.js';

// Endpoint type exports (Session 2.4)
export {
  type EndpointDefinition,
  type EndpointParameters,
  type EndpointResponses,
  type EndpointMethod,
  type ParameterLocation,
  type EndpointParseResult,
  type EndpointParseError,
} from './endpoints/index.js';

// AST utilities (Session 2.3 - ADR-026)
export {
  createZodProject,
  isZodCall,
  getZodMethodChain,
  extractObjectProperties,
  findZodSchemaDeclarations,
  ZodImportResolver,
  ZOD_PRIMITIVES,
  ZOD_COMPOSITIONS,
  ZOD_OBJECT_METHOD,
  type ZodMethodChainInfo,
  type ZodMethodCall,
  type ZodProjectResult,
  type ZodPrimitiveType,
  type ZodCompositionType,
} from './ast/index.js';
