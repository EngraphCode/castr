import type { CastrSchemaContext } from '../../ir/context.js';

const CONTEXT_TYPE_PROPERTY = 'property' as const;
const CONTEXT_TYPE_PARAMETER = 'parameter' as const;

export function isOptionalSchemaContext(context: CastrSchemaContext): boolean {
  return (
    (context.contextType === CONTEXT_TYPE_PROPERTY && context.optional === true) ||
    (context.contextType === CONTEXT_TYPE_PARAMETER && context.required === false)
  );
}
