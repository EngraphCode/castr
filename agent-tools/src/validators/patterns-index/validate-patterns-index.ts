#!/usr/bin/env node

/**
 * Patterns-index generator/validator entry point.
 *
 * Recomputes the "Pattern Index" section of
 * `.agent/memory/active/patterns/README.md` from every pattern file's
 * frontmatter, then either verifies the on-disk index matches (check mode, the
 * default — used as a quality gate) or rewrites it (`--fix`). The generated
 * region is delimited by sentinels so a hand-edit is structurally visible:
 *
 * ```sh
 * pnpm --filter @engraph/agent-tools validate-patterns-index       # check (gate)
 * pnpm --filter @engraph/agent-tools validate-patterns-index:fix   # regenerate
 * ```
 *
 * Repo-agnostic: it resolves the repo root from its own location and names no
 * repository, so the same tool regenerates any Practice estate's index.
 *
 * Exit 0 means the index is current (warnings do not fail the run); exit 1
 * means a hard error (unparseable file, absent README/sentinels) or — in check
 * mode — that the index is stale.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveRepoRoot } from '../../core/repo-root.js';
import {
  groupPatternEntries,
  parsePatternFile,
  renderPatternIndexBody,
  replaceIndexRegion,
  type PatternEntry,
} from './patterns-index-helpers.js';
import { reportPatternsIndex } from './patterns-index-report.js';

const PATTERNS_DIR = '.agent/memory/active/patterns';
const README_PATH = `${PATTERNS_DIR}/README.md`;

async function runPatternsIndex(repoRoot: string, fix: boolean): Promise<number> {
  const dir = path.join(repoRoot, PATTERNS_DIR);
  let files: string[];
  try {
    files = (await fs.readdir(dir))
      .filter((name) => name.endsWith('.md') && name !== 'README.md')
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return reportPatternsIndex({
      patternCount: 0,
      categoryCount: 0,
      wrote: false,
      errors: [`${PATTERNS_DIR}: directory not found`],
      drift: false,
    });
  }

  const entries: PatternEntry[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const parsed = parsePatternFile(file, await fs.readFile(path.join(dir, file), 'utf8'));
    errors.push(...parsed.errors);
    if (parsed.entry) {
      entries.push(parsed.entry);
    }
  }

  const groups = groupPatternEntries(entries);
  const body = renderPatternIndexBody(groups);
  const base = {
    patternCount: entries.length,
    categoryCount: groups.length,
  };

  let readme: string;
  try {
    readme = await fs.readFile(path.join(repoRoot, README_PATH), 'utf8');
  } catch {
    return reportPatternsIndex({
      ...base,
      wrote: false,
      errors: [...errors, `${README_PATH}: not found`],
      drift: false,
    });
  }

  const replaced = replaceIndexRegion(readme, body);
  if (!replaced.ok) {
    return reportPatternsIndex({
      ...base,
      wrote: false,
      errors: [...errors, `${README_PATH}: ${replaced.error}`],
      drift: false,
    });
  }

  const drift = replaced.next !== readme;
  // Never rewrite when a file failed to parse — the index would be incomplete.
  if (fix && drift && errors.length === 0) {
    await fs.writeFile(path.join(repoRoot, README_PATH), replaced.next, 'utf8');
    return reportPatternsIndex({ ...base, wrote: true, errors, drift: false });
  }
  return reportPatternsIndex({ ...base, wrote: false, errors, drift });
}

const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] === currentFilePath) {
  const exitCode = await runPatternsIndex(
    resolveRepoRoot(import.meta.url),
    process.argv.includes('--fix'),
  );
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}
