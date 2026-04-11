import {
  type CallbackObject,
  type HeaderObject,
  type MediaTypeObject,
  type OpenAPIDocument,
  type OperationObject,
  type ParameterObject,
  type PathItemObject,
  type ReferenceObject,
  type RequestBodyObject,
  type ResponseObject,
  isReferenceObject,
} from '../../../shared/openapi-types.js';

import { visitSchemaNode } from './openapi-document.object-semantics.schemas.js';

const HTTP_METHODS = [
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

function markSeen(value: object, seen: WeakSet<object>): boolean {
  if (seen.has(value)) {
    return false;
  }

  seen.add(value);
  return true;
}

function visitMapValues<T>(
  values: Record<string, T> | undefined,
  visitor: (value: T) => void,
): void {
  if (!values) {
    return;
  }

  for (const value of Object.values(values)) {
    visitor(value);
  }
}

function visitContent(
  content: Record<string, MediaTypeObject | ReferenceObject> | undefined,
  seen: WeakSet<object>,
): void {
  visitMapValues(content, (mediaType) => {
    if (!isReferenceObject(mediaType)) {
      if (mediaType.schema) {
        visitSchemaNode(mediaType.schema, seen);
      }
      if (mediaType.itemSchema) {
        visitSchemaNode(mediaType.itemSchema, seen);
      }
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
): void {
  if (!header || isReferenceObject(header) || !markSeen(header, seen)) {
    return;
  }

  visitSchemaNode(header.schema, seen);
  visitContent(header.content, seen);
}

function visitParameterNode(
  parameter: ParameterObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
): void {
  if (!parameter || isReferenceObject(parameter) || !markSeen(parameter, seen)) {
    return;
  }

  visitSchemaNode(parameter.schema, seen);
  visitContent(parameter.content, seen);
}

function visitParameterList(
  parameters: readonly (ParameterObject | ReferenceObject)[] | undefined,
  seen: WeakSet<object>,
): void {
  if (!parameters) {
    return;
  }

  for (const parameter of parameters) {
    visitParameterNode(parameter, seen);
  }
}

function visitRequestBodyNode(
  requestBody: RequestBodyObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
): void {
  if (!requestBody || isReferenceObject(requestBody) || !markSeen(requestBody, seen)) {
    return;
  }

  visitContent(requestBody.content, seen);
}

function visitResponseNode(
  response: ResponseObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
): void {
  if (!response || isReferenceObject(response) || !markSeen(response, seen)) {
    return;
  }

  visitMapValues(response.headers, (header) => visitHeaderNode(header, seen));
  visitContent(response.content, seen);
}

function visitCallbackNode(
  callback: CallbackObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
): void {
  if (!callback || isReferenceObject(callback) || !markSeen(callback, seen)) {
    return;
  }

  visitMapValues<PathItemObject | ReferenceObject>(callback, (pathItem) =>
    visitPathItemNode(pathItem, seen),
  );
}

function visitOperationNode(operation: OperationObject | undefined, seen: WeakSet<object>): void {
  if (!operation || !markSeen(operation, seen)) {
    return;
  }

  visitParameterList(operation.parameters, seen);
  visitRequestBodyNode(operation.requestBody, seen);
  visitMapValues<ResponseObject | ReferenceObject>(operation.responses, (response) =>
    visitResponseNode(response, seen),
  );
  visitMapValues<CallbackObject | ReferenceObject>(operation.callbacks, (callback) =>
    visitCallbackNode(callback, seen),
  );
}

function visitAdditionalOperations(
  additionalOperations: Record<string, OperationObject> | undefined,
  seen: WeakSet<object>,
): void {
  visitMapValues(additionalOperations, (operation) => visitOperationNode(operation, seen));
}

function visitPathItemNode(
  pathItem: PathItemObject | ReferenceObject | undefined,
  seen: WeakSet<object>,
): void {
  if (!pathItem || isStandalonePathItemReference(pathItem) || !markSeen(pathItem, seen)) {
    return;
  }

  visitParameterList(pathItem.parameters, seen);
  for (const method of HTTP_METHODS) {
    visitOperationNode(pathItem[method], seen);
  }
  visitAdditionalOperations(pathItem.additionalOperations, seen);
}

export function cloneAndValidateOpenApiDocumentObjectSemantics(
  doc: OpenAPIDocument,
): OpenAPIDocument {
  const clonedDoc = structuredClone(doc);
  const seen = new WeakSet<object>();

  visitMapValues(clonedDoc.components?.headers, (header) => visitHeaderNode(header, seen));
  visitMapValues(clonedDoc.components?.callbacks, (callback) => visitCallbackNode(callback, seen));
  visitMapValues(clonedDoc.components?.pathItems, (pathItem) => visitPathItemNode(pathItem, seen));
  visitMapValues(clonedDoc.components?.mediaTypes, (mediaType) => {
    if (!isReferenceObject(mediaType)) {
      if (mediaType.schema) {
        visitSchemaNode(mediaType.schema, seen);
      }
      if (mediaType.itemSchema) {
        visitSchemaNode(mediaType.itemSchema, seen);
      }
    }
  });
  visitMapValues(clonedDoc.webhooks, (pathItem) => visitPathItemNode(pathItem, seen));

  return clonedDoc;
}
