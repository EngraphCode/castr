# Third-party notices

Castr's own code is under the MIT licence in [LICENSE](../LICENSE). The files below, but
for the three named in "Files that are not the OpenAPI Initiative's", were written by
others and are reproduced under their own licences. Their authors are named in
[ATTRIBUTION.md](../ATTRIBUTION.md). Every comparison below was made on 19 November 2026
against the source repository at the commit named.

## OpenAPI Initiative examples

- **Files:** `lib/examples/openapi/`, except the three files listed at the end of this
  section.
- **Source:** OAI/learn.openapis.org, directory
  [`examples/`](https://github.com/OAI/learn.openapis.org/tree/bbb743ed3b7c5ed76b6e6ba9b302af38f3956c44/examples).
  The source's own notice at that commit reads "© 2025 OpenAPI Initiative."
- **Licence:** Creative Commons Attribution 4.0 International. The licence text, copied
  from the source repository's `LICENSE` at commit
  `bbb743ed3b7c5ed76b6e6ba9b302af38f3956c44`, is in
  [third-party-licences/CC-BY-4.0.txt](third-party-licences/CC-BY-4.0.txt), and is published
  at <https://creativecommons.org/licenses/by/4.0/legalcode>. The licence's disclaimer of
  warranties (its Section 5) applies to these files.

### Unchanged files

These files are byte for byte the source's files at commit
`bbb743ed3b7c5ed76b6e6ba9b302af38f3956c44`:

- `index.md`
- `v3.0/api-with-examples.json`, `v3.0/api-with-examples.md`
- `v3.0/callback-example.json`, `v3.0/callback-example.md`, `v3.0/callback-example.yaml`
- `v3.0/link-example.json`, `v3.0/link-example.md`, `v3.0/link-example.yaml`
- `v3.0/petstore-expanded.json`, `v3.0/petstore-expanded.md`, `v3.0/petstore-expanded.yaml`
- `v3.0/petstore.json`, `v3.0/petstore.md`, `v3.0/petstore.yaml`
- `v3.0/uspto.md`
- `v3.1/non-oauth-scopes.json`, `v3.1/non-oauth-scopes.md`, `v3.1/non-oauth-scopes.yaml`
- `v3.1/tictactoe.json`, `v3.1/tictactoe.md`
- `v3.1/webhook-example.json`, `v3.1/webhook-example.md`, `v3.1/webhook-example.yaml`

`v3.1/tictactoe.yaml` is byte for byte the source's file at an earlier commit,
`dad69824774ee992cc4894b8d5fbd683ae9ccbfb`.

Two of the unchanged documents state a licence for the API they describe, in their
`info.license` field: `petstore-expanded` says Apache 2.0 and `petstore` says MIT. That
field describes the API, not the file.

### Files Castr has modified

| File                          | What changed                                                                                                                                                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v3.0/api-with-examples.yaml` | Reformatted only. It parses to the same value as the source's file at commit `bbb743ed3b7c5ed76b6e6ba9b302af38f3956c44`.                                                                                                |
| `v3.0/uspto.json`             | Two `format: uri-reference` lines removed (Castr commit `d5bb5534`). Before that edit it was byte for byte the source's file at commit `8c5391a7602db80146d45fa6eac61a1c0a010c74`.                                      |
| `v3.0/uspto.yaml`             | Reformatted, then the same two `format: uri-reference` lines removed (Castr commit `d5bb5534`). Before that edit it parsed to the same value as the source's file at commit `bda51648af3872503ab0df849f81c7b15d67ad3a`. |
| `v3.2/tictactoe.yaml`         | The source's `v3.1/tictactoe.yaml` at commit `dad69824774ee992cc4894b8d5fbd683ae9ccbfb` with its `openapi` field changed from `3.1.0` to `3.2.0`.                                                                       |

### Files derived from the examples

`lib/tests-transforms/__fixtures__/arbitrary/` links to five of the unchanged examples.
`lib/tests-transforms/__fixtures__/normalized/` holds what Castr produces from each of
those five: its internal model and the OpenAPI document it writes back. Those files are
derived from the examples, changed by Castr's processing, and are reproduced under the
same licence.

### Files that are not the OpenAPI Initiative's

`v3.1/awkward-component-names.yaml` was written in Castr and is under Castr's MIT licence.
`multi-file/main.yaml` and `multi-file/components/pet.yaml` have been in Castr since its
first commit; they are not in the source repository, and no other origin and no licence is
recorded for them.

## Swagger Petstore

- **File:** `lib/examples/swagger/petstore.yaml`.
- **Source:** the OpenAPI 3.0 definition in
  [swagger-api/swagger-petstore](https://github.com/swagger-api/swagger-petstore),
  `src/main/resources/openapi.yaml`. The file's `info.version` is `1.0.11`.
- **Licence:** Apache License 2.0. The licence text, copied from the source repository's
  `LICENSE` at commit `5cb909fc7780bc708151bce0014939acba8b212a`, is in
  [third-party-licences/Apache-2.0.txt](third-party-licences/Apache-2.0.txt).
- **Modified.** The file's first line is a comment saying so, as the licence's section 4(b)
  asks. The revision this file was taken from is not recorded. As first committed to Castr
  it matched no revision of the source file on any branch of the source repository, byte
  for byte or by parsed value. Castr has since made two changes: a `format: binary` line
  was removed (commit `d5bb5534`), and one `additionalProperties` schema (`type: integer`,
  `format: int32`) was replaced with `additionalProperties: false` (commit `08f4d3e6`).

## Oak Curriculum API documents

- **Files:** the documents pinned in `lib/tests-transforms/__fixtures__/corpus/`, unchanged
  from the bytes Oak served; [the corpus README](../lib/tests-transforms/__fixtures__/corpus/README.md)
  and its `provenance.json` record each document's URL, fetch time and SHA-256.
- **An earlier document:** `lib/tests-transforms/__fixtures__/arbitrary/oak-api.json` is
  the Oak Curriculum API document for `/api/v0` with `info.version`
  `0.5.0-18a779a213d24096ecd2d73eec530f1679ab3e54`. It has been in Castr, unchanged, since
  19 January 2026 (Castr commit `be4a709d`); when it was fetched is not recorded.
  `lib/tests-transforms/__fixtures__/normalized/oak-api/` holds what Castr produces from
  it, under the same licence.
- **Source:** Oak National Academy, <https://open-api.thenational.academy>.
- **Licence:** [Open Government Licence v3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
  Contains public sector information licensed under the Open Government Licence v3.0.
  © Oak National Academy.

## Published definitions of the formats

- **Files:** the eighteen files pinned in `lib/tests-picture/__fixtures__/definitions/`,
  unchanged from the bytes their publishers served on the day each was fetched (20 or 22
  November 2026). That directory's `provenance.json` records each file's identifier, URL,
  fetch time and SHA-256, and [the picture's README](../lib/tests-picture/README.md) says
  what reads them.

### OpenAPI Initiative schemas

- **Files:** the ten whose names begin `oas-`. For each of OpenAPI 3.1 and 3.2: the
  document schema at the latest revision listed on 22 November 2026, the `schema-base`
  of that revision, and the vocabulary and dialect the version adds to JSON Schema; and
  the document schema at the earlier revision that version 0.8.0 of the specification
  names. A newer revision is a new pin, added beside the one it follows.
- **Source:** the OpenAPI Initiative, served at <https://spec.openapis.org/oas/>, and
  maintained in [OAI/OpenAPI-Specification](https://github.com/OAI/OpenAPI-Specification).
- **Licence:** Apache License 2.0, the licence of that repository (its `LICENSE` at commit
  `b9ab1c11c2a295ad7104488b10acdb3bb26828fe`). The licence text is in
  [third-party-licences/Apache-2.0.txt](third-party-licences/Apache-2.0.txt).

### JSON Schema meta-schemas

- **Files:** the eight whose names begin `jsonschema-2020-12-`: the vocabulary
  meta-schemas of JSON Schema Draft 2020-12. And `jsonschema-draft-07-schema.json`, the
  one meta-schema of JSON Schema Draft-07, served at
  <https://json-schema.org/draft-07/schema> and the same bytes as `schema.json` on that
  repository's `draft-07` branch at commit `20a3fee852db88519dcb3bb329b7a872ebad8953`.
  That branch holds no `LICENSE` file; its `README.md` says "The source material in this
  repository is licensed under the AFL or BSD license".
- **Source:** the JSON Schema Specification Authors, served at
  <https://json-schema.org/draft/2020-12/meta/>, and maintained in
  [json-schema-org/json-schema-spec](https://github.com/json-schema-org/json-schema-spec).
  The source's notice reads "Copyright (c) 2022 JSON Schema Specification Authors".
- **Licence:** that repository's `LICENSE` holds two licences, the 3-clause BSD licence and
  the Academic Free License version 3.0. The whole file, copied at commit
  `51326f80900357fe3069beb4f5f575db24c1b9a7`, is in
  [third-party-licences/json-schema-spec-LICENSE.txt](third-party-licences/json-schema-spec-LICENSE.txt).
  Castr reproduces these files under the 3-clause BSD licence.
