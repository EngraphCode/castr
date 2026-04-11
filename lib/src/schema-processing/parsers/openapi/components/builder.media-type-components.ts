import type { ComponentsObject, OpenAPIDocument } from '../../../../shared/openapi-types.js';
import { isRecord } from '../../../../shared/type-utils/types.js';
import type { IRComponent, IRMediaTypeComponent } from '../../../ir/index.js';
import { buildIRMediaTypeEntry } from '../operations/index.js';
import type { IRBuildContext } from '../builder.types.js';

function hasMediaTypeComponents(components: unknown): components is Pick<
  ComponentsObject,
  'mediaTypes'
> & {
  mediaTypes: NonNullable<ComponentsObject['mediaTypes']>;
} {
  return isRecord(components) && isRecord(components['mediaTypes']);
}

export function extractMediaTypeComponents(doc: OpenAPIDocument): IRComponent[] {
  const result: IRComponent[] = [];

  if (doc.components?.mediaTypes) {
    addMediaTypeComponents(
      doc,
      doc.components.mediaTypes,
      ['#', 'components', 'mediaTypes'],
      result,
    );
  }

  const xExt: unknown = doc['x-ext'];
  if (!isRecord(xExt)) {
    return result;
  }

  for (const [xExtKey, extContent] of Object.entries(xExt)) {
    if (!isRecord(extContent)) {
      continue;
    }

    const components = extContent['components'];
    if (!hasMediaTypeComponents(components)) {
      continue;
    }

    addMediaTypeComponents(
      doc,
      components.mediaTypes,
      ['#', 'x-ext', xExtKey, 'components', 'mediaTypes'],
      result,
      xExtKey,
    );
  }

  return result;
}

function addMediaTypeComponents(
  doc: OpenAPIDocument,
  mediaTypes: NonNullable<ComponentsObject['mediaTypes']>,
  pathPrefix: string[],
  result: IRComponent[],
  xExtKey?: string,
): void {
  for (const [name, mediaType] of Object.entries(mediaTypes)) {
    const context: IRBuildContext = {
      doc,
      path: [...pathPrefix, name],
      required: false,
    };
    const component: IRMediaTypeComponent = {
      type: 'mediaType',
      name,
      ...(xExtKey ? { xExtKey } : {}),
      mediaType: buildIRMediaTypeEntry(mediaType, context, context.path),
    };
    result.push(component);
  }
}
