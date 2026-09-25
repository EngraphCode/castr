/**
 * Corpus provenance: the pinned Oak API documents match their recorded pins.
 *
 * The specification defines a corpus as a document copied into Castr's fixtures and
 * pinned by source commit and SHA-256. `__fixtures__/corpus/provenance.json` is the pin
 * record. This test recomputes each pinned document's size and SHA-256 from the committed
 * bytes and checks the document's own `openapi` and `info` fields against the record, so
 * a silent rewrite of a corpus file (a formatter, a refresh, a hand edit) fails here rather
 * than going unnoticed.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const CORPUS_DIR = resolve(import.meta.dirname, '../__fixtures__/corpus');
const PROVENANCE_PATH = resolve(CORPUS_DIR, 'provenance.json');

const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/u);

const servedSourceSchema = z.strictObject({
  kind: z.literal('served'),
  url: z.url(),
  fetchedAt: z.iso.datetime(),
});

const copiedSourceSchema = z.strictObject({
  kind: z.literal('copied'),
  repository: z.url(),
  repositoryCommit: commitShaSchema,
  path: z.string().min(1),
  upstreamUrl: z.url(),
  upstreamCommit: commitShaSchema,
});

const pinnedDocumentSchema = z.strictObject({
  file: z.string().regex(/^[a-z0-9.-]+\.json$/u),
  openapi: z.string().min(1),
  infoTitle: z.string().min(1),
  infoVersion: z.string().min(1),
  bytes: z.int().positive(),
  sha256: sha256Schema,
  source: z.discriminatedUnion('kind', [servedSourceSchema, copiedSourceSchema]),
});

const provenanceSchema = z.strictObject({
  documents: z.array(pinnedDocumentSchema).min(1),
});

/** The fields of an OpenAPI document that the pin record repeats. */
const documentHeaderSchema = z.object({
  openapi: z.string(),
  info: z.object({
    title: z.string(),
    version: z.string(),
  }),
});

const provenance = provenanceSchema.parse(JSON.parse(readFileSync(PROVENANCE_PATH, 'utf8')));

describe('corpus provenance', () => {
  it('pins every document by a distinct file and a distinct hash', () => {
    const files = provenance.documents.map((document) => document.file);
    const hashes = provenance.documents.map((document) => document.sha256);

    expect(new Set(files).size).toBe(files.length);
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  it.each(provenance.documents)('$file matches its recorded pin', (document) => {
    const bytes = readFileSync(resolve(CORPUS_DIR, document.file));
    const header = documentHeaderSchema.parse(JSON.parse(bytes.toString('utf8')));

    expect(bytes.byteLength).toBe(document.bytes);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(document.sha256);
    expect(header.openapi).toBe(document.openapi);
    expect(header.info.title).toBe(document.infoTitle);
    expect(header.info.version).toBe(document.infoVersion);
  });
});
