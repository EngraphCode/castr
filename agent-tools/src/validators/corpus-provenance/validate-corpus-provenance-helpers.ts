/**
 * Pure helpers for the corpus provenance validator: the pin record's schema, the per-document
 * recompute, the directory listing check and the outcome. No IO here; the shell in
 * `validate-corpus-provenance.ts` reads the files and prints the outcome.
 *
 * @packageDocumentation
 */

import { createHash } from 'node:crypto';

import { z } from 'zod';

/** Repo-relative directory that holds the pinned corpus documents and their pin record. */
export const CORPUS_DIRECTORY = 'lib/tests-transforms/__fixtures__/corpus';

/** The pin record's file name inside the corpus directory. */
export const PROVENANCE_FILE = 'provenance.json';

/** The corpus directory's own README, the one entry beside the record that is not a pinned document. */
export const CORPUS_README = 'README.md';

const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const commitShaSchema = z.string().regex(/^[0-9a-f]{40}$/u);

/** A document fetched from the URL that serves it: its pin is the URL, the fetch time and the hash. */
const servedSourceSchema = z.strictObject({
  kind: z.literal('served'),
  url: z.httpUrl(),
  fetchedAt: z.iso.datetime(),
});

/** A document copied from another repository's commit, which also records where that copy came from. */
const copiedSourceSchema = z.strictObject({
  kind: z.literal('copied'),
  repository: z.httpUrl(),
  repositoryCommit: commitShaSchema,
  path: z.string().min(1),
  upstreamUrl: z.httpUrl(),
  upstreamCommit: commitShaSchema,
});

const pinnedDocumentSchema = z.strictObject({
  /** A bare file name inside the corpus directory: no separators, so it cannot point elsewhere. */
  file: z.string().regex(/^[a-z0-9][a-z0-9.-]*\.json$/u),
  openapi: z.string().min(1),
  infoTitle: z.string().min(1),
  infoVersion: z.string().min(1),
  bytes: z.int().positive(),
  sha256: sha256Schema,
  source: z.discriminatedUnion('kind', [servedSourceSchema, copiedSourceSchema]),
});

function addDuplicateIssues(
  documents: readonly z.infer<typeof pinnedDocumentSchema>[],
  field: 'file' | 'sha256',
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  documents.forEach((document, index) => {
    if (seen.has(document[field])) {
      ctx.addIssue({
        code: 'custom',
        message: `${field} ${document[field]} is pinned more than once`,
        path: ['documents', index, field],
      });
    }
    seen.add(document[field]);
  });
}

/** One entry per file and one per document: the same name or the same bytes pinned twice is not a record. */
const provenanceRecordSchema = z
  .strictObject({
    documents: z.array(pinnedDocumentSchema).min(1),
  })
  .superRefine((record, ctx) => {
    addDuplicateIssues(record.documents, 'file', ctx);
    addDuplicateIssues(record.documents, 'sha256', ctx);
  });

/** The fields of an OpenAPI document that the pin record repeats. */
const documentHeaderSchema = z.object({
  openapi: z.string(),
  info: z.object({
    title: z.string(),
    version: z.string(),
  }),
});

export type PinnedDocument = z.infer<typeof pinnedDocumentSchema>;
export type ProvenanceRecord = z.infer<typeof provenanceRecordSchema>;

export type ParsedProvenance =
  | { readonly ok: true; readonly record: ProvenanceRecord }
  | { readonly ok: false; readonly error: string };

export interface PinViolation {
  readonly file: string;
  readonly message: string;
}

/** Exit 0: every pin matches. Exit 1: at least one pin violation. Exit 2: the record cannot be parsed. */
export interface CorpusOutcome {
  readonly exitCode: 0 | 1 | 2;
  readonly stdout: readonly string[];
  readonly stderr: readonly string[];
}

type ParsedJson =
  { readonly ok: true; readonly value: unknown } | { readonly ok: false; readonly error: string };

