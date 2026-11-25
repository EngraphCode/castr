# What the third trial does with each finding of the three attacks

The reports are beside this file (`attack-on-core-*.md`), and so is
[the trial](core-proposal-third-trial.md).
**Held** = the prototype holds it, with the test named. **Stated** = the trial's text says
it and nothing runs it yet. **Owed** = not yet in the trial or the prototype. **Owner** =
a decision that is the owner's. Prototype: branch `design/model-prototype`,
`lib/tests-picture/design/`.

## JSON Schema (J1–J19)

| Id  | Finding                                 | Disposition                                                                                                                                                                                                                                                                               |
| --- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| J1  | Rule for items false with `contains`    | Held: rule 3 restricted; B12 value; `profile.unit.test.ts` "is not folded"                                                                                                                                                                                                                |
| J2  | Supplied closure cannot be placed       | Held: profile by value, two layers; `profile.unit.test.ts` (F1, F2, F3, F4, F5, G3)                                                                                                                                                                                                       |
| J3  | Identity collides; `Table` is OpenAPI's | Held in part: `DefinitionId` is a place of typed steps; A11 by a `data` step. Owed: nested `$defs/A/$defs/A` as a test                                                                                                                                                                    |
| J4  | Dynamic anchors and scope               | Held: `Resource.dynamicAnchors`, `reference-in-scope`; B5 value. Owed: the three adverse cases (static anchor does not capture; static initial target is a plain reference; inline resource enters scope) as tests                                                                        |
| J5  | Rule 4 merges annotated branches        | Stated: rule 4 excludes a branch that is a definition or has anything said of it. Owed: a `canonical()` and its test                                                                                                                                                                      |
| J6  | `first` → `some` changes accounting     | Stated: rule 5's second condition requires every branch to state its rest. Owed: test                                                                                                                                                                                                     |
| J7  | How one schema object is read           | Stated: rule 2. Held by the hand values (A5, I1). Owed: `canonical()` so the read form and the canonical form are both run                                                                                                                                                                |
| J8  | Several identities for one definition   | Held: `Definition.aliases` (A6, A23)                                                                                                                                                                                                                                                      |
| J9  | `inside{step}` fragile                  | Held: an edge's target is made a definition (A21 value)                                                                                                                                                                                                                                   |
| J10 | Missing one-meaning rules (a)–(g)       | Stated: rules 2, 3, 6; lists that are sets. (a) changed by the profile: `{unevaluatedProperties:false}` alone and `{additionalProperties:false}` alone are both the every-kind `by-kind` with rest `none`. Owed: sets as sets in the types (fields are a Map; `all.of` is still an array) |
| J11 | Counts are JavaScript numbers           | Held: counts are `bigint`                                                                                                                                                                                                                                                                 |
| J12 | `Pattern` is a string with a grammar    | Owner: kept as text with its dialect and flags; named to the owner                                                                                                                                                                                                                        |
| J13 | Other string leaves                     | Owed per leaf; URI of a resource and the written form of a reference are text, named to the owner                                                                                                                                                                                         |
| J14 | Unknown keywords                        | Owed: a place for a keyword the dialect does not define, per dialect rule (2020-12 collects, Draft-07 ignores)                                                                                                                                                                            |
| J15 | `format` on any kind                    | Owed: `format` is on number and string parts only                                                                                                                                                                                                                                         |
| J16 | readOnly/writeOnly on any schema        | Held: `Said.direction` on a `said` node, anywhere. Owed: the combining rule ("if any is true")                                                                                                                                                                                            |
| J17 | The `when` test of a dependent schema   | Held: test is an object-only `required` with no field (B6, I3 values)                                                                                                                                                                                                                     |
| J18 | Hand values mix readings                | Held: `asStated` and `underProfile` are two functions; values carry `unstated`                                                                                                                                                                                                            |
| J19 | Smaller gaps                            | Owed: two lower bounds; vocabulary required/optional; undefined rows as located rejections                                                                                                                                                                                                |

## OpenAPI (N1–N22)

The half of the model that holds boundaries is not in the prototype yet. Each of these is
**owed** to that half unless marked.

