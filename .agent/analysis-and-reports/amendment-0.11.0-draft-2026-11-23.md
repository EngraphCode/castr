# Amendment 0.11.0, proposed: the rows for the `paths` module

A draft, written on 23 November 2026 by the seat Firefly mends Quench. Nothing here is in
`docs/SPECIFICATION.md`, which stays at 0.10.1 until the owner approves text in their own
words, naming the version (SPEC-CC-2). This draft goes through one round of hosted review
before the owner is asked: revision 0.10.0 was approved before any review and needed
0.10.1 the same day.

## What it is for

By the picture, 24 of the 74 rows Oak's v1 document uses are not right, and all are the
document's structure. In the TypeScript column 21 of them read "missing" for one cause:
Castr writes no `paths` module. SPEC-C-1 names that module and what it holds:

> the module of TypeScript types a typed HTTP client consumes: `paths` keyed by path
> template, every HTTP method declared, each operation with its four parameter locations,
> its request body keyed by media type, and its responses keyed by status and then media
> type; with `operations`, `components`, `webhooks` and `$defs`

SPEC-C-1 says what the module holds. It does not say how each construct of a document is
written into it, and the scope-and-fidelity tables are open for those rows (SPEC-N-5).
This amendment brings the rows for the TypeScript column, for the constructs Oak's
document uses, and says plainly which constructs it leaves in no row.

## How the rows were reached

A prototype of the module was written from the model and checked at type level against a
client of `openapi-fetch` 0.15.2, the client the owner said stays. It is on the branch
`feat/paths-type-prototype` (`lib/tests-picture/prototypes/`), unmerged. Run on 23
November:

- For a small document, on a client built over the type: `data` has the type of the
  success body and `error` the type of each error body; `components["schemas"]["X"]` is
  the exported type `X`, and `X` is `z.output` of the Zod schema `X`.
- Four kinds of wrong call do not compile: a required path parameter left out, a method
  the path does not declare, a required request body left out, and a body of the wrong
  type. The tests were checked to have teeth by compiling such calls and reading the
  compiler's messages.
- For the whole of Oak's document the module compiles, and a client reads a lesson with
  `data` and `error` typed.

## The proposed text

### 1. Appendix B, a new section after B.3

