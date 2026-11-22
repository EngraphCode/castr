# Draft amendment, part two: numbers in JavaScript targets

Status: stopped at its third draft, 22 November 2026, by the exit the seat set before
the third attack. Three adversarial reviews broke the three drafts in twelve, seven and
six places ("Reviews", below). It is not approved, changes nothing in
`docs/SPECIFICATION.md`, and is not put to the owner for approval. The version this
part would have carried is 0.9.0.

Asked on 22 November 2026, by question prompt, where numbers are written now (with the
tables; after the fix for Oak's document; or again now, before the tables), the owner
answered: "Whatever is best for strict correctness". By that measure numbers are written with the tables, in
part three: three of the five things below are defined there, so a numbers clause
written before them rests on words that do not exist, and one written after the fix
leaves the integer rows of the tables open while code is changed against them. Part two
is withdrawn as a part of its own.

## Why it stopped

No review found the owner's two decisions wrong. Each found the text around them false
on a concrete schema and value, and the third found six such places after two rounds of
cutting. They share a cause. A clause on numbers cannot be made exact by itself, because
what it must say is defined elsewhere and not yet:

- **which class a narrowed integer has** (the scope-and-fidelity tables, part three);
- **what the annotation is** that states the narrowing and lets a reader recover the
  integer (the mark on a Zod check, part three, with how Zod is read);
- **how a parameter's text becomes a number** (the endpoint definitions' column, part
  three);
- **what the proof excuses and what it samples** (SPEC-G-4 and SPEC-G-5), which every
  draft patched and every review broke again;
- **which kind of located rejection** a place Castr cannot write soundly gets: none of
  the three kinds fits as they are defined.

What stands from the three drafts is under "What stands".

This is the second of three parts. It adds one profile clause and the two sentences the
proofs need to use it. It does not touch what the reader refuses (part one, approved as
0.8.0), the classes of the scope-and-fidelity table or the tables themselves (part
three). It changes nothing for Oak's document today: no row that stops that document is
a number row.

## How this draft was cut

The first draft added definitions and rules of the seat's own to the owner's two
decisions: a term for a number "within JavaScript precision", a rule for every number a
schema states, and an exception to where the narrowing is stated. Ten of the twelve
findings were in those additions. This draft keeps a sentence only if it states
something the owner decided, or is needed for a proof clause not to contradict that.

The second review then showed that decision four, as the seat had proposed it and the
owner accepted it, is not always a narrowing. "Zod asserts a safe integer, so a value
too large is refused" is false where the integer schema stands under `oneOf` or `not`:
for `oneOf: [{type: integer}, {type: number}]` the source refuses 9007199254740992,
because both branches match, and a validator that asserts the safe range in the first
branch accepts it. The third draft therefore states the decision as what must hold of
the whole validator (it never accepts what the source refuses, and refuses beyond the
source only integers outside the safe range), with the assertion as the means. SPEC-PR-2
already forbids the widening, so this is the existing promise applied and not a new
choice; it is said to the owner under "What the owner should know".

## What the owner has decided

- **20 November 2026, decision four.** Asked what Castr does with integers, the owner
  first said: "I need you to suggest the best options here, step back and consider the
  intended impact and desired user value first. Whatever we decide, it must be clearly
  communicated, especially if it is a transformation that means the reverse
  transformation does not give back the original semantic meaning". The seat proposed
  one clause for every integer, and the owner answered "Accept the clause": the model
  keeps the integer exactly; Zod and TypeScript write `number` and Zod asserts a safe
  integer, so a value too large is refused and never accepted rounded; the run report, a
  TypeScript comment and a Zod annotation state the narrowing; reading that Zod back
  gives the source's integer again. A `bigint` output is a later capability.
- **20 November 2026, decision seven.** A decimal with more digits than a JavaScript
  number holds is rounded by the JSON parser before any validator sees it: "Declare
  once, per run". The specification states the limit as a profile decision for
  JavaScript targets, and every run's report carries one plain statement of it.

