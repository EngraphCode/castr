import type { CastrSchema, IRZodChainInfo } from '../../../ir/index.js';
import { createDefaultMetadata } from '../modifiers/zod-parser.defaults.js';
import { ZOD_METHOD_NULLABLE, ZOD_METHOD_NULLISH, ZOD_METHOD_OPTIONAL } from '../zod-constants.js';

const ZOD_CHAIN_OPTIONAL_PRESENCE = '.optional()';
const ZOD_CHAIN_NULLABLE_PRESENCE = '.nullable()';
const ZOD_CHAIN_NULLISH_PRESENCE = '.nullish()';
const SCHEMA_TYPE_NULL = 'null';

export type ReferenceWrapperMethod =
  | typeof ZOD_METHOD_OPTIONAL
  | typeof ZOD_METHOD_NULLABLE
  | typeof ZOD_METHOD_NULLISH;

export function classifyReferenceWrapper(methodName: string): ReferenceWrapperMethod | undefined {
  if (methodName === ZOD_METHOD_OPTIONAL) {
    return ZOD_METHOD_OPTIONAL;
  }
  if (methodName === ZOD_METHOD_NULLABLE) {
    return ZOD_METHOD_NULLABLE;
  }
  if (methodName === ZOD_METHOD_NULLISH) {
    return ZOD_METHOD_NULLISH;
  }
  return undefined;
}

export function reduceReferenceWrapperMethods(methods: ReferenceWrapperMethod[]): {
  optional: boolean;
  nullable: boolean;
} {
  let optional = false;
  let nullable = false;

  for (const method of methods) {
    if (method === ZOD_METHOD_OPTIONAL) {
      optional = true;
    } else if (method === ZOD_METHOD_NULLABLE) {
      nullable = true;
    } else if (method === ZOD_METHOD_NULLISH) {
      optional = true;
      nullable = true;
    }
  }

  return { optional, nullable };
}

function buildPresence(optional: boolean, nullable: boolean): string {
  if (optional && nullable) {
    return ZOD_CHAIN_NULLISH_PRESENCE;
  }
  if (optional) {
    return ZOD_CHAIN_OPTIONAL_PRESENCE;
  }
  if (nullable) {
    return ZOD_CHAIN_NULLABLE_PRESENCE;
  }
  return '';
}

function createWrapperZodChain(optional: boolean, nullable: boolean): IRZodChainInfo {
  return {
    presence: buildPresence(optional, nullable),
    validations: [],
    defaults: [],
  };
}

export function buildWrappedReferenceSchema(
  ref: string,
  methods: ReferenceWrapperMethod[],
): CastrSchema {
  const { optional, nullable } = reduceReferenceWrapperMethods(methods);
  const metadata = createDefaultMetadata({
    required: !optional,
    zodChain: createWrapperZodChain(optional, nullable),
  });

  if (!nullable) {
    return {
      $ref: ref,
      metadata,
    };
  }

  return {
    anyOf: [
      {
        $ref: ref,
        metadata: createDefaultMetadata(),
      },
      {
        type: SCHEMA_TYPE_NULL,
        metadata: createDefaultMetadata(),
      },
    ],
    metadata,
  };
}
