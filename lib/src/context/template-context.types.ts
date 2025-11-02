import type { OpenAPIObject, ReferenceObject, SchemaObject } from 'openapi3-ts/oas30';
import {
  type Node,
  EmitHint,
  NewLineKind,
  ScriptKind,
  ScriptTarget,
  createPrinter,
  createSourceFile,
} from 'typescript';

import { getTypescriptFromOpenApi } from '../conversion/typescript/index.js';
import type { TsConversionContext } from '../conversion/typescript/index.js';
import { getSchemaFromComponents } from '../shared/component-access.js';
import { isReferenceObject } from 'openapi3-ts/oas30';

import { checkIfSchemaIsCircular } from './template-context.schemas.js';
import { getSchemaNameFromRef } from './template-context.common.js';

const file = createSourceFile('', '', ScriptTarget.ESNext, true, ScriptKind.TS);
const printer = createPrinter({ newLine: NewLineKind.LineFeed });
const printTs = (node: Node): string => printer.printNode(EmitHint.Unspecified, node, file);

/**
 * Type guard to check if result is a ts.Node
 */
export const isTsNode = (result: unknown): result is Node => {
  if (typeof result !== 'object' || result === null) {
    return false;
  }

  // Check if object has 'kind' property that is a number (Node requirement)
  const hasKind = 'kind' in result;
  if (!hasKind) {
    return false;
  }

  const obj: { kind?: unknown } = result;
  return typeof obj.kind === 'number';
};

/**
 * Convert result from getTypescriptFromOpenApi to string
 * Handles union type: Node | t.TypeDefinitionObject | string
 */
export const tsResultToString = (result: ReturnType<typeof getTypescriptFromOpenApi>): string => {
  if (typeof result === 'string') {
    return result;
  }
  if (isTsNode(result)) {
    return printTs(result);
  }
  return JSON.stringify(result);
};

/**
 * Determine if a type should be generated for a schema.
 * Pure validation function.
 *
 * @internal
 */
export const shouldGenerateTypeForSchema = (
  ref: string,
  dependencyGraph: Record<string, Set<string>>,
  options?: TemplateContext['options'],
): boolean => {
  const isCircular = checkIfSchemaIsCircular(ref, dependencyGraph);
  return Boolean(options?.shouldExportAllTypes || isCircular);
};

/**
 * Generate TypeScript type string for a schema.
 * Transformation function for template generation.
 *
 * @internal
 */
export const generateTypeForSchema = (
  schemaName: string,
  schema: SchemaObject | ReferenceObject,
  ctx: TsConversionContext,
  options?: TemplateContext['options'],
): string => {
  const tsResult = getTypescriptFromOpenApi({
    schema,
    ctx,
    meta: { name: schemaName },
    options,
  });
  return tsResultToString(tsResult).replace('export ', '');
};

/**
 * Determine if a type should be emitted (marked in emittedType).
 * Pure validation function.
 *
 * @internal
 */
export const shouldEmitTypeForSchema = (
  schema: SchemaObject | ReferenceObject,
  options?: TemplateContext['options'],
): boolean => {
  return (
    Boolean(options?.shouldExportAllTypes) && !isReferenceObject(schema) && schema.type === 'object'
  );
};

/**
 * Process types for all schemas in dependency graph.
 * Transformation function that generates TypeScript types.
 *
 * @internal
 */
export const processTypesForSchemas = (
  dependencyGraph: Record<string, Set<string>>,
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): {
  types: Record<string, string>;
  emittedType: Record<string, true>;
} => {
  const types: Record<string, string> = {};
  const emittedType: Record<string, true> = {};
  const ctx: TsConversionContext = { nodeByRef: {}, doc, visitedRefs: {} };

  for (const ref in dependencyGraph) {
    const shouldGenerate = shouldGenerateTypeForSchema(ref, dependencyGraph, options);
    const schemaName = shouldGenerate ? getSchemaNameFromRef(ref) : undefined;

    if (shouldGenerate && schemaName && !types[schemaName]) {
      const schema = getSchemaFromComponents(doc, schemaName);
      types[schemaName] = generateTypeForSchema(schemaName, schema, ctx, options);
      emittedType[schemaName] = true;

      processDependentTypes(ref, dependencyGraph, doc, ctx, types, emittedType, options);
    }
  }

  return { types, emittedType };
};

/**
 * Process dependent types for a schema.
 * Transformation function that generates types for dependencies.
 *
 * @internal
 */
export const processDependentTypes = (
  ref: string,
  dependencyGraph: Record<string, Set<string>>,
  doc: OpenAPIObject,
  ctx: TsConversionContext,
  types: Record<string, string>,
  emittedType: Record<string, true>,
  options?: TemplateContext['options'],
): void => {
  const depRefs = dependencyGraph[ref];
  if (!depRefs) {
    return;
  }

  for (const depRef of depRefs) {
    const depSchemaName = getSchemaNameFromRef(depRef);
    if (!depSchemaName) {
      continue;
    }

    const isDepCircular = checkIfSchemaIsCircular(depRef, dependencyGraph);
    if (isDepCircular || types[depSchemaName]) {
      continue;
    }

    const depSchema = getSchemaFromComponents(doc, depSchemaName);
    types[depSchemaName] = generateTypeForSchema(depSchemaName, depSchema, ctx, options);

    if (shouldEmitTypeForSchema(depSchema, options)) {
      emittedType[depSchemaName] = true;
    }
  }
};

// Import types from main file to avoid circular deps
import type { TemplateContext, TemplateContextOptions } from './template-context.js';

/**
 * Extract defaultStatusBehavior type from TemplateContextOptions
 * This ensures we use the library's type as the source of truth
 */
export type DefaultStatusBehavior = NonNullable<TemplateContextOptions['defaultStatusBehavior']>;

/**
 * Literal values for defaultStatusBehavior, derived from library type
 * If this doesn't compile, it means the library type has changed
 */
const DEFAULT_STATUS_BEHAVIORS = [
  'spec-compliant',
  'auto-correct',
] as const satisfies readonly DefaultStatusBehavior[];

/**
 * Type predicate to check if a value is a valid DefaultStatusBehavior
 * Narrows `unknown` to `DefaultStatusBehavior`
 */
export function isDefaultStatusBehavior(value: unknown): value is DefaultStatusBehavior {
  if (typeof value !== 'string') {
    return false;
  }
  const behaviors: readonly string[] = DEFAULT_STATUS_BEHAVIORS;
  return behaviors.includes(value);
}
