import type { IRComponent } from '../../../ir/index.js';

const COMPONENT_TYPE_ORDER_INDEX: Record<IRComponent['type'], number> = {
  schema: 0,
  securityScheme: 1,
  parameter: 2,
  response: 3,
  header: 4,
  link: 5,
  callback: 6,
  pathItem: 7,
  mediaType: 8,
  example: 9,
  requestBody: 10,
};

export function compareComponentsForDeterminism(left: IRComponent, right: IRComponent): number {
  const typeComparison =
    COMPONENT_TYPE_ORDER_INDEX[left.type] - COMPONENT_TYPE_ORDER_INDEX[right.type];
  if (typeComparison !== 0) {
    return typeComparison;
  }
  return left.name.localeCompare(right.name);
}
