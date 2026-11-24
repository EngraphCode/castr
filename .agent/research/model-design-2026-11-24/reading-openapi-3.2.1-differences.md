# OpenAPI 3.2.1 compared with 3.2.0

> **A reader's report, not a finding of this repository.** Commissioned on 24 November
> 2026 for the plan `.agent/plans/active/model-design.md` (M1, the texts), after review
> showed that the reading beside it, `reading-openapi-texts.md`, was made from 3.2.0
> where the specification names 3.2.1. It is one reader's account of the two texts, kept
> whole so that the reading can be checked. The seat has not yet checked its claims
> against the sources.

- Read: https://spec.openapis.org/oas/v3.2.1.html
- Compared with: https://spec.openapis.org/oas/v3.2.0.html (the text the earlier report "Reading the OpenAPI 3.2.0 and 3.1.2 texts" was made from)
- Date read: 2026-11-24

## Method and summary

Both pages were fetched to memory and reduced to text. I compared them section by section, aligning sections by number. Within each section, I compared the multiset of sentences, with every table row kept whole. Separately, I compared every code block exactly. Every quoted line in this file was then checked by program as an exact substring of the version it is tagged with. A line tagged `[3.2.0]` or `[3.2.1]` alone was also checked to be absent from the other version.

The extractor removes backticks and markup and makes curly quotes straight. Table rows are shown with `|` between cells.

The two texts have the same sections with the same numbers. The only retitle is 4.19.2.3, "Criteria for serializedExample" in 3.2.0, which becomes "Criteria for serializedValue". Revision history (Appendix A) dates 3.2.1 to 2026-09-10.

**Changed items in the earlier report: 11.**

- 5 table rows: 4.12.2, 4.12.5, 4.12.6, 4.14.5.1 and 4.24.1.
- 2 findings: Finding 2 is false of 3.2.1; Finding 4 gains one rule.
- 4 grammar entries: Encoding `contentType`, media type range in list A, media type range in list B, and the QUERY method.

Everything else holds unchanged for 3.2.1:

- Findings 1, 3 and 5 hold, along with every other row and every validity rule.
- Of the report's 132 table quotes taken from 3.2.0, 129 appear unchanged in 3.2.1; the three that do not are the ones listed in part 2.
- Section numbers are unchanged.

## 1. Sentence-by-sentence differences, by section

Each line is a sentence, or a whole table row, present in one version and absent from the other in that section.

**Front matter.** The title becomes "OpenAPI Specification v3.2.1". The date changes from "19 September 2025" to "10 September 2026", and the copyright year from 2025 to 2026.

**4.1.1 OpenAPI Object, `jsonSchemaDialect` row: one sentence added.**

> [3.2.1] See JSON Schema Keywords to determine the default value.

**4.6, 4.8.2 and 4.20.3.** The lead-in "defined by the following [ABNF] syntax" ends with ":" in 3.2.1. The three ABNF blocks themselves (server URL template, path template, runtime expression) are identical in both versions.

**4.8.2 Path Templating: two sentences added.**

> [3.2.1] This means that when matching templates to request URLs, no values that include a forward slash are matched.

> [3.2.1] For example, the template /foo/{bar} cannot match the URI path "/foo/alpha/beta" because the value of the template variable "bar" would have to be "alpha/beta".

**4.9.1 Path Item, `query` row**

> [3.2.0] A definition of a QUERY operation, as defined in the most recent IETF draft (draft-ietf-httpbis-safe-method-w-body-08 as of this writing) or its RFC successor, on this path.

> [3.2.1] A definition of a QUERY operation, as defined in [RFC10008], on this path.

**4.12.1 Parameter Locations**

> [3.2.0] query - Parameters that are appended to the URL.

> [3.2.0] For example, in /items?id=###, the query parameter is id;

> [3.2.1] query - Parameters that are appended to the URL with the ? character (or for subsequent query parameters, with the & character);

**4.12.2 Fixed Fields**

> [3.2.0] The rules for serialization of the parameter are specified in one of two ways.

> [3.2.1] The rules for serialization and deserialization of the parameter are specified in one of two ways.

**4.12.2.2 Fixed Fields for use with schema**

