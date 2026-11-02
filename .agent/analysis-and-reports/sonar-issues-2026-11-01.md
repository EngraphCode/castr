# SonarQube Cloud issues for castr: analysis

- Date: 2026-11-01
- Author: Smith stirs Ashes (claude / claude-opus-5-5 / 7bd175), the second seat to Bilby hunts Dreamscape (d71882)
- Project: `EngraphCode_castr` (organisation `engraphcode`), branch `main`
- Mode: read-only. No issue or hotspot status was changed, no tracked file was edited, nothing was committed.
- Commissioned: owner, 1 November 2026, verbatim: "please also have an Opus 5.5 sub-agent use the team start skill, then fetch and analyse the current Sonar issues for Castr". Saved to the repository on the owner's word the same day ("save the sonar report"); spot-checked by the lead before saving (the total of 380 and its type split, the gate status, the switched-off rule in `lib/eslint.config.ts`, and the widened `questionType` union in the Oak fixture).
- Owner's framing: "The issues are not a priority, as we expect to carry out significant rewrites and refactoring, but they remain potentially useful information." This report gives facts and a classification. It is not a remediation plan.

## 1. Summary

`main` has **380 open issues**: 5 bugs, 25 vulnerabilities and 350 code smells. There are 0 security hotspots and 0 accepted or false-positive issues. The quality gate ("Sonar way", the organisation default) is **OK**. The reliability and security ratings are both **C**, maintainability is A, duplication is 9.8%, and no coverage is measured.

Over half of the issues are not in castr's product code. 211 (55.5%) are in Practice tooling: `agent-tools`, shell scripts under `.agent/` and `.claude/hooks`, and CI YAML. One shell script, `.agent/claude-harness-integrations/cloud-environment-preflight.sh`, carries 83 issues (21.8% of the total).

Against the destination specification (draft 0.4.1, §8, §9, §11):

| Group                                            | Issues                                                                                        | Basis                                                                                                                                                                                     |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| (a) in code the specification condemns           | **117**                                                                                       | 32 in code §11 says is deleted (the Markdown writer and the MCP projection); 85 in the present model, parsers, writers, their consumers and their committed output (SPEC-AR-1, SPEC-AR-3) |
| (b) in code likely to survive, move or stay      | **263**                                                                                       | 52 in castr `lib` code outside the condemned set; 211 in Practice tooling                                                                                                                 |
| (c) patterns a rewrite must not repeat (overlay) | **101** product-code issues in five patterns, plus **212** in places no local analyser covers | Section 7.3                                                                                                                                                                               |

(a) and (b) partition all 380 issues. (c) cuts across them.

**Nothing is urgent.** No bug is a live defect. No vulnerability is exploitable without an attacker who already controls the network path to an HTTPS origin, the user's `PATH`, or the operator's own command line (section 8).

The most useful finding is a contradiction between two of castr's own gates. In `lib/src`, 56 issues are SonarCloud asking for native string and array methods, `startsWith`, `includes` and `codePointAt` among them, that the repository's ADR-026 ESLint ban forbids. The code works round the ban with lodash calls, hand-rolled `charCodeAt` loops and `.some(x => x === v)`. The string matching ADR-026 meant to remove is still there, spelled so the syntax ban cannot see it. 26 of those 56 are outside the code the specification condemns.

## 2. Provenance and completeness

