/**
 * Agent-adapter + cursor-rule drift checker.
 *
 * Recomputes every generated surface in memory and compares it bytewise
 * against the on-disk files. Read-only. Used by
 * `agent-adapter-generate --check` to gate against drift between the canonical
 * sources (Codex layer + `.agent/rules`) and their generated projections.
 */
import { readFile } from 'node:fs/promises';

import { planGeneration } from './generator.js';

export interface CheckOutcome {
  readonly drifted: readonly string[];
  readonly missing: readonly string[];
}

async function readFileOrUndefined(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return undefined;
  }
}

export async function checkAdapters(repoRoot: string): Promise<CheckOutcome> {
  const drifted: string[] = [];
  const missing: string[] = [];
  for (const unit of await planGeneration(repoRoot)) {
    const actual = await readFileOrUndefined(unit.target);
    if (actual === undefined) {
      missing.push(unit.target);
    } else if (actual !== unit.content) {
      drifted.push(unit.target);
    }
  }
  return { drifted, missing };
}
