---
title: Example-input corpus — a wide variety of pinned input documents
status: current
lane: current
created: 2026-09-25
last_updated: 2026-09-25
owner_directive: >-
  Owner, 2026-09-25: "We also need a wide variety of example input schemas to
  test against"; "If the openapi-ts test suits is suitable and appropriately
  licensed then I have no problem using it, the fixtures anyway, not the tests
  themselves as our target behaviour may be different"; and, asked how to carry
  it, the owner chose to plan it as its own slice.
todos:
  - id: EC-0
    content: docs/THIRD_PARTY_NOTICES.md is created with the CC BY 4.0 notice for the OpenAPI Initiative examples already in lib/examples/openapi (unchanged files at their commit, modified files marked) and the Oak OGL notice; the course plan's MOVE section names the corpus, its validator and the notices file
    status: pending
    depends_on: []
  - id: EC-1
    content: The pin record's shape for many sources (repository kind, json and yaml, openapi and fragment kinds, one source directory each with the Oak documents moved into theirs, a notice per entry, the summary line), proved by the first pinned source, openapi-typescript's fixture files (MIT)
    status: pending
    depends_on: [EC-0]
  - id: EC-2
    content: hey-api/openapi-ts specs/3.0.x and specs/3.1.x pinned under the licence rules, invalid/ included (MIT)
    status: pending
    depends_on: [EC-1]
  - id: EC-3
    content: readmeio/oas examples pinned under the licence rules, JSON serialisation only (MIT, Apache 2.0 and ISC notices; train-travel and the third-party-owned documents left out)
    status: pending
    depends_on: [EC-1]
  - id: EC-4
    content: JSON-Schema-Test-Suite tests/draft7 and tests/draft2020-12 files pinned whole with the json-schema-test-suite kind (MIT); files that reference the suite's own server left out
    status: pending
    depends_on: [EC-1]
  - id: EC-5
    content: SchemaStore schemas declaring 2020-12 pinned with the json-schema kind (Apache 2.0)
    status: pending
    depends_on: [EC-1]
  - id: EC-6
    content: learn.openapis.org's two OpenAPI 3.2 examples pinned, YAML as the source (CC BY 4.0)
    status: pending
    depends_on: [EC-1]
  - id: EC-7
    content: The OpenAPI Initiative 3.1 and 3.2 meta-schemas pinned with the json-schema kind (Apache 2.0)
    status: pending
    depends_on: [EC-5]
---

# Example-input corpus

## Goal

Castr holds a wide, pinned and licensed set of input documents beyond the two Oak
documents and its hand-made fixtures: real-world OpenAPI 3.0, 3.1 and 3.2 documents,
feature-named edge cases, and JSON Schema draft-07 and 2020-12 documents. Every document
is the bytes its pin record names, with its source, commit, licence and notice recorded,
and the corpus validator recomputes all of it on every run. Until the owner names any of
them in a capability's corpus in the specification, nothing reads them but the validator:
the Oak entries remain SPEC-C-1's corpus, and this plan puts about 460 files into the
repository with no reader. That is what the owner asked for, documents to test against,
and the tests that read them belong to the course's legs and to the owner's later naming.

## Mechanism

The corpus directory and its validator exist for the two Oak documents
(`lib/tests-transforms/__fixtures__/corpus/`). Today the record admits one source kind
(served), one format (JSON), one document kind (an OpenAPI document with `openapi`,
`info.title` and `info.version` as strings) and one flat directory. Every candidate source
needs a repository kind (repository, commit, path); between them they need YAML, files a
document `$ref`s that are not documents, JSON Schema documents, JSON Schema test-suite
files and one subdirectory per source; and many of them carry no `info.title` or a numeric
`info.version`, so the hash, not the header, is a pin's identity. EC-1 gives the record
that shape and proves it with the first pinned source; the tranches follow, one source per
pull request, and each document kind lands in the tranche that pins its first document.

