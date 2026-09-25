import { describe, expect, it } from 'vitest';

import {
  checkCorpusListing,
  checkPinnedDocument,
  parseProvenanceRecord,
  resolveCorpusOutcome,
  type DocumentOnDisk,
  type PinnedDocument,
  type ProvenanceRecord,
} from './validate-corpus-provenance-helpers.js';

const PINNED_TEXT = '{"openapi":"3.1.0","info":{"title":"Pinned","version":"1.0.0"}}';
const PINNED_SHA256 = '9880f616921054ec7e6f38879ca46537dfe2f433c2343314f1785802818c5159';
const SAME_LENGTH_TEXT = '{"openapi":"3.1.0","info":{"title":"Pinned","version":"1.0.1"}}';
const SAME_LENGTH_SHA256 = '57087e5513030289832b0655546efc8093f16e7db9feb3b4866cdb252981ebdf';
const NOT_AN_OBJECT_TEXT = '["openapi"]';
const NOT_AN_OBJECT_SHA256 = 'b4b8c721b39bad18b770d9a943c6699141ce3c48a9907aabd9e65453831017ef';
/** PINNED_TEXT with one byte of the title replaced by 0xFF, which no UTF-8 sequence contains. */
const INVALID_UTF8_BYTES = new Uint8Array([
  ...new TextEncoder().encode('{"openapi":"3.1.0","info":{"title":"Pinn'),
  0xff,
  ...new TextEncoder().encode('d","version":"1.0.0"}}'),
]);
const INVALID_UTF8_SHA256 = 'ceb8480ca412228e163722b8dcce9ba3578373ee497c78fe5bb52c264e9c4842';

const bytesOf = (text: string): Uint8Array => new TextEncoder().encode(text);
const onDisk = (bytes: Uint8Array): DocumentOnDisk => ({ kind: 'file', bytes });

const servedDocument: PinnedDocument = {
  file: 'pinned-1.0.0.json',
  openapi: '3.1.0',
  infoTitle: 'Pinned',
  infoVersion: '1.0.0',
  bytes: 63,
  sha256: PINNED_SHA256,
  source: {
    kind: 'served',
    url: 'https://example.test/swagger.json',
    fetchedAt: '2026-09-25T12:39:20Z',
  },
};

const secondDocument: PinnedDocument = {
  file: 'pinned-1.0.1.json',
  openapi: '3.1.0',
  infoTitle: 'Pinned',
  infoVersion: '1.0.1',
  bytes: 63,
  sha256: SAME_LENGTH_SHA256,
  source: {
    kind: 'served',
    url: 'https://example.test/v0/swagger.json',
    fetchedAt: '2026-09-25T15:31:42Z',
  },
};

const record: ProvenanceRecord = { documents: [servedDocument, secondDocument] };

describe('parseProvenanceRecord', () => {
  it('accepts a record of served documents', () => {
    const parsed = parseProvenanceRecord(JSON.stringify(record));

    expect(parsed).toStrictEqual({ ok: true, record });
  });

  it('rejects text that is not JSON', () => {
    const parsed = parseProvenanceRecord('{ not json');

    expect(parsed.ok).toBe(false);
  });

  it('rejects a record that carries a key the schema does not know', () => {
    const parsed = parseProvenanceRecord(JSON.stringify({ ...record, note: 'stray' }));

    expect(parsed.ok).toBe(false);
  });

  it('rejects a file name that could leave the corpus directory', () => {
    const escaping = { documents: [{ ...servedDocument, file: '../outside.json' }] };

    expect(parseProvenanceRecord(JSON.stringify(escaping)).ok).toBe(false);
  });

  it('rejects a source URL that is not http or https', () => {
    const local = {
      documents: [
        { ...servedDocument, source: { ...servedDocument.source, url: 'file:///etc/passwd' } },
      ],
    };

    expect(parseProvenanceRecord(JSON.stringify(local)).ok).toBe(false);
  });

  it('rejects a source of a kind the record does not know', () => {
    const copied = {
      documents: [{ ...servedDocument, source: { kind: 'copied', repository: 'https://x.test' } }],
    };

    expect(parseProvenanceRecord(JSON.stringify(copied)).ok).toBe(false);
  });

  it('rejects a record that pins the same file twice', () => {
    const twice = { documents: [servedDocument, { ...secondDocument, file: servedDocument.file }] };

    expect(parseProvenanceRecord(JSON.stringify(twice)).ok).toBe(false);
  });

  it('rejects a record that pins nothing', () => {
    expect(parseProvenanceRecord('{"documents":[]}').ok).toBe(false);
  });

  it('rejects a record that pins the same bytes under two names', () => {
    const sameBytes = {
      documents: [servedDocument, { ...secondDocument, sha256: servedDocument.sha256 }],
    };

    expect(parseProvenanceRecord(JSON.stringify(sameBytes)).ok).toBe(false);
  });
});

