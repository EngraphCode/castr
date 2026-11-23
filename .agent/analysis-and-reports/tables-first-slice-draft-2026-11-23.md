# Draft for part three, first slice: the two rows that stop Oak's document

Status: a draft by the Castr seat (Firefly mends Quench), 23 November 2026. It is not
approved text and changes nothing in `docs/SPECIFICATION.md`, which stays at 0.8.0. It
has had its one adversarial review, under the exit set at the end. Twelve findings; none
changed the outcome for Oak's shape, so the slice went on, and the text below is as
corrected. "The review" lists each finding and what became of it.

It is the first slice of the first piece of step N5 of the
[plan](../plans/active/after-0.8.0-next-steps.md): the table vocabulary and the tables
for schema rows. The slice is the two rows that stop Oak's document,
`additionalProperties` and `propertyNames`, taken all the way down: every word and every
other clause those two rows lean on is either written here or named with where it goes.
The piece widens to the other schema rows only if this slice closes.

## What it serves

The owner, 20 November 2026: "What I want is to not have to rework Castr if Oak adds an
additional, valid field type to their spec". The measure is that every row of the
picture has a class in approved text. The fix of what stops Oak's document (N0) waits on
the whole step.

Owner decisions this slice uses, none of them an approval of text: one (a fifth class),
two ("Carried; Castr marks its checks"), eight (the endpoint definitions are a third
column), seventeen (the two rows are classed "With the tables, in order"), and the
correction of 22 November ("strict, everywhere, all the time").

## What the slice found

1. **A keyword is not the unit of a row.** The picture's proposals give
   `additionalProperties` one class and `propertyNames` one class. The trials show the
   outcome of `additionalProperties` turns on its value and on whether the object names
   a property. The table needs a rule for splitting a keyword into rows.
2. **`propertyNames` needs no special case.** The withdrawn drafts carried it only where
   it "holds no name to anything", which needed a closed list of annotation keywords. A
   check Castr writes, on every `propertyNames`, is exact for every `K` tried, Oak's
   included, and needs no such list.
3. **Zod cannot be exact for the name `__proto__`, and a narrowing stated for each
   object widens under `not`.** Zod leaves a property of that name unchecked and out of
   the value it returns wherever unknown keys are allowed. Refusing the name where an
   object is open or constrained makes `not` of that object accept what the source
   refuses. The same fault broke the numbers drafts. The narrowing is stated here of the
   whole validator.
4. **So Oak's row needs a check Castr writes, and its mark.** The slice states the mark
   as a written form. It does not need an answer to SPEC-N-3: the form is data that a
   reader of a running module and a reader of source text can both reach (run, below).
   What a reader does with a marked check is left to the amendment that opens a Zod
   reader.
5. **One row has no good answer in TypeScript.** A constrained object that names a
   property its `additionalProperties` does not admit has a type that reads rightly and
   cannot be written as a literal. It is classed by companion and is the row most in need
   of attack.

## What the two rows lean on, and where each goes

