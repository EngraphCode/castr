# Corpus

The pinned Oak API documents. The [specification](../../../../docs/SPECIFICATION.md) defines
a corpus as the documents a capability is proved against, copied into Castr's fixtures and
pinned by SHA-256, and by source commit where the source has one; a served document records
its URL and fetch time. SPEC-C-1 names the Oak API specification, v1 first and v0, in the
owner's words of 25 September 2026: "Castr needs to be able to process both Oak API specs,
although the V1 spec is the higher priority and there is wiggle room on supporting the V0
spec if needed."

`provenance.json` is the pin record. The repository validator
`agent-tools/src/validators/corpus-provenance/validate-corpus-provenance.ts`, run by
`pnpm repo-validators:check`, recomputes every pin from the committed bytes on each run and
fails on a document here that is not pinned. It lives with the repository validators rather
than in the product test suite because it proves nothing about Castr's behaviour.

No transform scenario parses these documents: `transform-helpers.ts` lists its fixtures by
name. On 25 September 2026 neither document passes the parser, because both carry a
schema-valued `additionalProperties` at their two `check-restricted` 200 responses, which
the parser rejects.

## Documents

| File                                | What it is                                                                                                                                                                                                                                   |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `oak-curriculum-api-v1-1.0.1.json`  | Oak's v1 document, `info.version` 1.0.1, as served at `https://open-api.thenational.academy/api/v1/swagger.json` on 25 September 2026 at 12:39 UTC.                                                                                          |
| `oak-curriculum-api-v0-0.11.2.json` | Oak's v0 document, `info.version` 0.11.2, as served at `https://open-api.thenational.academy/api/v0/swagger.json` on 25 September 2026 at 15:31 UTC. Its description says v0 is frozen: fixes continue, new endpoints and fields land in v1. |

The server sends no ETag or Last-Modified header for either, so the SHA-256 is each
document's only identity. On 25 September 2026 the two documents differ only in their server
URL, eleven example asset URLs, `info.version` and one description sentence; their paths,
schemas and every measured count are the same.

Both files are one line, the bytes the server gave. `.prettierignore` excludes every
`*.json` here except `provenance.json`, so the pre-commit formatter cannot change them, and
`.gitattributes` marks them `-text` so no checkout converts their line endings. A changed
byte changes the hash and fails the validator. A pinned name must be a regular file holding
UTF-8 JSON: a symbolic link or a directory at that name fails, because its bytes are not the
bytes committed at that path.

## Licence and attribution

The documents are Oak National Academy's. Oak's API documentation says the API is provided
"for free on the Open Government License" (`https://open-api.thenational.academy/docs`, read
25 September 2026), and the documents' own endpoint descriptions say lesson content is under
OGL v3.0 with attribution required. The pinned documents are reproduced here under the
[Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/):
contains public sector information licensed under the Open Government Licence v3.0,
© Oak National Academy. The terms page the documents cite,
`https://open-api.thenational.academy/docs/about-oaks-api/terms`, served no content on
25 September 2026.

## Refreshing a pin

A new document is a new file and a new `provenance.json` entry, never an edit of an
existing file. Record what the validator checks: the file name, `openapi`, `info.title`,
`info.version`, the byte count and the SHA-256, plus the source: the URL and fetch time.
Served documents are the one source kind the record holds; a document from another kind of
source, one with a commit for instance, gets its own source shape in the validator's record
schema when the first such document is pinned.

The measurements of each document, and how the pinned documents differ from the consumer's
cached copy of 3 August 2026, are in
[the re-measurement note of 25 September 2026](../../../../.agent/research/oak-api-remeasurement-2026-09-25.md).
