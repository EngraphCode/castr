import path from 'node:path';

import { type Options, resolveConfig } from 'prettier';

/**
 * Resolve the prettier configuration that applies to a generated output file.
 *
 * prettier's {@link resolveConfig} takes the path of the file being
 * formatted and starts its config search at that file's directory. Passing a
 * directory path (or `'./'`) instead starts the search at the directory's
 * PARENT, silently skipping a config inside the directory and walking above
 * the project — resolution then depends on where the checkout sits on disk
 * (a nested git worktree picks up an enclosing repository's config). This
 * helper anchors the search on the output file path so the nearest config to
 * the generated file always wins; `resolve-prettier-config.test.ts` carries
 * the regression proof.
 *
 * @param outputFilePath - Path of the file the config will format, resolved
 *   against the current working directory. The path does not need to exist;
 *   nonexistent segments (for example URL-derived output paths) are walked
 *   over safely.
 * @param explicitConfigPath - Optional path to a specific prettier config
 *   file (the CLI's `--prettier <path>`). Loaded directly via prettier's
 *   `config` option, so non-discoverable filenames work; an unreadable or
 *   invalid file fails fast with prettier's own error.
 * @returns The resolved prettier options, or `null` when no config applies.
 */
export async function resolvePrettierConfigForOutput(
  outputFilePath: string,
  explicitConfigPath?: string,
): Promise<Options | null> {
  const absoluteOutputPath = path.resolve(outputFilePath);
  if (explicitConfigPath === undefined) {
    return resolveConfig(absoluteOutputPath);
  }
  return resolveConfig(absoluteOutputPath, { config: explicitConfigPath });
}
