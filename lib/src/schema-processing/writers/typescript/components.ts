/**
 * Component emission for the TypeScript writer.
 *
 * Emits the type-alias and Zod-schema declarations for a document's schema
 * components. The IR carries ORIGINAL component names; `safeSchemaName`
 * projects them to code symbols only here, at emission, and the projection
 * is guarded to stay injective over the emitted set.
 */

import { VariableDeclarationKind, type SourceFile } from 'ts-morph';
import type { TemplateContext } from '../../context/index.js';
import { writeZodSchema } from '../zod/index.js';
import { writeTypeDefinition } from './type-writer/index.js';
import type { CastrDocument, CastrSchemaContext, CastrSchemaComponent } from '../../ir/index.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';
import {
  assertDistinctSafeSchemaNames,
  safeSchemaName,
} from '../../../shared/utils/identifier-utils.js';

const COMPONENT_TYPE_SCHEMA = 'schema';

/**
 * Add type definitions and Zod schema declarations for schema components.
 *
 * Fails fast when two distinct component names collapse to one emitted
 * identifier: emitting both would produce duplicate exports and bind
 * `$ref`s to the wrong schema.
 *
 * @param sourceFile - The ts-morph source file receiving the declarations
 * @param context - The template context carrying writer options
 * @param ir - The IR document whose schema components are emitted
 * @param schemaNames - Component refs selecting the emission order
 *
 * @internal
 */
export function addComponentsToSourceFile(
  sourceFile: SourceFile,
  context: TemplateContext,
  ir: CastrDocument,
  schemaNames: string[],
): void {
  const componentsMap = new Map<string, CastrSchemaComponent>();
  ir.components.forEach((c) => {
    if (c.type === COMPONENT_TYPE_SCHEMA) {
      componentsMap.set(c.name, c);
    }
  });

  // The identifier-safe projection must be injective over the document's
  // schema components: two distinct names collapsing to one symbol would
  // emit duplicate exports and bind $refs to the wrong schema.
  assertDistinctSafeSchemaNames([...componentsMap.keys()]);

  addTypeDefinitions(sourceFile, schemaNames, componentsMap);
  addZodSchemas(sourceFile, schemaNames, componentsMap, context);
}

function addTypeDefinitions(
  sourceFile: SourceFile,
  schemaNames: string[],
  componentsMap: Map<string, CastrSchemaComponent>,
): void {
  sourceFile.addStatements('// Type Definitions');
  schemaNames.forEach((ref) => {
    const { componentName } = parseComponentRef(ref);
    const component = componentsMap.get(componentName);
    if (component) {
      const safeName = safeSchemaName(component.name);
      sourceFile.addTypeAlias({
        name: safeName,
        isExported: true,
        type: writeTypeDefinition(component.schema),
      });
    }
  });
}

function addZodSchemas(
  sourceFile: SourceFile,
  schemaNames: string[],
  componentsMap: Map<string, CastrSchemaComponent>,
  context: TemplateContext,
): void {
  sourceFile.addStatements('// Zod Schemas');
  schemaNames.forEach((ref) => {
    const { componentName } = parseComponentRef(ref);
    const component = componentsMap.get(componentName);
    if (component) {
      const safeName = safeSchemaName(component.name);
      const schemaContext: CastrSchemaContext = {
        contextType: 'component',
        name: safeName,
        schema: component.schema,
        metadata: component.metadata,
      };

      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: safeName,
            initializer: writeZodSchema(schemaContext, context.options),
          },
        ],
      });
    }
  });
}