describe('checkPinnedDocument', () => {
  it('returns no violation when the bytes, the hash and the header all match the record', () => {
    expect(checkPinnedDocument(servedDocument, onDisk(bytesOf(PINNED_TEXT)))).toStrictEqual([]);
  });

  it('reports the byte count, and only that, when the length differs', () => {
    expect(checkPinnedDocument(servedDocument, onDisk(bytesOf(`${PINNED_TEXT}\n`)))).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/64 bytes.*63/u) },
    ]);
  });

  it('reports the hash, and only that, when the length matches and one byte differs', () => {
    expect(checkPinnedDocument(servedDocument, onDisk(bytesOf(SAME_LENGTH_TEXT)))).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/sha256/iu) },
    ]);
  });

  it.each([
    { field: 'openapi', recorded: { openapi: '3.0.0' }, pattern: /openapi.*3\.1\.0.*3\.0\.0/u },
    {
      field: 'info.title',
      recorded: { infoTitle: 'Other' },
      pattern: /info\.title.*Pinned.*Other/u,
    },
    {
      field: 'info.version',
      recorded: { infoVersion: '9.9.9' },
      pattern: /info\.version.*1\.0\.0.*9\.9\.9/u,
    },
  ])(
    'reports $field when it disagrees with the record once the bytes match',
    ({ recorded, pattern }) => {
      const wrong = { ...servedDocument, ...recorded };

      expect(checkPinnedDocument(wrong, onDisk(bytesOf(PINNED_TEXT)))).toStrictEqual([
        { file: 'pinned-1.0.0.json', message: expect.stringMatching(pattern) },
      ]);
    },
  );

  it('reports a pinned document that is not on disk as missing, and checks nothing else', () => {
    expect(checkPinnedDocument(servedDocument, { kind: 'missing' })).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/missing/u) },
    ]);
  });

  it('reports a pinned name that is a link or a directory, not the bytes at its path', () => {
    expect(checkPinnedDocument(servedDocument, { kind: 'not-a-regular-file' })).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/not a regular file/u) },
    ]);
  });

  it('reports pinned bytes that are not UTF-8 even when the hash and length match', () => {
    const pinnedBytes = { ...servedDocument, sha256: INVALID_UTF8_SHA256 };

    expect(checkPinnedDocument(pinnedBytes, onDisk(INVALID_UTF8_BYTES))).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/openapi/iu) },
    ]);
  });

  it('reports a pinned document whose bytes are not an OpenAPI object', () => {
    const notAnObject = { ...servedDocument, bytes: 11, sha256: NOT_AN_OBJECT_SHA256 };

    expect(checkPinnedDocument(notAnObject, onDisk(bytesOf(NOT_AN_OBJECT_TEXT)))).toStrictEqual([
      { file: 'pinned-1.0.0.json', message: expect.stringMatching(/openapi/iu) },
    ]);
  });
});

describe('checkCorpusListing', () => {
  it('returns nothing when the directory holds the recorded documents, the record and the README', () => {
    const listing = ['README.md', 'pinned-1.0.1.json', 'pinned-1.0.0.json', 'provenance.json'];

    expect(checkCorpusListing(record, listing)).toStrictEqual([]);
  });

  it('reports a JSON document in the directory that the record does not pin', () => {
    const listing = ['pinned-1.0.0.json', 'pinned-1.0.1.json', 'stray.json'];

    expect(checkCorpusListing(record, listing)).toStrictEqual([
      { file: 'stray.json', message: expect.stringMatching(/not pinned/u) },
    ]);
  });

  it('reports a document of any other kind that the record does not pin', () => {
    const listing = ['pinned-1.0.0.json', 'pinned-1.0.1.json', 'stray.yaml'];

    expect(checkCorpusListing(record, listing)).toStrictEqual([
      { file: 'stray.yaml', message: expect.stringMatching(/not pinned/u) },
    ]);
  });

  it('does not report a recorded document that is absent: that is the per-document check, once', () => {
    expect(checkCorpusListing(record, ['pinned-1.0.0.json'])).toStrictEqual([]);
  });
});

describe('resolveCorpusOutcome', () => {
  it('exits 2 and names the record when it cannot be parsed', () => {
    const outcome = resolveCorpusOutcome({ ok: false, error: 'Unexpected token' }, []);

    expect(outcome.exitCode).toBe(2);
    expect(outcome.stdout).toStrictEqual([]);
    expect(outcome.stderr.join('\n')).toMatch(/provenance\.json.*Unexpected token/su);
  });

  it('exits 0 with one line naming the number of matched documents when nothing is violated', () => {
    const outcome = resolveCorpusOutcome({ ok: true, record }, []);

    expect(outcome.exitCode).toBe(0);
    expect(outcome.stderr).toStrictEqual([]);
    expect(outcome.stdout).toStrictEqual([expect.stringMatching(/2 pinned/u)]);
  });

  it('exits 1 and lists every violation by file', () => {
    const outcome = resolveCorpusOutcome({ ok: true, record }, [
      { file: 'pinned-1.0.0.json', message: 'sha256 differs' },
      { file: 'stray.json', message: 'not pinned' },
    ]);

    expect(outcome.exitCode).toBe(1);
    expect(outcome.stdout).toStrictEqual([]);
    expect(outcome.stderr[0]).toMatch(/2 corpus pin violation/u);
    expect(outcome.stderr).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/pinned-1\.0\.0\.json.*sha256 differs/u),
        expect.stringMatching(/stray\.json.*not pinned/u),
      ]),
    );
  });
});
