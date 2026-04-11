import type { OperationObject, PathItemObject } from '../../../../shared/openapi-types.js';
import {
  STANDARD_HTTP_METHODS,
  getAdditionalOperationMethodValidationError,
  isStandardHttpMethod,
} from '../../../../shared/openapi/http-methods.js';
import type { CastrAdditionalOperation, CastrOperation, IRHttpMethod } from '../../../ir/index.js';

const OPERATION_SOURCE_FIXED = 'fixed';
const OPERATION_SOURCE_ADDITIONAL = 'additional';

export type CastrOperationLike = CastrOperation | CastrAdditionalOperation;
export type OperationWriteEntry =
  | { source: typeof OPERATION_SOURCE_FIXED; operation: CastrOperation }
  | { source: typeof OPERATION_SOURCE_ADDITIONAL; operation: CastrAdditionalOperation };

type PathItemMethodSetter = (pathItem: PathItemObject, op: OperationObject) => void;

const PATH_ITEM_METHOD_SETTERS: Record<IRHttpMethod, PathItemMethodSetter> = {
  get: (p, op) => {
    p.get = op;
  },
  post: (p, op) => {
    p.post = op;
  },
  put: (p, op) => {
    p.put = op;
  },
  patch: (p, op) => {
    p.patch = op;
  },
  delete: (p, op) => {
    p.delete = op;
  },
  head: (p, op) => {
    p.head = op;
  },
  options: (p, op) => {
    p.options = op;
  },
  trace: (p, op) => {
    p.trace = op;
  },
  query: (p, op) => {
    p.query = op;
  },
};

const HTTP_METHOD_ORDER: IRHttpMethod[] = [...STANDARD_HTTP_METHODS];
const HTTP_METHOD_ORDER_INDEX = new Map<IRHttpMethod, number>(
  HTTP_METHOD_ORDER.map((method, index) => [method, index]),
);

function compareOperationsByPathThenMethod(
  left: CastrOperationLike,
  right: CastrOperationLike,
): number {
  const pathComparison = left.path.localeCompare(right.path);
  if (pathComparison !== 0) {
    return pathComparison;
  }

  return compareOperationMethods(left.method, right.method);
}

function compareOperationMethods(left: string, right: string): number {
  const leftOrder = getHttpMethodOrder(left);
  const rightOrder = getHttpMethodOrder(right);

  if (leftOrder === undefined || rightOrder === undefined) {
    return compareAdditionalOperationMethodOrder(left, leftOrder, right, rightOrder);
  }

  return leftOrder === rightOrder ? 0 : leftOrder - rightOrder;
}

function getHttpMethodOrder(method: string): number | undefined {
  if (!isStandardHttpMethod(method)) {
    return undefined;
  }

  return HTTP_METHOD_ORDER_INDEX.get(method);
}

function compareAdditionalOperationMethodOrder(
  left: string,
  leftOrder: number | undefined,
  right: string,
  rightOrder: number | undefined,
): number {
  if (leftOrder !== undefined && rightOrder === undefined) {
    return -1;
  }
  if (leftOrder === undefined && rightOrder !== undefined) {
    return 1;
  }

  return left.localeCompare(right);
}

function assertWritableAdditionalOperationMethod(method: string): void {
  const validationError = getAdditionalOperationMethodValidationError(method);
  if (validationError !== undefined) {
    throw new Error(validationError);
  }
}

function createAdditionalOperationWriteEntry(
  operation: CastrAdditionalOperation,
): OperationWriteEntry {
  assertWritableAdditionalOperationMethod(operation.method);
  return { source: OPERATION_SOURCE_ADDITIONAL, operation };
}

export function buildOperationWriteEntries(
  operations: CastrOperation[],
  additionalOperations: CastrAdditionalOperation[],
): OperationWriteEntry[] {
  return [
    ...operations.map((operation) => ({ source: OPERATION_SOURCE_FIXED, operation }) as const),
    ...additionalOperations.map(createAdditionalOperationWriteEntry),
  ].sort((left, right) => compareOperationsByPathThenMethod(left.operation, right.operation));
}

export function assignOperationToPath(
  pathItem: PathItemObject,
  op: OperationObject,
  entry: OperationWriteEntry,
): void {
  if (entry.source === OPERATION_SOURCE_FIXED) {
    PATH_ITEM_METHOD_SETTERS[entry.operation.method](pathItem, op);
    return;
  }

  assertWritableAdditionalOperationMethod(entry.operation.method);
  pathItem.additionalOperations ??= {};
  pathItem.additionalOperations[entry.operation.method] = op;
}
