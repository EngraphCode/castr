Read (under .agent/) [RULES.md](../directives/RULES.md), [testing-strategy.md](../directives/testing-strategy.md), [requirements.md](../directives/requirements.md), and [DEFINITION_OF_DONE.md](../directives/DEFINITION_OF_DONE.md) and take to heart that it is encouraged to take a step back and consider if work is delivering value through impact at the system level, not just fixing the problem right in front of you. Identify and question assumptions. Even before the First Question, ask: **are we solving the right problem, at the right layer?** Any generated plans must include regularly re-reading and re-committing to those foundation documents, and explicit, measurable metrics for success.

**Commit** to software engineering best practices, TDD at all levels, type discipline, and zero escape hatches (`as`, `any`, `!`).

Always ask: **"What impact are we trying to create for the user with this change?"**

## Non-Negotiable Principles

These principles are absolute. There are no exceptions, no grey areas, no compromises, no expediency shortcuts.

1. **STRICT BY DEFAULT.** Every component enforces the strictest possible validation. Never relax constraints to "make things work."
2. **FAIL FAST AND HARD.** Unsupported patterns throw immediately with helpful error messages. No silent fallbacks (`z.unknown()`), no degraded output, no swallowed errors. The cost of a strict error today is far less than a silent bug in production.
3. **NO ESCAPE HATCHES.** No `as` (except `as const`), `any`, `!`, or `eslint-disable` in product code. If types don't fit, fix the architecture, not the types.
4. **ADR-026: SEMANTIC ANALYSIS, NOT STRING HEURISTICS.** TS-source parsing must use ts-morph AST + semantic APIs (symbol resolution). `getText()` identity comparison, regex, and text-based heuristics are banned in ALL `src/` files. Data-string parsing is allowed ONLY in designated centralized utility modules. Ad-hoc inline string parsing is a violation. See ADR-026 § "Scope Definition".
5. **CENTRALIZE OR FAIL.** If a data format needs parsing (e.g., `$ref`, media types), there must be exactly ONE canonical parser for it. Scattered ad-hoc parsing is a violation — delegate to the canonical utility.
6. **NO TOLERANCE PATHS.** Do not create "partially enforced" or "excluded" tiers. Rules are either enforced everywhere or they're not rules.

When analysing a **generated file**, always analyse the **generator code** that produced it as well, as the generator is the source of truth.

Do not assume you know what the initial step should be—discuss with the user first.
After each piece of work, the full quality gate suite must be run **one gate at a time**, and analysis of issues must wait until **all gates are complete**. Analysis must include asking if there are fundamental architectural issues or opportunities for improvement.

All plans must include instructions to create:

- **Comprehensive TSDoc** (general on all logic and state, with additional extensive examples on public interfaces)
- **Markdown documentation** such as READMEs
- **ADRs** (Architecture Decision Records) as appropriate

## Quality Gates (run one at a time, in order)

```shell
# From the repo root
pnpm clean
pnpm install
pnpm build
pnpm type-check
pnpm lint
pnpm format:check
pnpm test # unit tests
pnpm test:snapshot # snapshot tests
pnpm test:gen # test generated code
pnpm character # character tests -- tests the public API as consumed by external users.
pnpm test:transforms # transform pipeline proofs
```

All quality gate issues are blocking at ALL times, regardless of where or why they happen. This rule is absolute and unwavering.

For a single non-mutating command, use `pnpm check:ci` (canonical definition: `.agent/directives/DEFINITION_OF_DONE.md`).
