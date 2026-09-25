#!/usr/bin/env node

/**
 * Standalone validator that fails when a pinned corpus document no longer matches its pin
 * record. The specification defines a corpus as documents copied into Castr's fixtures and
 * pinned by SHA-256 (docs/SPECIFICATION.md, Definitions: Corpus), and
 * `lib/tests-transforms/__fixtures__/corpus/provenance.json` is that record. This gate
 * recomputes each document's byte count and SHA-256 from the committed bytes, checks the
 * document's own `openapi` and `info` fields against the record, and fails on a document in
 * the directory that is not pinned, whatever its kind, a pinned document that is not there,
 * and a pinned name that is a symbolic link or a directory rather than the bytes at its path.
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

import { lstatSync, readdirSync, readFileSync } from 'node:fs';
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
  type DocumentOnDisk,
  type ParsedProvenance,
  type PinViolation,
} from './validate-corpus-provenance-helpers.js';

const repoRoot = resolveRepoRoot(import.meta.url);
const corpusDirectory = path.join(repoRoot, CORPUS_DIRECTORY);

/**
 * What is at a path inside the corpus directory. `lstat` does not follow a symbolic link, so a
 * link is reported as what it is rather than read through to its target.
 */
function readDocument(file: string): DocumentOnDisk {
  const documentPath = path.join(corpusDirectory, file);
  try {
    if (!lstatSync(documentPath).isFile()) {
      return { kind: 'not-a-regular-file' };
    }
  } catch (error) {
    if (isErrnoCode(error, 'ENOENT')) {
      return { kind: 'missing' };
    }
    throw error;
  }
  return { kind: 'file', bytes: readFileSync(documentPath) };
}

function readRecord(): ParsedProvenance {
  const record = readDocument(PROVENANCE_FILE);
  if (record.kind === 'missing') {
    return { ok: false, error: 'the file does not exist' };
  }
  if (record.kind === 'not-a-regular-file') {
    return { ok: false, error: 'the path is not a regular file' };
  }
  try {
    return parseProvenanceRecord(new TextDecoder('utf-8', { fatal: true }).decode(record.bytes));
  } catch {
    return { ok: false, error: 'the file is not UTF-8' };
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
