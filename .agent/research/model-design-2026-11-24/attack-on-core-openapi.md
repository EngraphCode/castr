> **A reader's report, not a finding of this repository.** A reader who knows OpenAPI
> attacked a first proposal for the core of the model's structure on 25 November 2026
> and read the texts of 3.2.1 and 3.1.2 and the published schemas. The proposal it read is
> [the second hand trial](core-proposal-second-trial.md), kept beside it. It is kept
> whole, as returned. What the seat checked of it, and what the design took from it, is
> in the thread record's step log. Paths on the reader's machine are replaced by
> `<scratchpad>` and `<repo>`; the reader's scripts are not kept.

# Attack on core-v2: OpenAPI 3.1 and 3.2

25 November 2026. The OpenAPI reader. The proposal on trial is `core-v2.md`.

**What was read this session.** I read all of `core-v2.md`. In the cases note I read A1–A24 and D3–I8. I read all 143 rows of the hand list. I read every `$defs` entry of both pinned schemas and both meta-schemas, using a script that also follows `if`/`then`, `dependentSchemas` and nested `$defs`. I read section 3 and Appendix B of `docs/SPECIFICATION.md`.

From the 3.2.1 text I read §2–§5, all of §4's fixed-field tables, §4.12.6, §4.14–4.15, §4.24.4.1–4.24.4.2, §4.24.5–4.24.7, §4.25–4.30, and Appendices B, D, F and G. I skimmed §4.24.4.3 and Appendices C and E. From 3.1.2 I read §4.3, §4.6, and the rows its 3.1-only rows rest on. I read JSON Schema 2020-12 validation §9.4.

**Run.** Hyperjump 1.18.1 against the pinned 3.2 schema (N21).

**Memory.** Anything marked "memory" was not read this session.

Section numbers are those of 3.2.1 unless a finding says 3.1.2.

**What "held" means below.** "Held" means the proposal names an element whose stated structure can carry the field without loss and without OpenAPI's spelling. There are two weaker grades:

- **Partly held:** an element is named, but its structure is not stated (`said`, "serialisation", `servers?`, `callbacks`, `document`).
- **None:** no element.

Because `said` is listed under "Open in this trial", fields that would sit in it count as partly held.

## Findings, most damaging first

Severity counts and the three changes I would make first are at the end.

### N1 · D, C · BREAKS · Boundaries as operations lose the path level

```json
{
  "paths": {
    "/empty": {},
    "/pets/{id}": {
      "summary": "Pets",
      "servers": [{ "url": "/v2" }],
      "x-item": 1,
      "parameters": [
        { "name": "id", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "delete": { "responses": { "204": { "description": "gone" } } }
    }
  }
}
```

**Evidence (READ).**

- §4.9 says "A Path Item MAY be empty, due to ACL constraints. The path itself is still exposed to the documentation viewer".
- §4.9.1 says `summary` is "intended to apply to all operations in this path". The path item's `servers` mean the document's "will be overridden by this value". Its parameters "can be overridden at the operation level, but cannot be removed there".
- `Boundary` exists only for an operation, so `/empty` has nothing.
- The path item's `summary`, `servers`, `parameters` and `x-item` have no node. They can only be copied into each boundary, which F1 and G1 say loses where they were stated.
- A webhook is keyed by a name (§4.1.1) and a callback's path item by a URL template (§4.18). Neither has a `PathTemplate`.

**Correction.** Make `PathItem` a kind of definition, inline or named, with summary, description, servers, parameters, operations by `Method`, and extensions. Make `Operation` its own kind of definition. `paths`, `webhooks` and each callback become maps to a path item or an edge. A boundary is then derived as (address, operation edge), where the address is a path template, a webhook name, or (callback name, URL template).

### N2 · C · BREAKS · One Operation Object, two operations, one `operationId` (A14)

**Evidence (READ).**

- §4.20.1 says "operations from any Path Item Object that is referenced multiple times within the OAD cannot be resolved unambiguously. In such ambiguous cases, the resulting behavior is implementation-defined".
- The proposal puts the identity on `Boundary`. A14 then gives either two boundaries with the identity `op`, or one boundary and a lost address. One stated operation has two addresses, and the proposal has nowhere to hold it once.

**Correction.** An `operationId` is a name of the `Operation` definition from N1, held once. A link's edge targets that operation. That its address is ambiguous is a status in the record (N16).

### N3 · C, D · BREAKS · "Each expression an edge to a path parameter" binds at the wrong level

**Evidence (READ).**

- In F1, `/pets/{id}` binds to `get`'s own `id` (integer) and, for `delete`, to the path item's `id` (string).
- §4.8.2 says "Each template expression in the path MUST correspond to a path parameter that is included in the Path Item itself and/or in each of the Path Item's Operations", and that an empty path item needs none.
- In A14, `P`'s parameters serve two templates. A path item under `components.pathItems` has no template at all.

**Correction.** A `PathTemplate` holds literal parts and expression names as data, with no edges. The binding of a name to a parameter belongs to each (path, operation) pair. It is derived by the text's override rule on (name, location), and may be absent.

### N4 · E · BREAKS · "Fill the default, record that it was unsaid" is false for OpenAPI's mode-selecting and derived defaults

```json
{
  "encoding": {
    "a": {},
    "b": { "style": "form", "explode": true },
    "c": { "allowReserved": false }
  }
}
```

**Evidence (READ).**

- §4.15.1.2 says the `form` default "applies only when `contentType` is not being used due to one or both of `explode` or `allowReserved` being explicitly specified". It also says "If a value is explicitly defined, then the value of `contentType` (implicit or explicit) SHALL be ignored".
- Appendix C applies RFC 6570 serialisation to an Encoding Object when "any of `style`, `explode`, or `allowReserved` are used".
- So `a` is serialised by its content type, and `b` and `c` by style. Filling `style: form, explode: true` into `a` makes two different meanings one value.
- `contentType` defaults by a table over the type of the property's schema (§4.15.1.1). That type is found by an inspection which "MUST NOT attempt to resolve ambiguities" (§4.24.4.2), so `anyOf: [{type: number}, {maximum: 100}]` has no single default.
- The XML `nodeType` default reads the containing schema's `$ref`, `$dynamicRef` and `type: "array"` (§4.26.1). The XML `name` default reads the component or property name (§4.26.3).
- `explode`'s default reads `style`, which may itself be a default (§4.12.2.2).

**Correction.** State four kinds:

- **Constant default:** filled in; the record says "text default".
- **Chained default:** filled in; the record names the default it follows.
- **Derived default:** computed by the reader from the source as written, before the canonical rules. Where the text's rule gives no single answer, it is held as the status "implementation-defined" and not filled in.
- **Mode chosen by presence:** a value from a closed set, never a default.

### N5 · E · BREAKS · Canonical rules 1 and 3 erase schema spelling that OpenAPI's own rules read

```json
{
  "multipart/form-data": {
    "schema": {
      "properties": {
        "p": { "anyOf": [{ "type": "string" }] },
        "q": { "allOf": [{ "$ref": "#/components/schemas/Q" }], "xml": { "name": "q" } }
      }
    }
  }
}
```

**Evidence (READ; reasoned on the texts, not run).**

- §4.24.4.2 says implementations "MUST examine that schema and all schemas that can be reached from it by following only `$ref` and `allOf` keywords". It also says "Schema Objects that do not contain `type` MUST be considered to allow all types".
- The same section says implementations "MAY inspect subschemas or possible reference targets of other keywords such as `oneOf`".
- As written, `p`'s `contentType` default is therefore the implementation's choice: `application/octet-stream` by the "absent" row of §4.15.1.1, or `text/plain` if it looks inside `anyOf`.
- Rule 1 makes `p` a plain `type: string`, which every implementation finds, so the default becomes `text/plain` for all of them.
- Rule 1 also makes `q` a bare reference, so its `nodeType` default moves from `element` to `none` (§4.26.1).
- The round trip changes meaning although nothing stated changed.

