/**
 * Zod Reference Parser
 *
 * Handles parsing of references (Identifiers) and recursion (z.lazy).
 *
 * @module parsers/zod/references
 */

import type { CastrSchema } from '../../../ir/index.js';
import {
  type ArrowFunction,
  type CallExpression,
  type FunctionExpression,
  type Identifier,
  Node,
} from 'ts-morph';
import { createZodProject, getZodMethodChain } from '../ast/zod-ast.js';
import type { ZodImportResolver } from './zod-import-resolver.js';
import type { ZodSchemaParser } from '../zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from '../zod-parser.core.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import { ZOD_METHOD_LAZY } from '../zod-constants.js';
import { deriveComponentName } from './schema-name-registry.js';
import {
  buildWrappedReferenceSchema,
  classifyReferenceWrapper,
  type ReferenceWrapperMethod,
} from './zod-parser.reference-wrappers.js';

const COMPONENT_SCHEMA_REF_PREFIX = '#/components/schemas/';

// ============================================================================
// Helper functions - extracted to reduce complexity and nesting
// ============================================================================

/**
 * Resolve an identifier node to its canonical component $ref.
 * @internal
 */
function getIdentifierRef(node: Identifier): string | undefined {
  const symbol = node.getSymbol();
  const symbolName = symbol?.getName();
  if (!symbolName) {
    return undefined;
  }

  // Declaration proof: verify the identifier's declaration site has a call expression
  // initializer (i.e., it looks like a Zod schema constructor call, not a bare value).
  const declarations = symbol?.getDeclarations() ?? [];
  const hasCallInitializer = declarations.some((decl) => {
    if (!Node.isVariableDeclaration(decl)) {
      return false;
    }
    const init = decl.getInitializer();
    return init !== undefined && Node.isCallExpression(init);
  });

  if (!hasCallInitializer) {
    return undefined;
  }

  const componentName = deriveComponentName(symbolName);
  return `${COMPONENT_SCHEMA_REF_PREFIX}${componentName}`;
}

/**
 * Handle identifier references to other schemas.
 * @internal
 */
function handleIdentifier(node: Identifier): CastrSchema | undefined {
  const ref = getIdentifierRef(node);
  if (!ref) {
    return undefined;
  }

  return {
    $ref: ref,
    metadata: createDefaultMetadata(),
  };
}

interface ReferenceWrapperChain {
  identifier: Identifier;
  wrapperMethods: ReferenceWrapperMethod[];
}

function extractReferenceWrapperCall(
  node: Node,
): { innerExpression: Node; wrapperMethod: ReferenceWrapperMethod } | undefined {
  if (!Node.isCallExpression(node) || node.getArguments().length > 0) {
    return undefined;
  }

  const expression = node.getExpression();
  if (!Node.isPropertyAccessExpression(expression)) {
    return undefined;
  }

  const wrapperMethod = classifyReferenceWrapper(expression.getName());
  if (!wrapperMethod) {
    return undefined;
  }

  return {
    innerExpression: expression.getExpression(),
    wrapperMethod,
  };
}

function extractReferenceWrapperTarget(node: Node): ReferenceWrapperChain | undefined {
  if (Node.isIdentifier(node)) {
    return {
      identifier: node,
      wrapperMethods: [],
    };
  }

  if (Node.isCallExpression(node)) {
    return extractReferenceWrapperChain(node);
  }

  return undefined;
}

function extractReferenceWrapperChain(node: CallExpression): ReferenceWrapperChain | undefined {
  const wrapperCall = extractReferenceWrapperCall(node);
  if (!wrapperCall) {
    return undefined;
  }

  const target = extractReferenceWrapperTarget(wrapperCall.innerExpression);
  if (!target) {
    return undefined;
  }

  return {
    identifier: target.identifier,
    wrapperMethods: [...target.wrapperMethods, wrapperCall.wrapperMethod],
  };
}

/**
 * Handle identifier-rooted wrapper calls like `TreeNodeSchema.optional()`.
 * @internal
 */
function handleWrappedIdentifierCall(node: Node): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const wrappedReference = extractReferenceWrapperChain(node);
  if (!wrappedReference) {
    return undefined;
  }

  const ref = getIdentifierRef(wrappedReference.identifier);
  if (!ref) {
    return undefined;
  }

  return buildWrappedReferenceSchema(ref, wrappedReference.wrapperMethods);
}

/**
 * Extract schema from arrow function concise body.
 * @internal
 */
function extractFromConciseBody(body: Node, parseSchema: ZodSchemaParser): CastrSchema | undefined {
  if (!Node.isExpression(body)) {
    return undefined;
  }
  return parseSchema(body);
}

/**
 * Extract schema from function block body.
 * @internal
 */
function extractFromBlockBody(body: Node, parseSchema: ZodSchemaParser): CastrSchema | undefined {
  if (!Node.isBlock(body)) {
    return undefined;
  }

  const returnStat = body.getStatement((s) => Node.isReturnStatement(s));
  if (!Node.isReturnStatement(returnStat)) {
    return undefined;
  }

  const expr = returnStat.getExpression();
  if (!expr) {
    return undefined;
  }

  return parseSchema(expr);
}

function extractLazyCallback(baseArgNodes: Node[]): ArrowFunction | FunctionExpression | undefined {
  const callback = baseArgNodes[0];
  if (!callback) {
    return undefined;
  }

  if (!Node.isArrowFunction(callback) && !Node.isFunctionExpression(callback)) {
    return undefined;
  }

  return callback;
}

/**
 * Handle z.lazy(() => Schema) calls.
 * @internal
 */
function handleLazy(
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }
  if (!resolver) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node, resolver);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, baseArgNodes } = chainInfo;

  if (baseMethod !== ZOD_METHOD_LAZY) {
    return undefined;
  }

  const callback = extractLazyCallback(baseArgNodes);
  if (!callback) {
    return undefined;
  }

  const body = callback.getBody();

  // Try concise body first, then block body
  return extractFromConciseBody(body, parseSchema) ?? extractFromBlockBody(body, parseSchema);
}

// ============================================================================
// Main exports
// ============================================================================

/**
 * Parse a Zod reference or lazy schema from a ts-morph Node.
 * @internal
 */
export function parseReferenceZodFromNode(
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
): CastrSchema | undefined {
  // Handle Identifiers (References to other schemas)
  if (Node.isIdentifier(node)) {
    return handleIdentifier(node);
  }

  const wrappedIdentifierReference = handleWrappedIdentifierCall(node);
  if (wrappedIdentifierReference) {
    return wrappedIdentifierReference;
  }

  // Handle z.lazy(() => Schema)
  return handleLazy(node, parseSchema, resolver);
}

// Register this parser with the core dispatcher
registerParser('reference', parseReferenceZodFromNode);
registerParser('identifier', parseReferenceZodFromNode);

/**
 * Parse a Zod reference expression string.
 * @internal
 */
export function parseReferenceZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseReferenceZodFromNode(init, boundParseSchema, resolver);
}