| Dependency                                                                   | Where it is written                                                                                           |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| The unit of a row, and what happens to a construct in no row                 | This slice, vocabulary 1 and 2                                                                                |
| How a row's class depends on the schemas inside it                           | This slice, vocabulary 3                                                                                      |
| What a class in one column means when another column rejects                 | This slice, vocabulary 4                                                                                      |
| The mark on a check Castr writes                                             | This slice, the change to SPEC-P-2                                                                            |
| The name `__proto__`                                                         | This slice, a new SPEC-P-7. It narrows, so it is a profile decision and the owner's text                      |
| A constraint that refuses nothing where it stands (Oak's `K`)                | This slice, the change to SPEC-G-5                                                                            |
| One sentence for each value of `additionalProperties`                        | This slice, rows A to E                                                                                       |
| A closed list of annotation keywords; a definition of "map" for Zod          | Not needed: the check on `propertyNames` is written for every `K`, and Zod writes `.catchall` for every shape |
| A schema whose `type` is absent or a list                                    | The piece, in the rows for `type`. Trials 2, 3 and 17 show the form that decides rightly                      |
| The rows for Oak's `S` and for `example` (`type: string`, `enum`, `example`) | The piece. The proposals class them and no trial here contradicts them                                        |
| `patternProperties`, `unevaluatedProperties`, a branch of `allOf`            | The piece, each in its own row. Until then a schema that holds one beside these rows is in no row             |

## What was run

Zod 4.6.7, Ajv for JSON Schema 2020-12 and the TypeScript compiler in `lib`, in scratch
(`lib/tests-picture/.tmp`, which is not tracked). Every expected outcome was written by
hand before the first run.

**The composition cases.** Sixteen schemas and 74 values. For each value three answers
were compared: the hand-written expectation; Ajv's answer on the source schema, made to
refuse any value that holds an object with a property named `__proto__` at any depth;
and a Zod schema built by hand in the forms this draft proposes. None of the 74
differed. Removing the check at the root of the first case made two differ, so the
comparison can fail.

| Case                                                                                   | Values | What it tests                                                  |
| -------------------------------------------------------------------------------------- | ------ | -------------------------------------------------------------- |
| 1. Oak's shape: `propertyNames: {type: string}`, `additionalProperties` an enum of two | 9      | Rows D and F together; the name at the top; values not objects |
| 2. `additionalProperties: {type: string}` with no `type`                               | 7      | A value that is not an object is accepted; the name at depth   |
| 3. `type: [object, null]`                                                              | 4      | A list of types                                                |
| 4. A required named property of a type the rest does not admit                         | 5      | Row E                                                          |
| 5. The same, optional                                                                  | 4      | Row E                                                          |
| 6. `additionalProperties: true` beside a named property                                | 4      | Row C; the name at the top and at depth                        |
| 7. `additionalProperties: {}`                                                          | 2      | Row C                                                          |
| 8. `additionalProperties: false`                                                       | 3      | Row A refuses the name at the top                              |
| 10. A schema whose `additionalProperties` refers to itself                             | 6      | A reference to the parent, through `z.lazy`                    |
| 11. Two branches of `allOf`, each stating its policy                                   | 5      | An intersection keeps each branch's own meaning                |
| 12. `oneOf` of two constrained maps                                                    | 5      | The empty object matches both and is refused                   |
| 13. `not` of a constrained map                                                         | 6      | The narrowing does not widen under `not`                       |
| 14. `propertyNames` with a pattern on an object that names properties                  | 4      | Row F where Zod has no form of its own                         |
| 15. `propertyNames` with an `enum` on a map                                            | 5      | Row F does not require every name, as `z.record` would         |
| 16. `propertyNames: false`                                                             | 2      | Only the empty object                                          |
| 17. `propertyNames` with no `type`                                                     | 3      | A value that is not an object is accepted                      |

Case 11 states `additionalProperties: true` in its first branch. With that keyword
absent the profile reads the branch as closed, and what `allOf` then means is the
`allOf` row's to say.

**Where a check can sit and what it can hold.**

- A check written after an object (`.refine`, `.check`) does not see a property named
  `__proto__`: Zod has already left it out.
- `z.custom<T>(f, {params}).pipe(S)` sees the value first. It refused both values that
  held the name and decided the others as `S` does. Its input and output types are
  mutually assignable with the TypeScript type `T`.
- `z.intersection(z.custom<T>(f), S)` decides the same.
- `params` given to `.refine` or to `z.custom` is held in the check's definition and is
  carried on the issue it raises. Zod's declared type for a custom issue names the field.
  A Zod schema placed in `params` is still a Zod schema when read back.
- Either form makes the schema a pipe or an intersection, no longer a Zod object, so a
  consumer that calls an object's own methods on it (`.shape`, `.extend`, `.pick`)
  cannot. The Ecosystem seat answered on 23 November 2026, from its repository's main
  branch: two places read `.shape` on a generated response schema, both on closed
  objects with fixed properties, which this draft leaves as Zod objects; a third reads
  an array's `.element.options`; no `.extend`, `.pick`, `.omit`, `.partial`, `.keyof`
  or `.merge` was found on one. Its search did not rule out functional forms such as
  `z.partial(schema)`.
- The same answer: the Ecosystem repository removes both `check-restricted` paths
  before it generates, so it has no Zod schema for either today and one caller, which
  uses a hand-written `z.record`. The two schemas that stop Castr on Oak's document are
  ones its consumer does not yet take from a generator.

**TypeScript.**

- A constrained map: `{ [key: string]: V }` is mutually assignable with the input and
  the output type of `z.strictObject({}).catchall(V)`.
- An open object that names a property: `{ a?: string; [key: string]: unknown }`
  compiles and is mutually assignable with the input type of the Zod loose object, with
  `exactOptionalPropertyTypes` off. With it on, Zod's type for an optional property adds
  `undefined` and the two are assignable in one direction only. That is a fact about
  every optional property and belongs to the row for `required`.
- A constrained object that names a property the rest does not admit:
  `{ a: string } & { [key: string]: number }` is mutually assignable with Zod's input
  type. Read through that type, `a` is a `string` and any other name is a `number`. The
  literal `{ a: 'x', b: 1 }`, which the validator accepts, is not assignable to it or to
  Zod's own input type.
- Where every named property's type is admitted by the rest,
  `{ a: string; [key: string]: string }` compiles, accepts the literal and is mutually
  assignable.

## The proposed text

Each block is wording for the owner to approve with the rest of part three, under a
version the owner names. None of it is in the specification.

### Vocabulary

> 1. **A row is one construct kind.** It is a keyword, one value of a keyword, or
>    several keywords standing together. Where the outcome of a keyword turns on its
>    value or on the keywords beside it, the table has a row for each case, the cases
>    are stated so that a schema holding the keyword falls in exactly one, and the
>    keyword's own row says only that.
> 2. **No row, no default.** A construct of a document that none of the cases of
>    SPEC-FV-1 describes, which falls in no row, receives `NOT-YET-BUILT`.
> 3. **A row classes its own construct.** Its class is the outcome when every schema
>    inside the construct is written. A schema that holds, at any depth, a construct
>    whose outcome in a column is a located rejection receives that rejection in that
>    column.
> 4. **The columns are classed separately.** A located rejection in one column is a
>    rejection of that output. A construct carried by companion in one column names the
>    column that enforces it, and is a located rejection wherever that column rejects.
> 5. **Carried by a check Castr writes.** Where Zod has no form of its own for a
>    construct, its Zod class is carried, by a check Castr writes and marks
>    (SPEC-P-2). No other column has this class.

### SPEC-P-2, the declarative subset

Added at the end of the clause:

> A check Castr writes is not a function supplied by the schema's author. The Zod
> writer emits one only where the scope-and-fidelity table says so, as a Zod custom
> check whose function Castr generates and whose `params` hold one entry, `castr`: the
> construct kind and its arguments, as data. An argument that is a shape is the Zod
> schema Castr writes for that shape, given as a function that returns it. The mark
> says what the check is. It does not prove who wrote the function, and what a reader
> of Zod does with a marked check is not stated at this version.

Section 11's third item becomes "Executable Zod refinements, transforms and conversions
to host-language objects, written by a schema's author." Appendix A is not changed: it
says what a reader of Zod accepts, and it rejects `.refine`, `z.custom` and `.pipe`. So
the Zod that Castr writes with a check in it is not Zod that Castr's own reader would
read, until the amendment that opens a Zod reader says what a mark means to it. No
reader of Zod is in SPEC-C-1.

### A new SPEC-P-7, the name `__proto__`

The identifier is provisional. The withdrawn draft of the numbers amendment used
SPEC-P-7 for its own clause, and numbers are a later part of this same step; each new
clause takes its identifier when its text is brought for approval, so the two cannot
share one.

> - **SPEC-P-7 A property named `__proto__`.** Every validator Castr writes for a
>   JavaScript target refuses a value that holds, at any depth, an object with a
>   property named `__proto__`, whatever the schema says. This narrows the source's
>   accepted set and is a profile decision, as the closed reading is. A Zod object that
>   allows unknown keys leaves a property of that name unchecked and out of the value it
>   returns, so it cannot accept such a value and return it whole, and SPEC-P-2 allows
>   no other difference between the two sides. The refusal is a check Castr writes.
>   SPEC-G-4's reference validator is made to refuse the same values by a
>   transformation independent of Castr's parser, and its samples hold the name at the
>   top of a value and inside it, for every validator a consumer can address. The run's
>   report states the refusal once.

The clause says which values are refused, not where the check sits. Placement is the
writer's, and is proved by the samples. Two facts for the writer. With no
check of Castr's in front of it, a closed object does not refuse the name inside an
unconstrained property (`z.strictObject({a: z.unknown().optional()})` alone accepts
`{"a": {"__proto__": 1}}`), so closed objects need the check too. And a check at the
top of every named schema walks a deep recursive value once for each level.

### SPEC-G-5, the sample is adequate

The sentence that gives the one exception gains a third route:

> or by naming the rule of the source format's own text under which the constraint
> refuses no value where it stands (a property name is a string, so `propertyNames:
{type: string}` refuses none). The check holds each such rule with the section that
> states it, and a constraint that no rule it holds names is not excused.

### The rows

For an object schema: `type` is `object`, and the schema holds no `patternProperties`,
no `unevaluatedProperties`, and none of the keywords that apply a subschema in place or
refer to one (`$ref`, `$dynamicRef`, `allOf`, `anyOf`, `oneOf`, `not`, `if`,
`dependentSchemas`; JSON Schema Core 8.2.3 and 10.2). A schema that holds one of those
beside these keywords is in no row of this slice. `S` is the value of
`additionalProperties`. Cases 2, 3 and 17 above, whose `type` is absent or a list, are
outside these rows: they were run to show the form the rows for `type` will need, and
until those rows are written such a schema is in no row. An object names a property when its `properties` or its
`required` holds at least one name; a name that only `required` holds is written as a
property whose shape is what the row gives an unknown key.

| Row                                                   | Zod                                                                | TypeScript                                                                                                                       | Endpoint definitions |
| ----------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| A. `additionalProperties: false` (closed)             | Carried: `z.strictObject`                                          | By companion (Zod): the type holds the named properties and cannot refuse another                                                | By companion (Zod)   |
| B. `additionalProperties` absent (closed by SPEC-P-1) | As A, and listed in the run's report                               | As A                                                                                                                             | As A                 |
| C. `true` or `{}` (open)                              | Carried: `z.looseObject`                                           | Carried: an index signature over `string` of `unknown`, beside the named properties                                              | By companion (Zod)   |
| D. Any other `S`, and the object names no property    | Carried: `.catchall(S)` on a strict object with no properties      | Carried: an index signature over `string` of the type of `S`                                                                     | By companion (Zod)   |
| E. Any other `S`, and the object names a property     | Carried: `.catchall(S)` on a strict object of the named properties | By companion (Zod): the intersection of the named properties' type and the index signature. It reads rightly; see the note below | By companion (Zod)   |
| F. `propertyNames: K`                                 | Carried, by a check Castr writes: every name passes the Zod of `K` | By companion (Zod)                                                                                                               | By companion (Zod)   |
| G. The refusal of SPEC-P-7                            | Carried, by a check Castr writes                                   | By companion (Zod)                                                                                                               | By companion (Zod)   |

The keyword row for `additionalProperties` says "one row per case: A to E".

Row E's type: where a named property's type is not admitted by `S`, no literal that
holds that property fits the type, and neither does a spread or `Object.assign`. A
value read through the type is right.

Rows A, C and E say "carried" for the unknown-key policy. They lean on the rows for
`properties` and `required`, which the piece owes and which must settle two things the
review found: Zod reads a member an object inherits as a property (`toString`,
`constructor`, `valueOf`), so a named property of such a name is decided wrongly for a
value that lacks it; and under the repository's compiler settings Zod's type for an
optional property is assignable with the TypeScript type in one direction only.

## What this makes of Oak's document

Each of its two schemas is `{type: object, propertyNames: {type: string},
additionalProperties: {type: string, enum: [ogl-compatible, restricted]}, example}`. It
uses rows D, F and G, and from the rest of the piece `type: object`, `type: string`,
`enum` and `example`.

- Zod: the check of SPEC-P-7, then a strict object with no properties and a catchall of
  the enum, with the check on names. Case 1 is this shape and decides all nine values
  as expected.
- TypeScript: an index signature over `string` of the union of the two strings.
- SPEC-G-5 excuses `propertyNames: {type: string}` by its third route.

Nothing here says whether anything stops the document after these two schemas: a
document refused at its first stop shows no later one.

## Open, and whose

- **The narrowing of SPEC-P-7 is the owner's text.** It refuses values the source
  accepts. The alternative that keeps them is to let Zod accept and drop the property,
  which widens and which the seat ruled out on 22 November by the strict lens.
- **Row E in TypeScript.** By companion with a type no valid literal with both kinds of
  property fits. The other candidates: `UNEXPRESSIBLE` for TypeScript, which refuses a
  shape Zod carries exactly; or a weaker type with a comment, which fails SPEC-G-4's
  mutual assignability as approved.
- **A schema that names `__proto__`.** Under SPEC-P-7 no accepted value has the
  property, so a schema that requires it accepts nothing and one that allows it loses
  nothing. The first draft gave a list of the places a schema can name it and called
  each `UNEXPRESSIBLE`; the list was not complete and TypeScript can express the name.
  Each row whose keyword can name a property says what it writes for this name, and the
  piece owes those rows.
- **Vocabulary 4 against the code.** Today one module holds the types and the Zod
  schemas, and a refusal by either writer refuses both. The sentence says what is right;
  the code is changed when N0 or a later leg reaches it.
- **Not in this slice and owed by the piece:** the six outcomes restated with their
  endings, the fifth class and its bar, the outcome `read`, and every other schema row
  outside the numbers part.

## The exit for the one adversarial review

Set before the review is asked for. The reviewer is given this file and the scratch
scripts and told to find: a valid schema that falls in two of rows A to F or in none
while this draft says one; a value that the proposed Zod form decides differently from
the reference of SPEC-P-7 while its row says carried; and a sentence that assumes an
answer to an open item of section 12.

- If a finding changes the class of row D, F or G for Oak's shape, or shows the mark
  cannot be stated without SPEC-N-3, the slice stops. The finding is recorded here, the
  owner is told that the first piece's boundary is wrong, and no second draft is
  attacked in the same session.
- Any other finding that is a factual error or changes an outcome is fixed once, and
  the fix is run. The rest are recorded with a disposition. There is no second round.

## The review

One adversarial review, 23 November 2026, by a reviewer told to break the draft by
running things. The seat re-ran findings 1, 2, 3, 7, 8 and 9 and they hold. Finding 10's
circular structure was not reproduced by the seat; its other half, that the message
prints the schema's definition, was. The exit's first branch did not fire: no finding
changes the class of row D, F or G for Oak's shape, and none shows the mark needs
SPEC-N-3.

| Finding                                                                                                                                                | Disposition                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1, 2. Zod reads an inherited member as a property: a schema that names `toString` refuses `{}`, and one that requires `constructor` accepts it         | True, and wider than this slice. Recorded under the rows as owed by the rows for `properties` and `required`. Oak's document names no such property (computed)                         |
| 1. The reference the seat used (Ajv as configured) is wrong the same way, so the two agreeing proved less than claimed                                 | True. The 74 values were re-run with Ajv reading own properties only; none differed. The picture's reference has the same setting and is corrected in a pull request of its own        |
| 3. `required` with no `properties`, `dependentSchemas`, `if` and a sibling `allOf` each fall in row D as stated and are decided wrongly                | Fixed: the conditions exclude the keywords that apply a subschema in place, and a name only `required` holds counts as named. The `required` case was run and decides as the reference |
| 4. Row B beside a `$ref` closes what the reference leaves open                                                                                         | Fixed by the same conditions                                                                                                                                                           |
| 5. The Appendix A exception states what a reader does, which is SPEC-N-3's; and a mark cannot tell a forged check from Castr's                         | Fixed: Appendix A is not changed and the sentence now says the mark does not prove who wrote the function                                                                              |
| 6. The form uses `.pipe`, which Appendix A rejects                                                                                                     | Appendix A is the reader's table. The draft now says plainly that Castr's reader would not read this output until a reader amendment says so                                           |
| 7. "Root" is not defined; a closed object does not refuse the name at depth; a check on each named recursive schema repeats the walk                   | Fixed: the clause says which values are refused, row G no longer says where, and the two facts are in the draft for N0                                                                 |
| 8. "No Zod schema can accept such a value and return it whole" is false for `z.unknown()`                                                              | Fixed: the sentence is about a Zod object that allows unknown keys                                                                                                                     |
| 9. The `UNEXPRESSIBLE` list is incomplete, TypeScript can express the name, and a Zod object given the name as a property accepts `{}`                 | Fixed: the list is removed. See "Open, and whose"                                                                                                                                      |
| 10. A Zod schema held in `params` is printed in every error message                                                                                    | Fixed: a shape in a mark is a function that returns the schema. Run: the message no longer holds the definition and the function returns the schema. Not run for a recursive `K`       |
| 11. Under the repository's compiler settings an optional property is assignable one way only in rows A, C and E; row E's literal fault was understated | The first is the `required` row's and is recorded under the rows. Row E's note is corrected. Row D is mutual in both directions with the whole written form                            |
| 12. A recursive value 2,000 levels deep makes Zod throw where the reference accepts                                                                    | True of every recursive schema, not of these rows. Owed by the row for a reference to an enclosing schema; Oak's two schemas are not recursive                                         |
| `z.toJSONSchema` on the written form loses `propertyNames`                                                                                             | No change: Castr writes JSON Schema from the model, never from the Zod it wrote                                                                                                        |
| A `pattern` of one character against an astral character                                                                                               | The `pattern` row's                                                                                                                                                                    |

Not run by the reviewer or the seat: reaching `params` from source text through a
syntax tree; the endpoint-definitions column; Oak's real document through any of this.
