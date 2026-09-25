# Oak API documents re-measured, 25 September 2026

**Author:** Quark stirs Latitude (claude-code, session `017FtN`). **Date:** 25 September
2026, on `main` at `SHA:08f829a1`.

**Why.** The owner asked for a fresh copy of the latest Oak Open Curriculum API document.
The [review record of 21 September](./castr-specification-review-2026-09-21.md) measured
the consumer's cached copy and said its figures were not re-verified; the
[categorisation report of 24 September](../analysis-and-reports/castr-lanes-and-plans-categorised-2026-09-24.md)
carried them forward unmeasured. This note measures the fetched document and the cached
one, reproduces the record's figures, and states what the fetched document changes.

**What it decides.** Nothing. The owner's decisions of 25 September are recorded where
they land: both documents are pinned in
[`lib/tests-transforms/__fixtures__/corpus/`](../../lib/tests-transforms/__fixtures__/corpus/README.md),
and the Zod version ruling is restated in the specification (0.4.1).

## 1. The two documents

| Document | `info.version`                                   | Source                                                                                                                                                                                                                                        | Pin                                                                                                                           |
| -------- | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| v1       | `1.0.1`                                          | `https://open-api.thenational.academy/api/v1/swagger.json`, fetched 25 September 2026 at 12:39:20 UTC (HTTP 200, 184,589 bytes, no ETag or Last-Modified header)                                                                              | SHA-256 `ca61a52da2ee188ef71f4a097c7950da4c2683129f886bad24d5c7790bb4250e`                                                    |
| v0       | `0.7.0-3b4b01e6a7677713b21d997f2c20d42b86ff9b46` | The Engraph Open Curriculum Ecosystem's committed schema cache, `packages/sdks/oak-sdk-codegen/schema-cache/api-schema-original.json`, last changed by its commit `SHA:bcdc6237` on 3 August 2026, unchanged at `SHA:1a4450a6` (25 September) | SHA-256 `6ff3b8b6825e2fce7358a6329f08ee7353470f7a64cc244f3ffbe65cc130b4df`; Oak commit `SHA:3b4b01e6` from the version string |

The first fetch, at 12:24 UTC, was refused by this session's network policy before it
reached Oak; the owner allowed the host and the second fetch succeeded. The served
document is one line of JSON; the cached one is indented. Both are copied byte for byte.

The consumer generates from v0: its code-generation entry point names
`https://open-api.thenational.academy/api/v0/swagger.json`
(`packages/sdks/oak-sdk-codegen/code-generation/codegen.ts:102`), and its cache README
says the cached file is the document exactly as returned by the API. The review record's
"last written 17 August 2026" is the file's modification time on the reviewer's disk; the
commit that last changed it is dated 3 August.

## 2. The review record's figures reproduce on v0

The record does not state its counting method. Counting string occurrences of each
keyword, and counting an object node as any `type: object` or `properties`-bearing node
outside `example` and `examples` subtrees, gives its figures exactly:

| Figure                                 | Review record      | v0, this note      |
| -------------------------------------- | ------------------ | ------------------ |
| Paths, `operationId`s                  | 34, 34             | 34, 34             |
| Component schemas                      | 33                 | 33                 |
| `$ref` (all local, none with siblings) | 129                | 129                |
| Parameters (query, path)               | 73 (43, 30)        | 73 (43, 30)        |
| `application/json` media types         | 133                | 134                |
| Servers, tags, security scheme         | 1, 9, one          | 1, 9, one          |
| `additionalProperties: false`          | 253                | 253                |
| Schema-valued `additionalProperties`   | 2                  | 2                  |
| Object nodes silent on the keyword     | 17 of 272          | 17 of 272          |
| `allOf`, `anyOf`, `oneOf`              | 8, 17, 16          | 8, 17, 16          |
| `const`, `enum`, `default`             | 81, 44, 14         | 81, 44, 14         |
| `example`, `description`, `title`      | 187, 854, 63       | 187, 854, 63       |
| `format: uri`, `maximum`, `minItems`   | 4, 7, 1            | 4, 7, 1            |
| Response statuses                      | 200, 400, 401, 404 | 200, 400, 401, 404 |

