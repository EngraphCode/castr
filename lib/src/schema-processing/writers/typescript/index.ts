import { Project, VariableDeclarationKind, type SourceFile } from 'ts-morph';
import type { TemplateContext } from '../../context/index.js';
import { createEndpointWriter } from './endpoints.js';
import { createMcpToolWriter } from './mcp.js';
import { addValidationHelpers, addSchemaRegistryHelper } from './helpers.js';
import { writeZodSchema } from '../zod/index.js';
import { writeTypeDefinition } from './type-writer/index.js';
import type { CastrDocument, CastrSchemaContext, CastrSchemaComponent } from '../../ir/index.js';
import { safeSchemaName } from '../../../shared/utils/identifier-utils.js';
import {
  assertEmittedReferencesDeclared,
  assertSchemaReferencesResolve,
  buildSchemaComponentsMap,
  requireSchemaComponent,
} from './schema-components.js';
import {
  COMPONENTS_ONLY_PLAN,
  ENDPOINTS_SYMBOL,
  MCP_TOOLS_SYMBOL,
  ZOD_IMPORT_SYMBOL,
  declaredSymbolsOf,
  planEmission,
} from './emission-plan.js';
import { assertDocumentSupportsIntegerTargetCapabilities } from '../../compatibility/integer-target-capabilities.js';
import { assertDocumentSupportsItemSchemaTargetCapabilities } from '../../compatibility/item-schema-target-capabilities.js';

export { writeTypeDefinition } from './type-writer/index.js';

function getSortedGroupEntries(groupNames: Record<string, string>): [string, string][] {
  return Object.entries(groupNames).sort(([leftApiName], [rightApiName]) =>
    leftApiName.localeCompare(rightApiName),
  );
}

function requireIr(context: TemplateContext, consumer: string): CastrDocument {
  if (!context._ir) {
    throw new Error(
      `${consumer} requires TemplateContext._ir so compatibility guards and schema emission stay honest.`,
    );
  }

  return context._ir;
}

/**
 * Generate TypeScript code from TemplateContext using ts-morph.
 * Replaces the legacy Handlebars templates.
 *
 * When `options.template === 'schemas-only'`, only schema types and Zod
 * declarations are emitted — endpoints, MCP tools, and helpers are suppressed.
 */
export function writeTypeScript(context: TemplateContext): string {
  const ir = requireIr(context, 'TypeScript writer');
  assertDocumentSupportsIntegerTargetCapabilities(ir, 'TypeScript');
  assertDocumentSupportsItemSchemaTargetCapabilities(ir, 'TypeScript');
  assertSchemaReferencesResolve(ir);

  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '', { overwrite: true });

  const plan = planEmission(context);

  addImports(sourceFile);
  addSchemasAndTypes(sourceFile, context, ir, declaredSymbolsOf(plan));
  if (plan.endpoints) {
    addEndpointsArray(sourceFile, context);
  }
  if (plan.mcpTools) {
    addMcpToolsArray(sourceFile, context);
  }
  if (plan.validationHelpers) {
    addValidationHelpers(sourceFile);
  }
  if (plan.schemaRegistry) {
    addSchemaRegistryHelper(sourceFile);
  }

  return sourceFile.getFullText();
}

function addImports(sourceFile: SourceFile): void {
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'zod',
    namedImports: [ZOD_IMPORT_SYMBOL],
  });
}

function addSchemasAndTypes(
  sourceFile: SourceFile,
  context: TemplateContext,
  ir: CastrDocument,
  declaredSymbols: readonly string[],
): void {
  if (context.sortedSchemaNames.length === 0) {
    return;
  }

  addComponentsToSourceFile(sourceFile, context, ir, context.sortedSchemaNames, declaredSymbols);
}

