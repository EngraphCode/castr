/**
 * Agent-adapter + cursor-rule drift checker.
 *
 * Recomputes every generated surface in memory and compares it bytewise
 * against the on-disk files. Read-only. Used by
 * `agent-adapter-generate --check` to gate against drift between the canonical
 * sources (Codex layer + `.agent/rules`) and their generated projections.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { glob } from 'tinyglobby';

import { planGeneration, type GenerationUnit } from './generator.js';

/** Differences between the complete generated estate and its expected projection. */
export interface CheckOutcome {
  /** Expected paths whose bytes differ from generation. */
  readonly drifted: readonly string[];
  /** Expected paths absent from the generated directories. */
  readonly missing: readonly string[];
  /** Generated paths with no canonical source remaining. */
  readonly unexpected: readonly string[];
}

/**
 * Compare a generation plan with the complete generated estate, without I/O.
 *
 * @param expected - Unique target paths and their canonical rendered contents.
 * @param actual - Every generated path and its current contents, using the same path base.
 * @returns Sorted missing, drifted and unexpected paths; empty lists mean exact parity.
 * @example
 * ```ts
 * compareAdapters([{ target: 'review.md', content: 'new' }], new Map());
 * // { drifted: [], missing: ['review.md'], unexpected: [] }
 * ```
 */
export function compareAdapters(
  expected: readonly GenerationUnit[],
  actual: ReadonlyMap<string, string>,
): CheckOutcome {
  const drifted: string[] = [];
  const missing: string[] = [];
  const expectedPaths = new Set(expected.map((unit) => unit.target));
  for (const unit of expected) {
    if (!actual.has(unit.target)) {
      missing.push(unit.target);
    } else if (actual.get(unit.target) !== unit.content) {
      drifted.push(unit.target);
    }
  }
  const unexpected = [...actual.keys()].filter((path) => !expectedPaths.has(path));
  return {
    drifted: drifted.toSorted(),
    missing: missing.toSorted(),
    unexpected: unexpected.toSorted(),
  };
}

/**
 * Recompute the generation plan and read all generated agent/rule files.
 *
 * @param repoRoot - Repository directory containing the canonical Codex sources.
 * @returns The complete bytewise parity result, including surplus nested files.
 * @throws If canonical sources are invalid or an enumerated file cannot be read.
 * @remarks No files are changed; the CLI fails when any difference is reported.
 */
export async function checkAdapters(repoRoot: string): Promise<CheckOutcome> {
  const expected = await planGeneration(repoRoot);
  const paths = await glob(
    ['.cursor/agents/**/*.md', '.claude/agents/**/*.md', '.cursor/rules/**/*.mdc'],
    { cwd: repoRoot, dot: true },
  );
  const actual = new Map<string, string>();
  for (const path of paths.toSorted()) {
    const target = join(repoRoot, path);
    actual.set(target, await readFile(target, 'utf8'));
  }
  return compareAdapters(expected, actual);
}
