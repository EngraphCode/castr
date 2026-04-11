import {
  type CallbackObject,
  type HeaderObject,
  type MediaTypeObject,
  type OperationObject,
  type ParameterObject,
  type PathItemObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResponseObject,
  isReferenceObject,
} from '../../shared/openapi-types.js';
import type { CastrDocument } from '../ir/index.js';
import {
  markOpenApiNodeSeen,
  type OpenApiSchemaVisitor,
  visitOpenApiSchemaNode,
} from './integer-target-capabilities.openapi-schemas.js';

const OPENAPI_HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
  'query',
] as const satisfies readonly (keyof PathItemObject)[];

const PATH_ITEM_MEMBER_KEYS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
  'query',
  'additionalOperations',
  'parameters',
  'servers',
] as const;

function visitRecordValues<T>(
  values: Record<string, T> | undefined,
  visitor: (value: T) => void,
): void {
  if (values === undefined) {
    return;
  }

  for (const value of Object.values(values)) {
    visitor(value);
  }
}

function visitMapValues<T>(values: Map<string, T> | undefined, visitor: (value: T) => void): void {
  if (values === undefined) {
    return;
  }

  for (const value of values.values()) {
    visitor(value);
  }
}

function visitContentSchemas(
  content: Record<string, ReferenceObject | MediaTypeObject> | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  visitRecordValues(content, (mediaType) => {
    if (!isReferenceObject(mediaType) && mediaType.schema) {
      visitOpenApiSchemaNode(mediaType.schema, seen, visitSchema);
    }
  });
}

function hasPathItemMembers(pathItem: PathItemObject | ReferenceObject): boolean {
  return PATH_ITEM_MEMBER_KEYS.some((key) => key in pathItem);
}

function isStandalonePathItemReference(
  pathItem: PathItemObject | ReferenceObject,
): pathItem is ReferenceObject {
  return isReferenceObject(pathItem) && !hasPathItemMembers(pathItem);
}

function visitHeaderNode(
  header: HeaderObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (header === undefined || isReferenceObject(header) || !markOpenApiNodeSeen(header, seen)) {
    return;
  }

  visitOpenApiSchemaNode(header.schema, seen, visitSchema);
  visitContentSchemas(header.content, seen, visitSchema);
}

function visitParameterNode(
  parameter: ParameterObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (
    parameter === undefined ||
    isReferenceObject(parameter) ||
    !markOpenApiNodeSeen(parameter, seen)
  ) {
    return;
  }

  visitOpenApiSchemaNode(parameter.schema, seen, visitSchema);
  visitContentSchemas(parameter.content, seen, visitSchema);
}

function visitRequestBodyNode(
  requestBody: RequestBodyObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (
    requestBody === undefined ||
    isReferenceObject(requestBody) ||
    !markOpenApiNodeSeen(requestBody, seen)
  ) {
    return;
  }

  visitContentSchemas(requestBody.content, seen, visitSchema);
}

function visitResponseNode(
  response: ResponseObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (
    response === undefined ||
    isReferenceObject(response) ||
    !markOpenApiNodeSeen(response, seen)
  ) {
    return;
  }

  visitRecordValues(response.headers, (header) => visitHeaderNode(header, seen, visitSchema));
  visitContentSchemas(response.content, seen, visitSchema);
}

function visitCallbackNode(
  callback: CallbackObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (
    callback === undefined ||
    isReferenceObject(callback) ||
    !markOpenApiNodeSeen(callback, seen)
  ) {
    return;
  }

  visitRecordValues<PathItemObject | ReferenceObject>(callback, (pathItem) =>
    visitPathItemNode(pathItem, seen, visitSchema),
  );
}

function visitOperationNode(
  operation: OperationObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (operation === undefined || !markOpenApiNodeSeen(operation, seen)) {
    return;
  }

  for (const parameter of operation.parameters ?? []) {
    visitParameterNode(parameter, seen, visitSchema);
  }

  visitRequestBodyNode(operation.requestBody, seen, visitSchema);
  visitRecordValues<ResponseObject | ReferenceObject>(operation.responses, (response) =>
    visitResponseNode(response, seen, visitSchema),
  );
  visitRecordValues<CallbackObject | ReferenceObject>(operation.callbacks, (callback) =>
    visitCallbackNode(callback, seen, visitSchema),
  );
}

function visitPathItemNode(
  pathItem: PathItemObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  if (
    pathItem === undefined ||
    isStandalonePathItemReference(pathItem) ||
    !markOpenApiNodeSeen(pathItem, seen)
  ) {
    return;
  }

  for (const parameter of pathItem.parameters ?? []) {
    visitParameterNode(parameter, seen, visitSchema);
  }

  for (const method of OPENAPI_HTTP_METHODS) {
    visitOperationNode(pathItem[method], seen, visitSchema);
  }
}

export function visitDocumentOpenApiSchemas(
  document: CastrDocument,
  seen: WeakSet<object>,
  visitSchema: OpenApiSchemaVisitor,
): void {
  for (const component of document.components) {
    switch (component.type) {
      case 'header':
        visitHeaderNode(component.header, seen, visitSchema);
        break;
      case 'callback':
        visitCallbackNode(component.callback, seen, visitSchema);
        break;
      case 'pathItem':
        visitPathItemNode(component.pathItem, seen, visitSchema);
        break;
      case 'mediaType':
        if (!isReferenceObject(component.mediaType) && component.mediaType.schema) {
          visitOpenApiSchemaNode(component.mediaType.schema, seen, visitSchema);
        }
        break;
      default:
        break;
    }
  }

  visitMapValues(document.webhooks, (pathItem) => visitPathItemNode(pathItem, seen, visitSchema));
}