> [3.2.1] The Cookie header prohibits unencoded commas (see [RFC6265] Section 4.2.1 for the complete ABNF), therefore "explode": false is invalid with "in": "cookie" (both "style": "form" and "style": "cookie").

> [3.2.0] This field only applies to in and style values that automatically percent-encode.

> [3.2.1] This field only applies to in and style values that automatically percent-encode (that is: in: path, in: query, and in: cookie with style: form).

> [3.2.0] The schema defining the type used for the parameter.

> [3.2.1] The schema defining the type and other constraints used for the parameter.

**4.12.5 Serialization and Examples**

> [3.2.0] In cases where the name is an inherent part of constructing the serialization, such as the name=value pairs produced by style: "form" or the combination of style: "simple", explode: true, the name and any delimiter between the name and value MUST be included.

> [3.2.1] In cases where the parameter name is an inherent part of constructing the serialization, such as the name=value pairs produced by the combination of style: "form", explode: false, the name and any delimiter between the name and value MUST be included.

**4.12.6 Style Examples**

The list of example values gains a first line (in a code block):

> [3.2.1] undefined -> null

> [3.2.0] The following table shows serialized examples, as would be shown with the serializedValue field of an Example Object, of the different serializations for each value.

> [3.2.1] The following table shows serialized examples, as would be shown with the serializedValue field of an Example Object, of the different serializations for the value of each supported type.

Table rows that changed (columns: style, explode, undefined, string, array, object):

> [3.2.0] matrix | false | ;color | ;color=blue | ;color=blue,black,brown | ;color=R,100,G,200,B,150

> [3.2.1] matrix | false | empty | ;color=blue | ;color=blue,black,brown | ;color=R,100,G,200,B,150

> [3.2.0] matrix | true | ;color | ;color=blue | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150

> [3.2.1] matrix | true | empty | ;color=blue | ;color=blue;color=black;color=brown | ;R=100;G=200;B=150

> [3.2.0] label | false | . | .blue | .blue,black,brown | .R,100,G,200,B,150

> [3.2.1] label | false | empty | .blue | .blue,black,brown | .R,100,G,200,B,150

> [3.2.0] label | true | . | .blue | .blue.black.brown | .R=100.G=200.B=150

> [3.2.1] label | true | empty | .blue | .blue.black.brown | .R=100.G=200.B=150

> [3.2.0] cookie | false | color= | color=blue | color=blue,black,brown | color=R,100,G,200,B,150

> [3.2.1] cookie | false | color= | color=blue | n/a | n/a

**4.12.7.** A typo is fixed ("of of" becomes "of"). Nothing else changes.

**4.14.1 Media Type, `prefixEncoding` and `itemEncoding` rows.** In both rows, "for a property" becomes "for an item"; the `encoding` row keeps "property":

> [3.2.1] If no Encoding Object is provided for an item, the behavior is determined by the default values documented for the Encoding Object.

**4.14.5.1 Encoding By Name**

> [3.2.0] To use the encoding field, each key under the field MUST exist as a property; encoding entries with no corresponding property SHALL be ignored.

> [3.2.1] To use the encoding field, each key under the field MUST exist in the data instance as a property; encoding entries with no corresponding property SHALL be ignored.

> [3.2.0] Array properties MUST be handled by applying the given Encoding Object to produce one encoded value per array item, each with the same name, as is recommended by [RFC7578] Section 4.3 for supplying multiple values per form field.

> [3.2.1] When serializing, property values of the array type MUST be handled by applying the given Encoding Object to produce one encoded value per array item, each with the same name, as is recommended by [RFC7578] Section 4.3 for supplying multiple values per form field; when deserializing, the Encoding Object is applied to each item of the array property of the same name.

> [3.2.1] For deserialization to an object, multiple values with the same name MUST be collapsed into an array value for that named property, with one item per value, in order.

> [3.2.0] For all other value types for both top-level non-array properties and for values, including array values, within a top-level array, the Encoding Object MUST be applied to the entire value.

> [3.2.1] For all other value types for both top-level non-array property values and for other values, including items of the array type within a top-level array, the Encoding Object MUST be applied to the entire value.

> [3.2.0] The order of these name-value pairs in the target media type is implementation-defined.

> [3.2.1] The order of these name-value pairs in the target media type is implementation-defined when not explicitly defined by that media-type's specification.