**Correction.** The canonical rules stay, and the shapes stay one value; case I4 stands. The derived defaults of N4 are resolved from the source spelling, before the rules run, and held as values on the encoding and the XML Object. The OpenAPI writer writes each one explicitly wherever inspecting its own output would derive a different value. That writer check can be tested on the corpus.

### N6 · C · BREAKS · A reference into a branch of a composition targets a node the canonical rules remove

```json
{
  "components": {
    "schemas": {
      "N": { "anyOf": [{ "type": "string" }, { "type": "null" }] },
      "S": { "$ref": "#/components/schemas/N/anyOf/0" }
    }
  }
}
```

**Evidence (READ).**

- §4.1.2.2.2 says a fragment "SHOULD be interpreted as a JSON Pointer", and nothing limits the target to a named place (A13, A21).
- Rule 3 merges `N` into one by-kind node, so `inside{ of: N, step: [anyOf, 0] }` names nothing.

**Correction.** Before the canonical rules run, every node that an edge targets becomes a definition with an `inside` identity. No rule merges across the boundary of a definition.

### N7 · C · BREAKS · `Place.named{ table: 'schema' }` collapses two places and splits one definition

**Evidence (READ).**

- In A11, if the proposal files `#/definitions/x` under `named` as it does `#/$defs/x`, both are table `schema`, name `x`, and they collapse into one place. The proposal does not say where `definitions` goes.
- In A15, `Legacy` has two identities: `{document, named(schema, Legacy)}` and `{https://example.com/legacy, root}`. The model's `definitions` is keyed by one.
- §F.1 requires the `$id` form: "Schema Objects containing an `$id`, or that are under a schema containing an `$id`, MUST be referenced by the nearest such `$id`".
- The component name is still what implicit connections use (§G.3: "the component name of the Schema Object at `#/components/schemas/Foo` is `Foo`"), and it is the name SPEC-PR-3 keeps.

**Correction.** Key each definition once by (resource, place, kind), with the place as typed steps (N13). Hold names apart from keys: the component name, an `$id` and anchors are each an alias that resolves to the key. Under 2020-12, `definitions/x` is a place inside a keyword the dialect does not define, never table `schema`.

### N8 · C · BREAKS · `to: DefinitionId` cannot hold a missing target, two candidates, or a target the text ignores

```json
{
  "tags": [],
  "paths": {
    "/a": { "get": { "tags": ["undeclared"], "responses": { "200": { "description": "ok" } } } }
  }
}
```

**Evidence (READ).** Each of these must still be an edge:

- **An undeclared tag.** §4.1.1 says "Not all tags that are used by the Operation Object must be declared".
- **A name in a referenced document (A17).** Resolving from the entry document is RECOMMENDED, and resolving from the current document is allowed (§4.1.2.3, §G.3).
- **An `operationId` used more than once (A14).**
- **An `encoding` key that matches no property.** §4.14.5.1 says such entries "SHALL be ignored".
- **A mapping value or requirement key that is both a name and a URI.** §4.25.3 says "it is RECOMMENDED that it be treated as a schema name". §4.30 says such a key "MUST be treated as a component name".
- **The link key `path.id` beside a query parameter named `path.id`.** §4.20.1 says tools "SHOULD prefer the qualified interpretation".

**Correction.**

```ts
type Edge = {
  written: Name | UriReference;
  resolution:
    | { resolved: DefinitionId }
    | { undeclared: true }
    | { ambiguous: DefinitionId[]; chosen?: DefinitionId; rule: string }
    | { ignored: true };
};
```

The rule and the text's status go in the record.

### N9 · D · BREAKS · Read-only and write-only are annotations on any value, not facts that change `required` by direction

```json
{
  "type": "object",
  "required": ["id"],
  "properties": { "id": { "$ref": "#/components/schemas/Id" } }
}
```

Here `Id` is `{ "type": "string", "readOnly": true }`.

**Evidence (READ).** Both texts were searched for `readOnly`, `read-only`, `read only`, `writeOnly`, `write-only` and `write only`. The only hits are the two sections below and the tables of contents.

- 3.2.1 §4.24.5.2 and 3.1.2 §4.8.24.3.2 say "The `readOnly` and `writeOnly` keywords are annotations".
- Both say a resource "MAY either ignore a `readOnly` field or treat it as an error", and "the behavior of `readOnly` in particular differs from that specified by version 3.0".
- JSON Schema 2020-12 validation §9.4 says the behaviour "SHOULD be as for a true value if any occurrence specifies a true value", and "Omitting these keywords has the same behavior as values of false".
- §9.4 also says a write-only value "is never present when the instance is retrieved from the owning authority". That is a statement about the owner's behaviour, made by an annotation. It does not say a required write-only property stops being required in responses.
- Neither OpenAPI text ties `required` to direction. That rule belongs to 3.0 (memory).
- The annotation stands on an instance: a referenced definition (above), an item, or a whole body. It is not a fact of a field.
- **The cases note is wrong here.** Its D3 says "The OpenAPI text says a required read-only property is required in a response only". No sentence of 3.1.2 or 3.2.1 says that.

**Correction.** Hold `readOnly` and `writeOnly` as annotations on any shape; `false` and absent are one value. If Castr writes types that differ by direction, that is a profile decision (SPEC §5), and the record says the profile supplied it. Correct D3 in the cases note.

### N10 · A · GAP · No element for 119 of the 176 field slots of 3.2

The full list is in section A below. The outline names elements for the component tables, references, the path template, the method, parameter locations, response keys, and the shape of a media type. Almost nothing of document content has an element.

### N11 · C, F · LEAK · Runtime expressions, callback keys and link values are text

**Evidence (READ).**

- Cases F7 (`"{$request.body#/url}"`) and A18 (`"path.name": "$request.path.name"`).
- §4.20.3 gives the ABNF. §4.18.2 says the callback key "is a runtime expression".
- §4.20.1 types `parameters` as `Map[string, Any | {expression}]`, and says "it is not possible to provide a constant value to `parameters` that matches the syntax of a runtime expression".
- §4.20.3.1 says "Request parameters MUST be declared in the `parameters` section of the parent operation". §4.20.3 says "The `name` identifier is case-sensitive, whereas `token` is not".
- The outline has no element for any of these, and `Boundary.address.path` cannot hold a callback key.

**Correction.**

```ts
type RuntimeExpression =
  | { source: 'url' }
  | { source: 'method' }
  | { source: 'status-code' }
  | {
      source: 'request' | 'response';
      part:
        | { in: 'header'; name: HeaderName; to?: Edge }
        | { in: 'query' | 'path'; name: string; to?: Edge } // a parameter of the operation
        | { in: 'body'; pointer?: JsonPointer };
    };
type Template = ({ text: string } | { expression: RuntimeExpression })[];
type LinkValue = { constant: Json } | { expression: RuntimeExpression } | { template: Template };
```

### N12 · F, E · LEAK · Media types, header names and authentication schemes need data types with their case rules

**Evidence (READ, except where marked memory).**

- Cases I7 (`X-Rate` and `x-rate`), F5 and F8.
- §4.17.1 says "[RFC9110] Section 5.1 states header names are case-insensitive". §4.27.1 says `scheme` "is case-insensitive".
- The keys of `content` are media ranges, and "only the most specific key is applicable" (§4.13.1, §4.17.1).
- Media types' type and subtype are case-insensitive (RFC 9110 §8.3.1, memory). Methods are case-sensitive (RFC 9110 §9.1, memory).
- `MediaType` is used in `StringPart` and never defined.
- B.4 keys TypeScript by "the template's own text", by "the media type's own text" and by "the name".

