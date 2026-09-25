# Example-input corpus sources — survey of 25 September 2026

Evidence base for the plan `.agent/plans/current/example-input-corpus.md`: candidate sources of
real-world and edge-case input documents for Castr, each with its pin (repository and commit, or
served URL), licence and gotchas, as read on 25 September 2026. Commissioned by the owner's words of
that day: "We also need a wide variety of example input schemas to test against" and "If the
openapi-ts test suits is suitable and appropriately licensed then I have no problem using it, the
fixtures anyway, not the tests themselves as our target behaviour may be different".

Method: each git source was blobless-cloned at HEAD on 25 September 2026 (commit recorded below, that
is the pin; DigitalOcean was not cloned and has no commit recorded here); LICENSE files were fetched raw; byte counts come from `git cat-file -s` or HTTP
`Content-Length`; per-file counts from `git ls-tree`. Counts by version inside APIs.guru and SchemaStore
come from GitHub code search (file-level matches) and are approximate. `api.github.com`, `api.apis.guru` and `spec.openapis.org` were not reachable from the
surveying session, so those were not used.

## 0. What Castr holds today

`lib/tests-transforms/__fixtures__/` (README lists seven directories; 41 json, 31 yaml, 6 ts, 5 md):

| Directory       | Files                    | Content                                                                                                  |
| --------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| `arbitrary/`    | 2 committed + 5 symlinks | `oak-api.json` (217,452 B), README; symlinks to five `lib/examples/openapi` docs                         |
| `corpus/`       | 4                        | README, `provenance.json`, Oak v1 (184,589 B) and v0 (184,716 B), both `openapi: 3.1.0`                  |
| `edge-cases/`   | 1                        | README only; its three "planned" fixtures do not exist                                                   |
| `invalid/`      | 15                       | `3.0.x-with-3.1.x-fields` 6, `3.1.x-with-3.0.x-fields` 2, `3.2.x-malformed-path-templates` 3, `common` 4 |
| `json-schema/`  | 10                       | standalone JSON Schema docs (composition, recursion, unions, 2020-12 keywords, …)                        |
| `normalized/`   | 31                       | README + 6 dirs × 5 files (input symlink, normalized, reprocessed, ir, ir2)                              |
| `valid/`        | 10                       | `3.0.x` 4, `3.1.x` 6                                                                                     |
| loose top level | 9 yaml                   | complete-fields 3.0/3.1, phase-b/d/e native 3.2, trace-method, invalid cross-version pairs               |

`lib/examples/openapi/`: 32 files. v3.0 six docs × (json, yaml, md); v3.1 three docs × 3 plus
`awkward-component-names.yaml`; v3.2 `tictactoe.yaml`; `multi-file/main.yaml` + `components/pet.yaml`;
`index.md`. The v3.0/v3.1 names and `index.md`'s Jekyll front matter ("Example API Descriptions",
`nav_order: 8`) are those of learn.openapis.org `examples/`, so Castr already carries the OAI example set
with no provenance record; `.md` files there contain no licence or source mention. Compared byte for
byte with learn.openapis.org on 25 September 2026: 24 of the 28 candidate files match `bbb743ed`;
`v3.1/tictactoe.yaml` matches learn at `dad6982`; `v3.0/uspto.json` was edited in Castr at
`SHA:d5bb5534` (two `format: uri-reference` lines removed; its original matches learn at `8c5391a`);
`v3.0/api-with-examples.yaml` and `v3.0/uspto.yaml` match no revision in learn's history.
`petstore-expanded` declares `info.license` Apache 2.0 and `petstore` declares MIT.

Pin pattern (`corpus/README.md`, `provenance.json`): per document `file`, `openapi`, `infoTitle`,
`infoVersion`, `bytes`, `sha256`, and `source` = `{kind: "served", url, fetchedAt}`. Served documents
are the one source kind the record holds today; a repository kind (repository, commit, path) is added
when the first such document is pinned, which every git source below needs. The validator recomputes
every pin from the committed bytes; `.prettierignore` and `.gitattributes -text` keep the bytes untouched.

## 1. openapi-typescript (openapi-ts org) — https://github.com/openapi-ts/openapi-typescript