The one difference, 134 against 133 `application/json` media types, is within the record's
own rounding of a hand count; this note's figure is the occurrence count. The two
schema-valued `additionalProperties` are at the same sites the record names, the
`check-restricted` 200 responses, each with `propertyNames`.

A structural walk that also excludes the children of `properties` from the object count
gives 245 closed objects, not 253: the eight it misses are the `allOf` members. The method
is therefore part of the figure, and Appendix A carries the one used here.

## 3. What v1 changes

Same method, both documents:

| Figure                               | v0 (0.7.0)         | v1 (1.0.1)                                                       |
| ------------------------------------ | ------------------ | ---------------------------------------------------------------- |
| `info.title`                         | Oak OpenAPI        | Oak Curriculum API                                               |
| Server                               | `/api/v0`          | `/api/v1`                                                        |
| Paths, operations                    | 34, 34             | 32, 32                                                           |
| Component schemas                    | 33                 | 3 (`error.BAD_REQUEST`, `error.UNAUTHORIZED`, `error.NOT_FOUND`) |
| `$ref` (distinct targets)            | 129 (33)           | 93 (3)                                                           |
| Parameters (query, path)             | 73 (43, 30)        | 77 (47, 30)                                                      |
| `application/json` media types       | 134                | 126                                                              |
| `additionalProperties: false`        | 253                | 243                                                              |
| Schema-valued `additionalProperties` | 2                  | 2, at the same two `check-restricted` sites                      |
| Object nodes silent on the keyword   | 17 of 272          | 17 of 262                                                        |
| `allOf`, `anyOf`, `oneOf`            | 8, 17, 16          | 0, 9, 16                                                         |
| `const`, `enum`, `default`           | 81, 44, 14         | 81, 44, 18                                                       |
| `example`, `description`, `title`    | 187, 854, 63       | 123, 857, 49                                                     |
| `format: uri`, `maximum`, `minItems` | 4, 7, 1            | 5, 9, 1                                                          |
| Response statuses                    | 200, 400, 401, 404 | 200, 302, 400, 401, 404                                          |

In words:

- **Two paths are gone:** `/changelog` and `/changelog/latest`. Nothing is added.
- **The response schemas are inlined.** v0 declared 33 component schemas and referenced
  them from operations; v1 keeps only the three error schemas as components and writes
  every response schema inside its operation. Every `$ref` in v1 points at an error schema.
- **The eight `allOf` sites that accepted no value are gone.** The record's example, the
  quiz answer items under `starterQuiz`, is one closed object in v1 (`order`, `type`,
  `content`). v1 has no `allOf` at all.
- **A `302` appears** on `GET /lessons/{lesson}/assets/{type}`, returned for `type=video`
  with a `Location` header to the file on the CDN. **`GET /keywords`** declares only a
  `200`; every other operation declares `400`, `401` and `404`.
- **The two schema-valued `additionalProperties` remain,** at the same two sites. Today's
  parser rejects each (`lib/src/schema-processing/parsers/openapi/builder/builder.additional-properties.ts:22-34`)
  and returns no partial document, so a whole-document run rejects v1 as it rejects v0.
- **Four more `default` keywords** (18 against 14), one more `format: uri`, two more
  `maximum`, four more query parameters, fewer examples and titles.

## 4. What this bears on

- **RATIFY.** The SPEC-PR-7 example in the review record, eight `allOf` sites that accept
  no value, is a v0 fact; v1 offers no such site. The SPEC-P-1 facts hold for both: two
  schema-valued sites, 17 silent objects. The source-`default` decision card counted 14
  keywords; on v1 it is 18.
