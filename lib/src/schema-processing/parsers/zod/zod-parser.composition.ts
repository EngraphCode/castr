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
import type { ZodImportResolver } from './zod-import-resolver.js';
import type { ZodSchemaParser } from './zod-parser.types.js';
import { registerParser, parseZodSchemaFromNode } from './zod-parser.core.js';
import { createDefaultMetadata } from './zod-parser.defaults.js';
import { applyMetaAndReturn } from './zod-parser.meta.js';
import {
  ZOD_METHOD_ARRAY,
  ZOD_METHOD_ENUM,
  ZOD_METHOD_NATIVE_ENUM,
  ZOD_METHOD_REST,
  ZOD_METHOD_TUPLE,
  ZOD_SCHEMA_TYPE_ARRAY,
  ZOD_SCHEMA_TYPE_STRING,
} from './zod-constants.js';

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
    type: ZOD_SCHEMA_TYPE_ARRAY,
    items: itemSchema,
    metadata: createDefaultMetadata(),
  };

  applyArrayConstraints(schema, chainedMethods);
  return schema;
}

/**
 * Dispatch table for array constraint methods.
 * @internal
 */
const ARRAY_CONSTRAINT_HANDLERS: Readonly<
  Record<string, (schema: CastrSchema, arg: unknown) => void>
> = {
  min: (schema, arg) => {
    if (typeof arg === 'number') {
      schema.minItems = arg;
    }
  },
  max: (schema, arg) => {
    if (typeof arg === 'number') {
      schema.maxItems = arg;
    }
  },
  length: (schema, arg) => {
    if (typeof arg === 'number') {
      schema.minItems = arg;
      schema.maxItems = arg;
    }
  },
  nonempty: (schema) => {
    schema.minItems = 1;
  },
};

/**
 * Apply array constraints from method chain.
 */
function applyArrayConstraints(schema: CastrSchema, methods: ZodMethodCall[]): void {
  for (const method of methods) {
    const handler = ARRAY_CONSTRAINT_HANDLERS[method.name];
    if (handler) {
      handler(schema, method.args[0]);
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
    type: ZOD_SCHEMA_TYPE_ARRAY,
    prefixItems,
    minItems: prefixItems.length,
    maxItems: prefixItems.length,
    metadata: createDefaultMetadata(),
  };

  for (const method of chainedMethods) {
    if (method.name === ZOD_METHOD_REST) {
      processRestMethod(schema, method, parseSchema);
    }
  }

  return schema;
}

/**
 * Parse z.enum(['a', 'b'])
 */
function parseEnum(args: Node[], baseMethod: string): CastrSchema | undefined {
  if (baseMethod === ZOD_METHOD_NATIVE_ENUM) {
    return { type: ZOD_SCHEMA_TYPE_STRING, metadata: createDefaultMetadata() };
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
    type: ZOD_SCHEMA_TYPE_STRING,
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

  const { baseMethod, chainedMethods, baseArgNodes } = chainInfo;

  if (baseMethod === ZOD_METHOD_ARRAY) {
    return applyMetaAndReturn(
      parseArray(baseArgNodes, chainedMethods, parseSchema),
      chainedMethods,
    );
  }
  if (baseMethod === ZOD_METHOD_TUPLE) {
    return applyMetaAndReturn(
      parseTuple(baseArgNodes, chainedMethods, parseSchema),
      chainedMethods,
    );
  }
  if (baseMethod === ZOD_METHOD_ENUM || baseMethod === ZOD_METHOD_NATIVE_ENUM) {
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
  const { sourceFile, resolver } = createZodProject(`const __schema = ${expression};`);

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();

  if (!init || !Node.isCallExpression(init)) {
    return undefined;
  }

  const boundParseSchema: ZodSchemaParser = (n) => parseZodSchemaFromNode(n, resolver);
  return parseCompositionZodFromNode(init, boundParseSchema, resolver);
}