## Facts the draft rests on

Each was run on 22 November 2026 at `main` commit `369b6354`, with Zod 4.6.7 and Node's
JSON parser, and the reviewer ran the first three again.

- **What Castr writes today.** `type: integer` is written as `z.int()` and the type
  `number`, with no statement anywhere. `format: int32` is `z.int32()`. `format: int64`
  is `z.int64()` and the type `bigint`, which refuses every JSON number: the picture
  shows both cells wrong. `type: ["integer", "number"]` is written as
  `z.union([z.int(), z.number()])`.
- **What `z.int()` decides.** It accepts 1, `1.0`, 9007199254740991 and
  −9007199254740991. It refuses 1.5, 9007199254740992, −9007199254740992 and `1e20`.
  `z.int32()` accepts −2147483648 to 2147483647. `z.int64()` accepts only a `bigint`.
- **What the JSON parser does with text.** `9007199254740993` becomes 9007199254740992.
  `9223372036854775807` becomes 9223372036854775808. `9007199254740991.4` becomes
  9007199254740991, and `1.0000000000000001` becomes 1: each is then an integer to any
  validator. `1e400` becomes infinity.
- **No integer outside the safe range arrives inside it.** The parser gives the nearest
  JavaScript number. 9007199254740992 is itself a JavaScript number, so every integer at
  or above it becomes a number at or above it; the same holds below. So refusing a
  JavaScript number outside the safe range refuses every integer the text states
  outside it. The reviewer attacked this and it held.
- **An integer bound outside the safe range needs no rule of its own in an integer
  schema.** Its nearest JavaScript number is also outside the safe range on the same
  side, so every integer in the safe range compares with it as with the bound stated;
  and a `const` or `enum` member that is an integer outside the safe range equals no
  integer inside it. The second reviewer ran inclusive and exclusive bounds at and
  beyond both edges and it held. It does not hold for a bound with a fraction, such as
  `9007199254740991.4`, which the parser makes 9007199254740991: that is the parser's
  limit on the document itself, routed below.
- **The assertion can widen.** `oneOf: [{type: integer}, {type: number}]` with the value
  9007199254740992: the reference validator refuses and `z.xor([z.int(), z.number()])`,
  which Castr writes today, accepts. `anyOf` of the same two accepts on both sides.
- **Not every number reaches the output through the JSON parser.** A path, query or
  header parameter and a body that is not JSON are text. Castr writes `z.int()` for
  them in the endpoint definitions today.
- **9007199254740992 and −9007199254740992 are exact JavaScript numbers.** The
  reference validator accepts each for `type: integer` and for `format: int64`, and
  `z.int()` refuses each.

## The amendment

### Section 5 gains a clause after SPEC-P-6

