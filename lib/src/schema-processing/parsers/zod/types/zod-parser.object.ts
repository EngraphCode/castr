/**
 * Zod Object Parser
 *
 * Handles parsing of Zod object schemas, including properties, strictness, and passthrough.
 * Recurses for property schemas via Core Dispatcher.
 *
 * @module parsers/zod/object
 */

import type { CallExpression } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  getZodMethodChain,
  extractObjectProperties,
  type ZodMethodCall,
} from '../ast/zod-ast.js';
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
import { resolveCatchallAdditionalProperties } from '../policy/zod-parser.object.catchall.js';

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
function isStrictObjectSchema(baseMethod: string, chainedMethods: ZodMethodCall[]): boolean {
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
const WIDENING_MODIFIERS = new Set([ZOD_METHOD_PASSTHROUGH, ZOD_METHOD_STRIP]);

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
  chainedMethods: ZodMethodCall[],
  isStrict: boolean,
): void {
  if (!isStrict) {
    return;
  }

  const strictSource = baseMethod === ZOD_STRICT_OBJECT_METHOD ? 'z.strictObject()' : '.strict()';
  const catchallMethod = findCatchallMethod(chainedMethods);
  if (catchallMethod) {
    throw new Error(
      `Contradictory object chain: ${strictSource} followed by .${catchallMethod.name}(). ` +
        'A strict object cannot also carry catchall semantics. Remove the conflicting modifier.',
    );
  }

  const widener = chainedMethods.find((m) => WIDENING_MODIFIERS.has(m.name));
  if (!widener) {
    return;
  }

  throw new Error(
    `Contradictory object chain: ${strictSource} followed by .${widener.name}(). ` +
      'A strict object cannot be widened. Remove the conflicting modifier.',
  );
}

function findCatchallMethod(chainedMethods: ZodMethodCall[]): ZodMethodCall | undefined {
  return chainedMethods.find((method) => method.name === ZOD_METHOD_CATCHALL);
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
  const chainInfo = getObjectChainInfo(node, resolver);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, chainedMethods, baseCallNode, resolver: resolvedResolver } = chainInfo;
  const isStrict = isStrictObjectSchema(baseMethod, chainedMethods);
  const catchallMethod = findCatchallMethod(chainedMethods);
  const hasWideningModifier = chainedMethods.some((method) => WIDENING_MODIFIERS.has(method.name));
  rejectContradictoryChains(baseMethod, chainedMethods, isStrict);
  const propertyNodes = extractObjectProperties(baseCallNode, resolvedResolver);
  const { properties, required } = extractPropertiesFromNode(propertyNodes, parseSchema);
  const additionalProperties =
    catchallMethod === undefined
      ? false
      : resolveCatchallAdditionalProperties(catchallMethod, parseSchema, resolvedResolver);

  const schema: CastrSchema = buildObjectSchema(properties, required, additionalProperties);

  applyMetaToSchema(schema, extractMetaFromChain(chainedMethods));
  enforceObjectPolicy(
    schema,
    baseMethod,
    isStrict,
    catchallMethod !== undefined,
    hasWideningModifier,
  );

  return schema;
}

function getObjectChainInfo(
  node: Node,
  resolver: ZodImportResolver | undefined,
):
  | {
      baseMethod: string;
      chainedMethods: ZodMethodCall[];
      baseCallNode: CallExpression;
      resolver: ZodImportResolver;
    }
  | undefined {
  if (!Node.isCallExpression(node) || !resolver) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node, resolver);
  if (!chainInfo || !isZodObjectBaseMethod(chainInfo.baseMethod) || !chainInfo.baseCallNode) {
    return undefined;
  }

  return {
    baseMethod: chainInfo.baseMethod,
    chainedMethods: chainInfo.chainedMethods,
    baseCallNode: chainInfo.baseCallNode,
    resolver,
  };
}

function buildObjectSchema(
  properties: Record<string, CastrSchema>,
  required: string[],
  additionalProperties: boolean | CastrSchema,
): CastrSchema {
  return {
    type: ZOD_SCHEMA_TYPE_OBJECT,
    properties: new CastrSchemaProperties(properties),
    required,
    additionalProperties,
    metadata: createDefaultMetadata(),
  };
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