- Pin: `main` @ `d46a319ae2efab30e135ba9b223a3cffd1a67eab`, 2,418 files.
- Licence: MIT, "Copyright (c) 2020 Drew Powers" — root `LICENSE` and `packages/openapi-typescript/LICENSE`
  (https://raw.githubusercontent.com/openapi-ts/openapi-typescript/main/LICENSE). Copy with notice: yes.
- `packages/openapi-typescript/test/fixtures/`: 28 files; 14 top-level YAML files (anchors with refs,
  remote refs, path-item components, jsonschema defs, multi-line descriptions, yaml merge) plus
  `redocly*/` config trees. Of the 14, nine are documents and five are `_`-prefixed fragments that the
  documents `$ref`; four of the five carry no `openapi` and no `info`, `jsonschema-defs.yaml` has no
  `info`, and six files declare `openapi: "3.0"`, so a header check needs `openapi` alone.
- The test suite proper keeps its inputs inline in 25 `*.test.ts` files: 42 object-literal documents
  declare `openapi:` (39 × "3.1", 3 × "3.0"), plus hundreds of schema-object fragments under
  `test/transform/schema-object/`. Copying them means extracting TS literals, not copying files.
- Sibling packages add small 3.1 documents: `packages/openapi-fetch/test/*/schemas/` (14 YAML: one per
  HTTP method, e2e, middleware, read-write, path-based-client) and `packages/openapi-react-query/test/fixtures/api.yaml`.
- `packages/openapi-typescript/examples/` is third-party material. Its README: "None of the example
  schemas here are associated with this project, and all code are © their respective owners", with a
  table: DigitalOcean (Apache 2.0), GitHub (MIT), octokit (MIT), Stripe (MIT). Files: `github-api.yaml`
  8,499,361 B (3.0.3), `github-api-next.yaml` 8,504,900 B (3.1.0), `stripe-api.yaml` 5,453,434 B,
  `octokit-ghes-3.6-diff-to-api.json` 876,101 B, `digital-ocean-api/` 2,034 files with external `$ref`s
  (root `DigitalOcean-public.v2.yaml` 72,473 B), `simple-example.yaml` 9,056 B, `enum-root-types.yaml` 429 B.
  These are stale snapshots; pin the same documents from their upstream repos (section 5c) instead.
- Gotcha: the owner's phrase "openapi-ts" also names hey-api/openapi-ts (section 5a), whose fixture
  set is larger. Confirm which was meant.

## 2. OpenAPI Initiative

### 2a. OAI/OpenAPI-Specification — https://github.com/OAI/OpenAPI-Specification

- Pin: `main` @ `447c479c9c7136918e80a57a258fd6c84f369c7c`, 120 files. Licence: Apache 2.0
  (https://raw.githubusercontent.com/OAI/OpenAPI-Specification/main/LICENSE). Copy with notice: yes.
- No `examples/` on `main` any more; README line 24 points to https://learn.openapis.org/examples/.
  What remains: `_archive_/schemas/v3.0/pass/` (the six 3.0 examples: api-with-examples, callback-example,
  link-example, petstore-expanded, petstore, uspto), `_archive_/schemas/v3.0/schema.yaml`,
  `_archive_/schemas/v2.0/schema.json`.
- The 3.1 and 3.2 meta-schemas live on branches, as JSON Schema 2020-12 documents heavy in
  `$dynamicRef`/`$dynamicAnchor`/`unevaluatedProperties`: `v3.1-dev` @
  `551e3df140215a051cfb2a54bbe348490409bc88` and `v3.2-dev` @ `85f1be31c4946139b7afca8be3d3694bbad4877f`,
  path `src/schemas/validation/schema.yaml` and `schema-base.yaml` (both fetch 200). Strong JSON Schema
  edge-case inputs; pin by branch commit + path.

### 2b. OAI/learn.openapis.org — https://github.com/OAI/learn.openapis.org

- Pin: `main` @ `bbb743ed3b7c5ed76b6e6ba9b302af38f3956c44`, 137 files. Licence: CC BY 4.0
  ("Attribution 4.0 International", https://raw.githubusercontent.com/OAI/learn.openapis.org/main/LICENSE).
  Copying into an MIT repo: yes, with attribution (source, licence link, changes noted) kept per file
  set; it is a content licence, so record it separately from Castr's MIT.
- `examples/`: v2.0 12 docs × json+yaml (incl. `petstore-separate/` multi-file); v3.0 6 docs; v3.1 3 docs
  (non-oauth-scopes, tictactoe, webhook-example); v3.2 2 docs (`3.2-query-example`, `3.2-tags-example`);
  each 3.x doc as json + yaml + md. Sizes 379 B to 11,679 B.
- Gotchas: `.github/workflows/convert-examples-to-json.yaml` exists, so treat YAML as source and JSON as
  generated. Castr's `v3.2/tictactoe.yaml` and `awkward-component-names.yaml` are not from this set.
- Precedent: readmeio/oas keeps `packages/oas-examples/.licenses/openapi-specification.md` (the Apache 2.0
  text) beside the OAI-derived examples it copied — the attribution-file practice Castr can mirror.

## 3. APIs.guru openapi-directory — https://github.com/APIs-guru/openapi-directory

- Pin: `main` @ `f04b8d0bcd39c52e1cf3ad7a5fe744709832ae49`, 4,151 files. `APIs/` holds 1,970
  `openapi.yaml` and 2,168 `swagger.yaml` across 701 provider directories; YAML only. Code search finds
  85 `openapi.yaml` matching "openapi: 3.1"; the rest are 3.0.x (many converted from Swagger 2.0 by the
  directory's tooling, so not the provider's bytes).
- Licence file: CC0 1.0 Universal (https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/LICENSE).
  README "Licenses" section, verbatim: "All API definitions contributed to project by authors are
  covered by the CC01.0 license." and "All API definitions acquired from public sources under the Fair
  use principle." (https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/README.md). So CC0
  covers only author-contributed definitions; acquired ones carry a fair-use claim, which is not a
  licence grant. Per-document metadata: `x-origin` (upstream URL and format), `x-providerName`,
  `x-serviceName`, `x-apisguru-categories`; `info.license` where the provider set one (GitHub's entry:
  `name: MIT`, `url: https://spdx.org/licenses/MIT`).
- Use it as an index: pin a document from the repo named in its `x-origin` where that repo's licence is
  explicit; copy from APIs.guru directly only where `info.license` or the provider's terms are confirmed.
- Gotchas: weekly auto-update rewrites files (commit pin is essential); AWS and Google trees are huge;
  the `api.apis.guru` metrics endpoint was not reachable from the surveying session.

## 4. JSON-Schema-Test-Suite — https://github.com/json-schema-org/JSON-Schema-Test-Suite

- Pin: `main` @ `5b0ee1613e45fcc2bddac00e07c19cd49b00d8a8`, 560 files. Licence: MIT text, "Copyright (c)
  2012 Julian Berman" (https://raw.githubusercontent.com/json-schema-org/JSON-Schema-Test-Suite/main/LICENSE;
  the file carries the MIT permission text without an "MIT License" heading). Copy with notice: yes.
- `tests/draft7/`: 64 files, 322 test groups; `tests/draft2020-12/`: 80 files, 462 groups. Each file is a
  JSON array of `{description, schema, tests[]}` validated by `test-schema.json`; the `schema` is the
  input document, `tests[].data` are instances. Also draft2019-09 78, draft6 52, draft4 43, draft3 39,
  `v1` 79 files. `remotes/` (draft7 6, draft2020-12 22 files) are served as `http://localhost:1234/…`.
  Six test files `$ref` or `$schema` such a remote: `refRemote.json` in both dialects, draft7
  `optional/cross-draft.json`, and draft2020-12 `dynamicRef.json`, `vocabulary.json`,
  `optional/cross-draft.json` and `optional/format-assertion.json`. None of draft7's 322 groups
  declares `$schema`; a draft7 file's dialect is its path.
- Gotchas: schemas are keyword-sized fragments (boolean schemas, `$ref` to the meta-schema, remote refs,
  `optional/format/*`, `ecmascript-regex`, `bignum`, `cross-draft`, `infinite-loop-detection`); pin whole
  test files and extract `schema` at test time rather than committing 784 extracted files.

## 5. Other sources

### 5a. hey-api/openapi-ts — https://github.com/hey-api/openapi-ts

- Pin: `main` @ `9d56b7e1aa05434a34d6e1dbb35b786d8f69dc4e`, 7,330 files. Licence: MIT, "Copyright (c)
  2026-present Hey API" (root `LICENSE`; root package.json `"license": "MIT"`). Copy with notice: yes,
  for the documents that are hey-api's own; the 3.0.x and 3.1.x counts below include nine vendor copies
  (clerk, cloudflare-v4, dutchie and neon under 3.0.x; api.github.com deref, openai, opencode, vercel-v0
  and zoom-video-sdk under 3.1.x) and one "Internal API" document of unstated origin
  (`3.0.x/sdk-method-class-conflict.yaml`, 962,285 B), which are not. After those exclusions the 3.0.x
  and 3.1.x set is 174 files: 164 documents, two `external-shared.json` fragments that `external.yaml`
  and `full.yaml` `$ref`, and eight `invalid/` documents. Seven 3.1.x documents have no `info.title`
  and the eight `invalid/` documents carry `info.version: 1`, a number, so the header is not identity.
- Root `specs/`: `3.1.x` 111 (+4 `invalid/`), `3.0.x` 65 (+4 invalid), `2.0.x` 26 (+1), `json-schema-ref-parser`
  22, `openapi` 2. Feature-named edge cases: `discriminator-*` (10 variants), `additional-properties-*`,
  const, enum-null, pattern-properties, transforms-read-write-unevaluated, validators-circular-ref,
  parameter-tuple, `security-*`, sse-post, `full.yaml` (74 KB). The best focused 3.0/3.1 edge-case set found.
- Gotcha: it also holds vendor documents with no licence note: `api.github.com.2026-03-10.deref.json`
  70,127,593 B, `cloudflare-v4.json` 19,584,606 B, `openai.yaml` 1,904,913 B, `anthropic.json` 1,835,818 B,
  `vercel-v0.json`, `zoom-video-sdk.json`, `neon.json`, `dutchie.json`, `clerk-2025-11-10.yaml`,
  `opencode.yaml`, `val-town.json`. Skip those or pin from their owners.

### 5b. Parser and tooling fixture sets

- swagger-api/swagger-parser — `master` @ `69f6d78250b70d2ccfcd306ff0aa74353a698f2a`; Apache 2.0
  (https://raw.githubusercontent.com/swagger-api/swagger-parser/master/LICENSE). `modules/swagger-parser-v3/src/test/resources/`:
  731 json/yaml (137 single-file at top level; `3.1.0/` has basic, oas3.1, petstore-3.1, securitySchemes31,
  siblings31 plus `dereference/` and `resolve/` trees). Heavy on relative, nested and remote file refs and
  issue-NNNN regressions; many deliberately broken. Copy with notice: yes.
- Redocly/redocly-cli — `main` @ `3174630994e1b88bfe73072383be7d2a084ccb8b`; MIT, "Copyright 2019 Redocly
  Inc." (`LICENSE.md`). `resources/`: `museum.yaml`, `cafe.yaml` + `cafe-split/` (3.1, webhooks, multi-file),
  `pets.yaml`, `petstore-with-errors.yaml`; 217 json/yaml under test fixtures, mostly split trees.
  Redocly/museum-openapi-example — @ `2770b2b2e59832d245c7b0eb0badf6568d7efb53`; MIT 2023; `openapi.yaml`
  23,137 B, `openapi: 3.1.0`.
- readmeio/oas (`packages/oas-examples`, where readmeio/oas-examples moved) — `main` @
  `6344460da0304a888b73a64b618dd78da5c78466`; MIT, "Copyright © 2025 ReadMe". 3.0: 41 json (+11
  `openapi-workshop/`) / 40 yaml; 3.1: 12 json / 12 yaml (train-travel, webhooks, schema-types, security,
  parameters-style, schema-validation-*); 2.0: 7/7. Named by feature (circular, discriminators,
  polymorphism, parameters-extreme, response-multiple-mediatypes, star-trek). Copy with notice: yes,
  except seventeen documents that declare their own licence in `info.license` at this commit:
  `3.1/json/train-travel.json` is "Creative Commons Attribution-NonCommercial-ShareAlike 4.0
  International" (identifier `CC-BY-NC-SA-4.0`), which an MIT repository cannot redistribute; six are
  Apache 2.0 (3.0 petstore, petstore-expanded, response-http-behavior, schema-encoding-style; 3.1
  petstore, schema-encoding-style), matching the repository's own `.licenses/openapi-specification.md`;
  and the ten `3.0/json/openapi-workshop/*.json` files declare ISC. The petstore, petstore-expanded and
  uspto documents also name a third party (Swagger's API team, the USPTO) as the API's owner.
- astahmer/openapi-zod-client — `main` @ `8ba980d64a348b2b0ae7b78c59fbda58de9b6318`: no LICENSE file;
  package.json says `"license": "ISC"` — unconfirmed by a licence file. Fixtures are the OAI examples
  again plus `examples/repro.yaml` and `lib/tests/ref-in-another-file/`. Low value.
- SchemaStore/schemastore — `master` @ `58e57d16bbddb12f578f7bb81a568f76bc264261`; Apache 2.0
  (https://raw.githubusercontent.com/SchemaStore/schemastore/master/LICENSE). `src/schemas/json/`: 967
  real-world JSON Schemas; code search: 736 files cite `draft-07/schema`, 72 cite `draft/2020-12/schema`
  (remainder older drafts or none). Measured in the clone: exactly 72 files declare the 2020-12
  `$schema`, 1,017,628 B in total, the largest 41,898 B, five of them with an `http` `$ref`. `src/test/` is 2,192 instance files, not inputs. No per-schema licence
  statement found in README or CONTRIBUTING. Gotchas: mixed drafts, some very large, `openapi-3.X.json`.
- json-schema-org/json-schema-spec — BSD-style ("Copyright (c) 2022 JSON Schema Specification Authors",
  https://raw.githubusercontent.com/json-schema-org/json-schema-spec/main/LICENSE); meta-schemas only.
  stoplightio/spectral and OpenAPITools/openapi-generator are Apache 2.0; trees not surveyed.

### 5c. Vendor documents from their owners (explicit licences)

- github/rest-api-description — @ `d66b5ecab2cd77c824ec336433a262241c2abc96`; MIT (README: "licensed
  under the MIT license"). `descriptions/api.github.com/api.github.com.json` 12,986,349 B (`openapi:
3.0.3`), `.yaml` 9,878,434 B; `descriptions-next/…` 13,099,679 B / 9,869,314 B (`openapi: 3.1.0`; README:
  "subject to breaking changes on the main branch").
- stripe/openapi — @ `2bab97685e29abae0c241680c2257153e259e50f`; MIT ("Copyright (c) 2011- Stripe, Inc.").
  `openapi/spec3.json` 8,316,935 B, `spec3.yaml` 6,629,420 B, `spec3.sdk.json` 10,894,005 B; `openapi: 3.0.0`.
- digitalocean/openapi — Apache 2.0; `specification/DigitalOcean-public.v2.yaml` 118,785 B root
  (`openapi: "3.0.0"`) with external `$ref`s into `description.yml` and `resources/`; needs bundling.
- Oak (served, already pinned); Anthropic/OpenAI/Cloudflare documents exist only as unattributed copies
  in hey-api (5a) — their own terms were not checked here.

## 6. Licence compatibility with an MIT repository, with attribution

| Licence                 | Sources                                                                                                                                   | Verdict                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| MIT                     | openapi-typescript, hey-api, JSON-Schema-Test-Suite, Redocly, ReadMe (except seven documents declaring their own licence), GitHub, Stripe | Yes: keep copyright + permission notice per source                |
| CC BY-NC-SA 4.0         | ReadMe's `train-travel.json`                                                                                                              | No: non-commercial; not redistributed                             |
| Apache 2.0              | OAI spec repo, swagger-parser, SchemaStore, DigitalOcean                                                                                  | Yes: keep the Apache notice (and any NOTICE), state modifications |
| CC BY 4.0               | learn.openapis.org                                                                                                                        | Yes: attribution with source, licence link, changes noted         |
| CC0 1.0                 | APIs.guru author-contributed definitions                                                                                                  | Yes, no conditions; but only for contributed ones                 |
| "Fair use"              | APIs.guru acquired definitions (the majority)                                                                                             | No grant: go to the `x-origin` upstream                           |
| ISC (package.json only) | openapi-zod-client                                                                                                                        | Unconfirmed: no LICENSE file                                      |

## 7. Pinning and practical gotchas

- Every git source pins as repository + commit + path (commits above); served documents keep the
  `served` kind. hey-api and openapi-typescript copies of vendor docs are pinned from the vendor or not at all.
- Sizes: GitHub 13 MB, Stripe 8–11 MB, hey-api's deref 70 MB and Cloudflare 19.6 MB are permanent
  history weight (formatting and linting already skip corpus files and, in `lib`, every json and yaml
  file). A run-time fetch is not an alternative: the Corpus definition says copied into Castr's fixtures,
  the validator recomputes from committed bytes, and it runs in the pre-commit hook. Each large document
  is committed whole or left out; the corpus README's `.prettierignore` + `.gitattributes -text` handling
  must extend to any new directory.
- Generated files: learn.openapis.org JSON, APIs.guru converted 3.0 documents, hey-api's `.deref.json`.
- External refs / multi-file: DigitalOcean, Redocly `cafe-split`, swagger-parser trees, learn's
  `petstore-separate`, JSON-Schema-Test-Suite `remotes/` (localhost:1234).
- Symlinks: Castr's own `arbitrary/` uses them; none of the surveyed sources rely on them.
