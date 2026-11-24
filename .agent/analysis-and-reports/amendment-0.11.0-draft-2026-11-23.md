# Amendment 0.11.0, proposed: the rows for the `paths` module

**Approved on 24 November 2026.** After two rounds of hosted review of this draft, the
owner was asked by question and approved the text ("I approve 0.11.x"). The review of the specification change then found three more cases that belong in the
list of what the rows say nothing of, and they were adjusted as revision 0.11.1, which
the owner approved by name the same day ("I approve 0.11.1"): anything given by
reference to a component, because a named definition stays named (SPEC-PR-3) and the
draft had wrongly classed it as the object it refers to; an operation with no
`responses`; and a note that two components whose names project to one identifier are
already a located rejection. The words "0.11.x" named no exact version, which the
specification's own check requires, so they were not taken to cover 0.11.1. The
specification is the text of record; this file is the draft as it was brought, kept as
the record of how it was reached.

What follows is the draft, written on 23 November 2026 by the seat Firefly mends Quench.
When it was written the specification was at 0.10.1 and held none of it.

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
> every schema position below is written by those rows and by no second reading. A
> parameter, request body, response or header given by reference to a component is
> classed as the object it refers to.
>
> | Row                                                                                                 | Class                | TypeScript                                                                                                                                                                                                                                 |
> | --------------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `paths`, an entry keyed by a path template                                                          | Carried as structure | A property of `paths`, keyed by the template's own text                                                                                                                                                                                    |
> | A path item's operation under `get`, `put`, `post`, `delete`, `options`, `head`, `patch` or `trace` | Carried as structure | A property of the path's type under that method. Each of the eight that the path item does not hold is an optional property of type `never`                                                                                                |
> | `operationId`                                                                                       | Carried as structure | The operation's type is a property of `operations` keyed by the `operationId`, and the path's method property refers to it. An operation with no `operationId` is written in place                                                         |
> | A parameter's `name` and `in`, where `in` is `query`, `header`, `path` or `cookie`                  | Carried as structure | A property of the operation's `parameters` under its location, keyed by its `name`. A location with no parameter is an optional property of type `never`                                                                                   |
> | A parameter's `required`                                                                            | Carried              | The parameter's property is optional unless `required: true`, and its location is optional unless it holds a required parameter                                                                                                            |
> | A parameter's `schema: S`                                                                           | Carried              | The parameter's property has the type of `S`                                                                                                                                                                                               |
> | `parameters` of a path item                                                                         | Carried as structure | Each is written in every operation of the path item that states no parameter of the same `name` and `in`; where an operation states one, the operation's stands and the path item's is not written. The path's own `parameters` holds none |
> | `requestBody`, and its `required`                                                                   | Carried              | The operation's `requestBody`, holding `content`; optional unless `required: true`. An operation with none has an optional `requestBody` of type `never`                                                                                   |
> | `content`, an entry keyed by a media type                                                           | Carried as structure | A property of `content`, keyed by the media type's own text                                                                                                                                                                                |
> | A media type's `schema: S`                                                                          | Carried              | The media type's property has the type of `S`                                                                                                                                                                                              |
> | `responses`, an entry keyed by an exact status code                                                 | Carried as structure | A property of the operation's `responses`, keyed by that number                                                                                                                                                                            |
> | `responses`, an entry keyed by one of `1XX` to `5XX`, or by `default`                               | Carried as structure | A property of `responses`, keyed by that text. It is never written as a number (SPEC-C-1)                                                                                                                                                  |
> | A response's `content`                                                                              | Carried as structure | The response's `content`. A response with none has an optional `content` of type `never`; no body is written for it                                                                                                                        |
> | A response's `headers`, an entry keyed by a header's name                                           | Carried as structure | A property of the response's `headers`, keyed by the name. A response with none has an optional `headers` of type `never`                                                                                                                  |
> | A response header's `schema: S`, and its `required`                                                 | Carried              | The header's property has the type of `S`, and is optional unless `required: true`                                                                                                                                                         |
> | `components.schemas`, an entry keyed by a component name                                            | Carried as structure | A property of `components["schemas"]`, keyed by the name, whose type is the type Castr exports for that component                                                                                                                          |
>
> The definitions that OpenAPI says are ignored are written nowhere: a header parameter
> named `Accept`, `Content-Type` or `Authorization`, and a response header named
> `Content-Type`. Header names are compared without regard to case.
>
> A document that holds none of `webhooks` and `$defs` has each written as an empty
> record. These rows say nothing of, and section 12 holds for each:
>
> - a document that holds `webhooks` or `$defs`;
> - an operation under `query`, or in `additionalOperations`;
> - a path item that is a reference, and the parameters of a path item that holds no
>   operation;
> - a parameter or a header that holds `content` in place of `schema`, and a parameter
>   whose `in` is `querystring`;
> - a media type that holds no `schema`, that holds `itemSchema`, or that is a reference
>   to a component;
> - every map of `components` but `schemas`, as a member of the `components` type;
> - a component whose exported type would take one of the five names;
> - what a parameter's `style`, `explode` and `allowReserved` do to a value on the wire,
>   which a type does not hold.

### 2. The front matter and the change log

The version becomes 0.11.0 and the change log gains one line that names B.4.

## What the first review round changed

The first round drew twelve findings, and each changed the draft. The table gained a class column and
its rows were split, because a parameter's type and whether it is required are enforced
by the compiler (carried) while its name and place are structure. The rule for a
parameter stated at both levels is now in a row. The definitions OpenAPI says are ignored
are named. The list of what the rows say nothing of grew by five, and a clash of names
moved into it from a rejection: the target could hold such a component, so refusing it
for good was the wrong class.

Three faults in Castr's model today came out of it, found by running the reviewers'
cases through the prototype on 23 November. They are repaired with the writer, test
first, since the rows above cannot be met without them:

- A parameter stated on a path item and again on its operation is held twice. The
  prototype wrote `query: { "q": string; "q"?: number }`.
- A path item's parameter given by reference to a component is not among the
  operation's parameters at all.
- The ignored header definitions are held like any other, and were written.

## What these rows do not make of SPEC-C-1

They do not complete it. SPEC-C-1 names `webhooks` and `$defs`, and says every HTTP
method; these rows leave a document that holds webhooks, a `query` operation or
`additionalOperations` in no row. By SPEC-PR-6 a capability is advertised only when no
valid document reaches something not built, so SPEC-C-1 stays unadvertised after this
amendment as before it. What the amendment buys is Oak's document, which uses none of
the constructs left out.

## What the second review round changed

Three findings, each held. A path item that is a reference, and the parameters of a path
item with no operation, are named in the list of what the rows say nothing of: the row
for a path item's parameters writes them into its operations, and with none they would
have vanished under a row that called them carried. And `205` is not among the statuses
the client takes `data` from.

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

## Observed of the client, and not a row

`openapi-fetch` 0.15.2, by the types of `openapi-typescript-helpers` 0.0.15 it is
installed with, takes `data` from the statuses `200` to `204`, `206`, `207` and `2XX`, and
`error` from a list of `4xx` and `5xx` codes, `4XX`, `5XX` and `default`. A response keyed
by `1XX`, `3XX` or a code such as `205` or `302` is in the type and reaches neither. Oak's document has one
`302`. The rows write the response into the type under its key, as for any status; what
a client then does with it is not Castr's to class.

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
