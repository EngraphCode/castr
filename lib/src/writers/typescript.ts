import { Project, VariableDeclarationKind, type SourceFile } from 'ts-morph';
import type { TemplateContext } from '../context/index.js';
import { createEndpointWriter, writerToString } from './typescript/endpoints.js';
import { createMcpToolWriter } from './typescript/mcp.js';
import { addValidationHelpers, addSchemaRegistryHelper } from './typescript/helpers.js';

/**
 * Generate TypeScript code from TemplateContext using ts-morph.
 * Replaces the legacy Handlebars templates.
 */
export function writeTypeScript(context: TemplateContext): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('generated.ts', '', { overwrite: true });

  addImports(sourceFile);
  addTypes(sourceFile, context);
  addSchemas(sourceFile, context);
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

function addTypes(sourceFile: SourceFile, context: TemplateContext): void {
  if (Object.keys(context.types).length > 0) {
    sourceFile.addStatements('// Type Definitions');
    for (const typeDef of Object.values(context.types)) {
      sourceFile.addStatements(typeDef);
    }
  }
}

function addSchemas(sourceFile: SourceFile, context: TemplateContext): void {
  if (Object.keys(context.schemas).length > 0) {
    sourceFile.addStatements('// Zod Schemas');
    for (const [schemaName, schemaDef] of Object.entries(context.schemas)) {
      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        isExported: true,
        declarations: [
          {
            name: schemaName,
            initializer: schemaDef,
          },
        ],
      });
    }
  }
}

function addEndpointsArray(sourceFile: SourceFile, context: TemplateContext): void {
  if (context.endpoints.length === 0) {
    return;
  }

  sourceFile.addStatements('// Endpoints');
  const endpointsArray = context.endpoints
    .map((endpoint) => writerToString(createEndpointWriter(endpoint)))
    .join(',\n');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'endpoints',
        initializer: `[\n${endpointsArray}\n] as const`,
      },
    ],
  });
}

function addMcpToolsArray(sourceFile: SourceFile, context: TemplateContext): void {
  if (!context.mcpTools || context.mcpTools.length === 0) {
    return;
  }

  sourceFile.addStatements('// MCP Tools');
  const toolsArray = context.mcpTools
    .map((tool) => writerToString(createMcpToolWriter(tool)))
    .join(',\n');

  sourceFile.addVariableStatement({
    declarationKind: VariableDeclarationKind.Const,
    isExported: true,
    declarations: [
      {
        name: 'mcpTools',
        initializer: `[\n${toolsArray}\n] as const`,
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
export function writeCommonFile(
  schemas: Record<string, string>,
  types: Record<string, string>,
): string {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile('common.ts', '', { overwrite: true });

  sourceFile.addImportDeclaration({
    moduleSpecifier: 'zod',
    namedImports: ['z'],
  });

  if (Object.keys(types).length > 0) {
    sourceFile.addStatements('// Type Definitions');
    for (const typeDef of Object.values(types)) {
      sourceFile.addStatements(typeDef);
    }
  }

  if (Object.keys(schemas).length > 0) {
    sourceFile.addStatements('// Zod Schemas');
    for (const schemaDef of Object.values(schemas)) {
      sourceFile.addStatements(schemaDef);
    }
  }

  return sourceFile.getFullText();
}
