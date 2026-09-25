# Corpus

The pinned documents that SPEC-C-1 is proved against. The
[specification](../../../../docs/SPECIFICATION.md) defines a corpus as the documents a
capability is proved against, copied into Castr's fixtures and pinned by source commit and
SHA-256. `provenance.json` is the pin record, and
`../../__tests__/corpus-provenance.unit.test.ts` recomputes every pin from the committed
bytes on each run.

The transform tests do not read this directory. `transform-helpers.ts` lists its fixtures
by name, and neither document passes today's parser: both carry a schema-valued
`additionalProperties` at their two `check-restricted` 200 responses, which the parser
rejects.

## Documents

| File                                 | What it is                                                                                                                                                                                                                                                 |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oak-curriculum-api-v1-1.0.1.json`   | Oak's v1 API document, `info.version` 1.0.1, as served at `https://open-api.thenational.academy/api/v1/swagger.json` on 25 September 2026 at 12:39 UTC. The server sends no ETag or Last-Modified header, so the SHA-256 is its only identity.             |
| `oak-openapi-v0-0.7.0-3b4b01e6.json` | Oak's v0 API document, `info.version` 0.7.0 at Oak commit `3b4b01e6`, copied byte for byte from the Engraph Open Curriculum Ecosystem's committed schema cache at its commit `bcdc6237` (3 August 2026). That consumer generates from this document today. |

Both files are the bytes their sources gave: the v1 file is one line, the v0 file is
indented. `.prettierignore` excludes `oak-*.json` here so that the pre-commit formatter
cannot change them; a changed byte changes the hash and fails the test.

## Refreshing a pin

A new document is a new file and a new `provenance.json` entry, never an edit of an
existing file. Record what the test checks: the file name, `openapi`, `info.title`,
`info.version`, the byte count and the SHA-256, plus the source: the URL and fetch time for
a served document, or the repository, its commit, the path, the upstream URL and the
upstream commit for a copied one.

The measurements of each document, and what changed between v0 and v1, are in
[the re-measurement note of 25 September 2026](../../../../.agent/research/oak-api-remeasurement-2026-09-25.md).
