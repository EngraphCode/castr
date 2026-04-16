import { Node } from 'ts-morph';

import type { CastrSchema } from '../../../ir/index.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import { applyMetaToSchema, extractMetaFromChain } from '../modifiers/zod-parser.meta.js';
import { getZodMethodChain, type ZodMethodCall } from '../ast/zod-ast.js';
import type { ZodImportResolver } from '../registry/zod-import-resolver.js';
import type { ZodSchemaParser } from '../zod-parser.types.js';
import {
  ZOD_INTERNAL_PERMISSIVE_CATCHALL_ANY,
  ZOD_INTERNAL_PERMISSIVE_CATCHALL_UNKNOWN,
} from '../../../../shared/zod/permissive-catchall.constants.js';
import {
  ZOD_BASE_METHOD_ANY,
  ZOD_BASE_METHOD_UNKNOWN,
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
} from '../zod-constants.js';

const PERMISSIVE_CATCHALL_METHODS = new Set([
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
]);

function getCatchallArgumentNode(catchallMethod: ZodMethodCall): Node {
  const catchallNode = catchallMethod.argNodes[0];
  if (catchallNode === undefined || catchallMethod.argNodes.length !== 1) {
    throw new Error('z.catchall() requires exactly one schema argument.');
  }

  return catchallNode;
}

function getCatchallChainInfo(
  catchallMethod: ZodMethodCall,
  resolver: ZodImportResolver,
): ReturnType<typeof getZodMethodChain> | undefined {
  const catchallNode = getCatchallArgumentNode(catchallMethod);
  if (!Node.isCallExpression(catchallNode)) {
    return undefined;
  }

  return getZodMethodChain(catchallNode, resolver);
}

function isPermissiveCatchallBaseMethod(baseMethod: string): boolean {
  return baseMethod === ZOD_BASE_METHOD_UNKNOWN || baseMethod === ZOD_BASE_METHOD_ANY;
}

function getUnsupportedPermissiveMethod(
  chainedMethods: ZodMethodCall[],
): ZodMethodCall | undefined {
  return chainedMethods.find((method) => !PERMISSIVE_CATCHALL_METHODS.has(method.name));
}

function buildPermissiveCatchallSchema(
  chainInfo: NonNullable<ReturnType<typeof getZodMethodChain>>,
): CastrSchema {
  const defaultValue = chainInfo.chainedMethods.find((method) => method.name === ZOD_METHOD_DEFAULT)
    ?.args[0];
  const baseValidation =
    chainInfo.baseMethod === ZOD_BASE_METHOD_ANY
      ? ZOD_INTERNAL_PERMISSIVE_CATCHALL_ANY
      : ZOD_INTERNAL_PERMISSIVE_CATCHALL_UNKNOWN;
  const schema: CastrSchema = {
    metadata: createDefaultMetadata({
      zodChain: {
        presence: '',
        validations: [baseValidation],
        defaults: defaultValue === undefined ? [] : [`.default(${JSON.stringify(defaultValue)})`],
      },
      defaultValue,
    }),
  };

  if (defaultValue !== undefined) {
    schema.default = defaultValue;
  }

  const describeMethod = chainInfo.chainedMethods.find(
    (method) => method.name === ZOD_METHOD_DESCRIBE,
  );
  if (typeof describeMethod?.args[0] === 'string') {
    schema.description = describeMethod.args[0];
  }

  applyMetaToSchema(schema, extractMetaFromChain(chainInfo.chainedMethods));
  return schema;
}

function parseCatchallSchema(
  catchallMethod: ZodMethodCall,
  parseSchema: ZodSchemaParser,
): CastrSchema {
  const catchallNode = getCatchallArgumentNode(catchallMethod);
  const parsedCatchall = parseSchema(catchallNode);
  if (!parsedCatchall) {
    throw new Error(
      'Failed to parse z.catchall() schema argument. Catchall semantics require a statically analyzable Zod schema.',
    );
  }

  return parsedCatchall;
}

export function resolveCatchallAdditionalProperties(
  catchallMethod: ZodMethodCall,
  parseSchema: ZodSchemaParser,
  resolver: ZodImportResolver,
): boolean | CastrSchema {
  const chainInfo = getCatchallChainInfo(catchallMethod, resolver);
  let additionalProperties: boolean | CastrSchema;

  if (!chainInfo || !isPermissiveCatchallBaseMethod(chainInfo.baseMethod)) {
    additionalProperties = parseCatchallSchema(catchallMethod, parseSchema);
  } else if (chainInfo.chainedMethods.length === 0) {
    additionalProperties = true;
  } else {
    const unsupportedMethod = getUnsupportedPermissiveMethod(chainInfo.chainedMethods);
    if (unsupportedMethod) {
      throw new Error(
        `Unsupported z.catchall() schema argument: .${unsupportedMethod.name}() on z.${chainInfo.baseMethod}() ` +
          'cannot be represented honestly. Use bare z.any()/z.unknown() or metadata-only chaining.',
      );
    }

    additionalProperties = buildPermissiveCatchallSchema(chainInfo);
  }

  return additionalProperties;
}
