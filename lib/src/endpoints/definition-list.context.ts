/**
 * Context preparation helpers for endpoint definition extraction
 * Extracted from getEndpointDefinitionList.ts to reduce file size
 *
 * @internal
 */

import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
} from 'openapi3-ts/oas30';
import { isReferenceObject } from 'openapi3-ts/oas30';
import { match, P } from 'ts-pattern';

import type { CodeMeta, ConversionTypeContext } from '../shared/code-meta.js';
import type { TemplateContext } from '../context/template-context.js';
import { getSchemaVarName } from './helpers.js';
import { pathToVariableName } from '../shared/utils/index.js';

/**
 * Helper type guard for PathItemObject
 */
export function isPathItemObject(maybePathItemObj: unknown): maybePathItemObj is PathItemObject {
  if (!maybePathItemObj || typeof maybePathItemObj !== 'object') {
    return false;
  }
  // PathItemObject is any object that's not a ReferenceObject
  // PathItemObject can have: HTTP methods (get, put, post, etc.), parameters, summary, description, servers
  // ReferenceObject only has: $ref, summary, description
  // We distinguish by checking for $ref - if it doesn't have $ref, it's a PathItemObject
  return !('$ref' in maybePathItemObj);
}

/**
 * Prepare conversion context for endpoint processing
 * Pure function: initializes context, operation alias resolver, and helper functions
 *
 * @returns Processing context with helpers and configuration
 */
export function prepareEndpointContext(
  doc: OpenAPIObject,
  options?: TemplateContext['options'],
): {
  ctx: Required<ConversionTypeContext>;
  getOperationAlias: (path: string, method: string, operation: OperationObject) => string;
  getZodVarName: (input: CodeMeta, fallbackName?: string) => ReturnType<typeof getSchemaVarName>;
  defaultStatusBehavior: NonNullable<TemplateContext['options']>['defaultStatusBehavior'];
} {
  const getOperationAlias = match(options?.withAlias)
    .with(
      P.boolean,
      P.nullish,
      () => (path: string, method: string, operation: OperationObject) =>
        operation.operationId ?? method + pathToVariableName(path),
    )
    .otherwise((fn) => fn);

  const ctx: Required<ConversionTypeContext> = {
    doc,
    zodSchemaByName: {},
    schemaByName: {},
    schemasByName: {},
  };

  const complexityThreshold = options?.complexityThreshold ?? 4;
  const getZodVarName = (
    input: CodeMeta,
    fallbackName?: string,
  ): ReturnType<typeof getSchemaVarName> =>
    getSchemaVarName(
      input,
      ctx,
      complexityThreshold,
      fallbackName,
      options?.exportAllNamedSchemas !== undefined
        ? { exportAllNamedSchemas: options.exportAllNamedSchemas }
        : undefined,
    );

  const defaultStatusBehavior = options?.defaultStatusBehavior ?? 'spec-compliant';

  return { ctx, getOperationAlias, getZodVarName, defaultStatusBehavior };
}

/**
 * Creates a map of parameters by name or $ref
 */
export function getParametersMap(
  parameters: NonNullable<PathItemObject['parameters']>,
): Record<string, ParameterObject | ReferenceObject> {
  return Object.fromEntries(
    (parameters ?? []).map(
      (param) => [isReferenceObject(param) ? param.$ref : param.name, param] as const,
    ),
  );
}
