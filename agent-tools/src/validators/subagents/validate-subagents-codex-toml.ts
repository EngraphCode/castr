import path from 'node:path';
import { readAgentRegistrations, readTomlDocument, tomlString } from '../../core/toml-document.js';

/** A registered project role, parsed from the agents table. */
export interface CodexRegistration {
  readonly name: string;
  readonly description: string;
  readonly configFile: string;
}

/** Read a real top-level TOML string; malformed input fails immediately. */
export function readTomlBasicStringValue(content: string, key: string): string | null {
  return tomlString(readTomlDocument(content), key);
}

/** Parse registrations without accepting fields from prose or unrelated tables. */
export function parseCodexRegistrations(content: string): CodexRegistration[] {
  return readAgentRegistrations(content);
}

/** Registry location relative to the repository root. */
export const CODEX_CONFIG_PATH = '.codex/config.toml';

/** Resolve config_file relative to the registry directory, as Codex does. */
export function resolveCodexConfigFilePath(
  configFile: string,
  configPath: string = CODEX_CONFIG_PATH,
): string {
  return path.isAbsolute(configFile)
    ? configFile
    : path.posix.normalize(path.posix.join(path.posix.dirname(configPath), configFile));
}
