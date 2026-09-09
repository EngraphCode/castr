/**
 * Validation logic for Codex subagent registrations.
 *
 * Validates a list of `CodexRegistration` records parsed from
 * `.codex/config.toml`, checking that each entry has a description and that
 * its declared `config_file` resolves to an existing adapter file.
 *
 * Adapter-level validation lives in the sibling module
 * `validate-subagents-codex-adapter-validation.ts`.
 *
 * All logic is I/O-free — filesystem access is injected via a callback
 * parameter so the functions can be exercised in unit tests without touching
 * the disk.
 */

import {
  CODEX_CONFIG_PATH,
  type CodexRegistration,
  resolveCodexConfigFilePath,
} from './validate-subagents-codex-toml.js';
import {
  expectedCodexAgentConfigFile,
  isCanonicalCodexAgentName,
} from '../../core/codex-agent-registration-contract.js';

// ---------------------------------------------------------------------------
// I/O shape interfaces
// ---------------------------------------------------------------------------

/**
 * Inputs for {@link getCodexRegistrationValidation}.
 */
export interface CodexRegistrationValidationInput {
  /** The list of registrations parsed from `.codex/config.toml`. */
  readonly registrations: readonly CodexRegistration[];

  /**
   * Repository-relative path to the config file that owns the registrations.
   * Defaults to `.codex/config.toml`.
   */
  readonly configPath?: string;

  /**
   * Predicate that reports whether a repository-relative file path exists.
   * Defaults to always returning `true` (permissive — useful for partial
   * validation scenarios in tests).
   */
  readonly fileExists?: (relPath: string) => boolean;
}

/**
 * Outputs from {@link getCodexRegistrationValidation}.
 */
export interface CodexRegistrationValidationResult {
  /** Validation issues collected across all registrations. */
  readonly issues: string[];

  /**
   * Map from agent name to its registration record, for agents whose
   * name and `config_file` spelling satisfy the canonical registration contract
   * (even if the target file was missing).
   *
   * Invalid declarations are excluded, so callers can reliably use this map
   * to look up registrations that are safe to resolve.
   */
  readonly registrationsByName: Map<string, CodexRegistration>;
}

// ---------------------------------------------------------------------------
// Single-registration validation
// ---------------------------------------------------------------------------

/**
 * Validates a single `CodexRegistration` entry and accumulates issues into
 * the provided mutable output structures.
 *
 * Checks performed:
 * - The registration has a non-empty `description`.
 * - The registration has a non-empty `config_file`.
 * - The registration owns `.codex/agents/<registration-name>.toml` exactly.
 * - The resolved adapter file path exists (via `fileExists`).
 *
 * @param registration - The registration to validate.
 * @param configPath - Repository-relative path to the config that declared
 *   this registration (used in issue messages).
 * @param fileExists - Predicate for filesystem existence checks.
 * @param registrationsByName - Mutable map to populate on success.
 * @param issues - Mutable array to append issue messages into.
 */
function validateSingleRegistration(
  registration: CodexRegistration,
  configPath: string,
  fileExists: (relPath: string) => boolean,
  registrationsByName: Map<string, CodexRegistration>,
  issues: string[],
): void {
  const hasCanonicalName = isCanonicalCodexAgentName(registration.name);
  if (!hasCanonicalName) {
    issues.push(
      `${configPath}: agent registration name "${registration.name}" must be a lowercase, hyphen-delimited token`,
    );
  }
  if (registration.description.trim().length === 0) {
    issues.push(`${configPath}: agent "${registration.name}" is missing a description`);
  }
  if (!registration.configFile) {
    issues.push(`${configPath}: agent "${registration.name}" is missing a config_file`);
    return;
  }
  const expectedConfigFile = expectedCodexAgentConfigFile(registration.name);
  if (registration.configFile !== expectedConfigFile) {
    issues.push(
      `${configPath}: agent "${registration.name}" config_file must be "${expectedConfigFile}" (found "${registration.configFile}")`,
    );
    return;
  }
  if (!hasCanonicalName) return;

  registrationsByName.set(registration.name, registration);
  const adapterPath = resolveCodexConfigFilePath(registration.configFile, configPath);
  if (!fileExists(adapterPath)) {
    issues.push(
      `${configPath}: agent "${registration.name}" references missing adapter ${adapterPath}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Public validation entry point
// ---------------------------------------------------------------------------

/**
 * Validates a list of Codex subagent registrations parsed from
 * `.codex/config.toml`.
 *
 * For each registration, checks that:
 * - A `description` field is present.
 * - A `config_file` field is present, names the registration's own adapter,
 *   and points to an existing adapter file.
 *
 * @param input - Registrations to validate plus optional overrides for the
 *   config path and the filesystem existence predicate.
 * @returns A result object containing accumulated issues and a lookup map of
 *   successfully-declared registrations.
 */
export function getCodexRegistrationValidation({
  registrations,
  configPath = CODEX_CONFIG_PATH,
  fileExists = () => true,
}: CodexRegistrationValidationInput): CodexRegistrationValidationResult {
  const issues: string[] = [];
  const registrationsByName = new Map<string, CodexRegistration>();
  for (const registration of registrations) {
    validateSingleRegistration(registration, configPath, fileExists, registrationsByName, issues);
  }
  return { issues, registrationsByName };
}