**Correction.**

- `MediaRange { type: Token | '*'; subtype: Token | '*'; parameters: { name; value }[] }`, with case folding and a stated order of specificity.
- `HeaderName` and `AuthScheme` folded to lower case; `Method` held exactly.
- The source's spelling becomes a new kind of record fact ("spelling"), so I7 is one value.
- B.4 states whether TypeScript uses the canonical spelling or the recorded one.
- Two `content` keys that differ only in case are one key, and get a located rejection.

### N13 · C · LEAK · `Step`, `ResourceId` and `AnchorName` are undefined, and pointer tokens would be OpenAPI's spelling

**Evidence (READ).** A13 has `#/paths/~1pets~1%7Bid%7D/get` and `#/components/schemas/Pet/properties/owner`. If a `Step` is a pointer token, then `paths`, `/pets/{id}` and `get` become structure in OpenAPI's vocabulary.

**Correction.**

- `Step` is a closed set of meaning-steps: path(template), webhook(name), callback(name, key), method(token), parameter(name, location), request-body, response(key), media(range), header(name), link(name), example(name), encoding(edge or position), property(name), pattern(n), position(n), after, branch(kind, n), condition(test, then or otherwise), not, definition(name).
- `ResourceId` is an absolute URI with no fragment, or a generated URN for a document with no base (§F.4).
- `AnchorName` is the anchor's text.

### N14 · D · GAP · Security: the document level, the requirement's contents and the scheme

**Evidence (READ).**

- §4.1.1 defines `security` at the root.
- §4.30.1 says the value "is a list of scope names" for OAuth2 and OpenID Connect, and for other types may hold "role names".
- `Requirement` is never defined, and a security scheme has a table but no structure.
- **The operation level is sound.** Absent, `[]`, `[{}]` and `[{a, b}]` map to `?`, `'none'`, `[[]]` and `[[a, b]]`.

**Correction.** Use `Requirement = { scheme: Edge; scopes: Set<string> }[]` for an AND, and `Security = Requirement[]` for an OR, both at the root and on the operation. `SecurityScheme` is a closed union by kind (section A).

### N15 · D, E · GAP · Servers at three levels, and an empty list below the root

```json
{
  "servers": [],
  "paths": { "/a": { "servers": [], "get": { "responses": { "200": { "description": "ok" } } } } }
}
```

**Evidence (READ).** §4.1.1 says an absent or empty root list means one server at `/`. §4.9.1 and §4.10.1 say only that a lower list overrides; neither says what an empty one means.

**Correction.**

- Add `Server` and `ServerVariable` as given in section A.
- At the root, absent, `[]` and `[{url: "/"}]` are one value, told apart in the record.
- Below the root, `[]` is held as stated, with the status "the text gives no meaning", and never merged with absent.

### N16 · B · GAP · No status fact

**Evidence (READ).**

- OT-003 asks for one, and 13 rows in section B need one.
- §4.23.1 says properties beside a Reference Object "SHALL be ignored". §4.17.1 says a response header named `Content-Type` "SHALL be ignored".
- Only the siblings of a path item's `$ref` carry "undefined" in the proposal.

**Correction.** Add a located record fact, `status: undefined | implementation-defined (rule chosen) | ignored | no-effect`. Reports read it (SPEC-PR-8).

### N17 · C · GAP · One place read as two kinds (A19)

**Evidence (READ).** §G.2 says "If the same JSON/YAML object is parsed multiple times and the respective contexts require it to be parsed as different Object types, the resulting behavior is implementation defined, and MAY be treated as an error if detected". 3.1.2 §4.3.2 says the same.

The design must say which of two things happens:

- Castr refuses the document, with a named kind of rejection.
- Castr holds two definitions keyed (resource, place, kind) and linked in the record.

`DefinitionId` gives no kind for a place that is not `named`.

### N18 · D, C · GAP · Several documents, the entry document and base URIs

**Evidence (READ).**

- §4.1.2 defines the entry document. §G.3 says "only the entry document's Paths Object contributes URLs".
- §4.1.2.2.1 says the base comes from `$self`, an encapsulating entity, the retrieval URI or a default, in that order.
- §4.1.1 says "references MUST use the target document's `$self` URI if the `$self` field is present". Other URIs are "not interoperable".
- Cases A7 and A17.

**Correction.** `Model.documents` holds each document with:

- its identity (from `$self` or its base);
- its base source (in the record);
- its version, major.minor (in the record);
- its stated `jsonSchemaDialect`.

`Model.entry` names one document. Each edge records the document it was written in, and the form of URI it used.

### N19 · D, E · GAP · The discriminator

**Evidence (READ).**

- Case A16. §4.25.2 gives three forms: beside `oneOf`, beside `anyOf`, and on a parent that children build on with `allOf`.
- §4.25.1 adds `defaultMapping`.
- §4.24.6.1 says "Override the schema name by overriding the property with a new value. If a new value exists, this takes precedence over the schema name".
- §4.25.5 says `dog` maps to Dog "rather than the default (implicit) value of `#/components/schemas/dog`".
- Holding it "beside `one`" covers the first form only.

**Correction.**

```ts
interface Discriminator {
  property: string;
  otherwise?: Edge;
  extensions: Extension[];
  cases: { value: string; to: Edge; source: 'mapping' | 'component-name' | 'child-property' }[];
}
```

It sits on any shape, and the `allOf` children are found by reverse edges.

### N20 · A · GAP · The Schema Object's OpenAPI keywords and unknown keywords

**Evidence (READ).**

- Case G2 has `"x-schema": 1, "unknownKeyword": 2`.
- §4.24.2 lists `xml`, `externalDocs` and `example`.
- §4.24.1 says the Schema Object "supports keywords from any other vocabularies, or entirely arbitrary properties".
- `Shape` has no slot for any of these.

**Correction.** Put annotations on every shape node, including `{ keyword, value: Json }` for each keyword the dialect does not define. This is where the open question on `said` lands.

### N21 · A, B · GAP · The pinned schemas are narrower than the text

**Evidence (RUN, Hyperjump 1.18.1, pinned 3.2 schema).**

- A callback with `"x-foo": 1` is INVALID; with `"x-foo": {}` it is VALID. The schema's `additionalProperties` applies to `x-` keys, because the `^x-` pattern sits in another schema object reached by `$ref`.
- A link with `parameters: { "id": 5 }` is INVALID.

The text allows both:

- §4.18.1 says "This object MAY be extended with Specification Extensions".
- §4.20.1 types link parameters as `Any | {expression}`.
- §4 says "If the JSON Schema differs from this section, then this section MUST be considered authoritative".

**Correction.** Requirement 1 is checked against the text. Add both facts to the hand list.

### N22 · D, E · GAP · A media type with no schema

**Evidence (READ).** §4.14.7 says "Content transferred in binary (octet-stream) MAY omit `schema`". OT-083 reads a missing schema as content that is unconstrained or binary, which `schema: {}` does not say. This verdict rests on §4.14.7 alone; no other sentence of the text compares the two.

**Correction.** Make `shape?` optional, with absent kept apart from `every`. The TypeScript writer may write `unknown` for both.

### Sound: I tried to break these and could not

