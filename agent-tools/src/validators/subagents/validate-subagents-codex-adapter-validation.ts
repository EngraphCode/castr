/**
 * Validation entry point for Codex subagent adapter TOML files.
 *
 * Orchestrates the full adapter validation: field checks (required TOML keys,
 * required settings, registry cross-reference) followed by developer-
 * instructions presence and canonical template reference checks.
 *
 * Field-level helpers live in the sibling module
 * `validate-subagents-codex-adapter-field-checks.ts`.
 *
 * Registration-level validation lives in the sibling module
 * `validate-subagents-codex-registration-validation.ts`.
 *
 * All logic is I/O-free — callers supply content as strings.
 */

import { CODEX_CONFIG_PATH, type CodexRegistration } from './validate-subagents-codex-toml.js';

import { extractCanonicalPaths } from './validate-subagents-codex-instructions.js';
import { readCodexAdapterDocument } from '../../core/codex-adapter-document.js';
import { tomlString } from '../../core/toml-document.js';

import {
  stripBasename,
  validateAdapterFields,
} from './validate-subagents-codex-adapter-field-checks.js';
import { cricketRole, supportsReviewer } from '../../core/reviewer-adapter-platform-contract.js';
import {
  canonicalAgentReferenceIssue,
  isCanonicalAgentReferenceInside,
} from '../../core/canonical-agent-reference.js';

// ---------------------------------------------------------------------------
// Module-private constants
// ---------------------------------------------------------------------------

/** Default base directory for Codex agent template files. */
const DEFAULT_TEMPLATE_DIR = '.agent/sub-agents/templates';

/** Default base directory for optional reviewer persona files. */
const DEFAULT_PERSONA_DIR = '.agent/sub-agents/components/personas';

// ---------------------------------------------------------------------------
// Public constants
// ---------------------------------------------------------------------------

/**
 * The required TOML settings for ordinary Codex subagent adapter files.
 *
 * Each entry is a `[key, expectedValue]` pair.  An adapter file must declare
 * all of these keys with exactly these values to be considered valid.
 */
const REQUIRED_CODEX_SETTINGS: readonly (readonly [string, string])[] = [
  ['model_reasoning_effort', 'high'],
  ['sandbox_mode', 'read-only'],
  ['approval_policy', 'never'],
];

// ---------------------------------------------------------------------------
// I/O shape interfaces
// ---------------------------------------------------------------------------

/**
 * Inputs for {@link getCodexAdapterValidation}.
 */
export interface CodexAdapterValidationInput {
  /** Repository-relative path to the adapter TOML file being validated. */
  readonly codexAdapterFile: string;

  /** Full text content of the adapter TOML file. */
  readonly content: string;

  /**
   * The `CodexRegistration` that declares this adapter in
   * `.codex/config.toml`, or `null` when no matching registration was found.
   */
  readonly registeredAgent?: CodexRegistration | null;

  /**
   * Repository-relative path prefix for canonical template files.
   * Defaults to `.agent/sub-agents/templates`.
   */
  readonly templateDir?: string;

  /**
   * List of required `[key, expectedValue]` TOML basic-string settings that
   * must be present in the adapter file.
   * Defaults to the exact model, effort and safety settings for a supported
   * Cricket role; ordinary reviewers use {@link REQUIRED_CODEX_SETTINGS}.
   */
  readonly requiredSettings?: readonly (readonly [string, string])[];

  /**
   * Repository-relative path to the Codex config file.
   * Used when resolving the registered adapter path for cross-reference
   * checks.  Defaults to `.codex/config.toml`.
   */
  readonly configPath?: string;
}

/**
 * Outputs from {@link getCodexAdapterValidation}.
 */
export interface CodexAdapterValidationResult {
  /** Validation issues collected for this adapter file. */
  readonly issues: string[];

  /**
   * The subset of canonical paths extracted from `developer_instructions`
   * that reside inside the `templateDir`.
   */
  readonly templatePaths: string[];

  /**
   * All canonical `.agent/...` paths extracted from `developer_instructions`.
   */
  readonly canonicalPaths: string[];
}

// ---------------------------------------------------------------------------
// Public validation entry point
// ---------------------------------------------------------------------------

/**
 * Validates a single Codex subagent adapter TOML file.
 *
 * Checks performed:
 * - The complete TOML document contains only declared reviewer string fields.
 * - Required TOML keys `name` and `description` are present.
 * - The `name` value matches the adapter's filename (without `.toml`).
 * - A matching entry exists in `.codex/config.toml`, and both `name` and
 *   `description` are consistent with that registration.
 * - All required settings (e.g. `model_reasoning_effort`, `sandbox_mode`,
 *   `approval_policy`) are set to their mandated values.
 * - A non-empty top-level `developer_instructions` string is present.
 * - The `developer_instructions` body references at least one canonical
 *   template path inside `templateDir`.
 *
 * @param input - The adapter file path, its content, and optional overrides
 *   for the registered agent, template directory, required settings, and
 *   config path.
 * @returns A result object with collected issues, the template paths
 *   referenced in `developer_instructions`, and all canonical paths found.
 */
