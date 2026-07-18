import path from 'node:path';

import { type Options, resolveConfig } from 'prettier';

/**
 * The shape of prettier's {@link resolveConfig} that
 * {@link resolvePrettierConfigForOutput} depends on — the injectable resolver
 * seam that keeps the unit tests pure (no filesystem IO).
 */
export type PrettierConfigResolveFn = (
  fileUrlOrPath: string,
  options?: { config?: string },
) => Promise<Options | null>;

const OUTPUT_TARGET_FILE = 'file';
const OUTPUT_TARGET_DIRECTORY = 'directory';

/**
 * Whether the generation output target is a single file or a directory the
 * renderer writes files beneath (the `tag-file` / `method-file` grouping
 * strategies).
 */
export type OutputTargetKind = typeof OUTPUT_TARGET_FILE | typeof OUTPUT_TARGET_DIRECTORY;

/**
 * Representative child path used to anchor config resolution inside a
 * directory output target; the grouped renderer really writes this file
 * beneath the output directory.
 */
const DIRECTORY_ANCHOR_CHILD = 'index.ts';

/**
 * Resolve the prettier configuration that applies to generated output.
 *
 * prettier's {@link resolveConfig} takes the path of the file being
 * formatted and starts its config search at that file's directory. Passing a
 * directory path (or `'./'`) instead starts the search at the directory's
 * PARENT, silently skipping a config inside the directory and walking above
 * the project — resolution then depends on where the checkout sits on disk
 * (a nested git worktree picks up an enclosing repository's config). This
 * helper anchors the search on the output file path — or, for directory
 * output targets, on a representative child path inside the directory — so
 * the nearest config to the generated output always wins;
 * `tests-snapshot/integration/resolve-prettier-config.test.ts` carries the
 * regression proof against prettier's real resolution.
 *
 * @param outputPath - Path of the generation output target, resolved against
 *   the current working directory. The path does not need to exist;
 *   nonexistent segments (for example URL-derived output paths) are walked
 *   over safely.
 * @param explicitConfigPath - Optional path to a specific prettier config
 *   file (the CLI's `--prettier <path>`). Loaded directly via prettier's
 *   `config` option, so non-discoverable filenames work; an unreadable or
 *   invalid file fails fast with prettier's own error.
 * @param outputKind - Whether `outputPath` names a single output file
 *   (default) or a directory the renderer writes files beneath (the
 *   `tag-file` / `method-file` grouping strategies). Directory targets are
 *   anchored on a representative child path so the config search starts
 *   INSIDE the directory.
 * @param resolveConfigFn - Config resolver, defaulting to prettier's
 *   {@link resolveConfig}. Injectable so the pure unit tests can prove the
 *   anchoring contract without filesystem IO.
 * @returns The resolved prettier options, or `null` when no config applies.
 */
export async function resolvePrettierConfigForOutput(
  outputPath: string,
  explicitConfigPath?: string,
  outputKind: OutputTargetKind = OUTPUT_TARGET_FILE,
  resolveConfigFn: PrettierConfigResolveFn = resolveConfig,
): Promise<Options | null> {
  const absoluteOutputPath = path.resolve(outputPath);
  const anchorPath =
    outputKind === OUTPUT_TARGET_DIRECTORY
      ? path.join(absoluteOutputPath, DIRECTORY_ANCHOR_CHILD)
      : absoluteOutputPath;
  if (explicitConfigPath === undefined) {
    return resolveConfigFn(anchorPath);
  }
  return resolveConfigFn(anchorPath, { config: explicitConfigPath });
}