- **The analysis is of current `main`.** The newest analysis is dated `2026-09-25T21:55:11Z` and records revision `851c7efe`. That is `main` and `origin/main` today: the merge of #116, committed `2026-09-25T21:55:01Z`. There are nine analyses on `main` since `2026-09-03`. Only one branch, `main`, is analysed.
- **Complete data.** All 380 open issues came back in one page (page size 500). The MCP tool `search_sonar_issues_in_projects` independently reports `total: 380` for `OPEN` and `CONFIRMED`, and `total: 0` for `ACCEPTED` and `FALSE_POSITIVE`. The MCP tool `search_security_hotspots` reports `total: 0`.
- **Method.** Bulk retrieval and facets used the public web API (no token), because the MCP issue tool has no facets and the full payload would have flooded context. Totals were cross-checked through MCP. Rule descriptions came from the MCP tool `show_rule` for the top five rules and S8707, and from the public `api/rules/show` for the rest. Queries are listed in section 10.
- **Automatic analysis (inferred, not confirmed).** The repository has no `sonar-project.properties` and no `.sonarcloud.properties`. Nothing under `.github/` mentions Sonar. The analyses carry `projectVersion: "not provided"`, and no coverage measure exists. Together that is consistent with SonarCloud automatic analysis. The endpoints that would confirm it (`api/autoscan/eligibility`, `api/ce/activity`) return 401 without a token.
- **One API pitfall, recorded so nobody trusts it.** The public `api/issues/search?...&inNewCodePeriod=true` returned all 380 issues, which contradicts the gate's new-code ratings. The MCP tool, given `inNewCodePeriod: true`, returned 3, and that matches the measure `new_violations = 3`. The MCP figure is the one used here.

## 3. Headline measures (`main`, analysis of `851c7efe`)

| Measure                     | Value                                                             |
| --------------------------- | ----------------------------------------------------------------- |
| Quality gate                | OK ("Sonar way", default gate)                                    |
| Open issues                 | 380 (bugs 5, vulnerabilities 25, code smells 350)                 |
| Accepted / false positive   | 0 / 0                                                             |
| Security hotspots           | 0 (reviewed 100%, security review rating A)                       |
| Maintainability rating      | A (`sqale_rating` 1.0); technical debt 1,612 min; debt ratio 0.0% |
| Reliability rating          | C (3.0)                                                           |
| Security rating             | C (3.0)                                                           |
| Coverage                    | not measured (no `coverage` measure exists on the branch)         |
| Duplication                 | 9.8% (18,171 duplicated lines, 1,035 blocks, 126 files)           |
| Size                        | 142,443 lines of code (184,505 lines, 1,096 files)                |
| Lines of code by language   | TypeScript 141,163; shell 996; YAML 238; JavaScript 46            |
| Remediation effort, all 380 | 2,262 min (`effortTotal`)                                         |

Quality-gate conditions. All are on new code, and all pass:

| Condition                      | Threshold | Actual |
| ------------------------------ | --------- | ------ |
| New reliability rating         | A         | A      |
| New security rating            | A         | A      |
| New maintainability rating     | A         | A      |
| New duplicated lines density   | ≤ 3%      | 0.6%   |
| New security hotspots reviewed | 100%      | 100%   |

New-code period: mode `previous_version`, from `2026-09-03T14:22:28Z`. It holds 8,178 new lines, 3 new issues (all code smells, in `.agent/research/inherited-estate-2026-09-12/*.sh`), 0 new bugs, 0 new vulnerabilities and 12 minutes of new debt.

Duplication by area: `lib` 13.2%, of which `lib/tests-transforms` is 37.8% (7,655 lines, committed fixtures), `lib/tests-snapshot` 14.9% and `lib/src` 6.1%. Inside `lib/src`, `schema-processing` is 4.9%, `writers` 9.7% and `characterisation` 20.4%. `agent-tools` is 4.7%. Duplication is not an issue type, so it does not count towards SPEC-G-2.

## 4. Totals

By type and legacy severity:

| Type          | Blocker | Critical | Major | Minor | Total   |
| ------------- | ------- | -------- | ----- | ----- | ------- |
| Bug           | 0       | 0        | 5     | 0     | **5**   |
| Vulnerability | 0       | 0        | 16    | 9     | **25**  |
| Code smell    | 2       | 26       | 139   | 183   | **350** |
| **Total**     | 2       | 26       | 160   | 192   | **380** |

By software quality and impact severity. There are 410 impacts on 380 issues, because 30 issues carry two.

| Software quality | Blocker | High | Medium | Low | Issues |
| ---------------- | ------- | ---- | ------ | --- | ------ |
| Maintainability  | 2       | 27   | 75     | 149 | 253    |
| Reliability      | 0       | 94   | 15     | 23  | 132    |
| Security         | 0       | 4    | 12     | 9   | 25     |

