import {
  CODEX_CONFIG_PATH,
  readCodexAgentRegistrations,
  readRequiredTomlValue,
  resolveCodexAgentConfigFilePath,
} from './codex-project-agent-registry.js';
import type { CodexAgentRegistration } from './codex-project-agent-registry.js';
import { tomlString } from './toml-document.js';
import { readCodexAdapterDocument, type CodexAdapterDocument } from './codex-adapter-document.js';
import {
  canonicalAgentReferenceIssue,
  extractCanonicalAgentPaths,
  readCanonicalAgentFileSync,
} from './canonical-agent-reference.js';
import { readRequiredRepositorySourceSync } from './required-repository-source.js';

export { parseCodexAgentRegistrations } from './codex-project-agent-registry.js';

interface AdapterMetadata {
  readonly model: string | null;
  readonly name: string;
  readonly description: string;
  readonly modelReasoningEffort: string;
  readonly sandboxMode: string;
  readonly approvalPolicy: string;
}

export interface CodexProjectAgent {
  /** Configured binding; null means inheritance, not an observed runtime model. */
  model: string | null;
  name: string;
  description: string;
  configPath: string;
  adapterPath: string;
  modelReasoningEffort: string;
  sandboxMode: string;
  approvalPolicy: string;
  developerInstructions: string;
  referencedCanonicalFiles: string[];
}

export function listCodexProjectAgentNames(repoRoot: string): string[] {
  return readCodexAgentRegistrations(repoRoot).map((registration) => registration.name);
}

export function resolveCodexProjectAgent(repoRoot: string, agentName: string): CodexProjectAgent {
  const registrations = readCodexAgentRegistrations(repoRoot);
  const registration = findRegistrationOrThrow(registrations, agentName);
  const adapterPath = resolveCodexAgentConfigFilePath(registration.configFile);
  const adapterContent = readAdapterContent(repoRoot, adapterPath, agentName);
  const agent = parseCodexProjectAgent(registration, adapterContent);
  ensureCanonicalFilesExist(repoRoot, agentName, agent.referencedCanonicalFiles);
  return agent;
}

/**
 * Resolve a registered adapter into its runtime descriptor without filesystem IO.
 * @param registration - Complete Castr registry entry.
 * @param adapterContent - Source of the adapter named by the registration.
 * @returns Exact configured metadata and canonical reference paths. A null model
 * means inheritance; it does not identify a model observed at runtime.
 * @throws When TOML is malformed, undeclared fields occur, required fields are missing/wrongly typed,
 * identity disagrees with the registry, or canonical references are absent.
 * @see {@link resolveCodexProjectAgent} for filesystem-backed resolution.
 * @example
 * ```typescript
 * const agent = parseCodexProjectAgent(registration, adapterSource);
 * console.log(agent.model, agent.modelReasoningEffort);
 * ```
 */
export function parseCodexProjectAgent(
  registration: CodexAgentRegistration,
  adapterContent: string,
): CodexProjectAgent {
  const adapterPath = resolveCodexAgentConfigFilePath(registration.configFile);
  const document = readCodexAdapterDocument(adapterContent);
  const adapterMetadata = readAdapterMetadata(
    registration,
    adapterPath,
    document,
    registration.name,
  );
  const developerInstructions = readRequiredTomlValue(
    document,
    'developer_instructions',
    adapterPath,
  ).trim();
  const referencedCanonicalFiles = extractCanonicalAgentPaths(developerInstructions);
  if (referencedCanonicalFiles.length === 0) {
    throw new Error(
      `Codex project agent '${registration.name}' does not reference any canonical .agent files in ${adapterPath}.`,
    );
  }
  for (const referencedFile of referencedCanonicalFiles) {
    const issue = canonicalAgentReferenceIssue(referencedFile);
    if (issue !== null) throw new Error(`${adapterPath}: ${issue}`);
  }

  return {
    ...adapterMetadata,
    configPath: CODEX_CONFIG_PATH,
    adapterPath,
    developerInstructions,
    referencedCanonicalFiles,
  };
}

function findRegistrationOrThrow(
  registrations: readonly CodexAgentRegistration[],
  agentName: string,
): CodexAgentRegistration {
  const registration = registrations.find((entry) => entry.name === agentName);
  if (registration) {
    return registration;
  }

  const availableAgents = registrations.map((entry) => entry.name).join(', ');
  throw new Error(
    `Codex project agent '${agentName}' is not registered in ${CODEX_CONFIG_PATH}. Available agents: ${availableAgents}`,
  );
}

function readAdapterContent(repoRoot: string, adapterPath: string, agentName: string): string {
  try {
    return readRequiredRepositorySourceSync(repoRoot, adapterPath);
  } catch (error) {
    throw new Error(
      `Codex project agent '${agentName}' points at missing adapter ${adapterPath}. ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}

function readAdapterMetadata(
  registration: CodexAgentRegistration,
  adapterPath: string,
  document: CodexAdapterDocument,
  agentName: string,
): AdapterMetadata {
  const name = readRequiredTomlValue(document, 'name', adapterPath);
  const description = readRequiredTomlValue(document, 'description', adapterPath);

  validateAdapterValue('name', name, registration.name, registration, agentName);
  validateAdapterValue(
    'description',
    description,
    registration.description,
    registration,
    agentName,
  );

  return {
    name,
    description,
    model: tomlString(document, 'model'),
    modelReasoningEffort: readRequiredTomlValue(document, 'model_reasoning_effort', adapterPath),
    sandboxMode: readRequiredTomlValue(document, 'sandbox_mode', adapterPath),
    approvalPolicy: readRequiredTomlValue(document, 'approval_policy', adapterPath),
  };
}

function validateAdapterValue(
  key: 'name' | 'description',
  actual: string,
  expected: string,
  registration: CodexAgentRegistration,
  agentName: string,
): void {
  if (actual === expected) {
    return;
  }

  if (key === 'name') {
    throw new Error(
      `Codex project agent '${agentName}' adapter name '${actual}' does not match registry name '${registration.name}'.`,
    );
  }

  throw new Error(
    `Codex project agent '${agentName}' adapter description does not match the registry description in ${CODEX_CONFIG_PATH}.`,
  );
}

function ensureCanonicalFilesExist(
  repoRoot: string,
  agentName: string,
  referencedCanonicalFiles: readonly string[],
): void {
  for (const referencedFile of referencedCanonicalFiles) {
    try {
      readCanonicalAgentFileSync(repoRoot, referencedFile);
    } catch (error) {
      throw new Error(
        `Codex project agent '${agentName}' cannot read canonical file ${referencedFile}: ${error instanceof Error ? error.message : String(error)}`,
        { cause: error },
      );
    }
  }
}
