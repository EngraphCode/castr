import { mkdir, readFile } from 'node:fs/promises';
import { dirname } from 'node:path';

import { writeTextAtomically } from './atomic-file.js';
import { required, type Options } from './cli-options.js';
import { validateCollaborationJsonBySchemaId } from './collaboration-json-validation.js';
import { parseClosedClaimsArchive, parseCollaborationRegistry } from './state-parsers.js';
import { type ClosedClaimsArchive, type CollaborationRegistry } from './types.js';

// Typed literals make the measured 2026-08-24 mis-seed (the registry shape
// written into the archive, rejected by the blocking validator three commits
// later) a compile error via excess-property checking.
const activeSeed: CollaborationRegistry = { schema_version: '1.3.0', claims: [], commit_queue: [] };
const closedSeed: ClosedClaimsArchive = { schema_version: '1.3.0', claims: [] };

/** Canonical seed text for a fresh active-claims registry (carries `commit_queue`). */
export const ACTIVE_CLAIMS_SEED_TEXT = `${JSON.stringify(activeSeed, undefined, 2)}\n`;

/** Canonical seed text for a fresh closed-claims archive (no `commit_queue`). */
export const CLOSED_CLAIMS_SEED_TEXT = `${JSON.stringify(closedSeed, undefined, 2)}\n`;

/** Which collaboration state file an init step concerns. */
type ClaimsInitFileKind = 'active' | 'closed';

/**
 * Narrow IO surface for `claims init`, following the `AutoSeedIo` precedent:
 * pinning the seam to exactly what the command needs lets tests inject a
 * tiny fake without re-implementing the CLI IO interface.
 */
export interface ClaimsInitIo {
  readonly readTextIfPresent: (path: string) => Promise<string | undefined>;
  readonly createExclusively: (path: string, text: string) => Promise<void>;
  readonly validateForKind: (kind: ClaimsInitFileKind, text: string) => Promise<void>;
}

/**
 * Production validity for one state-file kind: the canonical parser (which
 * pins `schema_version` 1.3.0 — ajv alone accepts older versions) composed
 * with the blocking ajv schema (`additionalProperties: false` included), by
 * schema id so `--active`/`--closed` may point at non-canonical basenames.
 *
 * @param kind - Which state file the text belongs to.
 * @param text - JSON text to validate.
 * @throws Error when the text fails either the parser or the schema.
 */
async function validateForKindProduction(kind: ClaimsInitFileKind, text: string): Promise<void> {
  if (kind === 'active') {
    parseCollaborationRegistry(text);
    await validateCollaborationJsonBySchemaId('active-claims.schema.json', text);
  } else {
    parseClosedClaimsArchive(text);
    await validateCollaborationJsonBySchemaId('closed-claims.schema.json', text);
  }
}

const productionIo: ClaimsInitIo = {
  readTextIfPresent: readFileIfPresent,
  createExclusively: async (path, text) => {
    await mkdir(dirname(path), { recursive: true });
    await writeTextAtomically(path, text, { exclusiveCreate: true });
  },
  validateForKind: validateForKindProduction,
};

interface ClaimsInitTarget {
  readonly kind: ClaimsInitFileKind;
  readonly path: string;
  readonly seedText: string;
}

/**
 * CLI handler for `collaboration-state claims init`: seed the active
 * registry and closed archive with their canonical per-file shapes when
 * absent, leave valid files untouched, and fail loud on invalid content
 * without overwriting.
 *
 * All-or-nothing: BOTH files are read and validated before EITHER is
 * written, so an invalid archive never leaves behind a half-initialised
 * pair. Seed texts are themselves validated through the same canonical
 * validation before writing — a mis-shapen seed fails here, at the cause.
 * A create that loses an exclusive-write race to a peer re-reads and
 * re-judges: a valid peer seed is the `already initialised` outcome, an
 * invalid one still fails loud.
 *
 * @param options - Parsed CLI options; requires `--active` and `--closed`.
 * @param io - IO seam (production default); tests inject a fake.
 * @returns One human-readable line per file naming what happened.
 * @throws Error when an existing file fails validation for its kind
 *   (refusing to overwrite), or when a raced peer write left invalid
 *   content.
 */
export async function initClaimsState(
  options: Options,
  io: ClaimsInitIo = productionIo,
): Promise<string> {
  const targets: readonly ClaimsInitTarget[] = [
    { kind: 'active', path: required(options, 'active'), seedText: ACTIVE_CLAIMS_SEED_TEXT },
    { kind: 'closed', path: required(options, 'closed'), seedText: CLOSED_CLAIMS_SEED_TEXT },
  ];

  // Phase 1 — read and validate everything before any write (all-or-nothing).
  const plans: { readonly target: ClaimsInitTarget; readonly seed: boolean }[] = [];
  for (const target of targets) {
    const existingText = await io.readTextIfPresent(target.path);
    if (existingText === undefined) {
      plans.push({ target, seed: true });
    } else {
      await assertValidExisting(io, target.kind, existingText);
      plans.push({ target, seed: false });
    }
  }

  // Phase 2 — write the missing files, each seed validated first.
  const lines: string[] = [];
  for (const { target, seed } of plans) {
    if (!seed) {
      lines.push(alreadyInitialisedLine(target));
      continue;
    }
    await io.validateForKind(target.kind, target.seedText);
    try {
      await io.createExclusively(target.path, target.seedText);
      lines.push(`seeded ${target.kind} state at ${target.path}`);
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'EEXIST')) {
        throw error;
      }
      // A peer seeded it in the race window: re-read and re-judge, so a
      // valid peer seed reports already-initialised and an invalid one
      // still fails loud.
      const raced = await io.readTextIfPresent(target.path);
      if (raced === undefined) {
        throw error;
      }
      await assertValidExisting(io, target.kind, raced);
      lines.push(alreadyInitialisedLine(target));
    }
  }
  return `${lines.join('\n')}\n`;
}

/**
 * Validate existing state-file text for its kind, wrapping any failure in
 * the command's refuse-to-overwrite taxonomy.
 *
 * @param io - IO seam carrying the kind validator.
 * @param kind - Which state file the text belongs to.
 * @param text - The file's current text.
 * @throws Error naming the kind and refusing to overwrite, with the
 *   underlying failure as `cause`.
 */
async function assertValidExisting(
  io: ClaimsInitIo,
  kind: ClaimsInitFileKind,
  text: string,
): Promise<void> {
  try {
    await io.validateForKind(kind, text);
  } catch (error) {
    const problem = error instanceof Error ? error.message : String(error);
    throw new Error(
      `claims init: existing ${kind} state file is invalid (${problem}); ` +
        `refusing to overwrite — repair or remove it deliberately, then re-run init`,
      { cause: error },
    );
  }
}

/**
 * Result line for a file that init leaves untouched.
 *
 * @param target - The state-file target the line describes.
 * @returns The human-readable already-initialised line.
 */
function alreadyInitialisedLine(target: ClaimsInitTarget): string {
  return `${target.kind} state already initialised at ${target.path} (untouched)`;
}

/**
 * Read a file's text, mapping absence (ENOENT) to `undefined` and wrapping
 * other read failures in the command's taxonomy.
 *
 * @param path - File path to read.
 * @returns The file text, or `undefined` when the file does not exist.
 * @throws Error naming the command and path for non-ENOENT read failures.
 */
async function readFileIfPresent(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8');
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return undefined;
    }
    throw new Error(`claims init: cannot read state file at ${path}`, { cause: error });
  }
}
