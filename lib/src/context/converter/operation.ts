import type { PathsObject, OperationObject } from 'openapi3-ts/oas31';
import type { IROperation } from '../ir-schema.js';
import { convertParameter } from './parameter.js';
import { convertResponses } from './response.js';
import { convertRequestBody } from './content.js';

export function convertOperations(operations: IROperation[]): PathsObject {
  const paths: PathsObject = {};
  for (const op of operations) {
    let pathItem = paths[op.path];
    if (!pathItem) {
      pathItem = {};
      paths[op.path] = pathItem;
    }
    pathItem[op.method] = convertOperation(op);
  }
  return paths;
}

export function convertOperation(op: IROperation): OperationObject {
  const operationObject: OperationObject = {
    operationId: op.operationId,
    ...(op.summary ? { summary: op.summary } : {}),
    ...(op.description ? { description: op.description } : {}),
    ...(op.tags ? { tags: op.tags } : {}),
    parameters: op.parameters.map(convertParameter),
    responses: convertResponses(op.responses),
    ...(op.deprecated ? { deprecated: op.deprecated } : {}),
  };

  if (op.security) {
    operationObject.security = op.security.map((sec) => ({ [sec.schemeName]: sec.scopes }));
  }

  if (op.requestBody) {
    operationObject.requestBody = convertRequestBody(op.requestBody);
  }

  return operationObject;
}
