/**
 * The `engraph-semantic-merge` git merge driver (LC2 stage-2) — the conflict-time
 * firing tripwire behind the `semantic-merge` skill.
 *
 * git invokes a custom merge driver as `<command> %O %A %B %P` (ancestor / ours /
 * theirs temp files, then the pathname) on a conflict in a path mapped to
 * `merge=engraph-semantic-merge` in `.gitattributes`. This driver does NOT attempt
 * a merge — a concept-merge of memory/state narratives cannot be automated (git
 * cannot do it, nor can a script). It exits NON-ZERO so git records the path as
 * unmerged, and routes the agent to the `engraph-semantic-merge` skill. The
 * alternative — git's default 3-way LINE merge — is exactly the silent corruption
 * PDR-049 forbids. This converts that silent corruption into a loud halt.
 *
 * Registered per-checkout by the agent-tools `postinstall` bootstrap (git
 * merge-driver config is not committable); a fresh, un-installed clone falls back
 * to git's default line-merge, so the human discipline in the skill remains the
 * backstop.
 *
 * @packageDocumentation
 */

/** The git merge-driver name (`.gitattributes` `merge=` value + git config key). */
export const SEMANTIC_MERGE_DRIVER_NAME = 'engraph-semantic-merge';

/**
 * The refusal verdict for a conflicted `merge_class` path: a non-zero exit and a
 * remediation message routing to the `engraph-semantic-merge` skill. Pure.
 *
 * @param pathname - The conflicted file (git `%P`), or a generic phrase when git
 *   passed none.
 */
export function semanticMergeDriverRefusal(pathname: string): {
  readonly exitCode: number;
  readonly message: string;
} {
  return {
    exitCode: 1,
    message:
      `[${SEMANTIC_MERGE_DRIVER_NAME}] refusing to line-merge ${pathname}: it is a memory/state ` +
      `file whose meaning a git line-merge silently corrupts (stacked entries, dropped sessions, ` +
      `split tables). Do NOT line-merge. Reconcile the CONCEPTS by hand: run the ` +
      `engraph-semantic-merge skill (base/ours/theirs are at \`git show :1:${pathname}\` / ` +
      `\`:2:${pathname}\` / \`:3:${pathname}\`), author the union, then stage the resolved file.`,
  };
}

/**
 * Driver entry point over git's argv (`%O %A %B %P`). The pathname is the last
 * argument; if absent (a misconfiguration), still refuse loudly rather than fall
 * through to a line-merge. Returns the process exit code.
 *
 * @param argv - `process.argv.slice(2)` — git's substituted placeholders.
 * @param write - Sink for the remediation line (stderr in production).
 */
export function runSemanticMergeDriver(
  argv: readonly string[],
  write: (line: string) => void,
): number {
  const pathname = argv.length > 0 ? argv[argv.length - 1] : 'a merge_class memory/state file';
  const { exitCode, message } = semanticMergeDriverRefusal(pathname);
  write(message);
  return exitCode;
}
