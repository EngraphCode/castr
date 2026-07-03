import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeLine, writeErrorLine } from '../../core/terminal-output.js';

import { findPdrCountDrift, type DriftViolation } from './validate-drift-helpers.js';

/**
 * §6 drift validator — the structural form of the manual catch made during the
 * 2026-06-05 transplant: a propagated, never-recounted PDR total ("92") that
 * disagreed with the filesystem (91), plus a named contract path that did not
 * resolve. Keeps the handoff/contract surfaces honest against source:
 *
 *   1. every DEFINITE total-PDR-estate count claim equals the actual file count;
 *   2. every load-bearing anchor path resolves on disk.
 *
 * It deliberately does NOT scrape arbitrary prose paths — plans legitimately
 * reference future-phase paths that do not exist yet — so the path check is a
 * curated must-exist anchor list, not a wildcard scan.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

const PDR_DIR = '.agent/practice-core/decision-records';

/** Handoff/contract surfaces whose definite total-PDR-count claims are checked. */
const SCANNED_SURFACES: readonly string[] = [
  '.agent/plans/transplant/README.md',
  '.agent/plans/transplant/reference-closure.md',
  '.agent/plans/transplant/relevance-ledger.md',
  '.agent/plans/active/oak-practice-transplant.md',
  '.agent/prompts/session-continuation.prompt.md',
];

/** Load-bearing anchors that must always resolve (a moved/renamed/phantom one is drift). */
const REQUIRED_ANCHORS: readonly string[] = [
  ...SCANNED_SURFACES,
  '.agent/practice-core/practice-verification.md',
  '.agent/hooks/policy.json',
];

async function countPdrFiles(): Promise<number> {
  const entries = await fs.readdir(path.join(repoRoot, PDR_DIR));
  return entries.filter((entry) => /^PDR-.*\.md$/.test(entry)).length;
}

async function readSurfaces(): Promise<Array<{ name: string; content: string }>> {
  const out: Array<{ name: string; content: string }> = [];
  for (const name of SCANNED_SURFACES) {
    try {
      out.push({ name, content: await fs.readFile(path.join(repoRoot, name), 'utf8') });
    } catch {
      // A missing surface is reported by the anchor check below.
    }
  }
  return out;
}

async function findMissingAnchors(): Promise<DriftViolation[]> {
  const violations: DriftViolation[] = [];
  for (const anchor of REQUIRED_ANCHORS) {
    try {
      await fs.access(path.join(repoRoot, anchor));
    } catch {
      violations.push({
        surface: anchor,
        detail: 'required handoff/contract anchor does not resolve on disk',
      });
    }
  }
  return violations;
}

async function main(): Promise<void> {
  const actualCount = await countPdrFiles();
  const violations: DriftViolation[] = [
    ...(await findMissingAnchors()),
    ...findPdrCountDrift(await readSurfaces(), actualCount),
  ];

  if (violations.length === 0) {
    writeLine(
      `validate-drift: OK (${actualCount} PDR files; all definite count-claims + anchors consistent)`,
    );
    return;
  }

  writeErrorLine(
    `validate-drift: ${violations.length} drift violation(s) — handoff/contract surfaces disagree with source.\n\n` +
      violations.map((violation) => `  ${violation.surface}: ${violation.detail}`).join('\n') +
      `\n\nHandoff surfaces must stay consistent with the repo they describe (§6 continuity-is-substrate). ` +
      `Recount the PDR estate and fix the claim, or restore/correct the anchor path.`,
  );
  process.exit(1);
}

await main();