The plan carries the rules and the sources. Every count below is the survey's measurement
on 25 September 2026 at the pinned commit, and each tranche re-derives its own file list
from the rules at pickup; a count that differs then is a fact for that pull request, not a
defect in this plan. The survey of candidate sources, with each repository's commit,
licence text and gotchas, is the evidence base:
[the source survey of 25 September 2026](../../research/example-input-corpus-sources-2026-09-25.md).

## Rules

- **Owner rule.** A document whose `info` names a third party as the API's owner is pinned
  from that owner's repository under its licence, or left out. This excludes hey-api's nine
  vendor copies and readmeio's petstore, petstore-expanded and uspto documents (Swagger's and
  the USPTO's); the OpenAPI Initiative's own copies of those are the ones Castr carries.
- **Licence rule.** A document that declares its own `info.license` is pinned under that
  licence, with that licence's notice, when the licence permits redistribution in an MIT
  repository, and left out otherwise. Where a document declares none, its repository's
  licence applies. This leaves readmeio's `train-travel.json` out (CC BY-NC-SA 4.0,
  non-commercial), puts its `response-http-behavior` and both `schema-encoding-style`
  documents under Apache 2.0 and its ten `openapi-workshop` documents under ISC, and puts
  the rest under MIT.
- **Named exclusion.** hey-api's `3.0.x/sdk-method-class-conflict.yaml` ("Internal API")
  declares no licence and names no owner; it is left out for its unstated origin.
- **Fixtures, never tests.** No expectation, expected output or test from any source is
  run or asserted. A JSON-Schema-Test-Suite file is pinned as the bytes it is; the
  validator's header check for that kind reads the array shape and nothing inside
  `tests[]`, and Castr has no other reader of those files.
- **An index is not a source.** APIs.guru's README says only author-contributed
  definitions are CC0 and the rest are held under a fair-use claim, which grants nothing;
  a document found there is pinned from the repository its `x-origin` names.

## Decisions taken in this plan

Each is taken from the survey's evidence and is open to the owner to strike.

- **Which "openapi-ts".** The owner's phrase names two MIT repositories:
  openapi-ts/openapi-typescript (14 top-level fixture files: nine documents and five
  `_`-prefixed fragments the documents `$ref`; its other inputs are inline in test code) and
  hey-api/openapi-ts (feature-named 3.0 and 3.1 documents under `specs/`: 164 documents,
  two `external-shared.json` fragments and eight `invalid/` documents once the rules apply,
  plus 26 for 2.0). The plan takes both: openapi-typescript first, because its small set
  proves the record shape, then hey-api.
- **Identity is the hash.** `info.title` and `info.version` leave the record, the Oak
  entries included: the byte count and SHA-256 already pin a document, the `openapi` field
  is what a document kind is checked by, and many candidate documents carry no title or a
  numeric version.
- **Large vendor documents are left out.** GitHub's two documents (13 MB each) and Stripe's
  (8 MB) would add about 34 MB to the repository's history for ever; DigitalOcean's is a
  derived, bundled artefact the survey records no commit for. A run-time fetch is not an
  alternative: the Corpus definition says copied into Castr's fixtures, the validator
  recomputes from committed bytes, and it runs in the pre-commit hook. The tranches meet
  the width criterion without them; adding one is a repository-weight decision the owner
  can take by naming it.
- **One serialisation per document.** readmeio publishes each document as JSON and YAML;
  the JSON is pinned. learn.openapis.org generates its JSON from YAML; the YAML is pinned.
- **SchemaStore by rule.** The 72 schemas declaring the 2020-12 `$schema` at the pinned
  commit are taken, all of them, because a rule can be recomputed and a hand-picked
  selection cannot; five carry an `http` `$ref`, which is a fact about the bytes and no
  reason to leave them out. The draft-07 set (about 736) is left out: no rule selects a
  usable subset, and the JSON-Schema-Test-Suite draft7 files give keyword coverage for
  that dialect.
