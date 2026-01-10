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

import type { CastrSchema, CastrSchemaNode } from '../../context/ir-schema.js';
import type { CallExpression } from 'ts-morph';
import { CastrSchemaProperties } from '../../context/ir-schema-properties.js';
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
 * Parse a z.object() expression into a CastrSchema using ts-morph AST.
 *
 * @param expression - A Zod object expression string
 * @returns CastrSchema if this is a valid z.object(), undefined otherwise
 *
 * @public
 */
export function parseObjectZod(expression: string): CastrSchema | undefined {
  // Parse with ts-morph
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

  // Verify this is a z.object() call
  const baseMethod = getZodBaseMethod(init as CallExpression);
  if (baseMethod !== 'object') {
    return undefined;
  }

  // Extract object properties from AST
  const propsMap = extractObjectProperties(init as CallExpression);
  if (!propsMap) {
    return undefined;
  }

  const propertiesRecord: Record<string, CastrSchema> = {};
  const requiredFields: string[] = [];

  // Parse each property
  for (const [propName, propCall] of propsMap) {
    // Get the full text of the property expression
    const propText = propCall.getText();

    // Use parsePrimitiveZod which handles chains
    const propSchema = parsePrimitiveZod(propText);
    if (propSchema) {
      propertiesRecord[propName] = propSchema;

      // Property is required unless marked optional
      if (propSchema.metadata.required) {
        requiredFields.push(propName);
      }
    }
  }

  return {
    type: 'object',
    properties: new CastrSchemaProperties(propertiesRecord),
    required: requiredFields,
    metadata: createDefaultMetadata(),
  };
}
