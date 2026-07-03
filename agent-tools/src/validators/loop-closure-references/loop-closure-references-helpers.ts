/**
 * Detect hollow `pnpm <script>` references in authored Practice surfaces — a
 * reference whose resolved script name is not defined in any workspace
 * `package.json` and is not an installed fall-through binary. This is the
 * loop-closure meta-validator's first reference class (LC0): a doctrine surface
 * (rule / skill / directive) that names an enforcement command which does not
 * exist is a feedback loop that only *looks* closed — the command silently does
 * nothing.
 *
 * The sibling `validate-no-stale-script-invocations` catches retired root
 * `scripts/<name>` paths; it does NOT resolve `pnpm <script>` names against the
 * defined universe, so hollow refs like `pnpm check:profile`,
 * `pnpm markdownlint-check:root`, and `pnpm run cruise` passed every gate green.
 *
 * Only references in CODE CONTEXT are considered — inline `backtick` spans and
 * fenced code blocks — so English prose ("prefer pnpm scripts that…") is never
 * flagged. The helper is pure and operates on an in-memory list of files plus
 * an injected set of defined names; the runtime that walks the file system,
 * reads the `package.json` scripts, and enumerates `node_modules/.bin` is in
 * `validate-loop-closure-references.ts`.
 *
 * @packageDocumentation
 */

/**
 * A single hollow-reference finding.
 */
export interface HollowScriptReferenceFinding {
  /** Repo-relative path to the file containing the finding. */
  readonly path: string;
  /** 1-based line number of the finding. */
  readonly line: number;
  /** The unresolved script name, e.g. `check:profile`. */
  readonly script: string;
  /** The normalised reference text, e.g. `pnpm run cruise`. */
  readonly match: string;
}

/**
 * Configuration for {@link findHollowScriptReferences}.
 */
export interface FindHollowScriptReferencesOptions {
  /**
   * The resolve universe: every script name defined across the workspace
   * `package.json` files, unioned with every installed `node_modules/.bin`
   * binary (pnpm runs `pnpm <bin>` by fall-through). A coded `pnpm <script>`
   * reference is hollow when its resolved name is absent from this set.
   * Injected (not read here) so the helper stays pure and unit-testable.
   */
  readonly definedScripts: ReadonlySet<string> | readonly string[];
  /**
   * Repo-relative paths exempted from the check. Use for surfaces that
   * legitimately quote a hollow reference in prose (e.g. this remediation
   * plan documents the false claims verbatim while specifying the cure).
   */
  readonly allowlistedPaths?: readonly string[];
}

/**
 * pnpm builtins and management subcommands that are NOT package-script runs.
 * When the first non-flag token after `pnpm` is one of these, the invocation
 * does not name a script and is skipped. `run` is handled separately (it
 * unwraps to the following script token).
 */
const MANAGEMENT_SUBCOMMANDS: ReadonlySet<string> = new Set([
  'exec',
  'dlx',
  'install',
  'i',
  'add',
  'remove',
  'rm',
  'update',
  'up',
  'why',
  'list',
  'ls',
  'outdated',
  'store',
  'prune',
  'link',
  'ln',
  'unlink',
  'patch',
  'patch-commit',
  'rebuild',
  'import',
  'deploy',
  'fetch',
  'setup',
  'env',
  'config',
  'audit',
  'publish',
  'pack',
  'root',
  'bin',
  'create',
  'init',
  'dedupe',
  'licenses',
  'server',
]);

/**
 * Flags that consume the following token as their value (e.g.
 * `pnpm --filter <pkg> <script>`). A flag carrying its value inline
 * (`--filter=<pkg>`) is a single token and handled by the `=` branch.
 */
const FLAGS_WITH_VALUE: ReadonlySet<string> = new Set([
  '--filter',
  '-F',
  '--filter-prod',
  '-C',
  '--dir',
  '--config',
  '--reporter',
  '--workspace-concurrency',
]);

/** Shell metacharacters that terminate a command within a code chunk. */
const SEGMENT_SPLIT_PATTERN = /[|&;()<>]/;

/**
 * A fence line: optional indent then three or more of the same fence character
 * (backtick or tilde). CommonMark allows both; a block opened with one
 * character closes only on the same character.
 */
