/**
 * commitlint configuration for @engraph/castr.
 *
 * Allowed types mirror principles.md (Git Commit Standards), the repo's
 * authority on commit format. Consumed by the agent-tools check-commit-message
 * validator, which runs `pnpm exec commitlint --edit <file>` from the repo root
 * and so resolves this config plus @commitlint/config-conventional here.
 *
 * Enforced at commit time by `.husky/commit-msg` (installed 2026-06-28, owner
 * directive "bring all guardrail infra" — PDR-005 §Default disposition;
 * supersedes the provisional 2026-06-15 advisory-only posture): the hook runs
 * `prevent-accidental-major-version` then `commitlint --edit`, so a
 * non-conforming message is blocked at `git commit`, not merely flagged.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'perf']],
  },
};