- **Test-suite files whose schemas reach the suite's server are left out.** Six files
  `$ref` or `$schema` a `localhost:1234` remote (`refRemote.json` in both dialects,
  draft7 `optional/cross-draft.json`, draft2020-12 `dynamicRef.json`, `vocabulary.json`,
  `optional/cross-draft.json` and `optional/format-assertion.json`). A test-suite file's
  dialect is its recorded upstream path, since draft7's groups declare no `$schema`.

## Prerequisites

- **EC-0 before EC-1 (blocking).** The notices file must exist before a record entry can
  name its notice.
- **EC-1 before EC-2 to EC-6 (blocking).** The record shape must admit a source's format,
  kind and layout before that source is pinned.
- **EC-5 before EC-7 (blocking).** The `json-schema` kind lands with SchemaStore, its first
  documents; the meta-schemas reuse it.
- **The course (none).** The plan sits beside the course, not on it: its documents are
  format inputs whatever the MEASURE leg decides, and the plan touches no writer code. It
  lands before the MOVE leg, and EC-0 adds the corpus, its validator and the notices file
  to the MOVE section's statement of what travels.

## Acceptance criteria (each with a proof — required)

- **AC-1 Every pinned document is the bytes its record names.** Proof, `repo-safe`:
  `pnpm --filter @engraph/agent-tools validate-corpus-provenance` passes over every corpus
  source directory in `repo-validators:check`. Todos: EC-1 to EC-7.
- **AC-2 Every pinned document has a recorded licence and attribution.** Proof,
  `repo-safe`: the validator checks that each record entry names a section of
  `docs/THIRD_PARTY_NOTICES.md` and that the section exists; the Oak entries name the OGL
  section EC-0 adds. Todos: EC-0, EC-1.
- **AC-3 The corpus is wide.** Proof, `repo-safe`: the validator's summary line counts
  pinned documents by kind, declared version (OpenAPI 3.0.x, with `"3.0"` counted as 3.0.x,
  3.1.x and 3.2.x; JSON Schema draft-07 and 2020-12, a test-suite file's dialect taken from
  its recorded path) and source; at the plan's end the OpenAPI documents come from at least
  three sources, all three OpenAPI minors are present, and both JSON Schema dialects are
  present. Todos: EC-1 to EC-7.
- **AC-4 No third-party test is run or asserted.** Proof, `repo-safe`: the validator's
  unit tests show the `json-schema-test-suite` header check reads the array shape and
  nothing inside `tests[]`; no code under `lib/` reads a corpus test-suite file. Todo: EC-4.
- **AC-5 The existing OpenAPI Initiative examples are attributed, modifications marked.**
  Proof, `repo-safe`: `docs/THIRD_PARTY_NOTICES.md` names learn.openapis.org, CC BY 4.0,
  the commit each unchanged file matches, and each modified file as modified, which
  CC BY 4.0 §3(a)(1)(B) requires; the course plan's MOVE section names the corpus, its
  validator and the notices file. Todo: EC-0.

## Todos

Each todo is one single-story pull request within the default review budget (PDR-132, at
most two review rounds); EC-2 to EC-6 are independent of each other.

- **EC-0** — `docs/THIRD_PARTY_NOTICES.md`: the CC BY 4.0 notice for the OpenAPI Initiative
  examples in `lib/examples/openapi`, from the survey's comparison of 25 September 2026: 24
  files match learn.openapis.org at its pinned commit byte for byte, `v3.1/tictactoe.yaml`
  matches an earlier learn commit, and three are modified (`v3.0/uspto.json`, edited in
  Castr at `SHA:d5bb5534`; `v3.0/api-with-examples.yaml` and `v3.0/uspto.yaml`, matching
  no learn revision), marked as modified; it records that `petstore-expanded` declares
  Apache 2.0 and `petstore` declares MIT in `info.license`. The Oak OGL notice moves here
  from the corpus README, which links to it. One sentence in the course plan's MOVE section
  names the corpus, its validator and the notices file. No pin record changes.
