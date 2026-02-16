/**
 * Zod Object Parser
 *
 * Handles parsing of Zod object schemas, including properties, strictness, and passthrough.
 * Recurses for property schemas via Core Dispatcher.
 *
 * @module parsers/zod/object
 */

import type { CastrSchema } from '../../ir/schema.js';
import { CastrSchemaProperties } from '../../ir/schema-properties.js';
import { Node } from 'ts-morph';
import { createZodProject, getZodMethodChain, extractObjectProperties } from './zod-ast.js';
import type { ZodImportResolver } from './zod-import-resolver.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { applyMetaToSchema, extractMetaFromChain } from './zod-parser.meta.js';
import {
  ZOD_METHOD_PASSTHROUGH,
  ZOD_METHOD_STRICT,
  ZOD_METHOD_STRIP,
  ZOD_OBJECT_METHOD,
  ZOD_SCHEMA_TYPE_OBJECT,
} from './zod-constants.js';

// ============================================================================
// Helper functions - extracted to reduce complexity
// ============================================================================

/**
 * Extract strictness/additionalProperties from chained methods.
 * @internal
 */
function extractStrictness(chainedMethods: { name: string }[]): boolean | undefined {
  let additionalProperties: boolean | undefined = undefined;

  for (const method of chainedMethods) {
    if (method.name === ZOD_METHOD_STRICT) {
      additionalProperties = false;
    } else if (method.name === ZOD_METHOD_PASSTHROUGH) {
      additionalProperties = true;
    } else if (method.name === ZOD_METHOD_STRIP) {
      additionalProperties = undefined;
    }
  }

  return additionalProperties;
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

  const additionalProperties = extractStrictness(chainedMethods);
  const propertyNodes = extractObjectProperties(baseCallNode, resolver);
  const { properties, required } = extractPropertiesFromNode(propertyNodes, parseSchema);

  const schema: CastrSchema = {
    type: ZOD_SCHEMA_TYPE_OBJECT,
    properties: new CastrSchemaProperties(properties),
    required,
    metadata: createDefaultMetadata(),
  };

  if (additionalProperties !== undefined) {
    schema.additionalProperties = additionalProperties;
  }

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
