# D1 lint findings — `function-return-type` (S3800) & `in-operator-type-error` (S3785)

**Date:** 2026-06-15 · **Branch:** `feat/transplant-engraph-practice` · **Author:** an AI agent (Claude, Opus 4.8)
**Status:** **RESOLVED 2026-06-19** — see §0. The §1–§9 handoff below is the (suspect) investigation history; read §0
first. The original conclusions were unverified; the actual root cause was measured firsthand on 2026-06-19 and is **not**
what §4/§9 guessed.

---

## 0. Resolution (2026-06-19) — VERIFIED root cause + fix

The 126 violations were **not** code smells and **not** a discriminated-union/optionality property of castr's code.
**Root cause (measured firsthand at the bit level): a TypeScript-version skew.** `lib` resolves TypeScript **6.0.3**;
`eslint-plugin-sonarjs@4.0.3` declares `typescript: ">=5"` and resolved its **own bundled 5.9.3** in-subtree. The
`typescript-eslint` parser builds the `Type` objects with **6.0.3**, but each sonarjs rule does
`type.flags & ts.TypeFlags.X` where `ts` is the rule's **5.9.3** — and the two releases **renumber `TypeFlags`**:

| flag           | TS 6.0.3  | TS 5.9.3  |
| -------------- | --------- | --------- |
| `Undefined`    | 4         | 32768     |
| `Null`         | 8         | 65536     |
| `Union`        | 134217728 | 1048576   |
| `Intersection` | 268435456 | 2097152   |
| `StringLike`   | 12583968  | 402653316 |

So `Union(TS6)=0x08000000` falls **inside** `StringLike(TS5.9.3)=402653316` → S3785 (`isPrimitive`) false-fired on every
type-safe **object-union** `in` guard; and `Undefined(TS6)=4 & Undefined(TS5.9.3)=32768 = 0` → `isNullLike` **missed**
`undefined`, so S3800 counted `X | undefined` as a second return category. All five facts were reproduced firsthand
(load both `typescript` instances, print `TypeFlags`; the arithmetic collisions; the `+2 -8` install when the override
landed; lint count `121+5 → 0`).

**Fix — single TypeScript across the workspace** (`pnpm-workspace.yaml` `overrides: { typescript: 6.0.3 }`). Under aligned
TypeScript both rules compute correctly and report **ZERO** violations, so both were restored to **`error`** in
`lib/eslint.config.ts`. Full `pnpm check` green. (Note: a sub-agent's _simulation_ estimated "~8 genuine cross-kind
returns" would survive — the **actual aligned-TS run flags 0**; the measurement supersedes the simulation. castr's
mandated `@returns` TSDoc independently exempts S3800 functions, verified.) §4's "central puzzle" is hereby answered: the
checker's inferred types differed from neither the annotations nor the rule logic — the **flag constants** were from the
wrong TypeScript instance. The lesson in §7 still stands and was vindicated: the rule was right; the environment was skewed.

---

> ## ⚠️ READ THIS FIRST — this is a SUSPECT session output
>
> This report was produced in a session where its author **made repeated, confident, wrong claims** about these two
> lint rules and had to retract them more than once (see §5). **Treat every conclusion here as suspect and re-derive
> it.** The durable value is exactly two things:
>
> 1. the **[VERIFIED]** facts — and even those you should **re-check yourself** with the reproduction commands given; and
> 2. the **documented failure process** (§5, §7) — so the next agent does not repeat it.
>
> There is **deliberately no "recommendation" / "next steps" section.** A _"what I would propose if I were
> recommending"_ section exists (§9), but it is **quarantined**: it is the author's hunch, not advice. Given the
> author's error rate this session, trust §9 **least of all** — it is included only because the owner asked for the
> proposed direction to be visible, not because it is reliable.
>
> **Tagging convention used throughout:** **[VERIFIED]** = checked firsthand, method shown. **[ASSUMPTION]** = not
> verified; an unproven lead. If a claim has no tag, assume it is **[ASSUMPTION]**.