> [3.2.0] For application/x-www-form-urlencoded, the encoding keys MUST map to parameter names, with the values produced according to the rules of the Encoding Object.

> [3.2.1] For application/x-www-form-urlencoded, the encoding keys MUST map to parameter names, with the serialized values produced according to the rules of the Encoding Object.

> [3.2.0] For multipart, the encoding keys MUST map to the name parameter of the Content-Disposition: form-data header of each part, as is defined for multipart/form-data in [RFC7578].

> [3.2.1] For multipart types that decode to an object, such as multipart/form-data, the encoding keys MUST map to the name parameter of the Content-Disposition: form-data header of each part, as is defined for multipart/form-data in [RFC7578].

**4.14.5.2 Encoding By Position**

> [3.2.0] To use the prefixEncoding and/or itemEncoding fields, either itemSchema or an array schema MUST be present.

> [3.2.1] For applications that wish to preserve part order, multipart/form-data content may also be modelled as an array, with one item per part, in order (where each item consists of an object containing the name/value pair); the schema SHALL be used to determine whether deserializing to an object or an array is preferred.

> [3.2.1] To use the prefixEncoding and/or itemEncoding fields, each item referenced by the field MUST exist in the data instance; prefixEncoding and itemEncoding entries with no corresponding item SHALL be ignored.

3.2.1 also adds a pointer: "See examples in Media Type Registry: Forms."

**4.14.5.3 Additional Encoding Approaches**

> [3.2.0] The prefixEncoding field can be used with any multipart content to require a fixed part order.

> [3.2.1] Usage of a schema indicating an array type (or itemSchema), can be used with any multipart content to produce a fixed part order.

> [3.2.0] This includes multipart/form-data, for which the Encoding Object's headers field MUST be used to provide the Content-Disposition and part name, as no property names exist to provide the names automatically.

> [3.2.1] This includes multipart/form-data, in which the property name of each item is used to populate the Content-Disposition headers with the part name.

**4.15.1.1 Encoding, Common Fixed Fields**

