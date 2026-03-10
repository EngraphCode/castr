import { Node } from 'ts-morph';
import type { CastrSchema } from '../../../ir/index.js';
import {
  applyExplicitUuidVersion,
  applyInferredUuidVersionFromPattern,
} from '../../../ir/index.js';
import type { ZodMethodCall } from '../ast/zod-ast.js';
import {
  ZOD_BASE_METHOD_UUID_V4,
  ZOD_BASE_METHOD_UUID_V7,
  ZOD_METHOD_REGEX,
} from '../zod-constants.js';

function hasRegexFlags(method: ZodMethodCall): boolean {
  const regexNode = method.argNodes[0];
  if (regexNode === undefined || !Node.isRegularExpressionLiteral(regexNode)) {
    return false;
  }

  return regexNode.getLiteralValue().flags.length > 0;
}

export function applyUuidSemanticsFromZodChain(
  schema: CastrSchema,
  baseMethod: string,
  chainedMethods: ZodMethodCall[],
): void {
  if (baseMethod === ZOD_BASE_METHOD_UUID_V4) {
    applyExplicitUuidVersion(schema, 4);
  } else if (baseMethod === ZOD_BASE_METHOD_UUID_V7) {
    applyExplicitUuidVersion(schema, 7);
  }

  const regexMethod = chainedMethods.find((method) => method.name === ZOD_METHOD_REGEX);
  if (regexMethod === undefined || hasRegexFlags(regexMethod)) {
    return;
  }

  applyInferredUuidVersionFromPattern(schema);
}
