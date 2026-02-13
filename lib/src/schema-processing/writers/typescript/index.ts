import { Project, VariableDeclarationKind, type SourceFile } from 'ts-morph';
import type { TemplateContext } from '../../context/index.js';
import { createEndpointWriter } from './endpoints.js';
import { createMcpToolWriter } from './mcp.js';
import { addValidationHelpers, addSchemaRegistryHelper } from './helpers.js';
import { writeZodSchema } from '../zod/index.js';
import { writeTypeDefinition } from './type-writer.js';
import type { CastrSchemaComponent } from '../../ir/schema.js';
import type { CastrSchemaContext } from '../../ir/context.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';
import { safeSchemaName } from '../../../shared/utils/identifier-utils.js';

/**
 * Generate TypeScript code from TemplateContext using ts-morph.
 * Replaces the legacy Handlebars templates.
 */
export function writeTypeScript(context: TemplateContext): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '', { overwrite: true });

  addImports(sourceFile);

  if (context._ir) {
    addSchemasAndTypes(sourceFile, context);
  } else {
    // Fallback or error if IR is missing (should not happen in this phase)
    sourceFile.addStatements('// Error: CastrDocument missing from context');
  }

  addEndpointsArray(sourceFile, context);
  addMcpToolsArray(sourceFile, context);
  addHelpers(sourceFile, context);

  return sourceFile.getFullText();
}

function addImports(sourceFile: SourceFile): void {
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'zod',
    namedImports: ['z'],
  });
}

function addSchemasAndTypes(sourceFile: SourceFile, context: TemplateContext): void {
  if (!context._ir || context.sortedSchemaNames.length === 0) {
    return;
  }
  addComponentsToSourceFile(sourceFile, context, context.sortedSchemaNames);
}

function addComponentsToSourceFile(
  sourceFile: SourceFile,
  context: TemplateContext,
  schemaNames: string[],
): void {
  if (!context._ir) {
    return;
  }

  const componentsMap = new Map<string, CastrSchemaComponent>();
  context._ir.components.forEach((c) => {
    if (c.type === 'schema') {
      componentsMap.set(c.name, c);
    }
  });

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

function addEndpointsArray(sourceFile: SourceFile, context: TemplateContext): void {
  if (context.endpoints.length === 0) {
    return;
  }

  sourceFile.addStatements('// Endpoints');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'endpoints',
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
  if (!context.mcpTools || context.mcpTools.length === 0) {
    return;
  }

  sourceFile.addStatements('// MCP Tools');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'mcpTools',
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

function addHelpers(sourceFile: SourceFile, context: TemplateContext): void {
  if (context.options?.withValidationHelpers) {
    addValidationHelpers(sourceFile);
  }

  if (context.options?.withSchemaRegistry) {
    addSchemaRegistryHelper(sourceFile);
  }
}

/**
 * Generate index file for grouped output.
 */
export function writeIndexFile(groupNames: Record<string, string>): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('index.ts', '', { overwrite: true });

  for (const [apiName, groupName] of Object.entries(groupNames)) {
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
export function writeCommonFile(context: TemplateContext, schemaNames: string[]): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('common.ts', '', { overwrite: true });

  addImports(sourceFile);

  if (!context._ir || schemaNames.length === 0) {
    return sourceFile.getFullText();
  }

  addComponentsToSourceFile(sourceFile, context, schemaNames);

  return sourceFile.getFullText();
}
