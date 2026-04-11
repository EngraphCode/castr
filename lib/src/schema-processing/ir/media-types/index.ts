import { type ReferenceObject, isReferenceObject } from '../../../shared/openapi-types.js';
import { parseComponentRef } from '../../../shared/ref-resolution.js';
import type { CastrDocument } from '../models/schema-document.js';
import type { IRComponent, IRMediaTypeComponent } from '../models/schema.components.js';
import type { IRMediaType, IRMediaTypeEntry } from '../models/schema.operations.js';
import type { CastrSchema } from '../models/schema.js';

const OPENAPI_COMPONENT_TYPE_MEDIA_TYPES = 'mediaTypes';
const IR_COMPONENT_TYPE_MEDIA_TYPE = 'mediaType';

function describeUnknownError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isMediaTypeComponent(component: IRComponent): component is IRMediaTypeComponent {
  return component.type === IR_COMPONENT_TYPE_MEDIA_TYPE;
}

function findMediaTypeComponent(
  document: Pick<CastrDocument, 'components'>,
  componentName: string,
  xExtKey?: string,
): IRMediaTypeComponent | undefined {
  return document.components.find(
    (component): component is IRMediaTypeComponent =>
      isMediaTypeComponent(component) &&
      component.name === componentName &&
      component.xExtKey === xExtKey,
  );
}

function resolveIRMediaTypeReference(
  document: Pick<CastrDocument, 'components'>,
  ref: ReferenceObject,
  location: string,
  seenRefs = new Set<string>(),
): IRMediaType {
  if (seenRefs.has(ref.$ref)) {
    throw new Error(
      `Circular IR media type reference "${ref.$ref}" at ${location}. ` +
        'Media type component refs must not form cycles.',
    );
  }
  seenRefs.add(ref.$ref);

  let parsedRef;
  try {
    parsedRef = parseComponentRef(ref.$ref);
  } catch (error) {
    throw new Error(
      `Invalid IR media type reference "${ref.$ref}" at ${location}. ${describeUnknownError(error)}`,
      { cause: error },
    );
  }

  if (parsedRef.componentType !== OPENAPI_COMPONENT_TYPE_MEDIA_TYPES) {
    throw new Error(
      `Unsupported IR media type reference "${ref.$ref}" at ${location}. ` +
        'Expected #/components/mediaTypes/{name} or #/x-ext/{hash}/components/mediaTypes/{name}.',
    );
  }

  const component = findMediaTypeComponent(document, parsedRef.componentName, parsedRef.xExtKey);
  if (!component) {
    throw new Error(
      `Unresolvable IR media type reference "${ref.$ref}" at ${location}. ` +
        'The referenced media type component does not exist.',
    );
  }

  return resolveIRMediaTypeEntry(document, component.mediaType, location, seenRefs);
}

export function resolveIRMediaTypeEntry(
  document: Pick<CastrDocument, 'components'>,
  mediaType: IRMediaTypeEntry | ReferenceObject,
  location: string,
  seenRefs?: Set<string>,
): IRMediaType {
  if (!isReferenceObject(mediaType)) {
    return mediaType;
  }

  return resolveIRMediaTypeReference(document, mediaType, location, seenRefs);
}

export function getSchemaFromIRMediaTypeEntry(
  document: Pick<CastrDocument, 'components'>,
  mediaType: IRMediaTypeEntry,
  location: string,
): CastrSchema | undefined {
  return resolveIRMediaTypeEntry(document, mediaType, location).schema;
}

export function getItemSchemaFromIRMediaTypeEntry(
  document: Pick<CastrDocument, 'components'>,
  mediaType: IRMediaTypeEntry,
  location: string,
): CastrSchema | undefined {
  return resolveIRMediaTypeEntry(document, mediaType, location).itemSchema;
}