| #   | What holds                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------ |
| S1  | `Method` as an exact token holds `query`, `PURGE`, and an `additionalOperations` key `get` as a method other than `GET`. |
| S2  | Response keys hold F4: exact, five ranges, "every other".                                                                |
| S3  | The five parameter locations hold, including `querystring` with `content` only (F9).                                     |
| S4  | The Reference Object edge `{ to, summary?, description? }` holds A12's override. The ignored siblings still need N16.    |
| S5  | A path item's `$ref` siblings, marked undefined, hold A3 and OT-038.                                                     |
| S6  | Operation-level security: absent, `[]`, `[{}]` and AND within OR are four facts (G4).                                    |
| S7  | A cycle is an edge (OT-024).                                                                                             |
| S8  | Resolving by base gives F.1's result: a fragment inside `Foo` cannot reach `#/components/schemas/Bar`.                   |
| S9  | A15's resource carries its own dialect, so Draft-07 siblings of `$ref` state nothing.                                    |
| S10 | Exact numbers hold "1 and 1.0 are the same value" (OT-116).                                                              |

## A. Field coverage

The fields were extracted by script. 3.2 has 30 objects with about 176 field and pattern slots, plus extensions on 27 of them. 3.1 has about 154 slots.

"Held" covers 42 slots (24%):

- the root's `components` and its 11 tables;
- the Reference Object's 3 fields and the path item's `$ref`;
- the 9 method fields, `additionalOperations` and the keys of `paths`;
- `in`, `schema` and `content` on a parameter;
- a request body's `content`;
- the keys of `responses`;
- `schema`, `itemSchema` and the keys of `encoding` on a media type;
- `operationId`;
- the name-edges: a tag's `parent`, the keys of a requirement, a discriminator's `mapping`, and a link's `operationRef` and `operationId`.

"Partly held" covers 15 slots:

- an operation's `tags`, `summary`, `description`, `deprecated`, `parameters`, `requestBody`, `responses`, `callbacks`, `security` and `servers`;
- a parameter's `style`, `explode` and `allowReserved`, as "serialisation";
- the keys of `content`, since `MediaType` is undefined;
- a schema's `discriminator`.

That leaves 119 slots with no element. The table lists each of them.

| Object (3.1 difference)                                                 | Fields with no element                                                                                                                                                          | Element the model needs                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OpenAPI Object (3.1: no `$self`)                                        | `openapi`, `$self`, `info`, `jsonSchemaDialect`, `servers`, `paths` as a map (empty or absent), `webhooks`, `security`, `tags`, `externalDocs`, `x-`                            | `Document { identity, info, servers?, paths?, webhooks?, security?, tags (ordered), externalDocs?, dialectDefault?, extensions }`; the version and the base source go in the record (N18)                                                                |
| Info                                                                    | `title`, `summary`, `description`, `termsOfService`, `contact`, `license`, `version`, `x-`                                                                                      | `Info { title; summary?; description?: Markdown; termsOfService?: Uri; contact?; license?; version; extensions }`                                                                                                                                        |
| Contact                                                                 | `name`, `url`, `email`, `x-`                                                                                                                                                    | `Contact { name?; url?: Uri; email?: Mailbox; extensions }`                                                                                                                                                                                              |
| License                                                                 | `name`, `identifier`, `url`, `x-`                                                                                                                                               | `License { name; ref?: { spdx: SpdxExpression } \| { url: Uri }; extensions }` (the text makes the two exclusive)                                                                                                                                        |
| Server (3.1: no `name`)                                                 | `url`, `description`, `name`, `variables`, `x-`                                                                                                                                 | `Server { url: ServerUrlTemplate; description?; name?; variables: Map<VarName, ServerVariable>; extensions }`                                                                                                                                            |
| Server Variable                                                         | `enum`, `default`, `description`, `x-`                                                                                                                                          | `ServerVariable { default; enum?: NonEmpty<string>; description?; extensions }`                                                                                                                                                                          |
| Components                                                              | `x-` (the 11 tables are held)                                                                                                                                                   | a node that carries the extensions of `components` (G3)                                                                                                                                                                                                  |
| Paths                                                                   | the map as a node (empty against absent), `x-`                                                                                                                                  | `Paths { entries: Map<PathTemplate, PathItem \| Edge>; extensions }` (N1)                                                                                                                                                                                |
| Path Item (3.1: no `query`, `additionalOperations`)                     | `summary`, `description`, `servers`, `parameters` at this level, the item as a node, `x-`                                                                                       | `PathItem`, a kind of definition (N1)                                                                                                                                                                                                                    |
| Operation                                                               | `externalDocs`, `x-`; the other ten fields only partly held (`tags` has an edge but no field on `Boundary`)                                                                     | `Operation`, a kind of definition: `{ tags: Edge[] (ordered), summary?, description?, externalDocs?, operationId?, parameters, requestBody?, responses, callbacks, deprecated, security?, servers?, extensions }`                                        |
| External Documentation                                                  | `description`, `url`, `x-`                                                                                                                                                      | `ExternalDocs { url: Uri; description?; extensions }`, at the document, a tag, an operation and a schema                                                                                                                                                 |
| Parameter (3.1: no `querystring`; `allowReserved` on `query` only)      | `name` as a datum of identity, `description`, `required`, `deprecated`, `allowEmptyValue`, `example`, `examples`, `x-`; `style`, `explode` and `allowReserved` only partly held | `Parameter { name: ParamName (folded for header); location; required; deprecated; description?; allowEmptyValue? (query); by: { shape; style: Style; explode; allowReserved } \| { content: [MediaRange, MediaType \| Edge] }; examples; extensions }`   |
| Request Body                                                            | `description`, `required`, `x-`                                                                                                                                                 | `RequestBody { description?; required; content: Map<MediaRange, MediaType \| Edge>; extensions }`                                                                                                                                                        |
| Media Type (3.1: `schema`, `encoding`, examples only)                   | `prefixEncoding`, `itemEncoding`, `example`, `examples`, `x-`; `schema` being absent                                                                                            | `MediaType { shape?; itemShape?; encoding: ByName \| ByPosition{ prefix: Encoding[]; rest?: Encoding } \| none; examples; extensions }`                                                                                                                  |
| Encoding (3.1: no nesting)                                              | `contentType`, `headers`, `style`, `explode`, `allowReserved`, `encoding`, `prefixEncoding`, `itemEncoding`, `x-`                                                               | `Encoding { mode: { byContentType: MediaRange[] \| derived } \| { byStyle: { style; explode; allowReserved } }; headers: Map<HeaderName, Header \| Edge>; nested; extensions }` (N4)                                                                     |
| Responses                                                               | `x-`                                                                                                                                                                            | `Responses { entries: Map<ResponseKey, Response \| Edge>; extensions }`                                                                                                                                                                                  |
| Response (3.1: no `summary`; `description` required)                    | `summary`, `description`, `headers`, `content`, `links`, `x-`                                                                                                                   | `Response { summary?; description?; headers: Map<HeaderName, Header \| Edge>; content: Map<MediaRange, MediaType \| Edge>; links: Map<Name, Link \| Edge>; extensions }`                                                                                 |
| Callback                                                                | the keys, `x-`                                                                                                                                                                  | `Callback { entries: Map<Template, PathItem \| Edge>; extensions }` (N11, N21)                                                                                                                                                                           |
| Example (3.1: `summary`, `description`, `value`, `externalValue`)       | all six fields and `x-`                                                                                                                                                         | `Example { summary?; description?; data?: Json; serialized?: { text } \| { external: Uri }; value?: Json (serialised, behaving as data for JSON targets, §4.19.2.1); extensions }`                                                                       |
| Link                                                                    | `parameters`, `requestBody`, `description`, `server`, `x-` (the target is held as an edge)                                                                                      | `Link { target: Edge; parameters: [Edge to a parameter, LinkValue][]; body?: LinkValue; description?; server?: Server; extensions }` (N11)                                                                                                               |
| Header                                                                  | all nine fields and `x-`                                                                                                                                                        | `Header`: a parameter with no name or location, its style always `simple` (OT-104)                                                                                                                                                                       |
| Tag (3.1: `name`, `description`, `externalDocs`)                        | the declaration with `name`, `summary`, `description`, `externalDocs`, `kind`, `x-` (`parent` is held as an edge)                                                               | `TagDeclaration { name; summary?; description?; externalDocs?; parent?: Edge; kind?; extensions }`, ordered; `Table` gains `tag`                                                                                                                         |
| Reference Object                                                        | none                                                                                                                                                                            | (held)                                                                                                                                                                                                                                                   |
| Schema Object, OpenAPI keywords                                         | `xml`, `externalDocs`, `example`; `discriminator` only partly held; unknown keywords                                                                                            | annotation slots on `Shape` (N20)                                                                                                                                                                                                                        |
| Discriminator (3.1: no `defaultMapping`)                                | `propertyName`, `defaultMapping`, `x-`                                                                                                                                          | N19                                                                                                                                                                                                                                                      |
| XML (3.1: `attribute` and `wrapped`, not deprecated; `namespace` a URI) | `nodeType`, `name`, `namespace`, `prefix`, `attribute`, `wrapped`, `x-`                                                                                                         | `Xml { node: 'element' \| 'attribute' \| 'text' \| 'cdata' \| 'none'; name?; namespace?: Iri; prefix?; extensions }`, with defaults resolved (N4); 3.1's `attribute` and `wrapped` read into `node`                                                      |
| Security Scheme (3.1: no `deprecated`, `oauth2MetadataUrl`)             | all ten fields and `x-`                                                                                                                                                         | a closed union by kind: `apiKey{ name; in: query \| header \| cookie }`, `http{ scheme: AuthScheme; bearerFormat? }`, `mutualTLS`, `oauth2{ flows; metadataUrl?: Uri }`, `openIdConnect{ url: Uri }`; each with `description?`, `deprecated`, extensions |
| OAuth Flows (3.1: no `deviceAuthorization`)                             | the five flows, `x-`                                                                                                                                                            | `Flows { implicit?; password?; clientCredentials?; authorizationCode?; deviceAuthorization?; extensions }`                                                                                                                                               |
| OAuth Flow                                                              | `authorizationUrl`, `deviceAuthorizationUrl`, `tokenUrl`, `refreshUrl`, `scopes`, `x-`                                                                                          | a `Flow` by kind with `Uri` fields and `scopes: Map<Scope, description>`                                                                                                                                                                                 |
| Security Requirement                                                    | the values (scopes or roles)                                                                                                                                                    | N14                                                                                                                                                                                                                                                      |
| Specification Extensions                                                | they stand on every object above that has no node                                                                                                                               | `{ name, value: Json }` on each new node; none on a Reference Object (§4.23.1)                                                                                                                                                                           |

