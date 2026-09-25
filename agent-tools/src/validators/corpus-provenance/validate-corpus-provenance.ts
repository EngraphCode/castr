#!/usr/bin/env node

/**
 * Standalone validator that fails when a pinned corpus document no longer matches its pin
 * record. The specification defines a corpus as documents copied into Castr's fixtures and
 * pinned by SHA-256 (docs/SPECIFICATION.md, Definitions: Corpus), and
 * `lib/tests-transforms/__fixtures__/corpus/provenance.json` is that record. This gate
 * recomputes each document's byte count and SHA-256 from the committed bytes, checks the
 * document's own `openapi` and `info` fields against the record, and fails on a document in
 * the directory that is not pinned, whatever its kind, or a pinned document that is not there.
 *
 * It lives here, with the other repository validators, rather than in the product test suite:
 * it proves nothing about Castr's behaviour, it proves that the fixtures are the bytes their
 * record names (`.agent/directives/testing-strategy.md`, "Prove behaviour, never config or
 * content"; `.agent/rules/validators-must-recompute-not-just-record.md`).
 *
 * Wired into root `repo-validators:check`.
 *
 * @packageDocumentation
 */

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { isErrnoCode } from '../../core/errno.js';
import { resolveRepoRoot } from '../../core/repo-root.js';
import { writeErrorLine, writeLine } from '../../core/terminal-output.js';

import {
  checkCorpusListing,
  checkPinnedDocument,
  CORPUS_DIRECTORY,
  parseProvenanceRecord,
  PROVENANCE_FILE,
  resolveCorpusOutcome,
  type ParsedProvenance,
  type PinViolation,
} from './validate-corpus-provenance-helpers.js';

const repoRoot = resolveRepoRoot(import.meta.url);
const corpusDirectory = path.join(repoRoot, CORPUS_DIRECTORY);

function readRecord(): ParsedProvenance {
  try {
    return parseProvenanceRecord(readFileSync(path.join(corpusDirectory, PROVENANCE_FILE), 'utf8'));
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return { ok: false, error: 'the file does not exist' };
    }
    throw error;
  }
}

/** The document's bytes, or nothing when there is no such file: the helper reports that. */
function readDocument(file: string): Uint8Array | undefined {
  try {
    return readFileSync(path.join(corpusDirectory, file));
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return undefined;
    }
    throw error;
  }
}

const parsed = readRecord();
const violations: PinViolation[] = [];

if (parsed.ok) {
  violations.push(...checkCorpusListing(parsed.record, readdirSync(corpusDirectory)));
  for (const document of parsed.record.documents) {
    violations.push(...checkPinnedDocument(document, readDocument(document.file)));
  }
}

const outcome = resolveCorpusOutcome(parsed, violations);
outcome.stdout.forEach((line) => writeLine(line));
outcome.stderr.forEach((line) => writeErrorLine(line));
process.exit(outcome.exitCode);
