import {
  type OpenAPIDocument,
  type PathItemObject,
  type OperationObject,
  isReferenceObject,
} from '../../../../shared/openapi-types.js';
import {
  getAdditionalOperationMethodValidationError,
  STANDARD_HTTP_METHODS,
} from '../../../../shared/openapi/http-methods.js';
import type { IRBuildContext } from '../builder.types.js';
import { buildCastrParameters } from './builder.parameters.js';
import { buildCastrResponses } from './builder.responses.js';
import type { CastrAdditionalOperation, CastrOperation } from '../../../ir/index.js';
import {
  addOptionalOperationFields,
  addPathItemFields,
  type CastrOperationLike,
  type HttpMethod,
  mergePathAndOperationParameters,
} from './fields/builder.operations.fields.js';

const PARAMETER_LOCATION_QUERY_STRING = 'querystring';

export { buildIRSecurity } from './fields/builder.operations.fields.js';

export function buildCastrOperations(doc: OpenAPIDocument): CastrOperation[] {
  if (!doc.paths) {
    return [];
  }

  const operations: CastrOperation[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (pathItem) {
      const pathOperations = extractPathOperations(path, pathItem, doc);
      operations.push(...pathOperations);
    }
  }

  return operations;
}

export function buildCastrAdditionalOperations(doc: OpenAPIDocument): CastrAdditionalOperation[] {
  if (!doc.paths) {
    return [];
  }

  const operations: CastrAdditionalOperation[] = [];

  for (const [path, pathItem] of Object.entries(doc.paths)) {
    if (pathItem) {
      const pathOperations = extractPathAdditionalOperations(path, pathItem, doc);
      operations.push(...pathOperations);
    }
  }

  return operations;
}

function extractPathOperations(
  path: string,
  pathItem: PathItemObject,
  doc: OpenAPIDocument,
): CastrOperation[] {
  const operations: CastrOperation[] = [];
  for (const method of STANDARD_HTTP_METHODS) {
    const operation = pathItem[method];
    if (!operation || typeof operation !== 'object' || isReferenceObject(operation)) {
      continue;
    }

    const irOperation = buildCastrOperation(
      method,
      path,
      mergePathAndOperationParameters(pathItem, operation),
      pathItem,
      doc,
    );
    operations.push(irOperation);
  }

  return operations;
}

function extractPathAdditionalOperations(
  path: string,
  pathItem: PathItemObject,
  doc: OpenAPIDocument,
): CastrAdditionalOperation[] {
  if (!pathItem.additionalOperations) {
    return [];
  }

  const operations: CastrAdditionalOperation[] = [];
  const sortedMethods = Object.keys(pathItem.additionalOperations).sort((left, right) =>
    left.localeCompare(right),
  );

  for (const method of sortedMethods) {
    const validationError = getAdditionalOperationMethodValidationError(method);
    if (validationError) {
      throw new Error(`${validationError} (at paths/${path}/additionalOperations/${method})`);
    }

    const operation = pathItem.additionalOperations[method];
    if (!operation || typeof operation !== 'object' || isReferenceObject(operation)) {
      continue;
    }

    const irOperation = buildCastrOperation(
      method,
      path,
      mergePathAndOperationParameters(pathItem, operation),
      pathItem,
      doc,
    );
    operations.push(irOperation);
  }

  return operations;
}

function buildCastrOperation(
  method: HttpMethod,
  path: string,
  operation: OperationObject,
  pathItem: PathItemObject,
  doc: OpenAPIDocument,
): CastrOperation;
function buildCastrOperation(
  method: string,
  path: string,
  operation: OperationObject,
  pathItem: PathItemObject,
  doc: OpenAPIDocument,
): CastrAdditionalOperation;
function buildCastrOperation(
  method: string,
  path: string,
  operation: OperationObject,
  pathItem: PathItemObject,
  doc: OpenAPIDocument,
): CastrOperationLike {
  const context: IRBuildContext = {
    doc,
    path: [path, method],
    required: false,
  };

  const irOperation: CastrOperationLike = {
    ...(operation.operationId ? { operationId: operation.operationId } : {}),
    method,
    path,
    parameters: buildCastrParameters(operation.parameters, context),
    parametersByLocation: {
      query: [],
      path: [],
      header: [],
      cookie: [],
      querystring: [],
    },
    responses: buildCastrResponses(operation.responses, context),
  };

  for (const param of irOperation.parameters) {
    if (param.in === PARAMETER_LOCATION_QUERY_STRING) {
      irOperation.parametersByLocation.querystring ??= [];
      irOperation.parametersByLocation.querystring.push(param);
    } else if (param.in in irOperation.parametersByLocation) {
      irOperation.parametersByLocation[param.in].push(param);
    }
  }

  addOptionalOperationFields(irOperation, operation, context);
  addPathItemFields(irOperation, pathItem);

  return irOperation;
}
