import {
  CODEX_CONFIG_PATH,
  readCodexAgentRegistrations,
  resolveCodexAgentConfigFilePath,
} from './codex-project-agent-registry.js';
import { resolveRegisteredCodexProjectAgent } from './codex-project-agents.js';
import { completeReviewerNames, supportsReviewer } from './reviewer-adapter-platform-contract.js';
import {
  CLAUDE_AGENTS_DIR,
  CODEX_AGENTS_DIR,
  CURSOR_AGENTS_DIR,
  listBasenames,
} from './health-probe-shared.js';
import type { HealthCheckResult } from './health-probe-types.js';

export function evaluateParityChecks(repoRoot: string): readonly HealthCheckResult[] {
  return [evaluateReviewerAdapterParity(repoRoot), evaluateReviewerRegistrationParity(repoRoot)];
}

function evaluateReviewerAdapterParity(repoRoot: string): HealthCheckResult {
  let cursorAgents: string[];
  let claudeAgents: string[];
  let codexAgents: string[];
  try {
    cursorAgents = listBasenames(repoRoot, CURSOR_AGENTS_DIR, '.md');
    claudeAgents = listBasenames(repoRoot, CLAUDE_AGENTS_DIR, '.md');
    codexAgents = listBasenames(repoRoot, CODEX_AGENTS_DIR, '.toml');
  } catch (error) {
    return {
      key: 'reviewer-adapter-parity',
      label: 'Reviewer adapter parity',
      status: 'fail',
      summary: 'Reviewer adapter estates could not be enumerated safely.',
      details: [error instanceof Error ? error.message : String(error)],
    };
  }
  const allAgentNames = completeReviewerNames([...cursorAgents, ...claudeAgents, ...codexAgents]);
  const details = collectReviewerAdapterParityDetails(allAgentNames, {
    cursorAgents,
    claudeAgents,
    codexAgents,
  });

  if (details.length > 0) {
    return {
      key: 'reviewer-adapter-parity',
      label: 'Reviewer adapter parity',
      status: 'fail',
      summary: 'Reviewer adapters are not present on every supported platform surface.',
      details,
    };
  }

  return {
    key: 'reviewer-adapter-parity',
    label: 'Reviewer adapter parity',
    status: 'pass',
    summary: `${allAgentNames.length} reviewer adapters are aligned across Cursor, Claude Code, and Codex.`,
    details: [],
  };
}

/**
 * Compare installed reviewer names against each platform's supported roster.
 * @param allAgentNames - Complete canonical reviewer names to assess.
 * @param platformAgents - Installed reviewer names grouped by platform.
 * @returns Operator-facing parity diagnostics; empty means the rosters align.
 */
export function collectReviewerAdapterParityDetails(
  allAgentNames: readonly string[],
  platformAgents: {
    readonly cursorAgents: readonly string[];
    readonly claudeAgents: readonly string[];
    readonly codexAgents: readonly string[];
  },
): string[] {
  const details: string[] = [];

  for (const agentName of allAgentNames) {
    if (!platformAgents.cursorAgents.includes(agentName)) {
      details.push(`Cursor is missing reviewer adapter ${agentName}.`);
    }
    if (!platformAgents.claudeAgents.includes(agentName)) {
      details.push(`Claude Code is missing reviewer adapter ${agentName}.`);
    }
    if (!supportsReviewer(agentName, 'codex') && platformAgents.codexAgents.includes(agentName)) {
      details.push(`Codex has unsupported reviewer adapter ${agentName}.`);
    } else if (
      supportsReviewer(agentName, 'codex') &&
      !platformAgents.codexAgents.includes(agentName)
    ) {
      details.push(`Codex is missing reviewer adapter ${agentName}.`);
    }
  }

  return details;
}

function evaluateReviewerRegistrationParity(repoRoot: string): HealthCheckResult {
  try {
    const codexAdapterNames = listBasenames(repoRoot, CODEX_AGENTS_DIR, '.toml');
    const registrations = readCodexAgentRegistrations(repoRoot);
    const details = collectReviewerRegistrationDetails(
      codexAdapterNames,
      registrations,
      (_adapterPath, registration) => {
        try {
          resolveRegisteredCodexProjectAgent(repoRoot, registration);
          return null;
        } catch (error) {
          return error instanceof Error ? error.message : String(error);
        }
      },
    );

    if (details.length > 0) {
      return {
        key: 'reviewer-registration-parity',
        label: 'Reviewer registration parity',
        status: 'fail',
        summary: 'Codex reviewer registrations and adapter files are out of sync.',
        details,
      };
    }

    return {
      key: 'reviewer-registration-parity',
      label: 'Reviewer registration parity',
      status: 'pass',
      summary: `${registrations.length} Codex reviewer registrations resolve cleanly to live adapters.`,
      details: [],
    };
  } catch (error) {
    return {
      key: 'reviewer-registration-parity',
      label: 'Reviewer registration parity',
      status: 'fail',
      summary: 'Codex reviewer registration could not be resolved cleanly.',
      details: [error instanceof Error ? error.message : String(error)],
    };
  }
}

export function collectReviewerRegistrationDetails(
  codexAdapterNames: readonly string[],
  registrations: readonly { name: string; description: string; configFile: string }[],
  getSourceIssue: (
    relativePath: string,
    registration: { name: string; description: string; configFile: string },
  ) => string | null,
): string[] {
  const registrationNames = new Set(registrations.map((registration) => registration.name));
  const details: string[] = [];

  for (const adapterName of codexAdapterNames) {
    if (!registrationNames.has(adapterName)) {
      details.push(
        `Codex adapter ${adapterName} is missing a registry entry in ${CODEX_CONFIG_PATH}.`,
      );
    }
  }

  for (const registration of registrations) {
    const adapterPath = resolveCodexAgentConfigFilePath(registration.configFile);
    const sourceIssue = getSourceIssue(adapterPath, registration);
    if (sourceIssue) {
      details.push(
        `${CODEX_CONFIG_PATH} cannot resolve adapter ${registration.configFile}. ${sourceIssue}`,
      );
    }
  }

  return details;
}
