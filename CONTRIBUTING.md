# Contributing to castr

## Prerequisites

Install these before running the quality gate or pushing:

- **Node.js** 24.x (the workspace `engines`).
- **pnpm** at the exact version declared by the root `packageManager` field.
- **[gitleaks](https://github.com/gitleaks/gitleaks)** — the secret scanner. It is **not** an npm
  dependency (it is a standalone binary), so install it separately:
  - `brew install gitleaks` (macOS)
  - `go install github.com/gitleaks/gitleaks/v8@latest` (Go)
  - or a release binary from <https://github.com/gitleaks/gitleaks/releases>

  The aggregate verification chain and hooks run `pnpm secrets:scan`
  (`gitleaks detect`). A missing executable fails verification. CI provides
  its own pinned gitleaks; local development requires the executable too.

## First contributor action

Follow the [local usage walkthrough](docs/USAGE.md): install with the frozen
lockfile, build `@engraph/castr`, generate from `examples/local-user.json`, compile
its output and run the positive and negative validation examples. This gives a
bounded, repeatable first action without package publication.

The [Practice bridge](.agent/practice-index.md) leads to the governing directives
and [verification contract](.agent/directives/DEFINITION_OF_DONE.md).
The [Practice bridge](.agent/practice-index.md) routes contributors to current
work, governing authority, implementation evidence and repair ownership. Read
those current records before choosing work or acting on its execution state.

## Quality gate

- `pnpm check` — the full local gate (clean + frozen install + formatting/lint autofixes + checks): secret scan, build, format,
  type-check, lint, dependency/orphan checks, knip, markdownlint, portability, packaging, skills,
  agents, the repo validators, and the full test suite.
- `pnpm check:ci` — clean + frozen install + checks, omitting formatting/lint
  autofixes. It still modifies generated files and dependencies. The pre-push hook
  runs this.
  GitHub CI runs its checks as jobs and requires their `quality-gates` result
  before a pull request can merge to `main`.

Commit messages are linted at commit time (`.husky/commit-msg`: conventional-commits, lowercase
subject, the 7 allowed types `feat`/`fix`/`refactor`/`test`/`docs`/`chore`/`perf`).
