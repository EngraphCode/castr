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
import type { ZodSchemaParser } from './zod-parser.types.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { applyMetaToSchema, extractMetaFromChain } from './zod-parser.meta.js';

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
    if (method.name === 'strict') {
      additionalProperties = false;
    } else if (method.name === 'passthrough') {
      additionalProperties = true;
    } else if (method.name === 'strip') {
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
): CastrSchema | undefined {
  if (!Node.isCallExpression(node)) {
    return undefined;
  }

  const chainInfo = getZodMethodChain(node);
  if (!chainInfo) {
    return undefined;
  }

  const { baseMethod, chainedMethods, baseCallNode } = chainInfo;

  if (baseMethod !== 'object') {
    return undefined;
  }

  if (!baseCallNode) {
    return undefined;
  }

  const additionalProperties = extractStrictness(chainedMethods);
  const propertyNodes = extractObjectProperties(baseCallNode);
  const { properties, required } = extractPropertiesFromNode(propertyNodes, parseSchema);

  const schema: CastrSchema = {
    type: 'object',
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

  return parseObjectZodFromNode(init, parseZodSchemaFromNode);
}
