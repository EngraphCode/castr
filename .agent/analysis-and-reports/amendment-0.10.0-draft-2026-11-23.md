# Amendment 0.10.0, proposed: the two schema rows Oak's document still waits on

A draft for the owner's approval, written on 23 November 2026 by the seat Firefly mends
Quench. Nothing here is in `docs/SPECIFICATION.md`, which stays at 0.9.1 until the owner
approves this text in their own words, naming the version (SPEC-CC-2).

## What it is for

By the picture, 26 of the 74 rows Oak's v1 document uses are not right. Two of them are
rows of a schema:

- **`default`**, 18 uses, each on a query parameter (`0` nine times, `20` nine times).
  Castr's Zod output holds nothing for it.
- **`format: uri`**, 5 uses. Castr writes `z.url()`, which accepts some strings the
  source's format refuses.

Each is covered by an approved clause, SPEC-P-6 and SPEC-P-3, and for each the clause
leaves the form open. The scope-and-fidelity tables are open item SPEC-N-5 and arrive row
by row, each by amendment. This amendment brings the two rows and nothing else. For `format: uri` it offers two
forms, and the owner chooses.

## What is not here, and why

The [plan](../plans/active/after-0.8.0-next-steps.md) queued one larger amendment. Three
things in that queue are held back.

- **The rows for the document's structure to TypeScript** (the `paths` type, 21 of Oak's
  cells). SPEC-C-1 names the type and what it holds. Its rows fix a shape that
  `openapi-fetch` reads, and that is checked by building it and compiling a client
  against it, not by reading. It comes as its own amendment, after a prototype.
- **The shape of an endpoint definition** (what it holds for a summary, a request body's
  media type, a response header, a response with no body, a status range). That is the
  public surface, open item SPEC-N-4, and it turns on what the consumer should read.
- **Where a run's report is returned.** Public surface again.

The lesson of amendment 0.9.0 is kept: ask for what the next change to code needs
approved, and no more.

## The proposed text

The owner chooses between two forms for `format: uri`, A and B below. Changes 1 and 3 are
the same under either; the row's Zod cell differs, and clause SPEC-P-8 exists only under
form A.

### 1. Appendix B, a new section after B.2

> ### B.3 OpenAPI 3.1 and 3.2 to Zod, TypeScript and endpoint definitions: `default` and `format: uri`
>
> Each row classes its own keyword and no other. `D` is the value of `default`.
>
> | Row           | Zod                                                                                                          | TypeScript                                         | Endpoint definitions |
> | ------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------------- |
> | `default: D`  | Carried: `default: D` in the schema's `.meta(…)`, beside any other annotation. It inserts nothing (SPEC-P-6) | By companion (Zod): a type holds no annotation     | By companion (Zod)   |
> | `format: uri` | Form A or form B, below                                                                                      | Carried as `string`; the format by companion (Zod) | By companion (Zod)   |

**Form A, the Zod cell:** "Carried, with the declared limit of SPEC-P-8: `z.url()`".

**Form B, the Zod cell:** "Carried: `z.string().regex(…)` with the pattern of RFC 3986's
`URI` rule (appendix A of that RFC)".

### 2. Form A only: section 5, a new clause after SPEC-P-7

> - **SPEC-P-8 `format: uri` in Zod.** Castr writes `format: uri` as `z.url()`. Zod's
>   `z.url()` follows the WHATWG URL Standard, and `format: uri` is RFC 3986. The two
>   decide some strings differently, in both directions: `z.url()` accepts strings RFC
>   3986 refuses (one with a space or an invalid percent-escape, for example), and it
>   refuses strings RFC 3986 accepts (a scheme with an empty authority, such as
>   `http://`, for example). For such a string the generated Zod validator and the source
>   disagree. This is a declared limit of the Zod that Castr writes, not fidelity to the
>   source. The samples of SPEC-G-4 hold no string on which the two differ, and every
>   run's report states the limit once.

### 3. The front matter and the change log

The version becomes 0.10.0 and the change log gains one line that names the two rows
and, under form A, SPEC-P-8.

## The two forms, set side by side

