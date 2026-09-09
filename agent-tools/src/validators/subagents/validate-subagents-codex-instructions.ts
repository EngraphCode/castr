/**
 * Extraction utilities for the `developer_instructions` string in Codex
 * adapter TOML files.
 *
 * Responsibilities:
 * - Decoding the top-level `developer_instructions` TOML string.
 * - Extracting the de-duplicated sorted set of canonical `.agent/...` paths
 *   referenced inside that block.
 *
 * TOML basic-string decoding and registration parsing live in the sibling
 * module `validate-subagents-codex-toml.ts`.
 *
 * All functions are stateless and free of I/O — callers supply content as
 * strings.
 */

import { readTomlDocument, tomlString } from '../../core/toml-document.js';
import { extractCanonicalAgentPaths } from '../../core/canonical-agent-reference.js';

// ---------------------------------------------------------------------------
// Developer instructions extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the top-level `developer_instructions` TOML string
 * from a Codex adapter TOML file.
 *
 * Returns an empty string when the block is absent or empty, so callers can
 * treat a falsy return value as "instructions not present".
 *
 * @param content - Full text of a Codex adapter TOML file.
 * @returns The trimmed developer instructions body, or `""` if absent.
 * @throws If the TOML is malformed or the field has a non-string value.
 */
export function readCodexDeveloperInstructions(content: string): string {
  return tomlString(readTomlDocument(content), 'developer_instructions')?.trim() ?? '';
}

// ---------------------------------------------------------------------------
// Canonical path extraction
// ---------------------------------------------------------------------------

/**
 * Extracts the de-duplicated, sorted set of canonical `.agent/...` paths
 * referenced inside a developer instructions string.
 *
 * A canonical path reference is any backtick-delimited path beginning with
 * `.agent/`, such as `.agent/sub-agents/templates/code-expert.md`.
 *
 * @param developerInstructions - The developer instructions body, as returned
 *   by {@link readCodexDeveloperInstructions}.
 * @returns A sorted array of unique `.agent/...` path strings.
 */
export function extractCanonicalPaths(developerInstructions: string): string[] {
  return extractCanonicalAgentPaths(developerInstructions);
}
