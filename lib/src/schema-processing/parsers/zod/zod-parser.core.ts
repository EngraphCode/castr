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

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import type { ZodSchemaParser } from './zod-parser.types.js';

/**
 * Parser function type for registry.
 * @internal
 */
type ParserFn = (node: Node, parseSchema: ZodSchemaParser) => CastrSchema | undefined;

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
function tryParser(name: keyof typeof parserRegistry, node: Node): CastrSchema | undefined {
  const parser = parserRegistry[name];
  if (!parser) {
    return undefined;
  }
  return parser(node, parseZodSchemaFromNode);
}

/**
 * Parse an identifier node as either a reference or direct identifier.
 * @internal
 */
function parseIdentifierSchema(node: Node): CastrSchema | undefined {
  return tryParser('identifier', node) ?? tryParser('reference', node);
}

/**
 * Parse a call expression through registered parsers in priority order.
 * @internal
 */
function parseCallExpressionSchema(node: Node): CastrSchema | undefined {
  return (
    tryParser('intersection', node) ??
    tryParser('chainedIntersection', node) ??
    tryParser('reference', node) ??
    tryParser('primitive', node) ??
    tryParser('object', node) ??
    tryParser('composition', node) ??
    tryParser('union', node)
  );
}

/**
 * Parse any Zod schema from a ts-morph Node.
 * Delegates to registered parsers based on the Zod method chain.
 *
 * @internal
 */
export function parseZodSchemaFromNode(node: Node): CastrSchema | undefined {
  if (Node.isIdentifier(node)) {
    return parseIdentifierSchema(node);
  }

  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  return parseCallExpressionSchema(node);
}