By each issue's highest impact severity: Blocker 2, High 124, Medium 98, Low 156.

One rule produces 91 of the 94 high-severity reliability impacts: `shell:S7688`, the request to use `[[` rather than `[` in Bash. The other three are the two `S7739` bugs and one `S7727` bug.

By language: TypeScript 251 (247 `typescript:*` plus 4 `tssecurity:*`), shell 128, GitHub Actions 1.

## 5. Rules

54 distinct rules fire. The top rules by count:

| #   | Rule                                      | Count  | Type / impact                   | What it flags (from the rule definition)                                                                                         |
| --- | ----------------------------------------- | ------ | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `shell:S7688`                             | 91     | Smell / Reliability High        | `[` or `test` used for conditionals in Bash. The rule says `[` is subject to word splitting and pathname expansion; `[[` is not. |
| 2   | `typescript:S8907`                        | 23     | Smell / Maint. Medium           | A Lodash or Underscore call where a native method does the same job (here `join`, `drop`, `includes` from `lodash-es`).          |
| 3   | `typescript:S7778`                        | 20     | Smell / Maint. Low              | Consecutive `Array#push()` calls on one array that could be a single call.                                                       |
| 4   | `typescript:S7758`                        | 19     | Smell / Maint. + Rel. Low       | `charCodeAt` or `fromCharCode`, which work on UTF-16 code units, where `codePointAt` or `fromCodePoint` handle surrogate pairs.  |
| 5   | `typescript:S6606`                        | 17     | Smell / Maint. Low              | `\|\|`, a ternary or an assignment that could be `??` or `??=`.                                                                  |
| 6   | `typescript:S7763`                        | 16     | Smell / Maint. Low              | A re-export written as import-then-export rather than `export … from`.                                                           |
| 7   | `typescript:S7765`                        | 12     | Smell / Maint. Low              | An existence check written with `.some()`, `.indexOf()` or `.lastIndexOf()` rather than `.includes()`.                           |
| 8   | `shell:S6506` (+ `githubactions:S6506` 1) | 11 + 1 | Vulnerability / Security Medium | An HTTP client that follows redirects (`curl -L`) without enforcing HTTPS on the redirect.                                       |
| 9   | `typescript:S6571`                        | 10     | Smell / Maint. Low              | A union or intersection constituent made redundant by another, here `unknown` absorbing every other member.                      |
| 10  | `typescript:S3776`                        | 9      | Smell / Maint. High             | A function over the cognitive-complexity limit of 15. All nine are in `agent-tools`; the worst scores 39.                        |
| 10  | `shell:S131`                              | 9      | Smell / Maint. High             | A `case` statement with no `*)` default clause.                                                                                  |
| 10  | `typescript:S4036`                        | 9      | Vulnerability / Security Low    | An OS command resolved through `PATH` (for example `execSync('git …')`).                                                         |
| 13  | `typescript:S8786`                        | 8      | Smell / Reliability Medium      | A regular expression with super-linear backtracking. All eight are in `agent-tools`.                                             |

Other rules worth naming, with fewer than eight issues each:

- **`tssecurity:S8707` (4, Security High):** "Agentic workflows should not be vulnerable to path injection attacks". It flags a CLI that reads or writes a path taken from its arguments without confining it to a base directory.
- **`typescript:S7739` (2, bug):** "Objects should not have a `then` property".
- **`typescript:S2137` (2, bug):** "Special identifiers should not be bound or assigned".
- **`typescript:S7727` (1, bug):** "Function references should not be passed directly to iterator methods".
- **`typescript:S2699` (2, Maintainability Blocker):** "Tests should include assertions".
- **`typescript:S4621` (6) and `typescript:S6564` (5):** duplicated union constituents and redundant type aliases. All 11 are in committed generated output.

## 6. Location

### 6.1 By area

