# Plan: Doctrine Enforcement Truthing (make the strict claims enforceable)

**Status:** Backlog (remediation) · **Findings:** M1, M2, M12, L1-L5 · **Risk:** Low (⚠️ doctrine edits need user approval)
**References:** report `06-doctrine-conformance.md`; `principles.md`, ADR-026; `lib/eslint.config.ts`

---

## User impact

Several doctrine claims are not actually enforced, so the code drifts from them undetected (the same mechanism that let
the C6 reversal ship). Per the **strictest-of-three** rule, raise enforcement up to the strict doctrine — do not soften.

## Scope (per the strictest-normalisation rule)

- **M1/M12:** `principles.md` declares `Object.*`/`Reflect.*` forbidden but no lint rule enforces it (148 uses). Add a
  `no-restricted-syntax`/`no-restricted-properties` rule (at least for type-information-losing uses) and refactor; fix
  the `Reflect.get/set`-on-`deprecated` site (M12) to typed access.
- **M2:** ADR-026's string-method ban is evaded via lodash function-call form (20 files, incl. ad-hoc `$ref` parsing).
  Add selectors/`no-restricted-imports` for the lodash form (or route `$ref` parsing through the centralised utilities),
  then reconcile ADR-026 to the real enforced scope.
- **L1:** `principles.md:970` permits test-`as`; the linter forbids it. Tighten the doc (remove the permission).
- **L2:** extend `no-restricted-types` to the `{[k:string]:unknown}` sibling.
- **L3/L4/L5:** govern/justify the two ungoverned `eslint-disable`s (`version.ts:17`, `preflight-validator.ts:48`);
  delete the stale `eslint.config.ts:112` "temporary" comment; fix `version.ts` `isRecord` (folds into plan 05).

Out of scope: relaxing any doctrine claim (forbidden by the strictest rule).

## Assumptions to validate

1. The 148 `Object.*`/`Reflect.*` uses have typed alternatives (most do); some may need a narrow governed allowance.
2. Editing `principles.md`/ADR-026 is **explicitly approved by the user first** (required by `principles.md`).

## Success criteria

- ESLint fails on a new `Object.keys`/`Reflect.get`/lodash-`split`-in-`src` introduction (rule proven by a fixture).
- The 148 uses are refactored or covered by a governed, documented allowance.
- `principles.md`/ADR-026 wording matches the enforced reality (after user approval).
- `pnpm qg` green.

## TDD order

1. Add the lint rules (red against current `src`). 2. Refactor uses / add governed allowances to green. 3. (After
   approval) reconcile `principles.md`/ADR-026 wording. 4. Gate green.