- **SPEC-P-7 Numbers in JavaScript targets.** (Owner, 20 November 2026: "Accept the
  clause", and "Declare once, per run".) Zod and TypeScript are JavaScript targets. A
  number carried as JSON reaches their output as the JavaScript number the JSON parser
  made from its text, before any validator runs. The _safe range_ is the integers from
  −9007199254740991 to 9007199254740991.
  - _The parser's limit._ For text that states a number no JavaScript number holds, the
    parser gives the nearest JavaScript number, or an infinity. The output decides what
    the parser gave and not what the text stated. This is a limit of the target and not
    a decision made for one schema. Every run's report states it once, in plain words.
  - _An integer._ Where a source schema's `type` names `integer` and does not name
    `number`, Zod and TypeScript write the integer as `number`, and the Zod validator
    asserts there an integer in the safe range. `type: integer` with `format: int64` is
    such a schema. `bigint` is not written; writing it is added here by change control
    when the owner names it.
  - _What the assertion may do._ Two things hold of the Zod validator for a whole
    shape, whatever surrounds such a schema. It accepts no value the source refuses
    (SPEC-PR-2). And a value it refuses that the source accepts is an integer outside
    the safe range. So an integer outside the safe range is refused or decided as the
    source decides it, and is never accepted as another number. Refusing it narrows the
    source's accepted set and is a profile decision, as the closed reading of SPEC-P-1
    is. Where the assertion at a schema would make the validator accept what the source
    refuses, as under `oneOf` or `not` it can, Castr writes that place in a way that
    keeps both, or gives a located rejection.
  - _Stating the narrowing._ At each schema where the assertion is written, the run's
    report has an entry (SPEC-PR-8), the TypeScript output has a comment, and the Zod
    output has an annotation. Each says that an integer in the safe range is asserted
    there and that an integer outside it is refused.
  - _Reading it back._ The annotation records that the source says integer, with its
    `format` if it has one. A reader of Zod that meets it reads the source's integer,
    and does not read the safe range as bounds the source stated. The form of the
    annotation is part of SPEC-N-3 and is open; section 12 binds it.

### SPEC-G-4 gains a paragraph, after "Those decisions prove the accepted side."

> One kind of difference between those decisions is SPEC-P-7's and is not a
> disagreement: a sampled integer outside the safe range that the reference validator
> accepts against the source and the generated Zod validator refuses. The reverse is a
> disagreement. For each shape whose Zod validator asserts the safe range, the sample
> holds 9007199254740992 and −9007199254740992.

### SPEC-G-5 gains a sentence, at the end of its "one exception"

> A constraint is also such an exception where the check shows that it decides no
> value differently from its absence among the values the safe-range assertions of
> SPEC-P-7 in its shape admit.

### The change log gains a row

> 0.9.0. Numbers in JavaScript targets (SPEC-P-7): an integer is written as `number`
> and asserted to be in the safe range; the validator never accepts what the source
> refuses and refuses beyond it only integers outside the safe range; the narrowing is
> stated in the run report, a TypeScript comment and a Zod annotation; and the JSON
> parser's limit is declared once in every run's report. SPEC-G-4 names the one
> difference and SPEC-G-5 the constraint that difference makes idle. Owner decisions four and seven of 20 November 2026.

## What the owner should know before approving

Each follows from the text above and from nothing else.

- **Decision four as worded could widen, and the text now forbids that.** Asserting the
  safe range at one schema can make a validator accept what the document refuses, under
  `oneOf` or `not`. The clause says the validator never does; where Castr cannot write
  such a place soundly it refuses the document with a located rejection. How often real
  documents hold such a place is not measured. Oak's document is not known to.
- **Nothing writes the annotation until its form is decided.** The form belongs with
  how Zod is read (SPEC-N-3), which is open, and section 12 says no code assumes an
  answer to an open item. It is designed in part three with the mark on a Zod check.
- **Every integer in the output carries the statement,** including one the source
  already bounds, such as `minimum: 0, maximum: 10` or `format: int32`. The first draft
  tried to leave those out and could not say exactly which they are. The statement is
  true everywhere it appears: it says what is asserted, not that something was lost.
- **Castr's Zod refuses what the document it came from accepts,** for integers outside
  the safe range, and reading that Zod back gives a document that accepts them again.
  That is decision four as accepted. The two sides differ by design and the annotation
  is what says so.
- **`type: ["integer", "number"]` is not narrowed.** It accepts every number, so there
  is no integer to assert.
- **A number in a JSON document Castr reads has been through the same parser.** A bound
  of `9223372036854775807` reaches Castr as 9223372036854775808. The definition of a value
  in section 3 says numbers are exact and SPEC-P-5 says bounds are held exactly; for a
  document given as a value that cannot be so, and for a file it needs a reader that
  keeps the text. This draft says the limit and does not settle those two clauses.

## What this part leaves, and where it goes

- **The form of the Zod annotation**, and the picture's case that looks for it: with the
  technique for reading Zod (SPEC-N-3) and the mark part three defines (N5).
- **Which class the integer rows have** in the tables, now that the outcome for a value
  outside the safe range is refusal: part three (N5).
- **The picture's cells for integer rows.** Today `type: integer` to Zod and
  `format: int64` in both columns read wrong against the source. After approval the case
  for such a row states that the specification's outcome for a sample outside the safe
  range is refusal. That change follows the approved text.
- **The code.** The Zod and TypeScript writers change `int64` from `bigint` to `number`
  and gain the three statements. That is a leg of the course (N6).
- **Numbers held exactly when a document is read** (section 3 and SPEC-P-5 against a
  JSON parser): a leg of the course (N6) for a file, and a sentence for the owner in a
  later amendment for a document given as a value.
- **A parameter, a header and a body that is not JSON.** Their numbers arrive as text
  and no clause says how that text becomes a number. That is the endpoint definitions'
  column of part three (N5); SPEC-P-7 speaks only of a number carried as JSON.
- **What Castr drops today.** A `maximum` in a typeless `allOf` branch beside an
  integer, a bound beside a `$ref`, and a `const` of 9007199254740992 are each written
  as `z.int()` alone. These are defects for the course's legs (N6), found by the second
  review.
- **The reference validator is wrong about decimal `multipleOf` and about `int64`.** It
  refuses 0.3 as a multiple of 0.1, which the source and Zod accept, and it accepts
  `1e19` as an `int64`. Both go to the leg that builds the proof of SPEC-G-4 (N6): the
  proof needs a reference that decides those as the source does.

## Reviews

### First review, of the first draft, 22 November 2026

One adversarial reviewer, told to find a schema and a value for which the text gives a
false, undefined or double outcome. It ran its cases with Zod 4.6.7 and Ajv 8.20.0.

| #   | Finding                                                                                                                                                                             | Disposition                                                                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The examples for a stated number ("such a `maximum` refuses nothing") were false in a schema that is a number: `maximum: 9007199254740993` with the value `1e30`                    | The rule for stated numbers is cut. In an integer schema no rule is needed ("Facts"); in a number schema SPEC-PR-2 already governs                                 |
| 2   | "Never written rounded" contradicted the general rule, whose only Zod form is the bound written as a neighbouring number                                                            | Cut with 1                                                                                                                                                         |
| 3   | "Stands for the number its shortest text names" made 1152921504606846976, an exact JavaScript number, match nothing as an `enum` member while the value paragraph said accept       | The term and the sentence are cut. The clause now speaks only of the JavaScript number the parser gave                                                             |
| 4   | For `type: integer` and the text `9007199254740993`, one paragraph said decide as the source decides the nearest number (accept) and another said refuse                            | The parser paragraph no longer says how the number is decided, only which number is. The integer paragraph decides it                                              |
| 5   | "A value larger in magnitude than every JavaScript number is refused" was false: `1.7976931348623158e308` parses to the largest number; `z.unknown()` accepts infinity              | Sentence cut. The clause says the parser gives "the nearest JavaScript number, or an infinity" and makes no claim about the outcome                                |
| 6   | The SPEC-G-4 paragraph required a sample it also excluded; counted two differences where more exist; and rested on a false fact (the reference and Zod differ on `multipleOf: 0.1`) | Rewritten to one difference with two named sample values. The false fact is removed; the reference's two defects are routed to N6                                  |
| 7   | "`type` names `integer`" did not define for a list: `["integer", "number"]` accepts 1.5, which the clause would refuse                                                              | "Names `integer` and does not name `number`", and "accepts a number there only if" so that a list with `string` is not said to write `number` alone                |
| 8   | The exception to stating the narrowing gave wrong answers across `allOf`, for exclusive bounds, and for formats other than `int32`                                                  | The exception is cut and the statement reworded so that it is true wherever it appears. The cost is said under "What the owner should know"                        |
| 9   | SPEC-G-5 was not amended: a bound beyond the safe range has no value that flips a decision in Zod                                                                                   | SPEC-G-5 gains a sentence                                                                                                                                          |
| 10  | A narrowing is none of the four classes of the scope-and-fidelity table, and SPEC-G-4 still said "identical"                                                                        | The paragraph in SPEC-G-4 now names itself as the one difference. The class of the integer rows is part three's (N5)                                               |
| 11  | "Reading it back" contradicted "binds only what is written", and makes one Zod validator mean two accepted sets                                                                     | "Binds only what is written" is cut. The second point is the owner's decision four as accepted, and is said to the owner in plain words                            |
| 12  | The reference to SPEC-PR-7 was wrong: `const: 9007199254740993` is satisfiable in the source                                                                                        | Cut with 1                                                                                                                                                         |
| —   | Unclear: "nearest" at a tie                                                                                                                                                         | The clause says what the parser gives; the parser's rule is ECMAScript's and is not restated                                                                       |
| —   | Unclear: the fact about a dropped `const` was run with a JavaScript literal, so Castr received 9007199254740992; and "the model holds every number exactly" cannot hold for a value | The fact is removed. The clause no longer repeats the claim; the limit paragraph says a document given as a value holds JavaScript numbers, and the rest is routed |
| —   | Attacked and held: no integer outside the safe range arrives inside it; the Zod and parser facts; the `int64` sample at 9007199254740992                                            | Kept                                                                                                                                                               |

### Second review, of the second draft, 22 November 2026

A second reviewer, with no sight of the first one's work beyond the table above, asked
also to say whether each finding reaches the core of a decision or the seat's wording.

| #   | Finding                                                                                                                                                                                | Disposition                                                                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Core of decision four. Under `oneOf` (and `not`) the assertion widens: `oneOf: [{type: integer}, {type: number}]` refuses 9007199254740992 in the source and accepts it in Castr's Zod | The clause now states what holds of the whole validator, with the assertion as the means and a located rejection where it cannot be kept. Said to the owner         |
| 2   | The SPEC-G-4 paragraph was false under `anyOf` of the same two: both sides accept, and the paragraph demanded a refusal                                                                | The paragraph permits one kind of difference and demands none                                                                                                       |
| 3   | The paragraph excused two values while SPEC-G-5 samples others (`maximum: 1e30`), and proved nothing for `multipleOf: 3`                                                               | Every sampled integer outside the safe range is covered. That a narrowing exists is not what needs proof; that no widening does is, and the two values test it      |
| 4   | The fact about bounds was false for a bound with a fraction                                                                                                                            | The fact is limited to integer bounds; the fraction is the parser's limit on the document, routed                                                                   |
| 5   | "`format: int64` is such an integer" gave two outcomes for `type: number, format: int64` and for no `type`                                                                             | "`type: integer` with `format: int64` is such a schema"                                                                                                             |
| 6   | "What their output decides is the JavaScript number the JSON parser has made" is false for parameters, headers and bodies that are not JSON; and a YAML file has its own parser        | "A number carried as JSON". Parameters are routed to part three. The sentence about a document given as a value is removed from the clause                          |
| 7   | An infinity is a second difference: the reference accepts it for `type: number` and `z.number()` refuses                                                                               | An infinity is not a value (section 3) and no JSON text states one; the clause claims nothing about its outcome. The reference accepting it is with its two defects |
| —   | Unclear: Zod as a source. An annotated `z.int()` refuses 9007199254740992 and what is read from it accepts                                                                             | This is decision four as accepted, said to the owner in plain words                                                                                                 |
| —   | Unclear: section 12 says no code assumes an answer to an open item, and the annotation's form is open                                                                                  | The clause now says so, and the owner is told nothing writes the annotation until part three decides its form                                                       |
| —   | Unclear: SPEC-PR-2's "a class or a rejection" has no class for a narrowed integer until part three                                                                                     | Part three (N5)                                                                                                                                                     |
| —   | Unclear: the SPEC-G-5 sentence did not reach a bound in a typeless `allOf` branch                                                                                                      | Reworded to speak of the shape                                                                                                                                      |
| —   | Attacked and held: the parser gives the nearest number or an infinity (17 texts); the facts at 9007199254740992; lists with `null` and `string`; integer `const` and `enum` members    | Kept                                                                                                                                                                |

### Third review, of the third draft, 22 November 2026

A third reviewer, asked to class each finding as core (a decision cannot hold as
decided), text false, or minor. Its count: core none, text false six, minor two. The
exit set before it (more than three faults of any kind stops drafting) was met.

| #   | Finding                                                                                                                                                                                                                                            | Where it goes                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | "It accepts no value the source refuses" is false today without the assertion: `z.int().multipleOf(3)` accepts 9007199254740991, which is not a multiple of 3. Zod's remainder check has a tolerance that grows with the value divided by the step | A defect in what Castr writes for `multipleOf`, for the course's legs (N6); and a fact any numbers text needs |
| 2   | "Or gives a located rejection": no kind fits. The meaning can be written in Zod, so not `UNEXPRESSIBLE`; `NOT-READ` is closed by SPEC-FV-1; `NOT-YET-BUILT` would bar advertising the pair                                                         | The text must state the rule for writing such a place. With the tables                                        |
| 3   | The two fixed sample values prove nothing for `oneOf: [{type: integer, multipleOf: 2}, {type: number, multipleOf: 3}]`, which widens at 9007199254740996                                                                                           | The sample must come from the source's own refusals outside the safe range. With SPEC-G-4 and SPEC-G-5        |
| 4   | "A value it refuses that the source accepts is an integer outside the safe range" is false beside SPEC-P-1's closed reading, and is not limited to places where the assertion is written, so a wrong output could pass the proof                   | The permitted difference must be tied to the place the assertion is written                                   |
| 5   | "Never accepted as another number" is false for a schema that is a number, and for `9007199254740991.4` under `type: integer` two sentences give opposite answers                                                                                  | Both properties must be stated of the JavaScript number the parser gave                                       |
| 6   | "Asserts there" is unconditional, so it contradicts writing a place another way; and it is not limited to JSON, while Castr writes `z.int()` for a path parameter                                                                                  | With the endpoint definitions' column                                                                         |
| 7   | Minor. The fact about integer bounds fails under `oneOf` with an exclusive bound just outside the range; "What Castr drops today" omits `not` (`{type: number, not: {type: integer}}` is written `z.number()`)                                     | Facts corrected when numbers are next written; the dropped `not` is a defect for N6                           |
| 8   | Minor. The notes for the owner left out the rejection kind and its cost, that `{type: integer, minimum: 9007199254740992}` accepts values in the source and none in Zod, and that every integer written would depend on an open item               | Said to the owner when numbers are next brought                                                               |

## What stands

Input to whichever step writes numbers next. Each was attacked and held, or was found
by a review and run.

- The owner's decisions four and seven, unchanged.
- The parser gives the nearest JavaScript number or an infinity (17 texts run). No
  integer outside the safe range arrives inside it.
- 9007199254740992 and −9007199254740992 are exact, the reference validator accepts
  each for `type: integer` and for `format: int64`, and `z.int()` refuses each.
- "`type` names `integer` and does not name `number`" defines the schemas concerned;
  lists with `null` or `string` held.
- Asserting the safe range at one schema can widen, under `oneOf` and `not`. A sound
  form exists: an integer of any magnitude can be written in Zod as a union of the
  safe integers and the numbers at or beyond each edge.
- The statement of the narrowing cannot be limited to "where something is narrowed" by
  one schema object's keywords; stated everywhere the assertion is written, it is true.
- Defects in what Castr writes today, for N6: `int64` as `bigint`; `multipleOf` on a
  large integer; a `maximum` in a typeless `allOf` branch, a bound beside a `$ref`, a
  `const` of 9007199254740992 and a `not` each dropped.
- Defects in the reference validator, for the proof of SPEC-G-4: decimal `multipleOf`,
  `int64` beyond its range, and an infinity accepted.
- Numbers in a JSON document Castr reads have been through the parser, against section
  3 and SPEC-P-5.