| Area                                                                                              | Issues  | Bugs  | Vulns  | Lines of code |
| ------------------------------------------------------------------------------------------------- | ------- | ----- | ------ | ------------- |
| `lib/src` parsers: OpenAPI 15, Zod 10, JSON Schema 3                                              | 28      | 1     | 0      | 12,978        |
| `lib/src` IR model (`schema-processing/ir`)                                                       | 4       | 0     | 0      | 4,602         |
| `lib/src` writers: Markdown 17, OpenAPI 11, Zod 3, shared 2, JSON Schema 1, TypeScript 0          | 34      | 1     | 0      | 9,710         |
| `lib/src` conversion: JSON Schema 7, Zod 0, TypeScript 0                                          | 7       | 0     | 0      | 1,654         |
| `lib/src` template context (`schema-processing/context`): MCP 12, other 9                         | 21      | 0     | 0      | 5,930         |
| `lib/src` other schema-processing (compatibility 2, ast 1)                                        | 3       | 0     | 0      | 1,986         |
| `lib/src` rendering (templating)                                                                  | 0       | 0     | 0      | 1,245         |
| `lib/src` endpoints                                                                               | 4       | 0     | 0      | 1,120         |
| `lib/src` CLI                                                                                     | 4       | 0     | 2      | 438           |
| `lib/src` validation                                                                              | 3       | 0     | 0      | 650           |
| `lib/src` shared: OpenAPI load boundary 10, other 23                                              | 33      | 0     | 0      | 7,684         |
| `lib` test code and harnesses (`tests-generated` 5, `tests-snapshot` 4, `src/characterisation` 2) | 11      | 0     | 0      | not split     |
| `lib/tests-transforms/__fixtures__/normalized` (committed generated output)                       | 13      | 2     | 0      | within 17,653 |
| `lib` scripts and config                                                                          | 4       | 0     | 0      | not split     |
| `agent-tools/src`                                                                                 | 75      | 1     | 11     | 34,876        |
| `agent-tools/tests`                                                                               | 8       | 0     | 0      | 17,696        |
| `.agent/` shell scripts (harness integrations 97, research 3)                                     | 100     | 0     | 10     | 823           |
| `.claude/hooks`                                                                                   | 27      | 0     | 1      | 135           |
| `.github/workflows/ci.yml`                                                                        | 1       | 0     | 1      | 238           |
| **Total**                                                                                         | **380** | **5** | **25** | 142,443       |

"Generators": castr has no separate generator unit. Generation lives in the writers (`writers/zod/generators/` sits inside the Zod writer row) and in `rendering`, which has no issues.

Issue density is very uneven:

- The 958 lines of shell under `.agent/` and `.claude/hooks` carry 127 issues, about one per 7.5 lines.
- The 53,511 lines of `lib/src` carry 143, about one per 374 lines.

`agent-tools` by directory: `src/core` 16, `src/collaboration-state` 10, `src/arc` 7, `src/claude` 6, `tests/collaboration-state` 5, `src/validators/*` 17 spread across ten validators, with 22 more spread thinly.

### 6.2 Files with the most issues

| Issues | File                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| 83     | `.agent/claude-harness-integrations/cloud-environment-preflight.sh`                 |
| 27     | `.claude/hooks/ensure-gitleaks.sh`                                                  |
| 17     | `lib/src/schema-processing/writers/markdown/index.ts`                               |
| 14     | `.agent/claude-harness-integrations/cloud-environment-setup.sh`                     |
| 11     | `lib/src/schema-processing/writers/openapi/components/openapi-writer.components.ts` |
| 9      | `lib/src/shared/openapi/http-methods.ts`                                            |
| 7      | `lib/src/shared/load-openapi-document/validation-errors.ts`                         |
| 7      | `lib/tests-transforms/__fixtures__/normalized/oak-api/zod.ts`                       |
| 6      | `agent-tools/src/arc/arc-channel-grammar.ts`                                        |
| 6      | `lib/src/shared/ref-resolution.ts`                                                  |

128 files carry at least one issue.

## 7. Relevance to the destination

The specification's relevant clauses are these:

