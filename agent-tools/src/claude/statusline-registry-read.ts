/**
 * Registry-read classification for the statusline session-shape glance.
 *
 * @remarks
 * The three-way outcome this module owns IS the absent-registry defect cure
 * (statusline S1 bring, 2026-07-03): an ABSENT registry file means genuinely
 * zero claims, so the resolver must read a truthful, confident `solo` — never
 * the `unknown` → blank-icon state Oak's pending icons plan documents as the
 * as-built defect. Any OTHER read failure, and any parse failure, stays
 * `undefined` → `unknown`: never a false solo on an unreadable or corrupt
 * registry. Extracted pure (reader and parser injected) so the classification
 * contract is unit-provable without filesystem state; the adapter
 * (`statusline-identity.ts`) supplies the real `readFileSync` +
 * `parseCollaborationRegistry`. Oak back-flow candidate.
 *
 * @packageDocumentation
 */

import { type CollaborationRegistry } from '../collaboration-state/types.js';

/** A registry that has never been written: truthfully zero claims. */
export const EMPTY_REGISTRY: CollaborationRegistry = {
  schema_version: '1.3.0',
  commit_queue: [],
  claims: [],
};

/**
 * Read and classify the active-claims registry for one statusline tick.
 *
 * @param registryPath - Absolute path of the registry file.
 * @param readFile - Reader returning the file's text; throws on any failure
 *   (the real adapter passes `readFileSync(path, 'utf8')`).
 * @param parse - Parser returning the validated registry; throws on invalid
 *   content (the real adapter passes `parseCollaborationRegistry`).
 * @returns The parsed registry; {@link EMPTY_REGISTRY} when the file is
 *   absent (ENOENT — truthful zero claims → solo); `undefined` for every
 *   other read failure or a parse failure (→ `unknown`, never a false solo).
 */
export function readRegistryWithSoloFloor(
  registryPath: string,
  readFile: (path: string) => string,
  parse: (raw: string) => CollaborationRegistry,
): CollaborationRegistry | undefined {
  let raw: string;
  try {
    raw = readFile(registryPath);
  } catch (cause) {
    return isEnoent(cause) ? EMPTY_REGISTRY : undefined;
  }
  try {
    return parse(raw);
  } catch {
    return undefined;
  }
}

function isEnoent(cause: unknown): boolean {
  return typeof cause === 'object' && cause !== null && 'code' in cause && cause.code === 'ENOENT';
}
