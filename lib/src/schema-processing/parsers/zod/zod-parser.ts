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

import type { CastrDocument, CastrSchemaComponent, CastrSchemaNode } from '../../ir/schema.js';
import type { ZodParseResult, ZodParseError, ZodParseRecommendation } from './zod-parser.types.js';
import { detectZod3Syntax, detectDynamicSchemas } from './zod-parser.detection.js';
import { createZodProject, findZodSchemaDeclarations } from './zod-ast.js';

// Import parser modules to trigger their registerParser side-effects
// These modules register themselves with the core dispatcher on import
import './zod-parser.primitives.js';
import './zod-parser.object.js';
import './zod-parser.composition.js';
import './zod-parser.union.js';
import './zod-parser.intersection.js';
import './zod-parser.references.js';

// Import core dispatcher for unified schema parsing
import { parseZodSchemaFromNode } from './zod-parser.core.js';
import { deriveComponentName } from './schema-name-registry.js';

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
  return deriveComponentName(variableName);
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
 * Result of parsing a single schema declaration.
 *
 * @internal
 */
interface ParsedDeclaration {
  component: CastrSchemaComponent;
  recommendation: ZodParseRecommendation;
}

interface ParsedDeclarationsResult {
  declarations: ParsedDeclaration[];
  errors: ZodParseError[];
}

type ZodDeclaration = ReturnType<typeof findZodSchemaDeclarations>[number];

function createParsedDeclaration(
  variableName: string,
  schema: CastrSchemaComponent['schema'],
): ParsedDeclaration {
  const name = extractSchemaName(variableName);
  return {
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
  };
}

function buildDeclarationParseError(
  sourceFile: ReturnType<typeof createZodProject>['sourceFile'],
  declaration: ZodDeclaration,
  detail: string,
): ZodParseError {
  const location = sourceFile.getLineAndColumnAtPos(declaration.initializer.getPos());
  return {
    code: 'PARSE_ERROR',
    message:
      `Failed to parse schema declaration "${declaration.name}" at line ${location.line}, ` +
      `column ${location.column}. ${detail}`,
    location: {
      line: location.line,
      column: location.column,
    },
  };
}

/**
 * Parse all schema declarations in source code using ts-morph AST.
 * Per ADR-026, we use proper AST tooling instead of regex.
 *
 * @internal
 */
function parseSchemaDeclarations(source: string): ParsedDeclarationsResult {
  const declarationsList: ParsedDeclaration[] = [];
  const errors: ZodParseError[] = [];
  const { sourceFile, resolver } = createZodProject(source);

  const declarations = findZodSchemaDeclarations(sourceFile, resolver);

  for (const decl of declarations) {
    let schema: CastrSchemaComponent['schema'] | undefined;
    try {
      schema = parseZodSchemaFromNode(decl.initializer, resolver);
    } catch (error) {
      errors.push(buildDeclarationParseError(sourceFile, decl, describeUnknownError(error)));
      continue;
    }

    if (!schema) {
      errors.push(
        buildDeclarationParseError(sourceFile, decl, 'Unsupported or unparseable Zod expression.'),
      );
      continue;
    }

    declarationsList.push(createParsedDeclaration(decl.name, schema));
  }

  return {
    declarations: declarationsList,
    errors,
  };
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
  const parsedDeclarations = parseSchemaDeclarations(source);
  errors.push(...parsedDeclarations.errors);
  const components = parsedDeclarations.declarations.map((d) => d.component);
  const recommendations = parsedDeclarations.declarations.map((d) => d.recommendation);

  // Create IR document
  const ir: CastrDocument = {
    ...createEmptyDocument(),
    components,
    schemaNames: components.map((c) => c.name),
  };

  return { ir, recommendations, errors };
}

function describeUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
