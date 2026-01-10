/**
 * Zod Source Parser
 *
 * Main entry point for parsing Zod source code into the canonical IR.
 * Combines detection, primitive parsing, object parsing, and naming.
 *
 * @module parsers/zod/parser
 *
 * @example
 * ```typescript
 * import { parseZodSource } from './zod-parser.ts';
 *
 * const result = parseZodSource(`
 *   export const UserSchema = z.object({
 *     name: z.string(),
 *     age: z.number(),
 *   });
 * `);
 *
 * console.log(result.ir.components); // [{ type: 'schema', name: 'User', ... }]
 * ```
 */

import type {
  CastrDocument,
  CastrSchemaComponent,
  CastrSchema,
  CastrSchemaNode,
} from '../../context/ir-schema.js';
import type { ZodParseResult, ZodParseError, ZodParseRecommendation } from './zod-parser.types.js';
import { detectZod3Syntax, detectDynamicSchemas } from './zod-parser.detection.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';
import { parseObjectZod } from './zod-parser.object.js';

/**
 * Regular expression to match schema variable declarations.
 *
 * Matches patterns like:
 * - `const UserSchema = z.object(...)`
 * - `export const ProductSchema = z.string()`
 * - `const mySchema = z.number()`
 *
 * Captures:
 * - Group 1: Variable name
 * - Group 2: Zod expression
 *
 * @internal
 */
const SCHEMA_DECLARATION_PATTERN =
  /(?:export\s+)?(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(z\.[a-zA-Z]+\s*\([^;]*\))/g;

/**
 * Extract schema name from a variable name.
 *
 * Removes common suffixes like 'Schema' to produce cleaner component names.
 *
 * @param variableName - The variable name (e.g., 'UserSchema', 'productSchema')
 * @returns Clean schema name (e.g., 'User', 'product')
 *
 * @example
 * ```typescript
 * extractSchemaName('UserSchema');     // 'User'
 * extractSchemaName('productSchema');  // 'product'
 * extractSchemaName('myThing');        // 'myThing'
 * ```
 *
 * @public
 */
export function extractSchemaName(variableName: string): string {
  // Remove 'Schema' suffix (case-sensitive, only if not the entire name)
  if (variableName.endsWith('Schema') && variableName.length > 6) {
    return variableName.slice(0, -6);
  }
  if (variableName.endsWith('schema') && variableName.length > 6) {
    return variableName.slice(0, -6);
  }
  return variableName;
}

/**
 * Create empty IR document.
 *
 * @returns Empty CastrDocument structure
 *
 * @internal
 */
function createEmptyDocument(): CastrDocument {
  return {
    version: '1.0.0',
    openApiVersion: '3.1.0',
    info: {
      title: 'Parsed from Zod',
      version: '1.0.0',
    },
    servers: [],
    components: [],
    operations: [],
    schemaNames: [],
    dependencyGraph: {
      nodes: new Map(),
      topologicalOrder: [],
      circularReferences: [],
    },
    enums: new Map(),
  };
}

/**
 * Create default metadata for a schema node.
 *
 * @internal
 */
function createDefaultMetadata(): CastrSchemaNode {
  return {
    required: true,
    nullable: false,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

/**
 * Parse a Zod expression and return a CastrSchema.
 *
 * @param expression - Zod expression string
 * @returns Parsed schema or undefined if not recognized
 *
 * @internal
 */
function parseZodExpression(expression: string): CastrSchema | undefined {
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  const object = parseObjectZod(expression);
  if (object) {
    return object;
  }

  return undefined;
}

/**
 * Result of parsing a single schema declaration.
 *
 * @internal
 */
interface ParsedDeclaration {
  component: CastrSchemaComponent;
  recommendation: ZodParseRecommendation;
}

/**
 * Parse all schema declarations in source code.
 *
 * @internal
 */
function parseSchemaDeclarations(source: string): ParsedDeclaration[] {
  const results: ParsedDeclaration[] = [];
  const declarationPattern = new RegExp(SCHEMA_DECLARATION_PATTERN.source, 'g');
  let match: RegExpExecArray | null;

  while ((match = declarationPattern.exec(source)) !== null) {
    const variableName = match[1];
    const zodExpression = match[2];

    if (variableName === undefined || zodExpression === undefined) {
      continue;
    }

    const schema = parseZodExpression(zodExpression);
    if (!schema) {
      continue;
    }

    const name = extractSchemaName(variableName);
    results.push({
      component: {
        type: 'schema',
        name,
        schema,
        metadata: createDefaultMetadata(),
      },
      recommendation: {
        schemaName: name,
        field: 'description',
        reason: `No .describe() found on ${variableName}. Consider adding a description.`,
        suggestedValue: `Description for ${name}`,
      },
    });
  }

  return results;
}

/**
 * Parse Zod source code into the canonical Intermediate Representation.
 *
 * This is the main entry point for Zod → IR parsing. It:
 * 1. Detects and rejects Zod 3 syntax
 * 2. Detects and reports dynamic schemas
 * 3. Parses schema declarations
 * 4. Extracts component names from variable names
 * 5. Generates recommendations for missing metadata
 *
 * @param source - TypeScript/JavaScript source code containing Zod schemas
 * @returns ParseResult with IR, recommendations, and errors
 *
 * @example
 * ```typescript
 * const result = parseZodSource(`
 *   export const UserSchema = z.object({
 *     name: z.string(),
 *   });
 * `);
 *
 * if (result.errors.length === 0) {
 *   console.log('Parsed schemas:', result.ir.components.length);
 * }
 * ```
 *
 * @public
 */
export function parseZodSource(source: string): ZodParseResult {
  // Detect Zod 3 syntax and dynamic schemas
  const errors: ZodParseError[] = [...detectZod3Syntax(source), ...detectDynamicSchemas(source)];

  // Parse all schema declarations
  const declarations = parseSchemaDeclarations(source);
  const components = declarations.map((d) => d.component);
  const recommendations = declarations.map((d) => d.recommendation);

  // Create IR document
  const ir: CastrDocument = {
    ...createEmptyDocument(),
    components,
    schemaNames: components.map((c) => c.name),
  };

  return { ir, recommendations, errors };
}
