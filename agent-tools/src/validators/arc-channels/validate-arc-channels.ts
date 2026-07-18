import { execFileSync } from 'node:child_process';

import { isArcChannelFileName } from '../../arc/arc-channel-grammar.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeLine, writeErrorLine } from '../../core/terminal-output.js';

import {
  validateArcChannelSurfaces,
  type ArcValidationFinding,
} from './validate-arc-channels-helpers.js';

/**
 * ARC channel-file structural gate. Scope is TRACKED files only
 * (`git ls-files`), by design: live channels are appended while tailed and often
 * sit uncommitted for hours — and content reads come from the INDEX
 * (`git show :<path>`), never the working tree, so even a TRACKED channel's
 * dirty mid-append churn can never red another seat's gate. Structure is
 * gated by what a commit would actually land;
 * the statusline (which reads the directory as-present) tolerates violations
 * via its defined `invalid` badge state instead.
 *
 * Grammar and tiering (grandfathered vs post-adoption) are owned by
 * `src/arc/arc-channel-grammar.ts`; the prose convention lives in
 * `.agent/reference/arc-rapid-communication.md` §Conventions.
 *
 * @packageDocumentation
 */

const repoRoot = resolveRepoRoot(import.meta.url);

const CHANNELS_DIR = '.agent/collaboration/rapid-comms';

function listTrackedChannelFiles(): readonly string[] {
  const stdout = execFileSync('git', ['ls-files', '-z', '--', `${CHANNELS_DIR}/*.md`], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  // Keep the FULL repo-relative path (git pathspec `*` matches `/`, so a
  // nested tracked channel must not be basename-collapsed into a phantom
  // flat path); the grammar tiers on the basename internally, and the shared
  // predicate excludes only a file whose BASENAME is exactly README.md — a
  // dated channel whose topic ends in `README` is a channel, not a README.
  return stdout.split('\0').filter((name) => name !== '' && isArcChannelFileName(name));
}

/** Read one tracked channel's INDEX blob; a read failure is a loud finding, never a crash. */
function readIndexBlob(
  relPath: string,
): { readonly content: string } | { readonly finding: ArcValidationFinding } {
  try {
    return {
      content: execFileSync('git', ['show', `:${relPath}`], { cwd: repoRoot, encoding: 'utf8' }),
    };
  } catch (error) {
    return {
      finding: {
        code: 'malformed-entry-header',
        surface: relPath,
        line: 0,
        detail: `tracked channel's index blob is unreadable: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
        remediation:
          'ARC channel structure convention: .agent/reference/arc-rapid-communication.md §Conventions',
      },
    };
  }
}

function main(): void {
  const names = listTrackedChannelFiles();
  const surfaces: Array<{ name: string; content: string }> = [];
  const readFindings: ArcValidationFinding[] = [];
  for (const relPath of names) {
    const read = readIndexBlob(relPath);
    if ('content' in read) {
      // The FULL repo-relative path is the finding surface (nested channels
      // stay distinguishable); the grammar derives the tier date from the
      // basename internally.
      surfaces.push({ name: relPath, content: read.content });
    } else {
      readFindings.push(read.finding);
    }
  }

  const findings = [...readFindings, ...validateArcChannelSurfaces(surfaces)];

  if (findings.length === 0) {
    writeLine(
      `validate-arc-channels: OK (${surfaces.length} tracked channel file(s) conform to the structural grammar)`,
    );
    return;
  }

  writeErrorLine(
    `validate-arc-channels: ${findings.length} structural violation(s) across tracked ARC channel files.\n\n` +
      findings
        .map((f) => `  ${f.surface}:${f.line} [${f.code}] ${f.detail}\n    fix: ${f.remediation}`)
        .join('\n') +
      `\n\nEntry BODIES are never validated — this gate binds structure only (title, opening block, entry headers).`,
  );
  process.exit(1);
}

main();