|                               | Form A: `z.url()` and a declared limit                                                                                                     | Form B: the RFC 3986 pattern                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Agreement with the source     | Not on every string. Of 26 strings tried, 18 agree                                                                                         | On all 26 tried. The pattern used was the reference validator's own, so this shows the pattern can be written in Zod, not that two independent readings of the RFC agree |
| Direction of the disagreement | Both. It accepts seven strings the source refuses, and it refuses one the source accepts (`http://`)                                       | None found                                                                                                                                                               |
| What the consumer reads       | `z.url()`                                                                                                                                  | `z.string().regex(…)` with a pattern of about 1,150 characters, written once in the module and named                                                                     |
| Generated code today          | Unchanged                                                                                                                                  | Every `format: uri` changes                                                                                                                                              |
| Specification                 | A new clause. SPEC-G-4's "identical decisions" then holds for `format: uri` only on the samples, as it does for `__proto__` under SPEC-P-7 | No new clause. SPEC-P-3 and SPEC-G-4 hold as written                                                                                                                     |
| Declarative subset (SPEC-P-2) | Yes                                                                                                                                        | Yes: `.regex` is in Appendix A                                                                                                                                           |

One thing sets form A apart from SPEC-P-7, its precedent. SPEC-P-7 declares a case where
the validator accepts what the source refuses. Form A also declares the other direction:
a valid value refused.

Oak's five uses: four are the address of a lesson's page (`oakUrl`, `canonicalUrl`), and
one is a `Location` response header on a redirect. Whether an address Oak serves could
hold a space, a character outside ASCII or a square bracket was not established.

## What was run

On 23 November, against Zod 4.6.6 and the picture's reference validator (Ajv 2020 with
`ajv-formats`, `format` asserting):

- **`default` as an annotation.** `z.strictObject({ limit: z.number().meta({ default: 20
}).optional() })` parses `{}` to `{}`: nothing is inserted. `z.toJSONSchema` of it
  gives `"limit": { "type": "number", "default": 20 }`: the annotation is carried.
  `.meta({ description: 'd', default: 20 })` carries both. By contrast
  `z.number().default(20)` parses `{}` to `{ "limit": 20 }`, which SPEC-P-6 forbids for a
  source `default`.
- **The endpoint definitions today.** For a query parameter with `default: 20`, the
  written definition holds `schema: z.number().optional()` and no default anywhere. Once
  the Zod cell is met, the parameter's schema holds it.
- **`format: uri` against `z.url()`.** 26 strings; the two agree on 18. `z.url()` alone
  accepts seven: `https://example.com/%ZZ`, `https://example.com/a b`,
  `https://example.com/é`, `https://example.com/a\b`, `https://example.com/a[1]`,
  `https://例え.jp/` and `https://example.com/#a#b`. The reference alone accepts one:
  `http://`. Both accept an ordinary address, `urn:`, `mailto:`, `tel:`, `data:` and
  `file:` addresses, a port, a user and an IPv6 host; both refuse a relative reference
  and plain words.
- **`format: uri` against the pattern.** `z.string().regex(…)` with the reference
  validator's `uri` pattern decides all 26 as the reference does.

## What the amendment leaves unmet, said plainly

Castr has no run report. So three sentences of the specification stay unmet after this
amendment as before it: SPEC-P-6's warning for each source `default`, and the lines
SPEC-P-7 and SPEC-P-8 have every run's report state. A run report is its own unit, and
where it is returned is the public surface.

## What follows approval

1. The specification changes, with its approval record, in one pull request.
2. The Zod writer writes a source `default` into `.meta(…)`, test first. The picture's
   `default` row then reads right in the Zod column.
3. `format: uri`. Under form A, the picture's sample that the limit concerns
   (`https://example.com/%ZZ`) leaves the row's samples and becomes a tracked case of the
   declared limit, as SPEC-P-7's is; the picture then shows the row as right with a
   declared limit, not as plainly right. Under form B, the Zod writer writes the pattern,
   test first, and the sample stays.
4. Oak's document: 24 of 74 rows not right, all of them the document's structure.