| Id           | Finding                                                                                                          | Disposition                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| N1           | Boundary only per operation                                                                                      | Stated (§6): path item and operation are definitions; boundaries derived       |
| N2           | One operation, two paths                                                                                         | Stated (§6)                                                                    |
| N3           | Expression binds per boundary                                                                                    | Stated (§6); a missing binding for an operation is a located rejection (4.8.2) |
| N4           | Defaults: mode and derived                                                                                       | Stated (§7): four kinds                                                        |
| N5           | Rules erase spelling the text inspects                                                                           | Stated (§7): derived facts are resolved from the source before any rule        |
| N6           | `$ref` into a branch                                                                                             | Held: targets made definitions before rules (A21)                              |
| N7           | `Place.named` collapses and splits                                                                               | Held in part: see J3                                                           |
| N8           | Edge target states                                                                                               | Held: `Edge.target` is resolved, undeclared or ambiguous. Owed: ignored        |
| N9           | readOnly/writeOnly are annotations                                                                               | Held: `Said.direction`; the note's D3 corrected                                |
| N10          | 119 of 176 field slots                                                                                           | Owed: the coverage map, computed                                               |
| N11          | Runtime expressions, callback keys, link values                                                                  | Owed: structured types                                                         |
| N12          | Media types, header names, auth schemes                                                                          | Owed: structured types with their case rules                                   |
| N13          | Step, ResourceId, anchors undefined                                                                              | Held: `Step` is a closed union; anchors are aliases or dynamic anchors         |
| N14–N19, N22 | Security, servers, status fact, one place two kinds, several documents, discriminator, media type with no schema | Owed                                                                           |
| N20          | OpenAPI's schema keywords, unknown keywords                                                                      | Owed (with J14)                                                                |
| N21          | Pinned schemas narrower than the text                                                                            | Owed to the coverage map: the field list comes from the text                   |

## Zod (Z1–Z21)

| Id       | Finding                                         | Disposition                                                                                          |
| -------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Z1       | `z.url()` changes the value                     | Owner: SPEC-P-2 excludes it, SPEC-P-8 writes it. The model does not decide                           |
| Z2       | Intersection with a catchall side               | Held: `all` with `unknownKeys: 'together'`; `zod-intersection.unit.test.ts`, 16 pairings against Zod |
| Z3       | A check on a wrapper; check order               | Owed: `absent-becomes` has no check after it; checks have no order                                   |
| Z4       | Number-keyed record renames keys                | Stated (§8): outside the declarative subset by SPEC-P-2's own definition                             |
| Z5       | `z.success`                                     | Stated (§8): outside the subset                                                                      |
| Z6       | Rule 4 (now 5) weak and strong                  | Stated: rule 5. Owed: "changes nothing" as a function, and its test                                  |
| Z7       | Doubles and `multipleOf` tolerance              | Owed: what a number part means for a Zod source                                                      |
| Z8       | `z.property` checks                             | Owed: no element; likely outside the subset                                                          |
| Z9       | `Format` cannot carry a Zod format              | Owed: format as name plus typed parameters plus the pattern Zod tests                                |
| Z10      | Template literal                                | Owed                                                                                                 |
| Z11      | Missing canonical rules for Zod spellings       | Owed                                                                                                 |
| Z12      | `keyed` with an absent discriminator            | Owed: `keyed` is not in the prototype                                                                |
| Z13      | Presence by side                                | Owed                                                                                                 |
| Z14      | Two kinds of `undefined`                        | Owed: not a JSON value; stated as outside                                                            |
| Z15      | Names: parent link, duplicate ids               | Owed                                                                                                 |
| Z16, Z17 | `.catch`, coercion                              | Stated (§8): outside the subset                                                                      |
| Z18      | `.trim()` against an author's overwrite         | Owed                                                                                                 |
| Z19      | Enum entry names                                | Owed                                                                                                 |
| Z20, Z21 | Vocabulary as structure; strings with a grammar | Owed per leaf                                                                                        |

## Counts

Held, with a test: J1, J2, J4, J8, J9, J11, J17, J18, N6, N9, N13, Z2 (12), and in part
J3, N7, N8, J16. Stated only: 13. Owed: the rest, of which the boundary half is the
largest part.
