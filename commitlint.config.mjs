/**
 * commitlint configuration for @engraph/castr.
 *
 * Allowed types mirror principles.md (Git Commit Standards), the repo's
 * authority on commit format. Consumed by the agent-tools check-commit-message
 * validator, which runs `pnpm exec commitlint --edit <file>` from the repo root
 * and so resolves this config plus @commitlint/config-conventional here.
 *
 * No enforcing .husky/commit-msg hook is installed (owner decision, 2026-06-15);
 * commit-message linting is advisory / skill-driven for now.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'test', 'docs', 'chore', 'perf']],
  },
};