---

## 1. Why this work happened (original motivations — including the flawed one)

- The session began as grounding/reflection. The owner then set the **D1** lane: "lint `warn → error`" for two
  `eslint-plugin-sonarjs` rules that began **erroring** after a `4.0.2 → 4.0.3` bump.
- **Motivation A (legitimate).** To unblock pushing the (newly consolidated) branch — pre-push runs `check:ci`, which
  runs lint — the author downgraded both rules `error → warn`, the owner-sanctioned transitional state in
  `DEFINITION_OF_DONE.md`. Committed as `3b3f0d9`. This is sound and is the current state.
- **Motivation B (the flawed one, stated plainly so the next agent can watch for it).** Facing the `warn → error`
  half — **126 violations** — the author was pulled toward _"these are false positives, deselect the rules,"_ i.e.
  making the hard part disappear rather than doing it. This is the **manufactured-completion** failure mode (the
  mirror of disable-to-dodge). It biased every analysis that followed. The owner's repeated interventions
  ("be careful," "probe your motivations," "research the rule first," "I don't trust your analysis") are what
  corrected it. **The rules being inconvenient is not the same as the rules being wrong.**

## 2. The rules, from source — [VERIFIED]

Installed: `eslint-plugin-sonarjs@4.0.3`
(`node_modules/.pnpm/eslint-plugin-sonarjs@4.0.3_eslint@10.4.1_jiti@2.7.0_/node_modules/eslint-plugin-sonarjs/`).
`lib/package.json` + root `package.json` declare `^4.0.2`.

- `function-return-type` → SonarSource **S3800**; `in-operator-type-error` → **S3785** (via `cjs/plugin-rules.js`,
  `cjs/S3800/`, `cjs/S3785/`).
- **Neither rule has any configuration option** — `cjs/S3800/generated-meta.js` and `cjs/S3785/generated-meta.js`
  both show `defaultOptions: []` and **no `schema`**. So **"tune the rule" is not available.** The choices are: fix
  the code, or change the rule's severity / selection.
- **S3800** (`type: 'suggestion'`), from `cjs/S3800/rule.js`:
  - Flags a function when its returns span **> 1 distinct _category_**, where categories are coarse: `prettyPrint`
    collapses **all object types → `'object'`**, arrays → `'array'`, functions → `'function'`, primitives by name.
  - **Excludes `null` / `undefined` / `void`** (`isNullLike`).
  - **Exempts any function carrying a `@return` / `@returns` JSDoc tag** (`!hasReturnTypeJSDoc`).
  - Exempts a "sanitation function" (returns `string | true`).
- **S3785** (`type: 'problem'`), from `cjs/S3785/rule.js`: flags `x in y` when the type of **`y` (the right operand)**
  carries a `StringLike | NumberLike | BooleanLike | Null | Undefined` flag (`isPrimitive`).

## 3. Current violations — [VERIFIED]

