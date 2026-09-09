import { isAbsolute, posix } from 'node:path';
import type { TomlTable } from 'smol-toml';
import { assertCanonicalCodexAgentRegistration } from './codex-agent-registration-contract.js';
import { readAgentRegistrations, tomlString } from './toml-document.js';
import { readRequiredRepositorySourceSync } from './required-repository-source.js';

export const CODEX_CONFIG_PATH = '.codex/config.toml';

/** A complete registered role ready for runtime resolution. */
export interface CodexAgentRegistration {
  name: string;
  description: string;
  configFile: string;
}

/**
 * Parse complete runtime registrations using actual TOML semantics.
 * @param content - Full project configuration source.
 * @returns Registrations sorted by name; reserved agent settings are excluded.
 * @throws For malformed TOML, invalid settings/role fields, or missing registration metadata.
 */
export function parseCodexAgentRegistrations(content: string): CodexAgentRegistration[] {
  const entries = readAgentRegistrations(content);
  for (const entry of entries) {
    assertCanonicalCodexAgentRegistration(entry);
  }
  return entries.toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * Read and validate the project's own registry.
 * @param repoRoot - Filesystem root containing the project's .codex directory.
 * @returns Complete registrations sorted by name.
 * @throws If the registry cannot be read or fails {@link parseCodexAgentRegistrations}.
 */
export function readCodexAgentRegistrations(repoRoot: string): CodexAgentRegistration[] {
  try {
    return parseCodexAgentRegistrations(
      readRequiredRepositorySourceSync(repoRoot, CODEX_CONFIG_PATH),
    );
  } catch (error) {
    throw new Error(
      `Missing or unreadable Codex project-agent registry: ${CODEX_CONFIG_PATH}. ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

/**
 * Resolve an adapter path relative to the registry directory.
 * @param configFile - Registry config_file value; absolute paths remain absolute.
 * @returns Normalised repo-relative path for relative values, otherwise the supplied path.
 */
export function resolveCodexAgentConfigFilePath(configFile: string): string {
  return isAbsolute(configFile)
    ? configFile
    : posix.normalize(posix.join(posix.dirname(CODEX_CONFIG_PATH), configFile));
}

/**
 * Require a top-level runtime string from an already parsed adapter document.
 * @param document - Parsed TOML adapter.
 * @param key - Required top-level field.
 * @param adapterPath - Path used in missing-field diagnostics.
 * @returns The exact string value, including any whitespace.
 * @throws If the field is missing or its TOML value is not a string.
 */
export function readRequiredTomlValue(
  document: TomlTable,
  key: string,
  adapterPath: string,
): string {
  const value = tomlString(document, key);
  if (value === null) throw new Error(adapterPath + " is missing required TOML key '" + key + "'.");
  return value;
}