function parseJson(text: string): ParsedJson {
  try {
    const value: unknown = JSON.parse(text);
    return { ok: true, value };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/** Parse the pin record's text into a validated record, or say why it is not one. */
export function parseProvenanceRecord(text: string): ParsedProvenance {
  const json = parseJson(text);
  if (!json.ok) {
    return { ok: false, error: `not JSON: ${json.error}` };
  }
  const result = provenanceRecordSchema.safeParse(json.value);
  if (!result.success) {
    return { ok: false, error: z.prettifyError(result.error) };
  }
  return { ok: true, record: result.data };
}

function compareField(name: string, inDocument: string, recorded: string): readonly string[] {
  return inDocument === recorded
    ? []
    : [`${name} is ${inDocument} in the document, ${recorded} recorded`];
}

/**
 * Check one pinned document's bytes against its record. No bytes means the document is not on
 * disk, reported alone. Otherwise the byte count is checked first and reported alone, then
 * the hash, also alone; the header fields are compared only once the bytes match, so a
 * rewrite is reported as the pin mismatch it is, never as a parse failure. Every recorded
 * document goes through here, so whether a pin is recomputed never depends on the shell.
 */
export function checkPinnedDocument(
  document: PinnedDocument,
  bytes: Uint8Array | undefined,
): readonly PinViolation[] {
  if (bytes === undefined) {
    return [
      {
        file: document.file,
        message: `pinned in ${PROVENANCE_FILE} but missing from the corpus directory`,
      },
    ];
  }

  if (bytes.byteLength !== document.bytes) {
    return [
      {
        file: document.file,
        message: `${bytes.byteLength} bytes on disk, ${document.bytes} recorded`,
      },
    ];
  }

  const digest = createHash('sha256').update(bytes).digest('hex');
  if (digest !== document.sha256) {
    return [
      { file: document.file, message: `sha256 ${digest} on disk, ${document.sha256} recorded` },
    ];
  }

  const json = parseJson(new TextDecoder().decode(bytes));
  const header = json.ok ? documentHeaderSchema.safeParse(json.value) : undefined;
  if (header === undefined || !header.success) {
    return [
      {
        file: document.file,
        message: 'the bytes are not an OpenAPI document with openapi, info.title and info.version',
      },
    ];
  }

  return [
    ...compareField('openapi', header.data.openapi, document.openapi),
    ...compareField('info.title', header.data.info.title, document.infoTitle),
    ...compareField('info.version', header.data.info.version, document.infoVersion),
  ].map((message) => ({ file: document.file, message }));
}

/**
 * Every entry in the corpus directory must be pinned, whatever its extension, apart from the
 * record and the README. Takes the raw listing so the selection is proved here, never in the
 * shell. A recorded document that is absent is `checkPinnedDocument`'s to report, once.
 */
export function checkCorpusListing(
  record: ProvenanceRecord,
  directoryListing: readonly string[],
): readonly PinViolation[] {
  const recorded = new Set(record.documents.map((document) => document.file));
  return directoryListing
    .filter((entry) => entry !== PROVENANCE_FILE && entry !== CORPUS_README)
    .filter((file) => !recorded.has(file))
    .map((file) => ({
      file,
      message: `in the corpus directory but not pinned in ${PROVENANCE_FILE}`,
    }));
}

/** Resolve the exit code and output lines. Pure: the runtime prints and exits. */
export function resolveCorpusOutcome(
  parsed: ParsedProvenance,
  violations: readonly PinViolation[],
): CorpusOutcome {
  if (!parsed.ok) {
    return {
      exitCode: 2,
      stdout: [],
      stderr: [
        `validate-corpus-provenance: ${CORPUS_DIRECTORY}/${PROVENANCE_FILE} is not a pin record: ${parsed.error}`,
      ],
    };
  }

  if (violations.length === 0) {
    return {
      exitCode: 0,
      stdout: [
        `✓ ${parsed.record.documents.length} pinned corpus documents match ${PROVENANCE_FILE}`,
      ],
      stderr: [],
    };
  }

  return {
    exitCode: 1,
    stdout: [],
    stderr: [
      `✖ ${violations.length} corpus pin violation(s):`,
      ...violations.map((violation) => `  ${violation.file}: ${violation.message}`),
      '',
      'A pinned corpus document is the bytes its record names. A changed document is a new pin: ' +
        `add it as a new file with a new ${PROVENANCE_FILE} entry, never edit a pinned file in place. ` +
        `See ${CORPUS_DIRECTORY}/README.md.`,
    ],
  };
}
