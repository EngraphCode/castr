# Contributing to castr

## Prerequisites

Install these before running the quality gate or pushing:

- **Node.js** 24.x or 26.x (the workspace `engines`; CI runs 24/26).
- **pnpm** 11 (the repo lockfile is pnpm-11 format; `corepack enable` provides it).
- **[gitleaks](https://github.com/gitleaks/gitleaks)** — the secret scanner. It is **not** an npm
  dependency (it is a standalone binary), so install it separately:
  - `brew install gitleaks` (macOS)
  - `go install github.com/gitleaks/gitleaks/v8@latest` (Go)
  - or a release binary from <https://github.com/gitleaks/gitleaks/releases>

  `pnpm check` / `pnpm qg` run `pnpm secrets:scan` (a `gitleaks detect`) as their **first** step, and
  the pre-push hook runs the full gate — so without gitleaks installed, `pnpm check` and `git push`
  fail before anything else runs. CI provides its own pinned gitleaks, so this is a local-dev prerequisite.

## Quality gate

- `pnpm check` — the full local gate (clean + frozen install + `qg`): secret scan, build, format,
  type-check, lint, dependency/orphan checks, knip, markdownlint, portability, packaging, skills,
  agents, the repo validators, and the full test suite.
- `pnpm check:ci` — the CI form (no `fix` pass). The pre-push hook runs this; it is also the required
  CI status check on pull requests to `main`.

Commit messages are linted at commit time (`.husky/commit-msg`: conventional-commits, lowercase
subject, the 7 allowed types `feat`/`fix`/`refactor`/`test`/`docs`/`chore`/`perf`).
