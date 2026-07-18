/**
 * Parsing utilities for Codex TOML configuration files.
 *
 * Responsibilities:
 * - Decoding TOML basic-string values (including escape sequences).
 * - Parsing `[agents."<name>"]` section blocks from `.codex/config.toml`.
 * - Resolving adapter file paths relative to a given config file location.
 *
 * Developer-instructions extraction lives in the sibling module
 * `validate-subagents-codex-instructions.ts`.
 *
 * All functions are stateless and free of I/O — callers supply content as
 * strings.
 */

import path from 'node:path';

// ---------------------------------------------------------------------------
// Regex constants
// ---------------------------------------------------------------------------

/**
 * Matches a single-line TOML basic string assignment such as `key = "value"`.
 *
 * Captures:
 * - Group 1: the key name (lowercase letters and underscores).
 * - Group 2: the raw string value (outer quotes excluded, escape sequences
 *   preserved for decoding via {@link parseTomlBasicString}).
 */
const TOML_BASIC_STRING_REGEX = /^([a-z_]+)\s*=\s*"([^"\\]*(?:\\.[^"\\]*)*)"$/u;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single subagent entry parsed from an `[agents."<name>"]` section block in
 * `.codex/config.toml`.
 */
export interface CodexRegistration {
  /** The agent name as it appears in the TOML section header. */
  readonly name: string;

  /** The description text declared in the registration block. */
  readonly description: string;

  /**
   * The `config_file` path declared in the registration block.
   *
   * Typically a path relative to the config file's directory,
   * e.g. `"agents/code-reviewer.toml"`.
   */
  readonly configFile: string;
}

// ---------------------------------------------------------------------------
// TOML basic-string decoding
// ---------------------------------------------------------------------------

/**
 * Decodes a TOML basic-string raw value into a plain JavaScript string.
 *
 * TOML basic strings share their escape syntax with JSON double-quoted
 * strings, so `JSON.parse` handles decoding by wrapping the raw value in
 * double quotes.  If parsing fails, the raw value is returned unchanged.
 *
 * @param rawValue - The raw TOML basic-string content (outer quotes excluded,
 *   backslash escape sequences still present).
 * @returns The decoded string value.
 */
function parseTomlBasicString(rawValue: string): string {
  const parsed: unknown = JSON.parse(`"${rawValue}"`);
  return typeof parsed === 'string' ? parsed : rawValue;
}

/**
 * Reads the string value associated with `key` from a TOML basic-string
 * assignment anywhere in `content`.
 *
 * Scans line by line and returns the first match.  Returns `null` when the
 * key is not present.
 *
 * @param content - Full text of a TOML file.
 * @param key - The key to look up (e.g. `"name"` or `"sandbox_mode"`).
 * @returns The decoded string value, or `null` if the key is absent.
 */
export function readTomlBasicStringValue(content: string, key: string): string | null {
  for (const rawLine of content.split(/\r?\n/u)) {
    const match = rawLine.trim().match(TOML_BASIC_STRING_REGEX);
    if (match !== null && match[1] === key && match[2] !== undefined) {
      return parseTomlBasicString(match[2]);
    }
  }
  return null;
}

/**
 * Returns whether a TOML key is assigned outside a multiline basic string, in
 * ANY legal spelling — bare, basic-quoted (`"key"`), or literal-quoted
 * (`'key'`); the three are semantically identical in TOML, so a gate that
 * matched only the bare form would be bypassable by quoting (gate-shaped code:
 * a missed spelling is a silent hole). The value shape is deliberately
 * irrelevant: callers use this to reject keys whose presence is unsupported,
 * including arrays and inline tables.
 */
export function hasTomlAssignment(content: string, key: string): boolean {
  let inMultilineBasicString = false;
  for (const rawLine of content.split(/\r?\n/u)) {
    const tripleQuoteCount = rawLine.match(/"""/gu)?.length ?? 0;
    if (!inMultilineBasicString) {
      const match = rawLine
        .trim()
        .match(/^(?:"(?<basic>[a-z_]+)"|'(?<literal>[a-z_]+)'|(?<bare>[a-z_]+))\s*=/u);
      const assignedKey =
        match?.groups?.['basic'] ?? match?.groups?.['literal'] ?? match?.groups?.['bare'];
      if (assignedKey === key) {
        return true;
      }
    }
    if (tripleQuoteCount % 2 === 1) {
      inMultilineBasicString = !inMultilineBasicString;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Registration parsing
// ---------------------------------------------------------------------------

/**
 * Returns `true` when the trimmed line should be skipped during config
 * section scanning (empty lines and TOML comment lines beginning with `#`).
 */
function isBlankOrComment(line: string): boolean {
  return line.length === 0 || line.startsWith('#');
}

/**
 * Applies a single content line to the in-progress `CodexRegistration`
 * accumulator.
 *
 * Recognises `description` and `config_file` TOML basic-string assignments
 * and merges them into the record.  Any other line is ignored.
 *
 * @param current - The registration record accumulated so far.
 * @param line - A trimmed, non-blank, non-comment line from the config.
 * @returns An updated (or unchanged) `CodexRegistration`.
 */
function processRegistrationLine(current: CodexRegistration, line: string): CodexRegistration {
  const m = line.match(TOML_BASIC_STRING_REGEX);
  if (m === null || m[1] === undefined || m[2] === undefined) {
    return current;
  }
  const value = parseTomlBasicString(m[2]);
  if (m[1] === 'description') {
    return { ...current, description: value };
  }
  if (m[1] === 'config_file') {
    return { ...current, configFile: value };
  }
  return current;
}

/**
 * Parses the text content of a `.codex/config.toml` file and returns the
 * ordered list of subagent registrations it declares.
 *
 * A registration block opens with a section header of the form
 * `[agents."<name>"]` and is closed by the next such header or end-of-file.
 *
 * @param content - Full text of the Codex config TOML file.
 * @returns An array of `CodexRegistration` objects in declaration order.
 */
export function parseCodexRegistrations(content: string): CodexRegistration[] {
  const registrations: CodexRegistration[] = [];
  let current: CodexRegistration | null = null;

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (isBlankOrComment(line)) {
      continue;
    }
    const sectionMatch = line.match(/^\[agents\."([^"]+)"\]$/u);
    if (sectionMatch !== null && sectionMatch[1] !== undefined) {
      if (current !== null) {
        registrations.push(current);
      }
      current = { name: sectionMatch[1], description: '', configFile: '' };
    } else if (current !== null) {
      current = processRegistrationLine(current, line);
    }
  }

  if (current !== null) {
    registrations.push(current);
  }

  return registrations;
}

// ---------------------------------------------------------------------------
// Adapter file path resolution
// ---------------------------------------------------------------------------

/** Default location of the Codex project-agent registry, from repo root. */
export const CODEX_CONFIG_PATH = '.codex/config.toml';

/**
 * Resolves the `config_file` value from a Codex registration to a normalised
 * repository-relative path for filesystem comparisons.
 *
 * If `configFile` is absolute it is returned unchanged.  Otherwise it is
 * resolved relative to the directory containing `configPath` using POSIX
 * path semantics.
 *
 * @param configFile - The `config_file` value from the registration block
 *   (e.g. `"agents/code-reviewer.toml"`).
 * @param configPath - Repository-relative path to the config file that
 *   declares this registration.  Defaults to `.codex/config.toml`.
 * @returns A normalised, repository-relative path to the adapter TOML file.
 */
export function resolveCodexConfigFilePath(
  configFile: string,
  configPath: string = CODEX_CONFIG_PATH,
): string {
  if (path.isAbsolute(configFile)) {
    return configFile;
  }
  return path.posix.normalize(path.posix.join(path.posix.dirname(configPath), configFile));
}
