/**
 * Zod Object Parser
 *
 * Handles parsing of Zod object schemas, including properties, strictness, and passthrough.
 * Recurses for property schemas via Core Dispatcher.
 *
 * @module parsers/zod/object
 */

import type { CastrSchema, IRUnknownKeyBehavior } from '../../../ir/index.js';
import { CastrSchemaProperties } from '../../../ir/index.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain, extractObjectProperties } from '../ast/zod-ast.js';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import type { ZodSchemaParser } from '../zod-parser.types.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import { registerParser, parseZodSchemaFromNode } from '../zod-parser.core.js';
import { applyMetaToSchema, extractMetaFromChain } from '../modifiers/zod-parser.meta.js';
import {
  ZOD_METHOD_CATCHALL,
  ZOD_METHOD_PASSTHROUGH,
  ZOD_METHOD_STRICT,
  ZOD_METHOD_STRIP,
  ZOD_OBJECT_METHOD,
  ZOD_SCHEMA_TYPE_OBJECT,
} from '../zod-constants.js';

// ============================================================================
// Helper functions - extracted to reduce complexity
// ============================================================================

/**
 * Extract object unknown-key behavior from chained methods.
 *
 * Maps Zod object semantics to IR runtime behavior plus portable
 * `additionalProperties` semantics:
 * - `.strict()` → reject unknown keys
 * - `.passthrough()` → accept and preserve unknown keys
 * - `.strip()` / default → accept and strip unknown keys
 * - `.catchall(schema)` → accept, validate, and preserve unknown keys
 *
 * @internal
 */
function extractUnknownKeyConfiguration(
  chainedMethods: { name: string; argNodes: Node[] }[],
  parseSchema: ZodSchemaParser,
): {
  additionalProperties: boolean | CastrSchema;
  unknownKeyBehavior: IRUnknownKeyBehavior;
} {
  let configuration: {
    additionalProperties: boolean | CastrSchema;
    unknownKeyBehavior: IRUnknownKeyBehavior;
  } = {
    additionalProperties: true,
    unknownKeyBehavior: { mode: 'strip' },
  };

  for (const method of chainedMethods) {
    configuration = applyUnknownKeyMethodConfiguration(configuration, method, parseSchema);
  }

  return configuration;
}

function applyUnknownKeyMethodConfiguration(
  configuration: {
    additionalProperties: boolean | CastrSchema;
    unknownKeyBehavior: IRUnknownKeyBehavior;
  },
  method: { name: string; argNodes: Node[] },
  parseSchema: ZodSchemaParser,
): {
  additionalProperties: boolean | CastrSchema;
  unknownKeyBehavior: IRUnknownKeyBehavior;
} {
  switch (method.name) {
    case ZOD_METHOD_STRICT:
      return {
        additionalProperties: false,
        unknownKeyBehavior: { mode: 'strict' },
      };
    case ZOD_METHOD_PASSTHROUGH:
      return {
        additionalProperties: true,
        unknownKeyBehavior: { mode: 'passthrough' },
      };
    case ZOD_METHOD_STRIP:
      return {
        additionalProperties: true,
        unknownKeyBehavior: { mode: 'strip' },
      };
    case ZOD_METHOD_CATCHALL:
      return parseCatchallUnknownKeyConfiguration(method.argNodes, parseSchema);
    default:
      return configuration;
  }
}

function parseCatchallUnknownKeyConfiguration(
  argNodes: Node[],
  parseSchema: ZodSchemaParser,
): {
  additionalProperties: CastrSchema;
  unknownKeyBehavior: IRUnknownKeyBehavior;
} {
  const catchallNode = argNodes[0];
  if (!catchallNode) {
    throw new Error('z.object().catchall() requires a schema argument.');
  }

  const catchallSchema = parseSchema(catchallNode);
  if (!catchallSchema) {
    throw new Error('Unsupported or unparseable Zod .catchall() schema.');
  }

  return {
    additionalProperties: catchallSchema,
    unknownKeyBehavior: {
      mode: 'catchall',
      schema: catchallSchema,
    },
  };
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
      continue;
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

  if (baseMethod !== ZOD_OBJECT_METHOD) {
    return undefined;
  }

  if (!baseCallNode) {
    return undefined;
  }

  const { additionalProperties, unknownKeyBehavior } = extractUnknownKeyConfiguration(
    chainedMethods,
    parseSchema,
  );
  const propertyNodes = extractObjectProperties(baseCallNode, resolver);
  const { properties, required } = extractPropertiesFromNode(propertyNodes, parseSchema);

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_OBJECT,
    properties: new CastrSchemaProperties(properties),
    required,
    additionalProperties,
    unknownKeyBehavior,
    metadata: createDefaultMetadata(),
  };

  applyMetaToSchema(schema, extractMetaFromChain(chainedMethods));

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
export function parseObjectZod(expression: string): CastrSchema | undefined {
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseObjectZodFromNode(init, boundParseSchema, resolver);
}
