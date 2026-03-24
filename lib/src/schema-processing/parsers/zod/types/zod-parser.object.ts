/**
 * Zod Object Parser
 *
 * Handles parsing of Zod object schemas, including properties, strictness, and passthrough.
 * Recurses for property schemas via Core Dispatcher.
 *
 * @module parsers/zod/object
 */

import type { CastrSchema } from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain, extractObjectProperties } from '../ast/zod-ast.js';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import type { ZodParseOptions, ZodSchemaParser } from '../zod-parser.types.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import { registerParser, parseZodSchemaFromNode } from '../zod-parser.core.js';
import { applyMetaToSchema, extractMetaFromChain } from '../modifiers/zod-parser.meta.js';
import {
  ZOD_METHOD_STRICT,
  ZOD_METHOD_PASSTHROUGH,
  ZOD_METHOD_STRIP,
  ZOD_METHOD_CATCHALL,
  ZOD_STRICT_OBJECT_METHOD,
  ZOD_SCHEMA_TYPE_OBJECT,
  isZodObjectBaseMethod,
} from '../zod-constants.js';
import { enforceObjectPolicy } from '../policy/zod-parser.object-policy.js';

// ============================================================================
// Helper functions - extracted to reduce complexity
// ============================================================================

/**
 * Determine if an object schema is strict.
 *
 * Under IDENTITY doctrine, only `z.strictObject()` or `z.object().strict()` produce
 * strict schemas. Everything else is non-strict and will be rejected.
 *
 * @internal
 */
function isStrictObjectSchema(
  baseMethod: string,
  chainedMethods: { name: string; argNodes: Node[] }[],
): boolean {
  if (baseMethod === ZOD_STRICT_OBJECT_METHOD) {
    return true;
  }

  // A non-strict base with `.strict()` chained becomes strict
  return chainedMethods.some((m) => m.name === ZOD_METHOD_STRICT);
}

/**
 * Object-mode widening modifiers that contradict a strict base.
 * @internal
 */
const WIDENING_MODIFIERS = new Set([ZOD_METHOD_PASSTHROUGH, ZOD_METHOD_STRIP, ZOD_METHOD_CATCHALL]);

/**
 * Reject contradictory strict-object chains.
 *
 * A chain is contradictory when a strict base (or `.strict()` modifier) is
 * followed by a widening modifier (`.passthrough()`, `.strip()`, `.catchall()`).
 * This produces ambiguous runtime behaviour and violates IDENTITY doctrine.
 *
 * @internal
 */
function rejectContradictoryChains(
  baseMethod: string,
  chainedMethods: { name: string; argNodes: Node[] }[],
  isStrict: boolean,
): void {
  if (!isStrict) {
    return;
  }

  const widener = chainedMethods.find((m) => WIDENING_MODIFIERS.has(m.name));
  if (!widener) {
    return;
  }

  const strictSource = baseMethod === ZOD_STRICT_OBJECT_METHOD ? 'z.strictObject()' : '.strict()';
  throw new Error(
    `Contradictory object chain: ${strictSource} followed by .${widener.name}(). ` +
      'A strict object cannot be widened. Remove the conflicting modifier.',
  );
}

/**
 * Extract properties from object node.
 * @internal
 */
function extractPropertiesFromNode(
  propertyNodes: Map<string, Node> | undefined,
  parseSchema: ZodSchemaParser,
): { properties: Record<string, CastrSchema>; required: string[] } {
  const properties: Record<string, CastrSchema> = {};
  const required: string[] = [];

  if (!propertyNodes) {
    return { properties, required };
  }

  for (const [name, propNode] of propertyNodes) {
    const propSchema = parseSchema(propNode);
    if (!propSchema) {
      throw new Error(
        `Failed to parse property "${name}": unsupported expression. ` +
          'All object properties must be valid Zod schema expressions.',
      );
    }
    properties[name] = propSchema;
    if (propSchema.metadata?.required) {
      required.push(name);
    }
  }

  return { properties, required };
}

/**
 * Parse a Zod object expression from a ts-morph Node.
 * @internal
 */
export function parseObjectZodFromNode(
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

  const { baseMethod, chainedMethods, baseCallNode } = chainInfo;

  if (!isZodObjectBaseMethod(baseMethod)) {
    return undefined;
  }

  if (!baseCallNode) {
    return undefined;
  }

  const isStrict = isStrictObjectSchema(baseMethod, chainedMethods);
  rejectContradictoryChains(baseMethod, chainedMethods, isStrict);
  const propertyNodes = extractObjectProperties(baseCallNode, resolver);
  const { properties, required } = extractPropertiesFromNode(propertyNodes, parseSchema);

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_OBJECT,
    properties: new CastrSchemaProperties(properties),
    required,
    additionalProperties: false,
    metadata: createDefaultMetadata(),
  };

  applyMetaToSchema(schema, extractMetaFromChain(chainedMethods));
  enforceObjectPolicy(schema, baseMethod, isStrict);

  return schema;
}

// Register this parser with the core dispatcher
registerParser('object', parseObjectZodFromNode);

/**
 * Parse a Zod object expression string.
 * Wrapper for string input.
 *
 * @internal
 */
export function parseObjectZod(
  expression: string,
  options?: ZodParseOptions,
): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver, options);
  return parseObjectZodFromNode(init, boundParseSchema, resolver);
}
