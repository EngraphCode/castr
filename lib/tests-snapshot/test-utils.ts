import { CodeBlockWriter } from 'ts-morph';
import type { OpenAPIObject, SchemaObject } from '../src/shared/openapi-types.js';
import {
  generateZodClientFromOpenAPI as generateZodClientFromOpenAPIBase,
  getOpenApiDependencyGraph,
  isGroupedFileResult,
  isSingleFileResult,
  type GenerateZodClientFromOpenApiArgs,
  type GenerationResult,
} from '../src/index.js';
import {
  getZodClientTemplateContext as getZodClientTemplateContextBase,
  type TemplateContext,
  type TemplateContextOptions,
} from '../src/schema-processing/context/index.js';
import type { TemplateContextGroupStrategy } from '../src/schema-processing/context/template-context.js';
import {
  buildCastrSchema,
  type IRBuildContext,
} from '../src/schema-processing/parsers/openapi/index.js';
import { writeTypeDefinition } from '../src/schema-processing/writers/typescript/index.js';
import { generateZodSchema } from '../src/test-helpers/generate-zod-schema.js';

function createSnapshotBuildContext(): IRBuildContext {
  return {
    doc: { openapi: '3.1.0', info: { title: '', version: '' }, paths: {} },
    path: [],
    required: false,
  };
}

export { getOpenApiDependencyGraph, isGroupedFileResult, isSingleFileResult };
export type { TemplateContextGroupStrategy };

export function generateZodClientFromOpenAPI(
  args: GenerateZodClientFromOpenApiArgs,
): Promise<GenerationResult> {
  return generateZodClientFromOpenAPIBase(args);
}

export function getZodClientTemplateContext(
  doc: OpenAPIObject,
  options?: TemplateContextOptions,
): TemplateContext {
  return getZodClientTemplateContextBase(doc, options);
}

export function getZodSchema({ schema }: { schema: SchemaObject }): {
  code: string;
  schema: SchemaObject;
} {
  const irSchema = buildCastrSchema(schema, createSnapshotBuildContext());
  const code = generateZodSchema(irSchema);
  return { code, schema };
}

export function getTypescriptFromOpenApi({
  schema,
  meta,
}: {
  schema: SchemaObject;
  meta?: { name: string; $ref?: string };
}): string {
  const irSchema = buildCastrSchema(schema, createSnapshotBuildContext());
  const writer = new CodeBlockWriter({
    useTabs: false,
    indentNumberOfSpaces: 2,
  });

  if (meta?.name) {
    writer.write(`export type ${meta.name} = `);
    writeTypeDefinition(irSchema)(writer);
    writer.write(';');
  } else {
    writeTypeDefinition(irSchema)(writer);
  }

  return writer.toString();
}
