import type { IRZodChainInfo } from '../../../ir/index.js';
import type { ZodMethodCall } from '../ast/zod-ast.js';
import type { ParsedOptionality } from '../modifiers/zod-parser.constraints.js';
import { collectDefaults, computePresence } from '../modifiers/zod-parser.chain-whitelist.js';
import {
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_DESCRIBE,
  ZOD_METHOD_META,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
  ZOD_METHOD_OPTIONAL,
} from '../zod-constants.js';

const SKIP_VALIDATION_METHODS = new Set<string>([
  ZOD_METHOD_OPTIONAL,
  ZOD_METHOD_NULLABLE,
  ZOD_METHOD_NULLISH,
  ZOD_METHOD_DEFAULT,
  ZOD_METHOD_META,
  ZOD_METHOD_DESCRIBE,
]);

function collectValidations(methods: ZodMethodCall[]): string[] {
  const validations: string[] = [];
  for (const method of methods) {
    if (SKIP_VALIDATION_METHODS.has(method.name)) {
      continue;
    }
    const argsStr = method.args.map((a) => JSON.stringify(a)).join(', ');
    validations.push(`.${method.name}(${argsStr})`);
  }
  return validations;
}

export function buildZodChainInfo(
  methods: ZodMethodCall[],
  optionality: ParsedOptionality,
  defaultValue: unknown,
): IRZodChainInfo {
  return {
    presence: computePresence(optionality),
    validations: collectValidations(methods),
    defaults: collectDefaults(defaultValue),
  };
}
