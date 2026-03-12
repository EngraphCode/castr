import type {
  CallbackObject,
  HeaderObject,
  MediaTypeObject,
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  ReferenceObject,
  RequestBodyObject,
  ResponseObject,
} from 'openapi3-ts/oas31';
import { isReferenceObject } from 'openapi3-ts/oas31';

import type { NonStrictObjectPolicyOptions } from '../../non-strict-object-policy.js';
import { visitSchemaNode } from './openapi-document.non-strict-object-policy.schemas.js';

const HTTP_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace',
] as const satisfies readonly (keyof PathItemObject)[];

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
  content: Record<string, MediaTypeObject> | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  visitMapValues(content, (mediaType) => visitSchemaNode(mediaType.schema, options, seen));
}

function visitHeaderNode(
  header: HeaderObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!header || isReferenceObject(header) || !markSeen(header, seen)) {
    return;
  }

  visitSchemaNode(header.schema, options, seen);
  visitContent(header.content, options, seen);
}

function visitParameterNode(
  parameter: ParameterObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!parameter || isReferenceObject(parameter) || !markSeen(parameter, seen)) {
    return;
  }

  visitSchemaNode(parameter.schema, options, seen);
  visitContent(parameter.content, options, seen);
}

function visitParameterList(
  parameters: readonly (ParameterObject | ReferenceObject)[] | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!parameters) {
    return;
  }

  for (const parameter of parameters) {
    visitParameterNode(parameter, options, seen);
  }
}

function visitRequestBodyNode(
  requestBody: RequestBodyObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!requestBody || isReferenceObject(requestBody) || !markSeen(requestBody, seen)) {
    return;
  }

  visitContent(requestBody.content, options, seen);
}

function visitResponseNode(
  response: ResponseObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!response || isReferenceObject(response) || !markSeen(response, seen)) {
    return;
  }

  visitMapValues(response.headers, (header) => visitHeaderNode(header, options, seen));
  visitContent(response.content, options, seen);
}

function visitCallbackNode(
  callback: CallbackObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!callback || isReferenceObject(callback) || !markSeen(callback, seen)) {
    return;
  }

  visitMapValues<PathItemObject | ReferenceObject>(callback, (pathItem) =>
    visitPathItemNode(pathItem, options, seen),
  );
}

function visitOperationNode(
  operation: OperationObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!operation || !markSeen(operation, seen)) {
    return;
  }

  visitParameterList(operation.parameters, options, seen);
  visitRequestBodyNode(operation.requestBody, options, seen);
  visitMapValues<ResponseObject | ReferenceObject>(operation.responses, (response) =>
    visitResponseNode(response, options, seen),
  );
  visitMapValues<CallbackObject | ReferenceObject>(operation.callbacks, (callback) =>
    visitCallbackNode(callback, options, seen),
  );
}

function visitPathItemNode(
  pathItem: PathItemObject | ReferenceObject | undefined,
  options: NonStrictObjectPolicyOptions | undefined,
  seen: WeakSet<object>,
): void {
  if (!pathItem || isReferenceObject(pathItem) || !markSeen(pathItem, seen)) {
    return;
  }

  visitParameterList(pathItem.parameters, options, seen);
  for (const method of HTTP_METHODS) {
    visitOperationNode(pathItem[method], options, seen);
  }
}

export function cloneAndApplyOpenApiDocumentNonStrictObjectPolicy(
  doc: OpenAPIObject,
  options?: NonStrictObjectPolicyOptions,
): OpenAPIObject {
  const clonedDoc = structuredClone(doc);
  const seen = new WeakSet<object>();

  visitMapValues(clonedDoc.components?.headers, (header) => visitHeaderNode(header, options, seen));
  visitMapValues(clonedDoc.components?.callbacks, (callback) =>
    visitCallbackNode(callback, options, seen),
  );
  visitMapValues(clonedDoc.components?.pathItems, (pathItem) =>
    visitPathItemNode(pathItem, options, seen),
  );
  visitMapValues(clonedDoc.webhooks, (pathItem) => visitPathItemNode(pathItem, options, seen));

  return clonedDoc;
}
