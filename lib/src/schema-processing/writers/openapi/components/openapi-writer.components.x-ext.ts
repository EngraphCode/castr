import type { ComponentsObject } from '../../../../shared/openapi-types.js';
import { writeMediaTypeEntry } from '../openapi-writer.media-types.js';
import type { IRComponent, IRMediaTypeComponent } from '../../../ir/index.js';

const COMPONENT_TYPE_MEDIA_TYPE = 'mediaType';

export type OpenApiXExtMediaTypeMap = Record<
  string,
  {
    components: {
      mediaTypes: NonNullable<ComponentsObject['mediaTypes']>;
    };
  }
>;

function isExternalMediaTypeComponent(
  component: IRComponent,
): component is IRMediaTypeComponent & { xExtKey: string } {
  return component.type === COMPONENT_TYPE_MEDIA_TYPE && component.xExtKey !== undefined;
}

function addXExtMediaTypeComponent(
  result: OpenApiXExtMediaTypeMap,
  component: IRMediaTypeComponent & { xExtKey: string },
): void {
  const bucket = (result[component.xExtKey] ??= {
    components: {
      mediaTypes: {},
    },
  });

  bucket.components.mediaTypes[component.name] = writeMediaTypeEntry(component.mediaType);
}

export function writeOpenApiXExtMediaTypeComponents(
  components: IRComponent[],
): OpenApiXExtMediaTypeMap | undefined {
  const result: OpenApiXExtMediaTypeMap = {};
  const externalMediaTypeComponents = components
    .filter(isExternalMediaTypeComponent)
    .sort(
      (left, right) =>
        left.xExtKey.localeCompare(right.xExtKey) || left.name.localeCompare(right.name),
    );

  for (const component of externalMediaTypeComponents) {
    addXExtMediaTypeComponent(result, component);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}
