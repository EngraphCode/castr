/**
 * Reviewer-adapter cross-platform parity checks for the portability validator.
 *
 * Every named reviewer requires its platform-specific roster: ordinary roles
 * exist on all three platforms, while Cricket has three Codex and four
 * Claude/Cursor adapters. Unsupported adapters are reported alongside gaps.
 * This module provides the pure function that detects parity gaps given the
 * lists of existing adapter file paths.
 */

import { stripDirAndExtension } from './portability-constants.js';
import {
  completeReviewerNames,
  supportsReviewer,
} from '../../core/reviewer-adapter-platform-contract.js';

/**
 * Options for {@link getReviewerAdapterParityIssues}.
 */
export interface ReviewerAdapterParityIssuesOptions {
  /**
   * Relative paths of all `.cursor/agents/<name>.md` files present in the
   * repo.
   */
  cursorAgentFiles: string[];
  /**
   * Relative paths of all `.claude/agents/<name>.md` files present in the
   * repo.
   */
  claudeAgentFiles: string[];
  /**
   * Relative paths of all `.codex/agents/<name>.toml` files present in the
   * repo.
   */
  codexAgentFiles: string[];
}

/**
 * Returns all portability issues caused by missing reviewer adapter files.
 *
 * A canonical reviewer adapter name is any name that appears in at least one
 * of the three platform adapter lists.  For each canonical name, the function
 * checks every supported platform and reports each missing or unsupported file.
 * Any Cricket member implies the complete platform-specific panel.
 *
 * Issue messages use the expected file path so that operators can immediately
 * identify what needs to be created.
 *
 * @param options - The three platform adapter file lists.
 * @returns An array of human-readable issue strings; empty means all adapters
 *   satisfy each platform's complete supported roster.
 */
export function getReviewerAdapterParityIssues({
  cursorAgentFiles,
  claudeAgentFiles,
  codexAgentFiles,
}: ReviewerAdapterParityIssuesOptions): string[] {
  const issues: string[] = [];

  const cursorNames = new Set(cursorAgentFiles.map((f) => stripDirAndExtension(f, '.md')));
  const claudeNames = new Set(claudeAgentFiles.map((f) => stripDirAndExtension(f, '.md')));
  const codexNames = new Set(codexAgentFiles.map((f) => stripDirAndExtension(f, '.toml')));

  const canonicalNames = completeReviewerNames([...cursorNames, ...claudeNames, ...codexNames]);

  for (const agentName of canonicalNames) {
    if (!cursorNames.has(agentName)) {
      issues.push(
        `.cursor/agents/${agentName}.md: missing reviewer adapter required for cross-platform parity`,
      );
    }
    if (!claudeNames.has(agentName)) {
      issues.push(
        `.claude/agents/${agentName}.md: missing reviewer adapter required for cross-platform parity`,
      );
    }
    if (!supportsReviewer(agentName, 'codex') && codexNames.has(agentName)) {
      issues.push(`.codex/agents/${agentName}.toml: reviewer adapter is unsupported on codex`);
    } else if (supportsReviewer(agentName, 'codex') && !codexNames.has(agentName)) {
      issues.push(
        `.codex/agents/${agentName}.toml: missing reviewer adapter required for cross-platform parity`,
      );
    }
  }

  return issues;
}
