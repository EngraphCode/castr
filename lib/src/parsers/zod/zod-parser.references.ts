/**
 * Zod References and Lazy Parsing
 *
 * Handles parsing of Zod lazy types (z.lazy) and variable references
 * into CastrSchema structures using ts-morph AST (ADR-026 compliant).
 *
 * @module parsers/zod/references
 * @internal
 */

import { type SourceFile, type VariableDeclaration, type Statement, Node } from 'ts-morph';
import type { CastrSchema } from '../../ir/schema.js';
import {
  createZodProject,
  getZodMethodChain,
  isZodCall,
  type ZodMethodChainInfo,
} from './zod-ast.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';
import { parseObjectZod } from './zod-parser.object.js';
import { parseArrayZod, parseEnumZod } from './zod-parser.composition.js';

// ============================================================================
// Common parsing helper
// ============================================================================

/**
 * Parse a Zod expression string into method chain info.
 * @internal
 */
function parseZodExpression(expression: string): ZodMethodChainInfo | undefined {
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  return getZodMethodChain(init);
}

// ============================================================================
// Shared helpers
// ============================================================================

/**
 * Create default metadata for reference schemas.
 * @internal
 */
function createReferenceMetadata(): CastrSchema['metadata'] {
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
 * Parse a schema expression into a CastrSchema.
 * Tries all known schema types.
 * @internal
 */
function parseSchemaExpression(expression: string): CastrSchema | undefined {
  // Try primitive
  const primitive = parsePrimitiveZod(expression);
  if (primitive) {
    return primitive;
  }

  // Try object
  const object = parseObjectZod(expression);
  if (object) {
    return object;
  }

  // Try array
  const array = parseArrayZod(expression);
  if (array) {
    return array;
  }

  // Try enum
  const enumSchema = parseEnumZod(expression);
  if (enumSchema) {
    return enumSchema;
  }

  return undefined;
}

// ============================================================================
// Lazy parsing
// ============================================================================

/**
 * Extract the body expression from a lazy arrow function.
 * @internal
 */
function extractLazyBody(node: Node): string | undefined {
  // Find arrow function argument
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const args = node.getArguments();
  if (args.length === 0) {
    return undefined;
  }

  const firstArg = args[0];
  if (!firstArg || !Node.isArrowFunction(firstArg)) {
    return undefined;
  }

  const body = firstArg.getBody();
  if (!body) {
    return undefined;
  }

  // If block body, we don't support it yet
  if (Node.isBlock(body)) {
    return undefined;
  }

  return body.getText();
}

/**
 * Parse a Zod lazy expression into a CastrSchema.
 *
 * @param expression - A Zod lazy expression string (e.g., 'z.lazy(() => z.object(...))')
 * @returns CastrSchema with the unwrapped schema, or undefined if not a lazy expression
 *
 * @example
 * ```typescript
 * parseLazyZod('z.lazy(() => z.object({ name: z.string() }))');
 * // => { type: 'object', properties: { name: { type: 'string', ... } }, ... }
 * ```
 *
 * @public
 */
export function parseLazyZod(expression: string): CastrSchema | undefined {
  const parsed = parseZodExpression(expression);
  if (!parsed) {
    return undefined;
  }

  const { baseMethod } = parsed;
  if (baseMethod !== 'lazy') {
    return undefined;
  }

  // Get the original call expression to extract the arrow function body
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const bodyExpression = extractLazyBody(init);
  if (!bodyExpression) {
    return undefined;
  }

  // Parse the body expression as a schema
  return parseSchemaExpression(bodyExpression);
}

/**
 * Try to parse a variable declaration as a schema.
 * @internal
 */
function tryParseVariableDeclaration(decl: VariableDeclaration): CastrSchema | undefined {
  const init = decl.getInitializer();
  if (!init) {
    return undefined;
  }

  if (!Node.isCallExpression(init)) {
    return undefined;
  }

  if (!isZodCall(init)) {
    return undefined;
  }

  return parseSchemaExpression(init.getText());
}

/**
 * Find a variable declaration by name in a statement.
 * @internal
 */
function findVariableInStatement(stmt: Statement, variableName: string): CastrSchema | undefined {
  if (!Node.isVariableStatement(stmt)) {
    return undefined;
  }

  for (const decl of stmt.getDeclarationList().getDeclarations()) {
    if (decl.getName() !== variableName) {
      continue;
    }

    const parsed = tryParseVariableDeclaration(decl);
    if (parsed) {
      return parsed;
    }
  }

  return undefined;
}

/**
 * Resolve a variable reference to its schema definition.
 *
 * @param variableName - The variable name to resolve
 * @param sourceFile - The source file to search in
 * @returns CastrSchema with parsed schema or $ref for unresolved references
 *
 * @example
 * ```typescript
 * const source = `const AddressSchema = z.object({ street: z.string() });`;
 * const project = createZodProject(source);
 * const result = resolveVariableReference('AddressSchema', project.getSourceFiles()[0]);
 * // => { type: 'object', properties: { street: { type: 'string', ... } }, ... }
 * ```
 *
 * @public
 */
export function resolveVariableReference(
  variableName: string,
  sourceFile: SourceFile | undefined,
): CastrSchema | undefined {
  if (!sourceFile) {
    return createUnresolvedReference(variableName);
  }

  for (const stmt of sourceFile.getStatements()) {
    const result = findVariableInStatement(stmt, variableName);
    if (result !== undefined) {
      return result;
    }
  }

  return createUnresolvedReference(variableName);
}

/**
 * Create an unresolved reference schema.
 * @internal
 */
function createUnresolvedReference(variableName: string): CastrSchema {
  return {
    $ref: `#/components/schemas/${variableName}`,
    metadata: createReferenceMetadata(),
  };
}
