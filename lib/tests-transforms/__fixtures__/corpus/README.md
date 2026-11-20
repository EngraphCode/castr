# Corpus

The pinned Oak API documents. The [specification](../../../../docs/SPECIFICATION.md) defines
a corpus as the documents a capability is proved against, copied into Castr's fixtures and
pinned by SHA-256, and by source commit where the source has one; a served document records
its URL and fetch time. SPEC-C-1 names the Oak API specification's v1 document at its
latest published version, in the owner's words of 19 November 2026: "Drop v0, latest v1
only".

`provenance.json` is the pin record. The repository validator
`agent-tools/src/validators/corpus-provenance/validate-corpus-provenance.ts`, run by
`pnpm repo-validators:check`, recomputes every pin from the committed bytes on each run and
fails on a document here that is not pinned. It lives with the repository validators rather
than in the product test suite because it proves nothing about Castr's behaviour.

No transform scenario parses this document: `transform-helpers.ts` lists its fixtures by
name. It does not pass the parser (checked on 18 November 2026), because it carries a
schema-valued `additionalProperties` at its two `check-restricted` 200 responses, which the
parser rejects.

## Document

`oak-curriculum-api-v1-1.1.1.json` is Oak's v1 document, `info.version` 1.1.1, as served at
`https://open-api.thenational.academy/api/v1/swagger.json` on 18 November 2026 at 08:03 UTC.
It was still what Oak served on 20 November 2026. SPEC-C-1 pins the document at the version
its source publishes, so a newer served version replaces this pin.

The server sends no ETag or Last-Modified header, so the SHA-256 is the document's only
identity.

The file is one line, the bytes the server gave. `.prettierignore` excludes every
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
Open Government Licence v3.0; the licence notice is in
[the third-party notices](../../../../docs/THIRD_PARTY_NOTICES.md) and Oak is named in
[ATTRIBUTION.md](../../../../ATTRIBUTION.md). The terms page the documents cite,
`https://open-api.thenational.academy/docs/about-oaks-api/terms`, served no content on
25 September 2026.

## Refreshing a pin

A new document is a new file and a new `provenance.json` entry, never an edit of an
existing file. Record what the validator checks: the file name, `openapi`, `info.title`,
`info.version`, the byte count and the SHA-256, plus the source: the URL and fetch time.
Where the source serves new bytes under an unchanged `info.version`, the new file's name
carries the fetch date. Served documents are the one source kind the record holds; a document from another kind of
source, one with a commit for instance, gets its own source shape in the validator's record
schema when the first such document is pinned.

The measurements of each document, and how the pinned documents differ from the consumer's
cached copy of 3 August 2026, are in
[the re-measurement note of 25 September 2026](../../../../.agent/research/oak-api-remeasurement-2026-09-25.md).
