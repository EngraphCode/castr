/**
 * Zod Core Parser Dispatcher
 *
 * Central dispatcher for parsing Zod schemas from AST nodes.
 * Uses a registry pattern to avoid circular dependencies.
 *
 * Parser modules register themselves with this dispatcher,
 * breaking the import cycle.
 *
 * @module parsers/zod/core
 */

import type { CastrSchema } from '../../ir/index.js';
import { Node } from 'ts-morph';
import type { ZodImportResolver } from './registry/zod-import-resolver.js';
import type { ZodParseOptions, ZodSchemaParser } from './zod-parser.types.js';

/**
 * Parser function type for registry.
 * @internal
 */
type ParserFn = (
  node: Node,
  parseSchema: ZodSchemaParser,
  resolver?: ZodImportResolver,
  options?: ZodParseOptions,
) => CastrSchema | undefined;

/**
 * Registry of parser functions.
 * Parsers register themselves here to avoid circular imports.
 * @internal
 */
const parserRegistry: {
  identifier?: ParserFn;
  intersection?: ParserFn;
  chainedIntersection?: ParserFn;
  reference?: ParserFn;
  primitive?: ParserFn;
  object?: ParserFn;
  composition?: ParserFn;
  union?: ParserFn;
} = {};

/**
 * Register a parser function.
 * @internal
 */
export function registerParser(name: keyof typeof parserRegistry, fn: ParserFn): void {
  parserRegistry[name] = fn;
}

/**
 * Try a parser from the registry.
 * @internal
 */
function tryParser(
  name: keyof typeof parserRegistry,
  node: Node,
  resolver?: ZodImportResolver,
  options?: ZodParseOptions,
): CastrSchema | undefined {
  const parser = parserRegistry[name];
  if (!parser) {
    return undefined;
  }
  // Bind the resolver into the parseSchema callback so that
  // recursive calls (e.g. parseSchema(innerNode) in composition parsers)
  // carry the resolver automatically without requiring every caller
  // to thread it explicitly.
  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver, options);
  return parser(node, boundParseSchema, resolver, options);
}

/**
 * Parse an identifier node as either a reference or direct identifier.
 * @internal
 */
function parseIdentifierSchema(
  node: Node,
  resolver?: ZodImportResolver,
  options?: ZodParseOptions,
): CastrSchema | undefined {
  return (
    tryParser('identifier', node, resolver, options) ??
    tryParser('reference', node, resolver, options)
  );
}

/**
 * Parse a call expression through registered parsers in priority order.
 * @internal
 */
function parseCallExpressionSchema(
  node: Node,
  resolver?: ZodImportResolver,
  options?: ZodParseOptions,
): CastrSchema | undefined {
  return (
    tryParser('intersection', node, resolver, options) ??
    tryParser('chainedIntersection', node, resolver, options) ??
    tryParser('reference', node, resolver, options) ??
    tryParser('primitive', node, resolver, options) ??
    tryParser('object', node, resolver, options) ??
    tryParser('composition', node, resolver, options) ??
    tryParser('union', node, resolver, options)
  );
}

/**
 * Parse any Zod schema from a ts-morph Node.
 * Delegates to registered parsers based on the Zod method chain.
 *
 * @internal
 */
export function parseZodSchemaFromNode(
  node: Node,
  resolver?: ZodImportResolver,
  options?: ZodParseOptions,
): CastrSchema | undefined {
  if (Node.isIdentifier(node)) {
    return parseIdentifierSchema(node, resolver, options);
  }

  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  return parseCallExpressionSchema(node, resolver, options);
}