- **SPEC-G-2:** the destination is met only while `main` has zero open static-analysis issues of any type and zero security findings awaiting review.
- **SPEC-G-3:** a suppression, a rule switched off in configuration, or an issue marked accepted is red.
- **SPEC-AR-1:** the model contains no format's vocabulary as structure and no writer's output.
- **SPEC-AR-3:** no writer assembles target syntax as text, and a grammar-defined string is parsed once by a parser for that grammar.
- **§11:** "Castr's existing MCP projection and Markdown writer are outside every capability. They are unadvertised, and they are deleted in the landing that replaces the model."

Distance to SPEC-G-2 today: 380 open issues and 0 hotspots awaiting review. This seat did not check dependency alerts.

### 7.1 (a) In code the specification condemns: 117 issues (4 bugs, 2 vulnerabilities, 111 smells)

| Sub-group                                 | Issues | What                                                                                                                                                                                     | Measured or judgement                                                                                                                                                                                                                                                                           |
| ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| a1, §11 deletes it                        | 17     | Markdown writer (`writers/markdown/`)                                                                                                                                                    | **Measured.** §11 names the Markdown writer.                                                                                                                                                                                                                                                    |
| a1, §11 deletes it                        | 15     | MCP projection: `context/mcp/` 12; `validation/mcp-error-formatting.ts` 1; `cli/index.ts` lines 155 and 165, the `--emit-mcp-manifest` write path, 2 (the two CLI S8707 vulnerabilities) | **Measured** for `context/mcp/`, since §11 names the MCP projection. **Judgement** that the validation file and the two CLI lines belong to that projection; it is read from their code.                                                                                                        |
| a2, model, parsers, writers and consumers | 72     | the rest of `schema-processing` (parsers, IR, writers, conversion, non-MCP context, compatibility, ast), `rendering`, and `endpoints`, which imports `CastrSchema` from the IR           | **Judgement**, anchored in SPEC-AR-1, SPEC-AR-3 and the course plan's "Known on 21 September 2026" (the model fails AR-1; the Zod and TypeScript writers fail AR-3). Whether any of it survives is the MEASURE leg's verdict (evolve or rebuild). These issues go only if the code is replaced. |
| a2, committed output of present writers   | 13     | `lib/tests-transforms/__fixtures__/normalized/**`                                                                                                                                        | **Judgement**: the fixtures are generated by the condemned writers.                                                                                                                                                                                                                             |

### 7.2 (b) In code likely to survive, move or stay: 263 issues (1 bug, 23 vulnerabilities, 239 smells)

| Sub-group                                 | Issues | What                                                                                                                                                                                        | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| b1, castr `lib` outside the condemned set | 52     | `shared/` 33 (`http-methods.ts` 9, `validation-errors.ts` 7, `ref-resolution.ts` 6, others); CLI helpers 2; `validation/type-guards.ts` 2; test code and harnesses 11; scripts and config 4 | **Judgement.** The course plan's MOVE leg carries product code only if MEASURE says evolve, so even this code's survival is conditional. 26 of the 56 ADR-026-pattern issues (section 7.3, c1) sit here.                                                                                                                                                                                                                                                     |
| b2, Practice tooling                      | 211    | `agent-tools` 83; `.agent/` shell 100; `.claude/hooks` 27; `.github/workflows/ci.yml` 1                                                                                                     | These follow the Practice estate, not the castr rewrite. The course archives this repository at MOVE. **Measured, by file existence only, contents not compared:** `cloud-environment-preflight.sh`, `cloud-environment-setup.sh` and `agent-tools/src/core/runtime.ts` have same-path counterparts in the OCE repository. `ensure-gitleaks.sh`, `arc-channel-grammar.ts`, `workspace-packages.ts` and `validate-manifest-duplicate-keys-helpers.ts` do not. |

### 7.3 (c) Patterns a rewrite must not repeat

The counts are measured. The reading of each pattern as a lesson is judgement.

**c1. A syntax-level ban displaced string matching instead of removing it: 56 issues in `lib/src`.**

The rules are `S8907` (23), `S7758` (17), `S7765` (12) and `S6557` (4). By group: a1 5, a2 25, b1 26.

Measured:

