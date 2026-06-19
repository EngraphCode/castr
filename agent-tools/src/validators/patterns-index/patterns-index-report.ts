/**
 * Patterns-index validation result reporting.
 *
 * Formats and writes the collected warnings/errors (or the success summary) to
 * the terminal and returns the process exit code. Separated from the
 * orchestration entry point so the report can be tested without re-running the
 * filesystem scan.
 */

import { writeErrorLine, writeLine } from '../../core/terminal-output.js';

/** Inputs to {@link reportPatternsIndex}. */
export interface PatternsIndexReport {
  /** Number of pattern files indexed. */
  readonly patternCount: number;
  /** Number of categories rendered. */
  readonly categoryCount: number;
  /** Whether `--fix` rewrote the README in this run. */
  readonly wrote: boolean;
  /** Gate-failing problems: unparseable files, schema violations, absent sentinels/README. */
  readonly errors: readonly string[];
  /** Whether the on-disk index region is stale (check mode only). */
  readonly drift: boolean;
}

/**
 * Report the result of a patterns-index run and return the exit code.
 *
 * Exit 1 on any error (unparseable file, frontmatter-schema violation, absent
 * sentinels/README) or — in check mode — detected drift; exit 0 otherwise.
 */
export function reportPatternsIndex(report: PatternsIndexReport): number {
  const { patternCount, categoryCount, wrote, errors, drift } = report;
  if (errors.length > 0) {
    writeErrorLine(
      `Patterns index validation failed (${errors.length} error${errors.length === 1 ? '' : 's'}):`,
    );
    for (const error of errors) {
      writeErrorLine(`  - ${error}`);
    }
    return 1;
  }
  const summary = `${patternCount} pattern${patternCount === 1 ? '' : 's'} across ${categoryCount} categor${categoryCount === 1 ? 'y' : 'ies'}`;
  if (wrote) {
    writeLine(`Patterns index regenerated: ${summary}.`);
    return 0;
  }
  if (drift) {
    writeErrorLine(
      'Patterns index is stale — the README index region does not match pattern frontmatter.',
    );
    writeErrorLine('Run: pnpm --filter @engraph/agent-tools validate-patterns-index:fix');
    return 1;
  }
  writeLine(`Patterns index up to date: ${summary}.`);
  return 0;
}
