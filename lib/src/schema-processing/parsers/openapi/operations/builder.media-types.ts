/**
 * Shared media-type builders and resolvers.
 *
 * Centralises media-type handling so request bodies, responses, parameters,
 * headers, and reusable `components.mediaTypes` all preserve refs and derive
 * effective schemas consistently.
 *
 * @module
 */

import type {
  MediaTypeObject,
  OpenAPIDocument,
  ReferenceObject,
} from '../../../../shared/openapi-types.js';
import { parseComponentRef } from '../../../../shared/ref-resolution.js';
import { isRecord } from '../../../../shared/type-utils/types.js';
import { isReferenceObject } from '../../../../validation/type-guards.js';
import type { CastrSchema, IRMediaType, IRMediaTypeEntry } from '../../../ir/index.js';
import { buildCastrSchema } from '../builder.core.js';
import type { IRBuildContext } from '../builder.types.js';
import { assertNoCircularComponentRef } from '../components/builder.component-ref-resolution.js';

const OPENAPI_COMPONENT_TYPE_MEDIA_TYPES = 'mediaTypes';

function createMediaTypeContext(context: IRBuildContext, path: string[]): IRBuildContext {
  return {
    ...context,
    path,
  };
}

function describeUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isMediaTypeComponentMap(
  value: unknown,
): value is Record<string, ReferenceObject | MediaTypeObject> {
  return isRecord(value);
}

function getExternalMediaTypes(
  doc: OpenAPIDocument,
  xExtKey: string,
): Record<string, ReferenceObject | MediaTypeObject> | undefined {
  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return undefined;
  }

  const extContent = xExt[xExtKey];
  if (!isRecord(extContent)) {
    return undefined;
  }

  const components = extContent['components'];
  if (!isRecord(components)) {
    return undefined;
  }

  const mediaTypes = components['mediaTypes'];
  return isMediaTypeComponentMap(mediaTypes) ? mediaTypes : undefined;
}

function getMediaTypesForRef(
  doc: OpenAPIDocument,
  xExtKey?: string,
): Record<string, ReferenceObject | MediaTypeObject> | undefined {
  if (xExtKey) {
    return getExternalMediaTypes(doc, xExtKey);
  }

  return doc.components?.mediaTypes;
}

/**
 * Resolve a reusable media-type reference from `components.mediaTypes`.
 *
 * Refs are preserved in IR content maps, but we still resolve them here to
 * fail fast on genuinely invalid references and to derive effective schemas
 * for existing consumers.
 */
export function resolveMediaTypeComponentRef(
  ref: ReferenceObject,
  context: IRBuildContext,
  seenRefs = new Set<string>(),
): MediaTypeObject {
  const location = context.path.join('/');
  assertNoCircularComponentRef(ref.$ref, location, seenRefs, 'media type');

  let parsedRef;
  try {
    parsedRef = parseComponentRef(ref.$ref);
  } catch (error) {
    throw new Error(
      `Invalid media type reference "${ref.$ref}" at ${location}. ${describeUnknownError(error)}`,
      { cause: error },
    );
  }

  if (parsedRef.componentType !== OPENAPI_COMPONENT_TYPE_MEDIA_TYPES) {
    throw new Error(
      `Unsupported media type reference "${ref.$ref}" at ${location}. ` +
        'Expected #/components/mediaTypes/{name}.',
    );
  }

  const mediaTypes = getMediaTypesForRef(
    context.doc,
    parsedRef.isExternal ? parsedRef.xExtKey : undefined,
  );
  if (!mediaTypes) {
    throw new Error(
      `Unresolvable media type reference "${ref.$ref}" at ${location}. ` +
        'The referenced media type does not exist in components.mediaTypes.',
    );
  }

  const resolved = mediaTypes[parsedRef.componentName];
  if (!resolved) {
    throw new Error(
      `Unresolvable media type reference "${ref.$ref}" at ${location}. ` +
        'The referenced media type does not exist in components.mediaTypes.',
    );
  }

  if (isReferenceObject(resolved)) {
    return resolveMediaTypeComponentRef(resolved, context, seenRefs);
  }

  return resolved;
}

/**
 * Convert an inline OpenAPI media-type object into IR form.
 */
export function buildIRMediaType(mediaType: MediaTypeObject, context: IRBuildContext): IRMediaType {
  const result: IRMediaType = {};

  if (mediaType.schema) {
    result.schema = buildCastrSchema(mediaType.schema, context);
  }

  if (mediaType.example !== undefined) {
    result.example = mediaType.example;
  }
  if (mediaType.examples !== undefined) {
    result.examples = mediaType.examples;
  }
  if (mediaType.encoding !== undefined) {
    result.encoding = mediaType.encoding;
  }

  return result;
}

/**
 * Convert a content entry into IR form while preserving reusable media-type refs.
 */
export function buildIRMediaTypeEntry(
  mediaType: ReferenceObject | MediaTypeObject,
  context: IRBuildContext,
  path: string[],
): IRMediaTypeEntry {
  const mediaContext = createMediaTypeContext(context, path);

  if (isReferenceObject(mediaType)) {
    resolveMediaTypeComponentRef(mediaType, mediaContext);
    return mediaType;
  }

  return buildIRMediaType(mediaType, mediaContext);
}

/**
 * Convert an entire content map into IR entries.
 */
export function buildIRMediaTypeEntries(
  content: Record<string, ReferenceObject | MediaTypeObject> | undefined,
  context: IRBuildContext,
  pathPrefix: string[],
): Record<string, IRMediaTypeEntry> {
  const result: Record<string, IRMediaTypeEntry> = {};

  if (!content) {
    return result;
  }

  for (const [mediaTypeName, mediaType] of Object.entries(content)) {
    result[mediaTypeName] = buildIRMediaTypeEntry(mediaType, context, [
      ...pathPrefix,
      mediaTypeName,
    ]);
  }

  return result;
}

function getSchemaFromMediaTypeEntry(
  mediaType: ReferenceObject | MediaTypeObject,
  context: IRBuildContext,
): CastrSchema | undefined {
  const resolvedMediaType = isReferenceObject(mediaType)
    ? resolveMediaTypeComponentRef(mediaType, context)
    : mediaType;

  return buildIRMediaType(resolvedMediaType, context).schema;
}

/**
 * Derive an effective schema from a content map for compatibility surfaces that
 * still expect a single schema.
 */
export function deriveSchemaFromMediaTypeEntries(
  content: Record<string, ReferenceObject | MediaTypeObject> | undefined,
  context: IRBuildContext,
  pathPrefix: string[],
): CastrSchema | undefined {
  if (!content) {
    return undefined;
  }

  for (const [mediaTypeName, mediaType] of Object.entries(content)) {
    const mediaContext = createMediaTypeContext(context, [...pathPrefix, mediaTypeName]);
    const schema = getSchemaFromMediaTypeEntry(mediaType, mediaContext);
    if (schema) {
      return schema;
    }
  }

  return undefined;
}