What `x-` means inside each map was derived from the schemas and checked against the text:

- `x-` is an extension in: Paths, Responses, a Callback (by the text, against the schema; N21), Components, and every fixed-field object.
- `x-` is a name in: the eleven component tables, `webhooks`, an operation's `callbacks`, `headers`, `links`, `examples`, server `variables`, `encoding`, a requirement, `mapping`, `scopes`, `additionalOperations` (a method `x-a`), and link `parameters`.
- `content`: `x-a` is a media type, which is invalid, so the reader rejects it.

## B. The hand list

All 110 in-scope rows were checked; the 9 grammar rows feed section F.

28 rows are held and are not listed: OT-004, 005, 008, 015, 016, 020, 024, 029, 034, 038, 042, 047, 055, 071, 074, 075, 076, 082, 092, 093, 108, 109, 115, 116, 117, 118, 120, 122. The other 82 have no element or a doubtful one:

| Key    | Disp.     | What is needed                                                                                                                 |
| ------ | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| OT-001 | reading   | The record holds the source format and its major.minor.                                                                        |
| OT-002 | holds     | The deprecated fields need elements: XML `attribute` and `wrapped`, and the Schema `example` (section A).                      |
| OT-003 | holds     | A status fact (N16).                                                                                                           |
| OT-006 | reading   | Case-folded data types for HTTP concepts (N12).                                                                                |
| OT-009 | holds     | The document's identity from `$self` (N18). `ResourceId` is undefined.                                                         |
| OT-010 | default   | Root `Server[]`: the value `[{url: "/"}]`, with the record "absent" or "stated empty" (N15).                                   |
| OT-011 | holds     | Security at the document level (N14).                                                                                          |
| OT-012 | holds     | Ordered tag declarations; an edge to an undeclared tag (N8).                                                                   |
| OT-013 | holds     | A webhook keyed by a name (N1).                                                                                                |
| OT-014 | holds     | Documents and the entry document; only the entry document's paths count (N18).                                                 |
| OT-017 | holds     | Two data types: `Uri` (resolved against the document's base) and `ApiUrl` (resolved against a server).                         |
| OT-018 | reading   | The base source and the retrieval URI in the record (N18).                                                                     |
| OT-019 | reading   | The same, for 3.1.                                                                                                             |
| OT-021 | reading   | An edge records the document it was written in and the rule that resolved it (N8).                                             |
| OT-022 | undefined | The resolution of a name as "implementation-defined", with the rule chosen (N8, N16).                                          |
| OT-023 | undefined | One place read as two kinds (N17).                                                                                             |
| OT-026 | reading   | A server URL kept relative, with the retrieval URI in the record; `$self` ignored for API URLs (§4.5.2.1).                     |
| OT-028 | holds     | `ServerVariable.enum` (section A).                                                                                             |
| OT-032 | holds     | An empty Paths Object and an empty path item (N1, section E).                                                                  |
| OT-033 | reading   | Binding per (path, operation), possibly absent (N3).                                                                           |
| OT-039 | reading   | `PathItem.summary` and `description` (N1).                                                                                     |
| OT-040 | holds     | Parameters on the path item and on the operation; identity is (name, location) with the header name folded (N1, N12).          |
| OT-041 | reading   | Servers at three levels and the rule for which applies (N15).                                                                  |
| OT-043 | holds     | One `operationId` for two operations (N2).                                                                                     |
| OT-044 | default   | A `deprecated` field on the operation, parameter, header and security scheme: `false`, with the record.                        |
| OT-045 | undefined | Status on a request body for a method with no defined content (N16).                                                           |
| OT-046 | reading   | Security at the document level (N14).                                                                                          |
| OT-049 | reading   | `ParamName`'s case rule by location (N12).                                                                                     |
| OT-050 | reading   | Status "ignored" on header parameters named `Accept`, `Content-Type` or `Authorization` (N16).                                 |
| OT-051 | undefined | Status "undefined" on a header parameter named `Cookie` (N16).                                                                 |
| OT-053 | default   | `Parameter.required`: `false` with the record; for a path parameter it is stated `true`.                                       |
| OT-054 | holds     | `allowEmptyValue` on a query parameter, `false` by default, and "ignored" where the style cannot serialise.                    |
| OT-057 | default   | `style`: a constant default by location.                                                                                       |
| OT-058 | default   | `explode`: a chained default from `style` (N4).                                                                                |
| OT-059 | holds     | `explode` is held as stated, and "no effect" is a status. It is not merged, because "primitive" is decided by inspection (N5). |
| OT-060 | undefined | Status for `explode: false` with `deepObject` in 3.1.                                                                          |
| OT-062 | holds     | `allowReserved`, `false` by default, with its applicability by version.                                                        |
| OT-063 | reading   | An `examples` element, plus the rule that it overrides the schema's `example` (3.1).                                           |
| OT-064 | holds     | `Style` as a closed set, each value with its permitted types and locations.                                                    |
| OT-066 | undefined | Status for an "n/a" combination; it needs the derived type (N5).                                                               |
| OT-068 | undefined | Status for `deepObject` with a nested value.                                                                                   |
| OT-070 | reading   | The serialised `Example` element (section A).                                                                                  |
| OT-072 | reading   | `MediaRange` and an order of specificity (N12).                                                                                |
| OT-073 | default   | `RequestBody.required`: `false` with the record.                                                                               |
| OT-077 | holds     | An encoding's edge to a property may be unresolved (N8). It applies to each item of an array property.                         |
| OT-078 | reading   | An `ignored` edge (N8).                                                                                                        |
| OT-080 | reading   | Status "ignored" on an encoding outside a request body or a form media type (3.1).                                             |
| OT-081 | holds     | `ByPosition` encoding (section A).                                                                                             |
| OT-083 | holds     | A missing media-type shape is kept apart (N22).                                                                                |
| OT-084 | default   | `contentType` is a derived default, sometimes undetermined (N4, N5).                                                           |
| OT-086 | reading   | Status "ignored" on `Content-Type` in an encoding's headers, and on headers outside multipart.                                 |
| OT-087 | reading   | The encoding mode, chosen by presence (N4).                                                                                    |
| OT-089 | holds     | Nested encodings (section A).                                                                                                  |
| OT-091 | reading   | Precedence of `contentType` over `contentMediaType`, and `contentEncoding` read as a header.                                   |
| OT-095 | reading   | Status "ignored" on a response header `Content-Type`; `HeaderName` folded (N12, N16).                                          |
| OT-097 | holds     | `Example.data`, `serialized` and `value` (section A).                                                                          |
| OT-098 | default   | `externalValue` assumed UTF-8 where nothing says otherwise. This is a constant default on the Example.                         |
| OT-099 | holds     | Link target edge to an `Operation` (N2).                                                                                       |
| OT-102 | holds     | `RuntimeExpression` with its case rules (N11).                                                                                 |
| OT-104 | holds     | A `Header` element (section A).                                                                                                |
| OT-105 | default   | A `Header` element: `required` false, `style` simple, `explode` false, each with the record.                                   |
| OT-107 | holds     | The `Example` element for `Set-Cookie`.                                                                                        |
| OT-110 | holds     | `TagDeclaration` with `kind` (section A).                                                                                      |
| OT-112 | reading   | The edge is held; the ignored siblings need a status (N16).                                                                    |
| OT-113 | reading   | The document's stated `jsonSchemaDialect`, as a value with the record (N18).                                                   |
| OT-114 | holds     | Unknown keywords on `Shape` (N20).                                                                                             |
| OT-119 | holds     | Annotations on any shape (N9).                                                                                                 |
| OT-121 | holds     | Annotations on each `values` branch, so a reader can see an enumeration.                                                       |
| OT-123 | reading   | A mapping edge with `written` and its resolution; implicit values from component names (N8, N19).                              |
| OT-124 | holds     | A discriminator on a parent, with children by reverse edges (N19).                                                             |
| OT-125 | holds     | `Discriminator.otherwise` (N19).                                                                                               |
| OT-126 | undefined | Status for a missing discriminating property (3.1).                                                                            |
| OT-128 | undefined | Status for a mapping key against a value that is not a string, and for undescribed arrangements.                               |
| OT-129 | default   | `Xml.node`, a derived default (N4, N5).                                                                                        |
| OT-130 | default   | `Xml.name` from the component or property name, a derived default; a name required where none can be inferred.                 |
| OT-131 | undefined | Status for XML node order.                                                                                                     |
| OT-132 | holds     | An `Xml` element (section A).                                                                                                  |
| OT-135 | reading   | `AuthScheme` folded (N12).                                                                                                     |
| OT-136 | reading   | A requirement key's `written` as a name or a URI, and its resolution (N8).                                                     |
| OT-137 | holds     | `Requirement.scopes` as scopes or roles (N14).                                                                                 |
| OT-139 | holds     | Extensions on nodes that the outline does not yet have (section A).                                                            |
| OT-141 | undefined | Status for converting a typed value to text.                                                                                   |

**Rows the hand list lacks (READ):**

- An empty `content` on a request body is implementation-defined (§4.13.1, both versions).
- A security scheme's `deprecated` defaults to `false` (§4.27.1).
- The ambiguity of `path.id` in link parameter keys, and the rule to prefer the qualified reading (§4.20.1).
- A constant link parameter never matches the grammar of an expression (§4.20.1).
- `$request.path.x` must be declared by the parent operation (§4.20.3.1).
- The shorthand `example` behaves as an Example Object with only `value` (§4.19.2).
- A child's overriding value for the discriminating property takes precedence over the schema name (§4.24.6.1).
- An empty `servers` list below the root is not defined by the text.
- Paths that differ only in their expression names "are identical" and "MUST NOT exist" (§4.8.1).
- The two places where the schema is narrower than the text (N21).

## C. References and names

Each row answers: can the proposal state this without keeping OpenAPI's spelling, and what is missing?

| Case                                        | States it without the spelling? | What is missing                                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1, A2                                      | Yes, as edges into tables       | Each slot must be `Part \| Edge` (parameters, responses, body, headers, links, examples, callbacks, media types). A component whose body is itself a Reference Object needs a definition that is an edge.                  |
| A3, A12                                     | Yes (three kinds of edge)       | Make the three kinds a closed union. The ignored siblings need a status (N16).                                                                                                                                             |
| A7, other document                          | Partly                          | `ResourceId` (N13). The entry document (N18).                                                                                                                                                                              |
| A8, A18, undeclared tag, `parent`           | No                              | Edges with no target (N8). `Table` has no `tag`. A link key is an edge to a parameter of the target operation, including the path item's (§4.20.2: `userid` is declared on the path item).                                 |
| A9, mapping as name or URI                  | Partly                          | `written` and the resolution (N8). The discriminator's structure (N19).                                                                                                                                                    |
| A10                                         | Yes                             | none                                                                                                                                                                                                                       |
| A11                                         | No                              | N7                                                                                                                                                                                                                         |
| A13, a place with no name                   | No                              | `Step` (N13). Targets that the canonical rules remove (N6).                                                                                                                                                                |
| A14, shared path item                       | No                              | N1, N2, N3                                                                                                                                                                                                                 |
| A15, own resource and dialect               | Partly                          | Two identities for one definition (N7). The dialect is held.                                                                                                                                                               |
| A16                                         | No                              | N19                                                                                                                                                                                                                        |
| A17, entry against current document         | No                              | N8, N18                                                                                                                                                                                                                    |
| A19                                         | No                              | N17                                                                                                                                                                                                                        |
| `$self` and the base URI                    | Partly                          | The base source in the record. References that use a non-`$self` URI get the status "not interoperable" (§4.1.1). The stated relative `$self` is kept, since §F.5 relies on it to deploy one description to several hosts. |
| A component referenced through its base URI | Yes, once N7 holds              | F.1 requires the `$id` form. The form used goes in the record.                                                                                                                                                             |
| A requirement key as a name or a URI        | Partly                          | N8. 3.1 has names only (3.1.2 §4.3.3: "no URI-based alternatives for the Security Requirement Object"), so a URI key to another document is unexpressible in 3.1.                                                          |
| `operationRef` against `operationId`        | Partly                          | Both are edges to an `Operation` (N2). They are one value when both resolve to the same operation; the form goes in the record.                                                                                            |
| Link `parameters` keys and values           | No                              | N11                                                                                                                                                                                                                        |

## D. The boundary outline

| Construct                                                                   | What the model must hold                                                           | Outline                                 |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| A path with no operation                                                    | The path item as a node                                                            | No (N1)                                 |
| Parameters on the path item and on the operation                            | Both levels, identity (name, location), the override rule                          | No (N1, N3)                             |
| The five locations                                                          | A closed set                                                                       | Yes (S3)                                |
| A schema with a style, against `content`                                    | A union of the two                                                                 | Yes, as words; no structure (section A) |
| `style`, `explode`, `allowReserved`, `allowEmptyValue`                      | A closed `Style`; booleans; the table of permitted combinations; "n/a" as a status | No                                      |
| Defaults: `style` by location, `explode` by style, `required`, `deprecated` | Constant and chained defaults with the record                                      | Rule given, kinds missing (N4)          |
| Headers the text ignores                                                    | A status                                                                           | No (N16)                                |
| Response keys and precedence                                                | Exact code, five ranges, `default`                                                 | Yes (S2)                                |
| Media-type keys, ranges, "most specific applies"                            | `MediaRange` and an order                                                          | Partly (N12)                            |
| `encoding`, `prefixEncoding`, `itemEncoding`, `itemSchema`                  | ByName, ByPosition, the mode, the item shape                                       | Partly: ByName and `itemSchema` only    |
| A request body's `required`                                                 | A boolean with the record                                                          | No                                      |
| Callbacks                                                                   | Name, then a template of literals and expressions, then a path item; `x-` keys     | No (N1, N11)                            |
| Webhooks                                                                    | Map from a name to a path item                                                     | No (N1)                                 |
| Servers at three levels                                                     | `Server`, `ServerVariable`, the replacement rule, empty lists                      | Partly: the operation only (N15)        |
| Security at two levels                                                      | `[]`, `[{}]`, AND within OR, scopes                                                | The operation only (N14)                |
| `additionalOperations` and `query`                                          | `Method` as an exact token                                                         | Yes (S1)                                |
| Examples                                                                    | `data`, `serialized`, `external`, `value`                                          | No                                      |
| Links                                                                       | Target edge, parameter edges, `LinkValue`s, server                                 | Target only                             |
| XML Object with `nodeType`                                                  | `Xml` with resolved defaults                                                       | No (N4, N5)                             |
| `externalDocs`                                                              | At four places                                                                     | No                                      |
| `info` and its parts                                                        | `Info`, `Contact`, `License`                                                       | No                                      |
| `jsonSchemaDialect`                                                         | The stated default per document                                                    | Partly (N18)                            |
| Extensions and `x-` keys that are names                                     | Nodes for every object; names decided by the map they stand in                     | Rule given, nodes missing (section A)   |

## E. One value

### The OpenAPI equivalence sets in section I

| Set                                                             | Canonical value under the proposal's rule                                                                          | Record                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Root `servers`: absent, `[]`, `[{url: "/"}]`                    | `[{ url: ["/"], variables: {} }]`                                                                                  | "text default", "stated empty, text default", "stated"                        |
| A query parameter with and without `style: form, explode: true` | `{ style: form, explode: true, allowReserved: false, allowEmptyValue: false, required: false, deprecated: false }` | Constant default for `style`; chained default for `explode`                   |
| A discriminator with and without the implicit mapping           | The resolved case table, for example `{ "Cat" → Cat }`                                                             | `source: component-name` or `mapping`; one value only once resolved (N8, N19) |
| A header name in two cases                                      | `x-rate`                                                                                                           | spelling `X-Rate` (N12)                                                       |

### Pairs to keep apart, or to merge (READ, with my verdict)

| Pair                                                                                                  | Verdict                                                                                                  | Proposal                                                                                                                                         |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Encoding `{}` against `{style: form, explode: true}` or `{allowReserved: false}`                      | Two values (mode)                                                                                        | Wrongly merged (N4)                                                                                                                              |
| Encoding `{explode: true}` against `{style: form, explode: true}`                                     | One value                                                                                                | Merged correctly if the mode is held                                                                                                             |
| `paths: {}` against no `paths`; `/empty: {}` against no key                                           | Two values (§4.8, OT-032)                                                                                | Wrongly merged (N1)                                                                                                                              |
| `servers: []` against absent, below the root                                                          | Two values; the text is silent                                                                           | Cannot hold it (N15)                                                                                                                             |
| A media type with no `schema` against `schema: {}`                                                    | Two values (§4.14.7)                                                                                     | Not stated (N22)                                                                                                                                 |
| `schema: true` against `schema: {}`                                                                   | One value                                                                                                | Merged (rule 6)                                                                                                                                  |
| `anyOf: [{type: string}]` against `type: string`, in an encoded part                                  | The shapes are one value (rule 1 stands). The encoding differs: its resolved `contentType` is held on it | Needs N4 and N5; the rules do not change                                                                                                         |
| `allOf: [$ref]` against `$ref`, beside `xml`                                                          | The shapes are one value. The XML Object differs: its resolved `nodeType` is held on it                  | Needs N4 and N5; the rules do not change                                                                                                         |
| A Reference Object with `description` against a schema `$ref` with `description` (A12)                | Two values: one overrides the target's description, the other stands beside it                           | Kept apart (S4)                                                                                                                                  |
| `x-a` under `components` against `x-a` under `components.schemas` (G3)                                | Two values: an extension against a schema named `x-a`                                                    | Kept apart, once Components has a node (section A)                                                                                               |
| Operation `security` absent, `[]` and `[{}]` (G4)                                                     | Three values                                                                                             | Kept apart (S6)                                                                                                                                  |
| `required: false` stated against absent; `deprecated: false`; `explode` at its default on a parameter | One value each                                                                                           | Merged correctly                                                                                                                                 |
| `parameters: []`, `tags: []`, `callbacks: {}`, `links: {}`, `headers: {}` against absent              | One value each                                                                                           | Merged, if lists                                                                                                                                 |
| Request body `content: {}`                                                                            | Its own status (implementation-defined, §4.13.1)                                                         | No element                                                                                                                                       |
| Response `description: ""` against absent (3.2)                                                       | Two values; `description` has no default                                                                 | Kept apart, if `said` holds it. A 3.1 writer must state one (required in 3.1), and that changes the value on read-back: the profile must say so. |
| Operation `security` absent against stated equal to the document's                                    | Two values: where a thing is stated is meaning (G1)                                                      | Kept apart                                                                                                                                       |
| Root `security` absent against `[]`                                                                   | One value: nothing is required                                                                           | Not stated (N14)                                                                                                                                 |
| Scopes `["a", "b"]` against `["b", "a"]`; alternatives in another order                               | One value (AND and OR have no order)                                                                     | `Requirement[][]` keeps the order: state that it is a set                                                                                        |
| Tag declarations in another order                                                                     | Two values (§4.1.1: the order "can be used")                                                             | Kept apart, if ordered                                                                                                                           |
| `readOnly: false` against absent                                                                      | One value (§9.4)                                                                                         | Not stated (N9)                                                                                                                                  |
| `xml` absent against `xml: {}`                                                                        | One value (§4.26: defaults apply)                                                                        | Needs N4                                                                                                                                         |
| `operationRef` against `operationId` to one operation                                                 | One value; the form goes in the record                                                                   | Not stated                                                                                                                                       |
| `X-Trace` on the path item against `x-trace` on the operation                                         | One parameter identity: the override applies                                                             | Wrong if names are compared exactly (N12)                                                                                                        |
| `Application/JSON` against `application/json` as keys                                                 | One key: a located rejection if both appear                                                              | Kept apart if a string (N12)                                                                                                                     |
| Method `get` (in `additionalOperations`) against the `get` field                                      | Two methods (case-sensitive)                                                                             | Kept apart (S1)                                                                                                                                  |

## F. Grammars (requirement 6)

This list comes from every `format` and `pattern` in both schemas and both meta-schemas, from the five ABNF blocks of 3.2.1, and from every "MUST be in the form of" in both texts.

| String                                                                                      | Specification, section                                                                 | Proposal                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `openapi`                                                                                   | OAS §2.1; pattern `^3\.2\.[0-9]+`                                                      | Text: belongs in the record                                                                                                                                              |
| `$self`                                                                                     | URI reference with no fragment, RFC 3986 §4.1 (§4.1.1)                                 | Undefined `ResourceId`                                                                                                                                                   |
| `jsonSchemaDialect`, `$schema`                                                              | URI (§4.1.1, §4.24.7)                                                                  | Partly: as a dialect                                                                                                                                                     |
| `termsOfService`, `contact.url`, `license.url`, `externalDocs.url`, `example.externalValue` | URI, relative allowed (§4.1.2.2)                                                       | Text: no element                                                                                                                                                         |
| `contact.email`                                                                             | email address (§4.3.1; JSON Schema `email`, memory: RFC 5321)                          | Text                                                                                                                                                                     |
| `license.identifier`                                                                        | SPDX license expression (§4.4.1; grammar in the SPDX specification, memory)            | Text                                                                                                                                                                     |
| server `url`                                                                                | `server-url-template` ABNF (3.2 §4.6); braces only in 3.1 (§4.6)                       | Text: needs `ServerUrlTemplate`                                                                                                                                          |
| Server variable name                                                                        | `server-variable-name` ABNF (§4.6)                                                     | Text: needs an edge from the template                                                                                                                                    |
| Component keys, link names                                                                  | `^[a-zA-Z0-9.\-_]+$` (§4.7.1, §4.17.1)                                                 | Held as a name, which is correct                                                                                                                                         |
| `paths` keys                                                                                | `path-template` ABNF (3.2 §4.8.2)                                                      | Data. The literal parts must say whether percent-encoded unreserved characters are normalised (RFC 3986 §6.2.2.2, memory), because B.4 keys by "the template's own text" |
| Path parameter `name`                                                                       | `^[^{}]+$`, matching one expression (§4.12.2.1)                                        | A name                                                                                                                                                                   |
| `additionalOperations` keys                                                                 | method token, RFC 9110 `1*tchar`                                                       | Data (S1)                                                                                                                                                                |
| Header parameter `name`; `headers` keys of a response and of an encoding                    | field-name token, RFC 9110 §5.1, §5.6.2, case-insensitive                              | Text (N12)                                                                                                                                                               |
| `in`, `style`, `type` of a security scheme, apiKey `in`, XML `nodeType`                     | Closed sets (§4.12.1, §4.12.3, §4.27.1, §4.26.1)                                       | `in` is data; the rest have no element                                                                                                                                   |
| `content` keys                                                                              | media-range, RFC 9110 (§4.13.1); schema format `media-range`                           | Partly (N12)                                                                                                                                                             |
| Encoding `contentType`                                                                      | `media-range *( "," OWS media-range )` ABNF (3.2 §4.15.1.1)                            | Text                                                                                                                                                                     |
| Response keys                                                                               | `default`, `[1-5][0-9]{2}`, `[1-5]XX` (§4.16.2)                                        | Data (S2)                                                                                                                                                                |
| Callback keys                                                                               | Runtime expression ABNF (§4.20.3) inside literal text (§4.18.2)                        | Text (N11)                                                                                                                                                               |
| Link `parameters` keys                                                                      | `[location "."] name` (§4.20.1)                                                        | Text (N11)                                                                                                                                                               |
| Link `parameters` values, `requestBody`                                                     | `Any \| {expression}` (§4.20.1, §4.20.3)                                               | Text (N11)                                                                                                                                                               |
| Runtime expression parts                                                                    | `token` (case-insensitive), `name` (case-sensitive), `json-pointer` RFC 6901 (§4.20.3) | Text (N11)                                                                                                                                                               |
| `operationRef`, Reference `$ref`, Path Item `$ref`                                          | URI reference; fragment as JSON Pointer RFC 6901 (§4.1.2.2.2, §4.20.2.1)               | Edge, once `Step` is defined (N13)                                                                                                                                       |
| Discriminator `mapping` values, `defaultMapping`                                            | Component name or URI reference, `./` for a URI (§4.25.3)                              | Edge, with `written` (N8)                                                                                                                                                |
| Requirement keys                                                                            | Component name or URI reference (3.2 §4.30)                                            | Edge, with `written` (N8)                                                                                                                                                |
| Security `scheme`                                                                           | auth-scheme, RFC 9110 §11.1 (§4.27.1), case-insensitive                                | Text (N12)                                                                                                                                                               |
| `openIdConnectUrl`, `oauth2MetadataUrl`, flow URLs                                          | URL, TLS (§4.27.1, §4.29.1); schema `uri-reference`                                    | Text                                                                                                                                                                     |
| OAuth scope names                                                                           | scope-token, RFC 6749 §3.3 (memory)                                                    | Text                                                                                                                                                                     |
| XML `namespace`                                                                             | non-relative IRI, RFC 3987 (3.2 §4.26.1); URI in 3.1                                   | Text                                                                                                                                                                     |
| XML `name`, `prefix`                                                                        | XML Name and NCName (memory; the text does not cite them)                              | Text                                                                                                                                                                     |
| `contentMediaType`                                                                          | media type, RFC 2046 / 9110                                                            | `MediaType` undefined                                                                                                                                                    |
| `contentEncoding`                                                                           | RFC 4648 and RFC 2045 encodings (JSON Schema validation §8.3, memory)                  | `encoding?: string`: text                                                                                                                                                |
| `pattern`                                                                                   | ECMA-262 regular expression                                                            | `Pattern.source`: text. A source string with flags is a fair datum; the JSON Schema reader decides                                                                       |
| A cookie value with `style: cookie` (OT-067)                                                | The Cookie syntax of RFC 6265 §4.2.1 (§4.12.3)                                         | A wire grammar: it governs the value sent, not a string in the document, so the model holds nothing for it                                                               |
| A schema's `$ref`, `$id`, `$anchor`, `$dynamicRef`, `$dynamicAnchor`, `$schema`             | JSON Schema 2020-12 core §8                                                            | Left to the JSON Schema reader                                                                                                                                           |
| `description` fields                                                                        | CommonMark 0.27 (§3.3)                                                                 | A string is the datum, which is correct                                                                                                                                  |
| `serializedValue`                                                                           | The serialised form of the media type or style                                         | A string is the datum, which is correct                                                                                                                                  |
| Extension names                                                                             | `^x-`; `x-oai-` and `x-oas-` reserved (§5)                                             | A name, which is correct                                                                                                                                                 |

Of the grammars listed, the proposal holds five as data:

- the path template;
- the method;
- the response key;
- the parameter location;
- an edge's target, once `Step` is defined.

## Counts and first changes

**Counts:**

- BREAKS: 9 (N1–N9)
- GAP: 10 (N10, N14–N22)
- LEAK: 3 (N11–N13)
- SOUND: 10 (S1–S10)

**The three changes I would make first:**

1. **Replace `Boundary` with a path-item layer.** `paths`, `webhooks` and callbacks are maps to `PathItem` definitions. `Operation` is a definition, named by its `operationId`. A boundary is derived as (address kind, operation edge). This cures N1–N3, the empty and shared path items, webhooks and callbacks.
2. **Define the edge and the place.** An edge carries what was written and a resolution state. A place is typed meaning-steps. A definition is keyed by (resource, place, kind), with names held as aliases. Every target of an edge is lifted to a definition before the canonical rules run. This cures N6–N8, N13 and N17.
3. **Split defaults into constant, chained, derived and mode.** Resolve every OpenAPI fact the text derives by inspecting schemas from the source spelling, before the canonical rules. Add a status fact and a spelling fact to the record. This cures N4, N5, N12's I7, N16, and the rows OT-084, 087, 129 and 130.