const FENCE_PATTERN = /^(\s*)(`{3,}|~{3,})(.*)$/;

/** Inline code spans delimited by single backticks. */
const INLINE_CODE_PATTERN = /`([^`]+)`/g;

/**
 * Find every hollow `pnpm <script>` reference across the provided files.
 *
 * @param files - In-memory files to scan; each carries a repo-relative path
 *   and UTF-8 contents.
 * @param options - The defined universe and optional allowlist; see
 *   {@link FindHollowScriptReferencesOptions}.
 * @returns Findings in file then line order. Empty when every coded reference
 *   resolves.
 *
 * @example A doctrine surface naming a non-existent script:
 *
 * ```ts
 * findHollowScriptReferences(
 *   [{ path: '.agent/skills/gates/SKILL-CANONICAL.md', content: 'Run `pnpm check:profile`.' }],
 *   { definedScripts: ['check:ci', 'qg'] },
 * );
 * // [{ path: '.agent/skills/gates/SKILL-CANONICAL.md', line: 1,
 * //    script: 'check:profile', match: 'pnpm check:profile' }]
 * ```
 */
export function findHollowScriptReferences(
  files: readonly { readonly path: string; readonly content: string }[],
  options: FindHollowScriptReferencesOptions,
): readonly HollowScriptReferenceFinding[] {
  const definedScripts =
    options.definedScripts instanceof Set
      ? options.definedScripts
      : new Set(options.definedScripts);
  const allowlistedPaths = new Set(options.allowlistedPaths ?? []);
  const findings: HollowScriptReferenceFinding[] = [];

  for (const file of files) {
    if (allowlistedPaths.has(file.path)) {
      continue;
    }

    const lines = file.content.split('\n');
    // Track the OPENING fence marker (char + length); null = not fenced. A fence
    // closes only on a marker of the SAME character, at least as long, with
    // nothing trailing — so an inner ``` inside an outer ```` (or a backtick
    // fence inside a tilde block) is treated as block content (CommonMark).
    let openFence: { char: string; length: number } | null = null;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
      const line = lines[lineIndex];
      const fenceMatch = FENCE_PATTERN.exec(line);

      if (fenceMatch) {
        const fenceMarker = fenceMatch[2];
        const fenceChar = fenceMarker[0];
        const fenceLength = fenceMarker.length;
        const trailing = fenceMatch[3].trim();
        if (openFence === null) {
          openFence = { char: fenceChar, length: fenceLength };
          continue;
        }
        if (fenceChar === openFence.char && fenceLength >= openFence.length && trailing === '') {
          openFence = null;
          continue;
        }
        // An inner fence line inside an open block: fall through and scan it
        // as content (it may itself carry a coded command in examples).
      }

      const codeChunks = openFence !== null ? [line] : extractInlineCode(line);
      for (const chunk of codeChunks) {
        for (const reference of findReferencesInChunk(chunk)) {
          if (!definedScripts.has(reference.script)) {
            findings.push({
              path: file.path,
              line: lineIndex + 1,
              script: reference.script,
              match: reference.match,
            });
          }
        }
      }
    }
  }

  return findings;
}

/** Return the contents of each inline `code` span on a line. */
function extractInlineCode(line: string): readonly string[] {
  const chunks: string[] = [];
  for (const match of line.matchAll(INLINE_CODE_PATTERN)) {
    chunks.push(match[1]);
  }
  return chunks;
}

/**
 * Extract every resolved `pnpm` script reference in a code chunk. Splits on
 * shell metacharacters so chained/piped commands are isolated, then parses
 * each `pnpm` occurrence independently (a chunk may chain several).
 */
function findReferencesInChunk(
  chunk: string,
): readonly { readonly script: string; readonly match: string }[] {
  const references: { readonly script: string; readonly match: string }[] = [];

  for (const segment of chunk.split(SEGMENT_SPLIT_PATTERN)) {
    const tokens = segment.split(/\s+/).filter((token) => token.length > 0);
    for (let i = 0; i < tokens.length; i += 1) {
      if (tokens[i] !== 'pnpm') {
        continue;
      }

      let end = i + 1;
      while (end < tokens.length && tokens[end] !== 'pnpm') {
        end += 1;
      }

      const resolved = resolveScriptToken(tokens.slice(i + 1, end));
      if (resolved) {
        references.push({
          script: resolved.script,
          match: `pnpm ${resolved.prefixTokens.join(' ')}`,
        });
      }

      i = end - 1;
    }
  }

  return references;
}

/**
 * Resolve the script token a `pnpm` invocation names, walking past leading
 * flags and unwrapping a single `run`. Returns the resolved script name and
 * the prefix tokens (flags + `run` + script) for normalised reporting, or
 * `null` when the invocation does not name a runnable script (a management
 * subcommand, a flag-only invocation, or a bare `pnpm`).
 */
function resolveScriptToken(
  commandTokens: readonly string[],
): { readonly script: string; readonly prefixTokens: readonly string[] } | null {
  let index = skipFlags(commandTokens, 0);
  if (index >= commandTokens.length) {
    return null;
  }

  let candidate = commandTokens[index];
  if (candidate === '--') {
    return null;
  }

  let viaRun = false;
  if (candidate === 'run') {
    viaRun = true;
    index = skipFlags(commandTokens, index + 1);
    if (index >= commandTokens.length) {
      return null;
    }
    candidate = commandTokens[index];
    if (candidate === '--') {
      return null;
    }
  }

  // A management word in the SUBCOMMAND position (`pnpm install`) is not a
  // script run. After an explicit `run` (`pnpm run install`) pnpm always forces
  // script interpretation, so the same word IS a script reference there.
  if (!viaRun && MANAGEMENT_SUBCOMMANDS.has(candidate)) {
    return null;
  }

  const script = stripTrailingPunctuation(candidate);
  if (!isScriptName(script)) {
    return null;
  }

  const prefixTokens = [...commandTokens.slice(0, index), script];
  return { script, prefixTokens };
}

/** Advance past a run of flags (boolean or value-carrying) from `start`. */
function skipFlags(tokens: readonly string[], start: number): number {
  let index = start;
  while (index < tokens.length && tokens[index].startsWith('-') && tokens[index] !== '--') {
    const flag = tokens[index];
    if (FLAGS_WITH_VALUE.has(flag) && !flag.includes('=')) {
      index += 2;
    } else {
      index += 1;
    }
  }
  return index;
}

/**
 * Strip trailing punctuation that prose appends to a coded reference. A
 * trailing colon is never part of a real script name (script names use colons
 * only internally, e.g. `check:ci`), so `check:` resolves to its base `check`.
 */
function stripTrailingPunctuation(token: string): string {
  return token.replace(/[.,:]+$/, '');
}

function isScriptName(token: string): boolean {
  return /^[A-Za-z0-9][A-Za-z0-9:_.-]*$/.test(token);
}

/**
 * Extract the `packages:` list from a `pnpm-workspace.yaml`. A minimal parser
 * for the block-sequence form this repo uses — `packages:` on its own line
 * followed by indented `- <entry>` items, terminated by the next non-indented
 * line. Pure (no IO) so the resolve-universe recompute is unit-testable.
 *
 * SUPPORTED: block sequence, single- or double-quoted entries, trailing
 * inline comments on an item (`- lib  # core`). NOT supported (would parse to
 * empty/partial — acceptable because this repo's file is plain block style):
 * flow style (`packages: [a, b]`) and anchors/aliases. The runtime always
 * seeds the root `package.json` regardless, so an empty parse degrades to
 * root-only, never to a crash.
 *
 * @param yaml - Raw `pnpm-workspace.yaml` contents.
 * @returns The declared package globs/paths, in file order.
 */
export function parseWorkspacePackages(yaml: string): readonly string[] {
  const packages: string[] = [];
  const lines = yaml.split('\n');
  let inPackages = false;

  for (const line of lines) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true;
      continue;
    }
    if (inPackages) {
      const itemMatch = /^\s+-\s+(.+?)\s*$/.exec(stripInlineComment(line));
      if (itemMatch) {
        packages.push(stripQuotes(itemMatch[1]));
        continue;
      }
      // A non-indented, non-item line ends the block.
      if (/^\S/.test(line)) {
        inPackages = false;
      }
    }
  }

  return packages;
}

/** Strip a trailing ` # comment` from a YAML line (outside quotes). */
function stripInlineComment(line: string): string {
  return line.replace(/\s+#.*$/, '');
}

/** Remove a single matching pair of surrounding single/double quotes. */
export function stripQuotes(value: string): string {
  return value.replace(/^(['"])(.*)\1$/, '$2');
}
