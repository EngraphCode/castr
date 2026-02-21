/**
 * Zod Declaration Builder
 *
 * Generates a synthetic zod declaration source file from the parser's
 * known method arrays. This is a build-time utility, not a runtime parser,
 * so string operations on constant data are appropriate here.
 *
 * @module parsers/zod/zod-decl-builder
 * @internal
 */

import {
  ZOD_FLAT_PRIMITIVES,
  ZOD_NAMESPACE_PRIMITIVES,
  ZOD_COMPOSITIONS,
} from '../zod-constants.js';

/**
 * Build a synthetic zod declaration source from the parser's known method lists.
 *
 * Single source of truth: the constant arrays in `zod-constants.ts` define
 * the API surface. The synthetic declaration is generated from these so it
 * stays in sync automatically.
 *
 * @returns A TypeScript declaration source string for the synthetic zod module
 * @internal
 */
export function buildZodDeclarationSource(): string {
  const lines = ['export declare const z: {'];

  for (const m of ZOD_FLAT_PRIMITIVES) {
    lines.push(`  ${m}(...args: never[]): unknown;`);
  }

  for (const m of ZOD_COMPOSITIONS) {
    lines.push(`  ${m}(...args: never[]): unknown;`);
  }

  // Namespaced methods (e.g. z.iso.date, z.iso.datetime)
  for (const [ns, methods] of ZOD_NAMESPACE_PRIMITIVES) {
    lines.push(`  ${ns}: {`);
    for (const m of methods) {
      lines.push(`    ${m}(...args: never[]): unknown;`);
    }
    lines.push('  };');
  }

  lines.push('};');
  return lines.join('\n');
}