function addComponentsToSourceFile(
  sourceFile: SourceFile,
  context: TemplateContext,
  ir: CastrDocument,
  schemaNames: readonly string[],
  declaredSymbols: readonly string[],
): void {
  const componentsMap = buildSchemaComponentsMap(ir, declaredSymbols);
  assertEmittedReferencesDeclared(
    schemaNames.map((ref) => requireSchemaComponent(componentsMap, ref)),
  );

  addTypeDefinitions(sourceFile, schemaNames, componentsMap);
  addZodSchemas(sourceFile, schemaNames, componentsMap, context);
}

function addTypeDefinitions(
  sourceFile: SourceFile,
  schemaNames: readonly string[],
  componentsMap: ReadonlyMap<string, CastrSchemaComponent>,
): void {
  sourceFile.addStatements('// Type Definitions');
  schemaNames.forEach((ref) => {
    const component = requireSchemaComponent(componentsMap, ref);
    sourceFile.addTypeAlias({
      name: safeSchemaName(component.name),
      isExported: true,
      type: writeTypeDefinition(component.schema),
    });
  });
}

function addZodSchemas(
  sourceFile: SourceFile,
  schemaNames: readonly string[],
  componentsMap: ReadonlyMap<string, CastrSchemaComponent>,
  context: TemplateContext,
): void {
  sourceFile.addStatements('// Zod Schemas');
  schemaNames.forEach((ref) => {
    const component = requireSchemaComponent(componentsMap, ref);
    const safeName = safeSchemaName(component.name);
    const schemaContext: CastrSchemaContext = {
      contextType: 'component',
      name: component.name,
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
  });
}

function addEndpointsArray(sourceFile: SourceFile, context: TemplateContext): void {
  sourceFile.addStatements('// Endpoints');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: ENDPOINTS_SYMBOL,
        initializer: (writer) => {
          writer
            .write('[')
            .indent(() => {
              context.endpoints.forEach((endpoint, index) => {
                createEndpointWriter(endpoint, context.options)(writer);
                if (index < context.endpoints.length - 1) {
                  writer.write(',').newLine();
                }
              });
            })
            .write('] as const');
        },
      },
    ],
  });
}

function addMcpToolsArray(sourceFile: SourceFile, context: TemplateContext): void {
  sourceFile.addStatements('// MCP Tools');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: MCP_TOOLS_SYMBOL,
        initializer: (writer) => {
          writer
            .write('[')
            .indent(() => {
              if (context.mcpTools) {
                context.mcpTools.forEach((tool, index) => {
                  createMcpToolWriter(tool)(writer);
                  if (index < (context.mcpTools?.length ?? 0) - 1) {
                    writer.write(',').newLine();
                  }
                });
              }
            })
            .write('] as const');
        },
      },
    ],
  });
}

/**
 * Generate index file for grouped output.
 */
export function writeIndexFile(groupNames: Record<string, string>): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('index.ts', '', { overwrite: true });

  for (const [apiName, groupName] of getSortedGroupEntries(groupNames)) {
    sourceFile.addExportDeclaration({
      moduleSpecifier: `./${groupName}`,
      namespaceExport: apiName,
    });
  }

  return sourceFile.getFullText();
}

/**
 * Generate common file for grouped output.
 */
export function writeCommonFile(context: TemplateContext, schemaNames: readonly string[]): string {
  const ir = requireIr(context, 'TypeScript common writer');
  assertDocumentSupportsIntegerTargetCapabilities(ir, 'TypeScript');
  assertDocumentSupportsItemSchemaTargetCapabilities(ir, 'TypeScript');
  assertSchemaReferencesResolve(ir);

  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('common.ts', '', { overwrite: true });

  addImports(sourceFile);

  if (schemaNames.length === 0) {
    return sourceFile.getFullText();
  }

  addComponentsToSourceFile(
    sourceFile,
    context,
    ir,
    schemaNames,
    declaredSymbolsOf(COMPONENTS_ONLY_PLAN),
  );

  return sourceFile.getFullText();
}
