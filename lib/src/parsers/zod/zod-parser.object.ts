/**
 * Zod Object Schema Parsing
 *
 * Parses z.object() schemas into CastrSchema structures with properties.
 * Uses ts-morph AST traversal (ADR-026 compliant - no regex).
 *
 * @module parsers/zod/object
 *
 * @example
 * ```typescript
 * import { parseObjectZod } from './zod-parser.object.js';
 *
 * const schema = parseObjectZod('z.object({ name: z.string().min(1) })');
 * ```
 */

import type { CastrSchema, CastrSchemaNode } from '../../ir/schema.js';
import type { CallExpression } from 'ts-morph';
import { Node } from 'ts-morph';
import { CastrSchemaProperties } from '../../ir/schema-properties.js';
import { createZodProject, getZodBaseMethod, extractObjectProperties } from './zod-ast.js';
import { parsePrimitiveZod } from './zod-parser.primitives.js';

/**
 * Create default metadata for a schema node.
 * @internal
 */
function createDefaultMetadata(
  options: { nullable?: boolean; required?: boolean } = {},
): CastrSchemaNode {
  const { nullable = false, required = true } = options;

  return {
    required,
    nullable,
    zodChain: {
      presence: '',
      validations: [],
      defaults: [],
    },
    dependencyGraph: {
      references: [],
      referencedBy: [],
      depth: 0,
    },
    circularReferences: [],
  };
}

/**
 * Parse and extract initializer from expression.
 * @internal
 */
function parseExpression(expression: string): CallExpression | undefined {
  const project = createZodProject(`const __schema = ${expression};`);
  const sourceFile = project.getSourceFiles()[0];
  if (!sourceFile) {
    return undefined;
  }

  const varDecl = sourceFile.getVariableDeclarations()[0];
  const init = varDecl?.getInitializer();
  if (!init) {
    return undefined;
  }

  if (Node.isCallExpression(init)) {
    return init;
  }
  return undefined;
}

/**
 * Process object properties into schema records.
 * @internal
 */
function processProperties(propsMap: Map<string, CallExpression>): {
  propertiesRecord: Record<string, CastrSchema>;
  requiredFields: string[];
} {
  const propertiesRecord: Record<string, CastrSchema> = {};
  const requiredFields: string[] = [];

  for (const [propName, propCall] of propsMap) {
    const propText = propCall.getText();
    const propSchema = parsePrimitiveZod(propText);
    if (propSchema) {
      propertiesRecord[propName] = propSchema;
      if (propSchema.metadata.required) {
        requiredFields.push(propName);
      }
    }
  }

  return { propertiesRecord, requiredFields };
}

/**
 * Parse a z.object() expression into a CastrSchema using ts-morph AST.
 *
 * @param expression - A Zod object expression string
 * @returns CastrSchema if this is a valid z.object(), undefined otherwise
 *
 * @public
 */
export function parseObjectZod(expression: string): CastrSchema | undefined {
  const init = parseExpression(expression);
  if (!init) {
    return undefined;
  }

  const baseMethod = getZodBaseMethod(init);
  if (baseMethod !== 'object') {
    return undefined;
  }

  const propsMap = extractObjectProperties(init);
  if (!propsMap) {
    return undefined;
  }

  const { propertiesRecord, requiredFields } = processProperties(propsMap);

  return {
    type: 'object',
    properties: new CastrSchemaProperties(propertiesRecord),
    required: requiredFields,
    metadata: createDefaultMetadata(),
  };
}