- `pnpm lint` → **126 problems, 0 errors, 126 warnings** = **121 S3800 + 5 S3785** (both rules currently `warn`).
- The **5 S3785 sites** (right operand of each `in`):
  | Site | `in` expression (right operand's declared type) |
  | --- | --- |
  | `lib/src/schema-processing/compatibility/integer-target-capabilities.openapi.ts:84` | `key in pathItem` (`PathItemObject \| ReferenceObject`) |
  | `…/parsers/openapi/openapi-document.object-semantics.ts:83` | same `hasPathItemMembers` shape |
  | `…/context/mcp/template-context.mcp.security.from-ir.ts:106` | `'$ref' in component.scheme` (`SecuritySchemeObject \| ReferenceObject`) |
  | `…/parsers/openapi/operations/builder.operations.ts:170` | `param.in in irOperation.parametersByLocation` (`Record<'query'\|'path'\|'header'\|'cookie', CastrParameter[]> & { querystring?: … }`) |
  | `…/writers/openapi/openapi-writer.media-types.ts:31` | `'$ref' in mediaType` (`IRMediaType \| IRMediaTypeReference`) |
- The **121 S3800 sites** are spread across `schema-processing`, concentrated in the zod-parser subsystem. Reproduce
  the exact list: `cd lib && pnpm exec eslint . --format json | node -e '<filter messages by ruleId>'`.

## 4. The central unresolved puzzle — read before believing anything else

**The author's reading of _both_ rules' source predicts the flagged sites should NOT be flagged — yet they are.**

- **S3800:** `getSchemaFromContent` (`…/template-context.endpoints.content.ts:54`) is declared `CastrSchema | undefined`,
  and `CastrSchema` is a plain `interface` **[VERIFIED via ts-morph + grep]**. By the rule's own logic (exclude
  `undefined`, collapse object → `'object'`) that is **one** category → should not flag. **It is flagged**
  **[VERIFIED via fresh `eslint --no-cache --format json`]**. Same for many `Object | undefined` / `Object | null`
  functions (`:88`, `:107`, `template-context.mcp.responses.ts:41/130/204`).