- **EC-1** — the record shape, red first: a `repository` source (`repository`, `commit`,
  `path`) beside `served`; a `format` (`json` or `yaml`) per entry; a `kind` per entry,
  `openapi` (checked by its `openapi` field alone) or `fragment` (checked by hash alone,
  for a file a pinned document in the same record `$ref`s, which the tranche's review
  confirms); `infoTitle` and `infoVersion` removed; one record per source subdirectory
  under `corpus/`, with `file` a relative path inside that directory and a traversal guard
  in place of today's no-separator rule (security-expert reviews it); the two Oak files and
  their record moved, bytes unchanged, into `corpus/oak/`, so the top level holds the
  README and source directories only; a `notice` per entry naming its section in the
  notices file; the summary line of AC-3. `.prettierignore` and `.gitattributes` cover
  `corpus/**`, keeping each `provenance.json` and README formatted as today. The first
  source is pinned in the same pull request: openapi-typescript's 14 top-level fixture
  files at the survey's commit, nine documents and five fragments, so the shape has real
  instances the moment it lands.
- **EC-2** — hey-api/openapi-ts `specs/3.0.x` and `specs/3.1.x`, `invalid/` included, under
  the rules; `gitleaks dir` over the source directory before staging (the survey measured
  no findings outside the excluded vendor copies). MIT notice.
- **EC-3** — readmeio/oas `packages/oas-examples` 3.0 and 3.1, JSON only, under the rules;
  MIT, Apache 2.0 and ISC notices.
- **EC-4** — JSON-Schema-Test-Suite `tests/draft7` and `tests/draft2020-12` files, whole,
  under the rules; the `json-schema-test-suite` kind lands here with its header check.
  MIT notice.
- **EC-5** — SchemaStore `src/schemas/json` files declaring the 2020-12 `$schema`; the
  `json-schema` kind lands here, checked by its `$schema` field. Apache 2.0 notice.
- **EC-6** — learn.openapis.org `examples/v3.2` (two documents), YAML. CC BY 4.0 notice,
  the section EC-0 creates.
- **EC-7** — the OpenAPI Initiative meta-schemas for 3.1 and 3.2
  (`src/schemas/validation/schema.yaml` on the `v3.1-dev` and `v3.2-dev` branches at the
  survey's commits). Apache 2.0 notice.

## Risks

- **Secret scanning over third-party bytes.** `secrets:scan` runs `gitleaks detect` over
  committed history, so a finding on a pinned document appears after the commit, when
  leaving the document out no longer removes it from history. Each tranche runs
  `gitleaks dir` over its source directory before staging; the survey measured no findings
  in any planned set, and all findings in hey-api sit in vendor copies the rules exclude.
- **An upstream licence change after the pin.** The grant is the licence at the pinned
  commit, which the notice records; a later change upstream does not alter it, and a
  refreshed pin is a new entry under the licence at its own commit.

## Out of scope

- **Reading the documents.** No transform scenario, proof or reader is added; SPEC-PR-6's
  check runs capability corpora, and these documents join one only when the owner names
  them.
- **Running or asserting third-party tests.** The owner's ruling covers fixtures only;
  Castr's target behaviour may differ.
- **APIs.guru's acquired definitions and unattributed vendor copies**, for the rules above.
- **The large vendor documents** (GitHub, Stripe, DigitalOcean), for the weight reason
  above; the survey keeps their commits and licences for the owner.
- **A table of what today's parser rejects.** SPEC-PR-6's required check is that record,
  in code; a committed table of the present parser's failures would be a second record,
  and the course's MEASURE leg keeps its probe out of the repository.
- **Swagger 2.0 documents.** The specification does not read OpenAPI 2.0.
- **Zod input documents.** The owner's words name schemas and the openapi-ts fixtures,
  which are OpenAPI and JSON Schema documents. Zod is a read format, but the technique by
  which it is read is SPEC-N-3, an open item on the ratification checklist; a Zod input
  set is planned when that decision lands. TypeScript is not read.
- **Pinning or reverting `lib/examples/openapi`.** The set already serves the tests that
  read it; it gains its notice in EC-0 with its modifications marked, and a provenance
  record for a directory that mixes copied and Castr-authored files needs an authored
  source kind no other directory needs.