function validateCodexAdapter({
  codexAdapterFile,
  content,
  registeredAgent = null,
  templateDir = DEFAULT_TEMPLATE_DIR,
  requiredSettings,
  configPath = CODEX_CONFIG_PATH,
}: CodexAdapterValidationInput): CodexAdapterValidationResult {
  const document = readCodexAdapterDocument(content);
  const adapterBasename = stripBasename(codexAdapterFile, '.toml');
  const role = cricketRole(adapterBasename);
  const roleSettings = role?.codexModel
    ? [
        ['model', role.codexModel] as const,
        ['model_reasoning_effort', role.effort] as const,
        ['sandbox_mode', 'read-only'] as const,
        ['approval_policy', 'never'] as const,
      ]
    : REQUIRED_CODEX_SETTINGS;
  const declaredName = tomlString(document, 'name');
  const declaredDescription = tomlString(document, 'description');
  const issues: string[] = validateAdapterFields(
    codexAdapterFile,
    adapterBasename,
    declaredName,
    declaredDescription,
    registeredAgent,
    document,
    requiredSettings ?? roleSettings,
    configPath,
  );
  if (!supportsReviewer(adapterBasename, 'codex'))
    issues.push(`${codexAdapterFile}: unsupported Codex role`);
  const developerInstructions = tomlString(document, 'developer_instructions')?.trim() ?? '';
  if (!developerInstructions) {
    issues.push(`${codexAdapterFile}: missing non-empty developer_instructions string`);
    return { issues, templatePaths: [], canonicalPaths: [] };
  }
  const extractedCanonicalPaths = extractCanonicalPaths(developerInstructions);
  for (const path of extractedCanonicalPaths) {
    const pathIssue = canonicalAgentReferenceIssue(path);
    if (pathIssue !== null) issues.push(`${codexAdapterFile}: ${pathIssue}`);
  }
  const canonicalPaths = extractedCanonicalPaths.filter(
    (path) => canonicalAgentReferenceIssue(path) === null,
  );
  const templatePaths = canonicalPaths.filter((path) =>
    isCanonicalAgentReferenceInside(path, templateDir),
  );
  const personaPaths = canonicalPaths.filter((path) =>
    isCanonicalAgentReferenceInside(path, DEFAULT_PERSONA_DIR),
  );
  if (role && (templatePaths.length !== 1 || templatePaths[0] !== role.templatePath)) {
    issues.push(
      `${codexAdapterFile}: developer_instructions must reference exactly ${role.templatePath} for its Cricket method contract`,
    );
  }
  if (!role && templatePaths.length !== 1) {
    issues.push(
      `${codexAdapterFile}: developer_instructions must reference exactly one canonical template inside ${templateDir}`,
    );
  }
  if (personaPaths.length > 1) {
    issues.push(
      `${codexAdapterFile}: developer_instructions must reference at most one canonical persona inside ${DEFAULT_PERSONA_DIR}`,
    );
  }
  return { issues, templatePaths, canonicalPaths };
}

/**
 * Validate an adapter's TOML, registered identity, safety settings and canonical method.
 *
 * @param input - Adapter path/source, matching registration and optional contract overrides.
 * @returns File-scoped issues plus canonical/template paths found in instructions.
 * TOML parsing, undeclared-field and field-type errors become issues with empty path lists rather
 * than escaping as exceptions. Ordinary models may be omitted; explicit values
 * must be strings. Cricket requires its exact supported role bindings and method.
 * This pure boundary does not check whether referenced files exist.
 * @example
 * ```typescript
 * const result = getCodexAdapterValidation({
 *   codexAdapterFile: '.codex/agents/code-reviewer.toml',
 *   content: adapterSource,
 *   registeredAgent: registration,
 * });
 * if (result.issues.length > 0) throw new Error(result.issues.join('\n'));
 * ```
 */
export function getCodexAdapterValidation(
  input: CodexAdapterValidationInput,
): CodexAdapterValidationResult {
  try {
    return validateCodexAdapter(input);
  } catch (error) {
    return {
      issues: [
        `${input.codexAdapterFile}: invalid TOML: ${error instanceof Error ? error.message : String(error)}`,
      ],
      templatePaths: [],
      canonicalPaths: [],
    };
  }
}
