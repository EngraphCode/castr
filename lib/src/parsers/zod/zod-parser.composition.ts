/**
 * Zod Composition Parser
 *
 * Handles parsing of Zod composition schemas: array, tuple, enum.
 *
 * @module parsers/zod/composition
 */

import type { CastrSchema } from '../../ir/schema.js';
import { Node } from 'ts-morph';
import {
  createZodProject,
  getZodMethodChain,
  type ZodMethodCall,
  extractLiteralValue,
} from './zod-ast.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';

// ============================================================================
// Helper functions - extracted to reduce complexity
// ============================================================================

/**
 * Parse z.array(T)
 */
function parseArray(
  args: Node[],
  chainedMethods: ZodMethodCall[],
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }

  const itemArg = args[0];
  if (!itemArg) {
    return undefined;
  }

  const itemSchema = parseSchema(itemArg);
  if (!itemSchema) {
    return undefined;
  }

  const schema: CastrSchema = {
    type: 'array',
    items: itemSchema,
    metadata: createDefaultMetadata(),
  };

  applyArrayConstraints(schema, chainedMethods);
  return schema;
}

/**
 * Apply array constraints from method chain.
 */
function applyArrayConstraints(schema: CastrSchema, methods: ZodMethodCall[]): void {
  for (const method of methods) {
    const arg = method.args[0];
    if (typeof arg === 'number') {
      if (method.name === 'min') {
        schema.minItems = arg;
      } else if (method.name === 'max') {
        schema.maxItems = arg;
      } else if (method.name === 'length') {
        schema.minItems = arg;
        schema.maxItems = arg;
      }
    }
    if (method.name === 'nonempty') {
      schema.minItems = 1;
    }
  }
}

/**
 * Process rest method for tuple.
 */
function processRestMethod(
  schema: CastrSchema,
  method: ZodMethodCall,
  parseSchema: ZodSchemaParser,
): void {
  const restArg = method.argNodes[0];
  if (!restArg) {
    return;
  }
  const restSchema = parseSchema(restArg);
  if (!restSchema) {
    return;
  }
  schema.items = restSchema;
  delete schema.maxItems;
}

/**
 * Parse z.tuple([...])
 */
function parseTuple(
  args: Node[],
  chainedMethods: ZodMethodCall[],
  parseSchema: ZodSchemaParser,
): CastrSchema | undefined {
  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const prefixItems: CastrSchema[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const itemSchema = parseSchema(itemNode);
    if (itemSchema) {
      prefixItems.push(itemSchema);
    }
  }

  const schema: CastrSchema = {
    type: 'array',
    prefixItems,
    minItems: prefixItems.length,
    maxItems: prefixItems.length,
    metadata: createDefaultMetadata(),
  };

  for (const method of chainedMethods) {
    if (method.name === 'rest') {
      processRestMethod(schema, method, parseSchema);
    }
  }

  return schema;
}

/**
 * Parse z.enum(['a', 'b'])
 */
function parseEnum(args: Node[], baseMethod: string): CastrSchema | undefined {
  if (baseMethod === 'nativeEnum') {
    return { type: 'string', metadata: createDefaultMetadata() };
  }

  if (args.length === 0) {
    return undefined;
  }
  const itemsArg = args[0];

  if (!Node.isArrayLiteralExpression(itemsArg)) {
    return undefined;
  }

  const enumValues: unknown[] = [];
  for (const itemNode of itemsArg.getElements()) {
    const val = extractLiteralValue(itemNode);
    if (val !== undefined) {
      enumValues.push(val);
    }
  }

  return {
    type: 'string',
    enum: enumValues,
    metadata: createDefaultMetadata(),
  };
}

// ============================================================================
// Main exports
// ============================================================================

/**
 * Parse a Zod composition expression from a ts-morph Node.
 * @internal
 */
export function parseCompositionZodFromNode(
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

  const { baseMethod, chainedMethods, baseArgNodes } = chainInfo;

  if (baseMethod === 'array') {
    return applyMetaAndReturn(
      parseArray(baseArgNodes, chainedMethods, parseSchema),
      chainedMethods,
    );
  }
  if (baseMethod === 'tuple') {
    return applyMetaAndReturn(
      parseTuple(baseArgNodes, chainedMethods, parseSchema),
      chainedMethods,
    );
  }
  if (baseMethod === 'enum' || baseMethod === 'nativeEnum') {
    return applyMetaAndReturn(parseEnum(baseArgNodes, baseMethod), chainedMethods);
  }

  return undefined;
}

// Register this parser with the core dispatcher
registerParser('composition', parseCompositionZodFromNode);

/**
 * Parse a Zod composition expression string.
 * @internal
 */
export function parseCompositionZod(expression: string): CastrSchema | undefined {
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

  return parseCompositionZodFromNode(init, parseZodSchemaFromNode);
}