- **S3785:** each flagged right operand is, by its annotation, a union of object types. By the author's reading of
  `isPrimitive` (a union type's `flags` is `Union`, which ANDs to 0 against the primitive flags), a union operand
  should not flag. **They are flagged.**

So exactly one of these is true, and **the author could not determine which** (all of the following are
**[ASSUMPTION]**):

- (a) the author is **misreading both rules' helpers** consistently
  (`isNullLike` / `isObjectLikeType` / `getReturnTypeOfSignature` / `getBaseTypeOfLiteralType` / `isPrimitive`); **or**
- (b) the types the **TypeScript checker actually infers** at these sites differ from the source annotations
  (narrowing, widening, overload-implementation signatures — note `resolvePrimarySuccessResponseSchemaFromIR` has an
  overload), and the rules act on those inferred types, not the annotations.

**The rules use the TypeScript checker, not the annotations.** The single most valuable missing datum is: _what
categories does each rule actually see at each site?_ That is **unmeasured**. Until it is known, **no** "false
positive" vs "genuine" claim is justified — including any made earlier in this session's chat.

## 5. The author's errors, explicitly — so you don't inherit them

| Claim the author made (in chat)                                      | Status         | What was wrong                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Both rules fire only false positives on type-safe code → deselect"  | **RETRACTED**  | An unverified assumption asserted as fact. The correct prior: "the rule is right; my reading of the types is wrong."                                                                                                                                                             |
| "S3800 fights `T \| undefined` and discriminated-union returns"      | **RETRACTED**  | Source **[VERIFIED]** shows it _excludes_ null/undefined and _collapses_ objects — the **opposite** of the claim. The supporting "samples" were misattributed line numbers.                                                                                                      |
| "All 121 are optional / discriminated-union false positives"         | **RETRACTED**  | Built on the above misreading.                                                                                                                                                                                                                                                   |
| The ts-morph probe's return-_category_ output (`/tmp/type-probe.ts`) | **UNRELIABLE** | The probe used `getDescendantsOfKind(ReturnStatement)`, which **counts returns inside nested callbacks** (e.g. a `.sort((a,b) => return aNum-bNum)` produced a phantom `number` category for the outer function). Only the **declared return types** it printed are trustworthy. |

## 6. Verified vs assumed — the honest ledger

**[VERIFIED]** (re-check each with the repro steps anyway): rule versions & IDs; the rule source logic as written;
**no config options on either rule**; the `@returns` exemption _exists in S3800's source_; 126 violations
(121 + 5); the exact 5 S3785 locations; that S3800 flags `Object | undefined`-returning functions (contradicting the
author's reading); that eslint's default output carries **no** secondary "Returns X / Returns Y" detail (the full
message objects were dumped — only the primary message is present).

**[ASSUMPTION] / UNVERIFIED:** that adding `@returns` actually _clears_ a violation in practice (the exemption is in
the source but was **never tested**); **why** `Object | undefined` functions are flagged; the actual inferred types of
the 5 S3785 operands (the probe computes them, but its output was truncated before that section printed — **they were
never read**); whether any flagged function is a "genuine smell" vs a "deliberate union" (never classified); the
"better-or-worse / maximize-signal" rule-selection framework the author floated (proposed, never validated against
real data — **do not** use it to justify deselecting anything).

## 7. The prior that should have governed (the lesson)

An established, type-aware SonarSource rule, run across millions of projects, being _wrong_ is far less likely than
one agent's static reading being wrong. When the rule and a reading disagree, **assume the reading is wrong and
measure.** The author violated this repeatedly; this report's verified/assumed split is the corrective.

## 8. How to re-derive everything yourself (reproduction)

- Rule source: the `cjs/S3800/rule.js` and `cjs/S3785/rule.js` paths in §2.
- Violation list: `cd lib && pnpm exec eslint . --no-cache --format json` then filter `messages[].ruleId`.
- Declared types: `lib`'s `ts-morph` (`new Project({ tsConfigFilePath: 'lib/tsconfig.json' })`, then
  `getFunction(name).getReturnType().getText()` and `BinaryExpression` `in` `.getRight().getType().getText()`).
  **If you re-probe S3800, attribute returns per immediate function (mirror the rule's `FunctionScope` stack); do not
  count nested-callback returns** (that is the bug in this session's probe).
- The rule's _own_ verdict (the missing datum): S3800's `report` call passes
  `toSecondaryLocation(stmt, 'Returns ' + prettyPrint(type))` secondary locations naming the categories it considers
  mixing. Default eslint output drops them. Surface them (a `RuleTester` harness, a custom formatter, or sonarjs's
  secondary-location output mode) to see exactly what the rule sees — this likely resolves §4 outright.

## 9. What the author WOULD propose if recommending — ⚠️ QUARANTINED, NOT advice, trust least

> This section exists only because the owner asked for the proposed direction to be visible. Given §5, **do not act on
> it without independently re-deriving it.** It is a hunch, not a plan.

The proposed _method_ (not conclusion) would be **measure before deciding, do not theorize**: (i) surface the rule's
own secondary "Returns X/Y" categories (§8) and measure the 5 S3785 operand types, to resolve §4; (ii) only then
classify each violation as a genuine return-type inconsistency (→ fix the return) or an undocumented function (→ add
the `@returns` that castr's TSDoc doctrine already mandates, which **per the source** also satisfies S3800 — but test
that the exemption actually clears it first); (iii) treat **"deselect the rule" as off the table** absent firsthand
evidence the rule is noise here, owner ratification, and an ADR — and the author's (suspect) research pointed _away_
from deselect. **Re-verify all of this; the author was wrong repeatedly this session.**

## 10. Repo state at handoff — [VERIFIED]

- Branch `feat/transplant-engraph-practice`; in sync with origin; `check:ci`-green end-to-end (126 sonarjs **warnings**
  are the owner-sanctioned D1 transitional state, not failures).
- Both rules at **`warn`** via `lib/eslint.config.ts` (commit `3b3f0d9`), with an inline block citing D1 /
  `DEFINITION_OF_DONE.md` §Transitional gate states. `pnpm lint` exits 0 (warnings only).
- D1 is currently framed across `DEFINITION_OF_DONE.md`, the transplant tracker, and `session-continuation.prompt.md`
  as "warn→error refactor pending." **Per §4 that framing embeds an unconfirmed assumption** — the resolution might be
  "fix the returns," might be a justified rule-selection, and **nobody yet has the evidence to say which.** Do not let
  the "refactor pending" wording pre-commit you to an answer.