> [3.2.0] The value is a comma-separated list, each element of which is either a specific media type (e.g. image/png) or a wildcard media type (e.g. image/*).

> [3.2.1] The value is a comma-separated list, each element of which is either a specific media type (e.g. image/png) or a media type range (e.g. image/*).

> [3.2.1] The contentType field is defined by the following [ABNF] syntax:

> [3.2.1] Here, media-range and OWS are taken from [RFC9110].

New code block in 3.2.1, also checked as an exact substring:

```text
encoding-content-type = media-range *( "," OWS media-range )
```

**4.15.1.2 Encoding, RFC 6570-style fields.** "Property values" and "parameter values" become "values":

> [3.2.0] Describes how a specific property value will be serialized depending on its type.

> [3.2.1] Describes how a specific value will be serialized depending on its type.

> [3.2.0] When this is true, property values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map.

> [3.2.1] When this is true, values of type array or object generate separate parameters for each value of the array, or key-value-pair of the map.

> [3.2.1] When this is true, values are serialized using reserved expansion, as defined by [RFC6570] Section 3.2.3

**4.15.4, 4.15.4.2.** Typo fixes only: "multi-part/form-data" becomes "multipart/form-data", and "Object'scontentMediaType" becomes "Object's contentMediaType".

**4.15.4.7 and 4.15.4.9.** One sentence each is removed in 3.2.1; the 3.2.1 examples describe these headers with `schema` instead of `content`:

> [3.2.0] The Content-Location header is defined using content: {text/plain: {...}} to avoid percent-encoding its URI value; see Appendix D for further details.

> [3.2.0] See Appendix D for an explanation of why content: {text/plain: {...}} is used to describe the header value.

**4.16.2 Responses, Patterned Fields**

> [3.2.0] This field MUST be enclosed in quotation marks (for example, "200") for compatibility between JSON and YAML.

> [3.2.1] This field MUST be represented by a string (for example, "200" enclosed in quotes in YAML) for compatibility between JSON and YAML.

**4.19.1 Example Object, `externalValue` row**

> [3.2.0] Otherwise, the value SHOULD be the valid serialization of a data value that itself MUST be valid as described for dataValue.

> [3.2.1] Otherwise, the value SHOULD identify the valid serialization of a data value that itself MUST be valid as described for dataValue.

**4.24 Schema Object**

> [3.2.0] This object is a superset of the JSON Schema Specification Draft 2020-12.

> [3.2.1] By default, this object is a superset of the JSON Schema Specification Draft 2020-12.

**4.24.1 JSON Schema Keywords**

> [3.2.0] The OpenAPI Schema Object dialect for this version of the specification is identified by the URI https://spec.openapis.org/oas/3.1/dialect/base (the "OAS dialect schema id").

> [3.2.1] The default OpenAPI Schema Object dialect for this version of the specification (that is, the default for the $schema keyword in Schema Objects, and the jsonSchemaDialect keyword in the OpenAPI Description itself) is identified by the URI of the form https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD (the "OAS dialect schema id" – see the list of current schemas for the specific URI).

**4.24.4 Parsing and Serializing**

> [3.2.0] The application form, which incorporates any additional information conveyed by JSON Schema keywords such as format and contentType

> [3.2.1] The application form, which incorporates any additional information conveyed by JSON Schema keywords such as format and contentMediaType

**Appendix A.** A row is added for 3.2.1, dated 2026-09-10.

**C.1**

> [3.2.0] The latter is problematic because if foo is not defined, the result will be an invalid URI.

> [3.2.1] The latter is problematic because if foo is not defined (see RFC6570 §2.3 for details on what is considered undefined), the result will be an invalid URI.

**Appendix D.** A citation is corrected:

> [3.2.0] While the quoted-string ABNF rule given in [RFC9110] Section 5.4.6 is the most common escaping solution, it is not sufficiently universal to apply automatically.

> [3.2.1] While the quoted-string ABNF rule given in [RFC9110] Section 5.6.4 is the most common escaping solution, it is not sufficiently universal to apply automatically.

**D.1**

> [3.2.0] If automatic percent-encoding is desired, style: "form" with a primitive value or with the non-default explode value of false provides this behavior.

> [3.2.1] If automatic percent-encoding is desired, style: "form" with a primitive value provides this behavior (note that the non-default explode value of false produces cookie values containing a comma (,), which are invalid).

> [3.2.0] To allow the full use of style: "form" with in: "cookie", use the allowReserved field.

> [3.2.1] To allow the full use of style: "form" with in: "cookie", use the allowReserved field, taking care to still escape the characters that are invalid in the Cookie header (see [RFC6265] Section 4.2.1 for the complete ABNF).

**F.5.** An example address is corrected:

> [3.2.0] resulting in the first document's $self being https://staging.example.com/openapi,

> [3.2.1] resulting in the first document's $self being https://staging.example.com/api/openapi,

**H.1 Normative references.** 3.2.1 adds [RFC10008], "The HTTP QUERY Method", June 2026.

**Code blocks other than the new ABNF.** Every other differing block is an example fix and states no new rule:

- `openapi: 3.2.0` becomes `3.2.1`.
- Typos: `serializeValue` becomes `serializedValue`; `addJson` becomes `addJSON`; a truncated "GMT" and a missing JSON comma are fixed; the XML closing tags are fixed.
- The coordinates example gains named example values.
- The querystring example gains `name: metadata`.
- The SSE int64 data changes from "1234.5678" to "1234".
- The URL-encoded form example moves `encoding` under the media type.
- The multipart example gains an `alias` property of type `[string, array]` with `contentType: text/plain`. This illustrates the new deserialisation rule in 4.14.5.1.
- The multiple-files example gains `type: object`.
- The RFC 2557 and byte-range headers use `schema` instead of `content`.
- Two wrong `$ref` targets are corrected (linkset and F.2).
- Appendix C.4.1's `words` parameter gains `explode: false`.

## 2. Earlier report items that change for 3.2.1

Only items that change are listed. Every row, finding, grammar entry and validity rule not listed holds unchanged for 3.2.1, with the same quote and section number.

| #   | Item in the earlier report                                                                                      | Status for 3.2.1                             | What changes                                                                                                                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Row 4.12.2: two serialisation strategies (`schema` with style, or `content`)                                    | Holds; quote changed                         | The rule now governs deserialisation as well (new quote below).                                                                                                                                                                                               |
| 2   | Row 4.12.5: what a serialised value includes                                                                    | Holds; content changed, quote unchanged      | The name is now included for `style: form` with `explode: false`. The 3.2.0 sentence named `form`, and `simple` with `explode: true`.                                                                                                                         |
| 3   | Row 4.12.6: the style table defines the serialisation function                                                  | Holds; the function changed, quote unchanged | `matrix` and `label` now give the empty string for an undefined value (3.2.0: `;color` and `.`). `cookie` with `explode: false` is n/a for arrays and objects. The example values gain `undefined -> null`.                                                   |
| 4   | Row 4.14.5.1: encoding by name                                                                                  | Holds; quote changed, content widened        | Deserialisation is added: repeated names collapse into an array in order, and each array item is decoded with the Encoding Object. Keys are checked against the data instance. Pair order is implementation-defined only where the media type leaves it open. |
| 5   | Row 4.24.1: the OAS dialect id named by the text                                                                | **False of 3.2.1**                           | The default dialect is a dated 3.2 address (new quote below).                                                                                                                                                                                                 |
| 6   | Finding 2 (text and schema differ on the dialect id)                                                            | **False of 3.2.1**                           | The details follow the table.                                                                                                                                                                                                                                 |
| 7   | Finding 4 (text-only validity rules missing from SPEC-FV-2)                                                     | Holds; one rule added                        | 3.2.1 makes `explode: false` invalid with `in: cookie`. The 2026-11-12 3.2 schema's `styles-for-cookie` definition gives `explode` only a default of true, so it does not hold this rule.                                                                     |
| 8   | Grammar A: Encoding `contentType` as "a comma-separated list of media types or wildcard media types (4.15.1.1)" | Changed                                      | 3.2.1 gives an ABNF, `encoding-content-type = media-range *( "," OWS media-range )`, with `media-range` and `OWS` from RFC 9110.                                                                                                                              |
| 9   | Grammar A: media type range ("3.2.0 names ranges and cites nothing")                                            | Changed                                      | 3.2.1 cites the RFC 9110 media-range for Encoding `contentType`. The content-map keys (4.13.1, 4.17.1) still cite nothing.                                                                                                                                    |
| 10  | Grammar B: "The 3.2.0 media type range: probably RFC 9110 media-range"                                          | Changed                                      | The text now confirms it for `contentType`. For content-map keys it stays my attribution.                                                                                                                                                                     |
| 11  | Grammar A: "QUERY method: draft-ietf-httpbis-safe-method-w-body-08"                                             | Changed                                      | 3.2.1 cites RFC 10008, The HTTP QUERY Method (4.9.1, H.1).                                                                                                                                                                                                    |

New quotes for items 1, 2, 4, 5, 8 and 11:

> [3.2.1] The rules for serialization and deserialization of the parameter are specified in one of two ways.

> [3.2.1] In cases where the parameter name is an inherent part of constructing the serialization, such as the name=value pairs produced by the combination of style: "form", explode: false, the name and any delimiter between the name and value MUST be included.

> [3.2.1] For deserialization to an object, multiple values with the same name MUST be collapsed into an array value for that named property, with one item per value, in order.

> [3.2.1] The default OpenAPI Schema Object dialect for this version of the specification (that is, the default for the $schema keyword in Schema Objects, and the jsonSchemaDialect keyword in the OpenAPI Description itself) is identified by the URI of the form https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD

> [3.2.1] Here, media-range and OWS are taken from [RFC9110].

> [3.2.1] A definition of a QUERY operation, as defined in [RFC10008], on this path.

Item 7 (cookie `explode: false` is invalid):

> [3.2.1] The Cookie header prohibits unencoded commas (see [RFC6265] Section 4.2.1 for the complete ABNF), therefore "explode": false is invalid with "in": "cookie" (both "style": "form" and "style": "cookie").

**Finding 2 for 3.2.1:**

- 3.2.1 names the dialect by the dated form `https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD`. The 2026 publisher schemas use that same form as their `jsonSchemaDialect` default.
- 3.2.1 also makes this id the stated default for both `$schema` and `jsonSchemaDialect` (4.24.1). 4.1.1 now points there: "See JSON Schema Keywords to determine the default value."
- The 3.2.0 wording is therefore an erratum within the 3.2 line; 2.1 treats patch versions as one feature set.
- For 3.1.2 the text still names `https://spec.openapis.org/oas/3.1/dialect/base`. I fetched that address on 2026-11-24. It serves the "OpenAPI 3.1 Schema Object Dialect", whose `$id` is that same address, so it is a published 3.1 dialect.
- What remains of Finding 2 is narrower. Does SPEC-FV-1 case 3's "at any revision" cover the undated 3.1 `base` id? For 3.2 nothing remains.

**Removed rule, not in the earlier report.** 3.2.1 also removes a 3.2.0 validity rule that the earlier report did not list:

> [3.2.0] To use the prefixEncoding and/or itemEncoding fields, either itemSchema or an array schema MUST be present.

3.2.1 replaces it with a rule that ignores unmatched entries (part 3, row j).

## 3. What 3.2.1 adds that only the text defines

| §                        | Construct or rule new in 3.2.1                                                                                                                                                                                                                 | Quote                                                                                                                                                                                                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a. 4.8.2                 | URL matching: a template variable never matches a value containing `/`                                                                                                                                                                         | "This means that when matching templates to request URLs, no values that include a forward slash are matched."                                                                                                                                                                                                                                    |
| b. 4.12.2.2, 4.12.6, D.1 | `explode: false` is invalid with `in: cookie` for both cookie styles. The style table marks those cells n/a.                                                                                                                                   | See item 7 above.                                                                                                                                                                                                                                                                                                                                 |
| c. 4.12.2.2              | `allowReserved` applies to an enumerated scope: path, query, and cookie with style form                                                                                                                                                        | "This field only applies to in and style values that automatically percent-encode (that is: in: path, in: query, and in: cookie with style: form)."                                                                                                                                                                                               |
| d. 4.12.5                | The name appears in a serialised value for form with explode false                                                                                                                                                                             | See item 2 above.                                                                                                                                                                                                                                                                                                                                 |
| e. 4.12.6                | An undefined value (`null` among them) serialises to the empty string under matrix and label                                                                                                                                                   | See the table rows in part 1.                                                                                                                                                                                                                                                                                                                     |
| f. 4.12.1                | Query parameters are attached with `?`, then `&`                                                                                                                                                                                               | "query - Parameters that are appended to the URL with the ? character (or for subsequent query parameters, with the & character);"                                                                                                                                                                                                                |
| g. 4.12.2                | Parameter rules define deserialisation as well as serialisation                                                                                                                                                                                | See item 1 above.                                                                                                                                                                                                                                                                                                                                 |
| h. 4.14.5.1              | Decoding encoding by name: repeated names collapse into an array, in order; each item is decoded with the Encoding Object; keys are tested against the data instance; pair order is implementation-defined only where the media type is silent | "For deserialization to an object, multiple values with the same name MUST be collapsed into an array value for that named property, with one item per value, in order." / "To use the encoding field, each key under the field MUST exist in the data instance as a property; encoding entries with no corresponding property SHALL be ignored." |
| i. 4.14.5.2              | `multipart/form-data` may be modelled as an array of name/value objects; the schema decides object or array                                                                                                                                    | "For applications that wish to preserve part order, multipart/form-data content may also be modelled as an array, with one item per part, in order (where each item consists of an object containing the name/value pair); the schema SHALL be used to determine whether deserializing to an object or an array is preferred."                    |
| j. 4.14.5.2              | `prefixEncoding`/`itemEncoding` entries with no matching item are ignored                                                                                                                                                                      | "To use the prefixEncoding and/or itemEncoding fields, each item referenced by the field MUST exist in the data instance; prefixEncoding and itemEncoding entries with no corresponding item SHALL be ignored."                                                                                                                                   |
| k. 4.14.5.3              | Part order comes from an array schema or `itemSchema`; for form-data each item's property name gives the part name                                                                                                                             | "This includes multipart/form-data, in which the property name of each item is used to populate the Content-Disposition headers with the part name."                                                                                                                                                                                              |
| l. 4.14.1                | A missing positional Encoding Object means the defaults apply per item                                                                                                                                                                         | "If no Encoding Object is provided for an item, the behavior is determined by the default values documented for the Encoding Object."                                                                                                                                                                                                             |
| m. 4.15.1.1              | Grammar of Encoding `contentType` (an ABNF over RFC 9110 `media-range`)                                                                                                                                                                        | See item 8 above.                                                                                                                                                                                                                                                                                                                                 |
| n. 4.24, 4.24.1, 4.1.1   | The default dialect is the dated 3.2 dialect; the Schema Object is a 2020-12 superset only "by default"                                                                                                                                        | "By default, this object is a superset of the JSON Schema Specification Draft 2020-12." / "See JSON Schema Keywords to determine the default value."                                                                                                                                                                                              |
| o. 4.9.1                 | The QUERY method is defined by RFC 10008                                                                                                                                                                                                       | See item 11 above.                                                                                                                                                                                                                                                                                                                                |
| p. 4.16.2                | A status-code key is a string (quoted in YAML)                                                                                                                                                                                                 | "This field MUST be represented by a string (for example, "200" enclosed in quotes in YAML) for compatibility between JSON and YAML."                                                                                                                                                                                                             |
| q. D.1                   | Cookie values sent with `allowReserved` must still escape characters invalid in Cookie                                                                                                                                                         | "To allow the full use of style: "form" with in: "cookie", use the allowReserved field, taking care to still escape the characters that are invalid in the Cookie header (see [RFC6265] Section 4.2.1 for the complete ABNF)."                                                                                                                    |
| r. C.1                   | "Undefined" in RFC 6570 expansion is as defined in RFC 6570 §2.3                                                                                                                                                                               | "The latter is problematic because if foo is not defined (see RFC6570 §2.3 for details on what is considered undefined), the result will be an invalid URI."                                                                                                                                                                                      |

New grammar entries for the earlier report's list A:

- **The OAS dialect id:** `https://spec.openapis.org/oas/3.2/dialect/YYYY-MM-DD` (4.24.1).
- **Encoding `contentType`:** the ABNF quoted under 4.15.1.1 in part 1, over RFC 9110 `media-range` and `OWS`.

## 4. Specific checks against 3.2.1

**Finding 3 (header `allowReserved`) holds unchanged.**

- The 4.21 sentence is identical in 3.2.0 and 3.2.1.
- In 3.2.1, 4.21.1.2 still lists only `style`, `explode` and `schema`, with no `allowReserved`.
- 3.2.1's new `allowReserved` text (4.12.2.2, D.1) concerns parameters and cookies, not headers.

> [both] This means that allowEmptyValue MUST NOT be used, and style, if used, MUST be limited to "simple".

**Finding 1's text-only defaults all hold unchanged in 3.2.1.**

XML `nodeType` default:

> [both] The default value is none if $ref, $dynamicRef, or type: "array" is present in the Schema Object containing the XML Object, and element otherwise.

XML `attribute` and `wrapped` default to false:

> [both] Default value is false. If nodeType is present, this field MUST NOT be present.

The Encoding `contentType` default table is unchanged, row for row:

> [both] The default value depends on the type as shown in the table below.

> [both] absent | n/a | application/octet-stream

> [both] array | n/a | application/json

"Explode has no effect" for primitives and `deepObject`, in Parameter (4.12.2.2) and in Encoding (4.15.1.2):

> [both] For other types of parameters, or when style is "deepObject", this field has no effect.

> [both] For other types of properties, or when style is "deepObject", this field has no effect.

Two related points:

- 3.2.1 now states in the text a default the earlier report had seen only in the publisher's schemas: the dated dialect id as the `jsonSchemaDialect` default (Finding 2).
- 3.2.1 adds one rule that decides a reading rather than a value: whether `multipart/form-data` decodes to an object or an array is decided by the schema (part 3, row i).

**Finding 5 (SPEC-FV-2 section numbers) holds.** The section numbers are identical in 3.2.1. The validity rules the earlier report listed as text-only are all still present in 3.2.1:

> [both] Each template expression MUST NOT appear more than once in a single path template.

> [both] Each server variable MUST NOT appear more than once in the URL template.

> [both] If the enum is defined, the value MUST exist in the enum's values.

> [both] MUST NOT appear more than once, and MUST NOT appear in the same operation (or in the operation's path-item) as any in: "query" parameters.

> [both] The name of a tag that this tag is nested under. The named tag MUST exist in the API description, and circular references between parent and child tags MUST NOT be used.

> [both] when defined as optional the Discriminator Object MUST include a defaultMapping field