> ### B.4 OpenAPI 3.1 and 3.2 to TypeScript: the document's structure
>
> These rows class the TypeScript column only. The module they describe exports the five
> types SPEC-C-1 names: `paths`, `operations`, `components`, `webhooks` and `$defs`.
> "The type of `S`" is the type Castr writes for the schema `S` by the rows for a schema;
> every schema position below is written by those rows and by no second reading.
>
> | Row                                                                                                                                       | TypeScript                                                                                                                                                                                                                                                                                                                                                                                                        |
> | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `paths`, an entry keyed by a path template                                                                                                | Carried as structure: a property of `paths`, keyed by the template's own text                                                                                                                                                                                                                                                                                                                                     |
> | A path item's operation under `get`, `put`, `post`, `delete`, `options`, `head`, `patch` or `trace`                                       | Carried as structure: a property of the path's type under that method. Each of the eight that the path item does not hold is written as an optional property of type `never`                                                                                                                                                                                                                                      |
> | `operationId`                                                                                                                             | Carried as structure: the operation's type is a property of `operations` keyed by the `operationId`, and the path's method property refers to it. An operation with no `operationId` is written in place                                                                                                                                                                                                          |
> | `parameters` of an operation or of its path item, where the parameter holds `schema: S` and `in` is `query`, `header`, `path` or `cookie` | Carried as structure: a property of the operation's `parameters` under its location, keyed by its `name`, of the type of `S`; optional unless `required: true`. A location is optional unless it holds a required parameter, and a location with no parameter is an optional property of type `never`. A path item's parameters are written in each of its operations, and the path's own `parameters` holds none |
> | `requestBody`                                                                                                                             | Carried as structure: the operation's `requestBody`, holding `content`; optional unless `required: true`. An operation with none has an optional `requestBody` of type `never`                                                                                                                                                                                                                                    |
> | `content`, an entry keyed by a media type that holds `schema: S`                                                                          | Carried as structure: a property of `content`, keyed by the media type's own text, of the type of `S`                                                                                                                                                                                                                                                                                                             |
> | `responses`, an entry keyed by an exact status code                                                                                       | Carried as structure: a property of the operation's `responses`, keyed by that number                                                                                                                                                                                                                                                                                                                             |
> | `responses`, an entry keyed by one of `1XX` to `5XX`, or by `default`                                                                     | Carried as structure: a property of `responses`, keyed by that text. It is never written as a number (SPEC-C-1)                                                                                                                                                                                                                                                                                                   |
> | A response's `content`                                                                                                                    | Carried as structure: the response's `content`. A response with none has an optional `content` of type `never`; no body is written for it                                                                                                                                                                                                                                                                         |
> | A response's `headers`, an entry that holds `schema: S`                                                                                   | Carried as structure: a property of the response's `headers`, keyed by the header's name, of the type of `S`; optional unless `required: true`. A response with none has an optional `headers` of type `never`                                                                                                                                                                                                    |
> | `components.schemas`, an entry keyed by a component name                                                                                  | Carried as structure: a property of `components["schemas"]`, keyed by the name, whose type is the type Castr exports for that component                                                                                                                                                                                                                                                                           |
>
> A document that holds none of `webhooks` and `$defs` has each written as an empty
> record. These rows say nothing of: a document that holds `webhooks` or `$defs`; a
> parameter or a header that holds `content` in place of `schema`; a parameter whose `in`
> is `querystring`; a media type that is a reference to a component, or that holds
> `itemSchema`; a method outside the eight; and what a parameter's `style`, `explode` and
> `allowReserved` do to a value on the wire, which a type does not hold.
>
> A component whose exported type would take one of the five names is a located
> rejection: two declarations of one name would not compile.

### 2. The front matter and the change log

The version becomes 0.11.0 and the change log gains one line that names B.4.

## Choices inside the rows, and what each was weighed against

- **The five names are SPEC-C-1's, in its own spelling.** The Ecosystem repository's
  present file spells them with capitals because it rewrites the output of
  `openapi-typescript` after generation. SPEC-C-1's second acceptance part removes that
  rewriting, so the names here are the ones a client of `openapi-fetch` expects with no
  rewriting.
- **An absent method is written, as `never`.** SPEC-C-1 says "every HTTP method
  declared". The other form, leaving it out, was not built; by the client's types a call
  to an undeclared method fails on the path argument under either. Writing it follows
  SPEC-C-1's words and is the form `openapi-typescript` writes, which the client's
  authors test against.
- **A path item's parameters are folded into its operations.** The model already holds
  them so, and a client reads parameters from the operation. The other form keeps them on
  the path item and repeats them; it adds nothing a client reads.
- **A response with no body gets no body.** Today the endpoint definitions invent an
  empty object for one. Here `content` is `never`, and a call gives `data` of
  `undefined`.

## A fact about the client, not about Castr

`openapi-fetch` takes `data` from the statuses `200` to `207` and `2XX`, and `error` from
a list of `4xx` and `5xx` codes, `4XX`, `5XX` and `default`. A response keyed by `1XX`,
`3XX` or a code such as `302` is in the type and reaches neither. Oak's document has one
`302`. The type is right, and the rows say nothing about what a client does with it.

## What the amendment leaves open, on purpose

- The endpoint definitions column for these constructs. Its shape is the public surface
  (SPEC-N-4) and is its own amendment.
- SPEC-C-1's boundary check, which confirms each boundary against the source. It reads
  the module once the module exists.
- Whether the module is one file with the Zod schemas or a file of its own. SPEC-C-1
  says "the module of TypeScript types"; the writer's pull request states which and why.

## What follows approval

1. The specification changes, with its approval record, in one pull request.
2. The prototype becomes the writer in `src`, test first, with a template that emits the
   module. The prototype's type-level tests move with it.
3. The picture's 21 cells in the TypeScript column are judged against the module.