- `lib/eslint.config.ts` bans `startsWith()`, `endsWith()` and `includes()` on a non-literal receiver for `src/**`, citing ADR-026 (lines 330–348).
- It switches `sonarjs/prefer-native-lodash-alternative` (SonarCloud's S8907) **off** for `src/**`, with a comment saying the rule "conflicts with ADR-026" (lines 567–583).
- Reading the flagged sites shows the workarounds:
  - `hasPrefix` in `builder.component-ref-resolution.ts` is a `charCodeAt` loop that reimplements `startsWith`.
  - `schema-name-registry.ts` has the suffix equivalent.
  - `ir/uuid-version.ts` and `ir/integer-semantics/index.ts` use `.some((c) => c === v)` where `.includes(v)` is banned.
  - `pathKey[0] !==`, `ref.charAt(0) !==` and a last-character index check stand in for `startsWith` and `endsWith` in `path-template-validation`, `convert-schema.ts` and `http-methods.ts`.
  - `ref-resolution.ts` splits and joins JSON Pointer `$ref` strings with lodash `join` and `drop`.

Judgement: this is the same string matching, re-spelled to pass a ban written against method names. Under SPEC-G-2 and SPEC-G-3 the two gates cannot both be satisfied by the present idiom. SonarCloud flags the workaround spellings. The native spellings break the local ban. The local "off" is itself red under SPEC-G-3. SPEC-AR-3 resolves this at the level of meaning: the grammar-defined strings involved (JSON Pointer references, path templates, HTTP method tokens) are parsed once into data. That is a statement of what the specification requires, not a work item. 26 of the 56 sit in `lib/src/shared`, outside the code (a) condemns, so a rewrite of the model and writers alone would not remove them.

**c2. Output assembled as lines of text: 20 issues (`S7778`).**

17 of them are in the Markdown writer, which builds output with `lines.push('# …'); lines.push('');` (`writers/markdown/index.ts`, lines 30–52). The other 3 are in the OpenAPI parser and schema context. This is the text assembly SPEC-AR-3 forbids, made visible by a rule about push calls.

**c3. A format keyword used as an object property: 2 bugs (`S7739`).**

The JSON Schema parser and the shared JSON Schema writer fields both do `result.then = …` (`json-schema-parser.2020-keywords.ts:98`, `json-schema-2020-12-fields.ts:172`). SonarCloud classes any object with a `then` property as a thenable hazard.

The model half of this is SPEC-AR-1: no format's vocabulary as structure.

The writer half is a constraint the destination will meet again. A JSON Schema writer must emit `then`, and SPEC-G-3 forbids accepting the issue. So any JSON Schema output value that carries `if`/`then`/`else` has to be built in a form this rule does not flag, or SPEC-G-2 cannot hold. Judgement: this follows from the rule's behaviour as documented. It was not tested.

**c4. Defects in committed generated output: 13 issues, all in fixtures.**

- `S4621` (6): `oak-api/zod.ts:292` reads `questionType: string | string | string | string;`. Enum literals have been widened to `string`, which is a fidelity loss of the kind SPEC-G-4's mutual-assignability check exists to catch.
- `S6564` (5): `export type LessonAssetResponseSchema = unknown;` in the Oak fixture, and primitive aliases in the tic-tac-toe fixture.
- `S2137` (2): `export const Error = z…` in the two petstore fixtures, shadowing the global `Error` in the generated module.

The fixtures were last committed on 2026-07-03. The napkin records the committed normalised fixtures as stale against the writer, so whether today's writer emits the same output is **not measured here**.

Judgement: committed generated code is analysed like any other code, and SPEC-G-3 forbids excluding paths. So generated output must itself be issue-free, and generated identifiers must not shadow globals. SonarCloud independently corroborates a napkin inference from 13 September: "TS writer widens enum literals to `string`".

**c5. `unknown` absorbing union members: 10 issues (`S6571`).**

By group: a1 2, a2 7, b1 1. They are in `endpoints/parameter-metadata.ts` (4), the OpenAPI parser's parameter builder (2), the MCP context (2), the Zod parser's meta handling (1) and `doctor/pointer-utils.ts` (1). The repository's own rule, `unknown-is-type-destruction`, names this class.

**c6. Code that no local analyser covers: 212 issues (55.8%).**

- **Shell and GitHub Actions, 129.** Nothing in `package.json`, `.github/` or `.husky/` refers to `shellcheck` (measured: zero references). SonarCloud is the only analyser these scripts meet.
- **`agent-tools` TypeScript, 83.** `agent-tools/eslint.config.ts` is JS plus TS-ESLint recommended, without `eslint-plugin-sonarjs`.
- `lib` runs `eslint-plugin-sonarjs` `recommended` and still has 169 SonarCloud issues, so `lib`'s local profile is not "Sonar way" either.

Judgement: wherever the local gate and SonarCloud run different rule sets, SonarCloud is the first place an issue is seen. That is after the push.

**c7. The configured gate is weaker than SPEC-G-1 (configuration, not issues).**

Measured:

- "Sonar way" gates on new-code _ratings_. A maintainability rating of A tolerates code smells.
- The gate is OK today with 3 issues in new code.
- SPEC-G-1 requires "static analysis reports no issue in new code". A pull request that adds a minor code smell passes the configured gate and fails the specification.
- Coverage is not measured at all.
- The hotspot condition (100% reviewed) is vacuous at zero hotspots. 21 of the 25 vulnerabilities carry the tag `former-hotspot`: they are `S6506` ×12 and `S4036` ×9, findings that SonarCloud now reports as vulnerabilities rather than hotspots for review.

Product-code issues in c1 to c5: 101 distinct. Including c6: 313 distinct issues fall in at least one pattern.

## 8. Urgency

**None is urgent.** Each bug and vulnerability class, with the reason:

| Class                                                         | Count | Why it is not urgent                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `S7739` bug: `then` property                                  | 2     | The value is a schema object or boolean, never a function. Promise resolution treats an object whose `then` is not callable as a plain value, so nothing misbehaves today. The lesson is c3.                                                                                                                                                                                                                                                                             |
| `S2137` bug: `Error` shadowed                                 | 2     | The fixtures only use the generated `Error` as a schema; nothing in them calls the global `Error`. They are stale fixtures of a condemned writer. The lesson is c4.                                                                                                                                                                                                                                                                                                      |
| `S7727` bug: `.map(parseTask)`                                | 1     | `parseTask(taskValue: unknown, index: number)` takes the index on purpose (`agent-tools/src/ci/ci-turbo-summary-parsing.ts:130`), so `map`'s second argument is the intended input.                                                                                                                                                                                                                                                                                      |
| `S6506` vulnerability: `curl -L` without HTTPS-only redirects | 12    | Every URL is `https://`. The CI gitleaks download (`ci.yml:72`) and the gitleaks hook verify a pinned SHA-256 and refuse a mismatch. The cloud setup script's Node download is checked against `SHASUMS256.txt` from the same origin. That is the weakest of the twelve: an attacker able to downgrade that channel could substitute both files. Exploiting any of them needs control of the network path between a cloud container and nodejs.org, GitHub or Launchpad. |
| `S4036` vulnerability: `PATH` resolution                      | 9     | Local developer tooling running `git` and similar by name. An attacker who can write to the user's `PATH` already controls the account.                                                                                                                                                                                                                                                                                                                                  |
| `tssecurity:S8707` vulnerability: CLI path injection          | 4     | Each path comes from the operator's own command line or from a git hook (`commit-msg` file, turbo report directory, `--emit-mcp-manifest` target). Writing where the operator says is the documented behaviour. The two `lib` cases are on the MCP manifest path §11 deletes.                                                                                                                                                                                            |
| Security hotspots                                             | 0     | None awaiting review.                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Not urgent but adjacent to proof quality: two `S2699` Blocker smells in `agent-tools/tests/collaboration-state/transaction.integration.test.ts` (lines 182 and 205). Those tests assert only by not throwing. SPEC-G-7 calls a test that can pass without asserting a defect in the proof.

## 9. Surprises

1. **Most issues are not in castr's product code.** 211 of 380 are in Practice tooling, and one probe script carries 83.
2. **Two of castr's own gates contradict each other** on 56 `lib/src` sites, and the local side resolves it with a switched-off rule (c1).
3. **The configured gate cannot enforce SPEC-G-1.** It passes today with 3 issues in new code (c7).
4. **Ratings C and C sit under a passing gate.** "Sonar way" looks only at new code, so older bugs and vulnerabilities keep the overall reliability and security ratings at C without failing anything.
5. **SonarCloud found a fidelity defect in generated output.** `string | string | string | string` in the Oak fixture corroborates an unverified napkin inference (c4).
6. **Three of the files with the most issues have same-path counterparts in OCE**, the repository castr is moving into. If their contents match, their issues will reappear under OCE's analysis. Contents were not compared.

## 10. Queries behind every number

The project and gate tools were MCP calls, all with `projectKey: EngraphCode_castr` and `branch: main` where applicable:

```text
list_branches(projectKey)                                  -> 1 branch, main, gate OK, analysed 2026-09-25T21:55:11Z
get_project_quality_gate_status(projectKey, branch)        -> OK; five conditions in section 3
get_component_measures(projectKey, branch, metricKeys=[ncloc, lines, files, coverage, duplicated_*, *_rating,
  security_hotspots*, bugs, vulnerabilities, code_smells, violations, open_issues, accepted_issues,
  false_positive_issues, sqale_index, sqale_debt_ratio, alert_status, ncloc_language_distribution])
search_sonar_issues_in_projects(projectKeys, branch, issueStatuses=[OPEN, CONFIRMED], pageSize=1)     -> total 380
search_sonar_issues_in_projects(projectKeys, branch, issueStatuses=[ACCEPTED, FALSE_POSITIVE])         -> total 0
search_sonar_issues_in_projects(projectKeys, branch, inNewCodePeriod=true, issueStatuses=[OPEN, CONFIRMED]) -> total 3
search_security_hotspots(projectKey, branch)               -> total 0
show_rule(key) for shell:S7688, typescript:S8907, typescript:S7778, typescript:S7758, typescript:S6606, tssecurity:S8707
```

The public web API, read-only, without a token:

```bash
B=https://sonarcloud.io/api
curl "$B/issues/search?componentKeys=EngraphCode_castr&branch=main&resolved=false&ps=500&p=1&facets=types,severities,impactSoftwareQualities,impactSeverities,rules,directories,languages,tags,cleanCodeAttributeCategories"
curl "$B/project_analyses/search?project=EngraphCode_castr&branch=main&ps=10"          # revisions and dates
curl "$B/measures/component?component=EngraphCode_castr&branch=main&metricKeys=new_violations&additionalFields=periods"
curl "$B/measures/component?component=EngraphCode_castr&branch=main&metricKeys=coverage,lines_to_cover,new_violations,new_code_smells,new_bugs,new_vulnerabilities,new_lines,new_maintainability_rating,new_technical_debt"
curl "$B/measures/component_tree?component=EngraphCode_castr:<dir>&branch=main&metricKeys=ncloc,violations,duplicated_lines_density,duplicated_lines&strategy=children&ps=100"   # for the root, lib, lib/src, lib/src/schema-processing, agent-tools
curl "$B/qualitygates/get_by_project?project=EngraphCode_castr&organization=engraphcode"   # "Sonar way", default
curl "$B/rules/show?key=<rule>&organization=engraphcode"                                  # remaining rule names and impacts
```

Local aggregation ran over the fetched issue payload with two short Node scripts, one for counts and one for the groups and patterns. The payload and the scripts lived in the session's temporary directory and were not kept. The first `curl` above reproduces the payload for as long as `851c7efe` stays the newest analysis of `main`.

Repository facts were read at `851c7efe`:

- `lib/eslint.config.ts` (lines 330–348, 567–583)
- `agent-tools/eslint.config.ts`
- the flagged source lines named in sections 7 and 8
- `docs/SPECIFICATION.md` §8, §9 and §11
- `.agent/plans/active/castr-course.md`
- `git log`, for the commit dates of `851c7efe` and of the fixtures