- **MEASURE.** Both documents are pinned, and the course's "pinned Oak corpus" is now
  either. A run on v0 measures what a replacement of the consumer's generator must match
  today; a run on v1 measures the document the consumer moves to. On v1, SPEC-C-1's Zod
  schemas "addressable by component name" have three component names; everything else is
  addressable only by operation, response status and media type.
- **The categorisation report** carried the v0 figures, and its statements remain true of
  v0. Its note that `lib/tests-transforms/__fixtures__/arbitrary/oak-api.json` is not the
  corpus stands: that file is a third document, `0.5.0-18a779a2` with 26 paths.

## Appendix A. Method

Run from the corpus directory. The object count treats any node with `type: object` or a
`properties` key as an object, outside `example` and `examples` subtrees; keyword counts
are string occurrences of the quoted key.

```python
import json
import re
import sys

raw = open(sys.argv[1], encoding='utf-8').read()


def occ(pattern):
    return len(re.findall(pattern, raw))


for key in ('title', 'description', 'application/json', 'allOf', 'anyOf', 'oneOf', 'const',
            'enum', 'example', 'default', '$ref', 'propertyNames', 'maximum', 'minItems'):
    print(key, occ(r'"' + re.escape(key) + r'"\s*:'))
print('additionalProperties false', occ(r'"additionalProperties":\s*false'))
print('additionalProperties schema', occ(r'"additionalProperties":\s*\{'))
print('format uri', occ(r'"format":\s*"uri"'))

document = json.loads(raw)


def walk(node, in_example):
    if isinstance(node, dict):
        yield node, in_example
        for key, value in node.items():
            yield from walk(value, in_example or key in ('example', 'examples'))
    elif isinstance(node, list):
        for value in node:
            yield from walk(value, in_example)


objects = [n for n, ex in walk(document, False) if not ex and (n.get('type') == 'object' or 'properties' in n)]
print('objects', len(objects),
      'closed', sum(1 for n in objects if n.get('additionalProperties') is False),
      'silent', sum(1 for n in objects if 'additionalProperties' not in n),
      'schema-valued', sum(1 for n in objects if isinstance(n.get('additionalProperties'), dict)))

operations = [(path, method, op) for path, item in document['paths'].items() for method, op in item.items()
              if method in ('get', 'put', 'post', 'delete', 'patch', 'head', 'options', 'trace')]
parameters = [p for _, _, op in operations for p in op.get('parameters', [])]
statuses = sorted({status for _, _, op in operations for status in op.get('responses', {})})
print('paths', len(document['paths']), 'operations', len(operations),
      'schemas', len(document.get('components', {}).get('schemas', {})),
      'parameters', len(parameters), {loc: sum(1 for p in parameters if p.get('in') == loc) for loc in ('query', 'path')},
      'statuses', statuses)
```

Output for v0 (`oak-openapi-v0-0.7.0-3b4b01e6.json`):

```text
title 63
description 854
application/json 134
allOf 8
anyOf 17
oneOf 16
const 81
enum 44
example 187
default 14
$ref 129
propertyNames 2
maximum 7
minItems 1
additionalProperties false 253
additionalProperties schema 2
format uri 4
objects 272 closed 253 silent 17 schema-valued 2
paths 34 operations 34 schemas 33 parameters 73 {'query': 43, 'path': 30} statuses ['200', '400', '401', '404']
```

Output for v1 (`oak-curriculum-api-v1-1.0.1.json`):

```text
title 49
description 857
application/json 126
allOf 0
anyOf 9
oneOf 16
const 81
enum 44
example 123
default 18
$ref 93
propertyNames 2
maximum 9
minItems 1
additionalProperties false 243
additionalProperties schema 2
format uri 5
objects 262 closed 243 silent 17 schema-valued 2
paths 32 operations 32 schemas 3 parameters 77 {'query': 47, 'path': 30} statuses ['200', '302', '400', '401', '404']
```
