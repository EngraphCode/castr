/**
 * Type definitions extracted from template-context.ts
 * Following the "Literals Tied to Library Types" pattern from RULES.md
 */

import type { TemplateContextOptions } from './template-context.js';

/**
 * Extract defaultStatusBehavior type from TemplateContextOptions
 * This ensures we use the library's type as the source of truth
 */
export type DefaultStatusBehavior = NonNullable<TemplateContextOptions['defaultStatusBehavior']>;

/**
 * Literal values for defaultStatusBehavior, derived from library type
 * If this doesn't compile, it means the library type has changed
 */
const DEFAULT_STATUS_BEHAVIORS = [
  'spec-compliant',
  'auto-correct',
] as const satisfies readonly DefaultStatusBehavior[];

/**
 * Type predicate to check if a value is a valid DefaultStatusBehavior
 * Narrows `unknown` to `DefaultStatusBehavior`
 */
export function isDefaultStatusBehavior(value: unknown): value is DefaultStatusBehavior {
  if (typeof value !== 'string') return false;
  const behaviors: readonly string[] = DEFAULT_STATUS_BEHAVIORS;
  return behaviors.includes(value);
}
