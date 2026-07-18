import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Reachable-from-outside surfaces: CLI bins, the statusline hook, validator/hook/
  // bootstrap/version-guard entries, and the test estate. Anything not reachable from
  // these is dead code (unused files / dependencies — the checks we keep ON below).
  entry: [
    'src/bin/**/*.ts',
    'src/claude/statusline-identity.ts',
    'src/claude/subagent-statusline-adapter.ts',
    'src/validators/**/validate-*.ts',
    'src/hook-policy/check-*.ts',
    'src/bootstrap/bootstrap.ts',
    'src/repo-check/repo-check.ts',
    'src/practice-substrate/**/*.ts',
    'src/practice-fitness/validate-*.ts',
    'src/version-guard/prevent-accidental-major-version.ts',
    'src/ci/ci-*.ts',
    'src/**/*.test.ts',
    'tests/**/*.test.ts',
    'e2e-tests/**/*.e2e.test.ts',
    'smoke-tests/**/*.smoke.ts',
    '*.config.ts',
  ],
  project: ['src/**/*.ts'],
  // agent-tools is a multi-entry CLI/validator toolkit, not a barrel library: it
  // legitimately exports many module-API types/functions that aren't cross-imported
  // (some are Phase-8 collaboration forward-references). Keep the high-value dead-FILE
  // and dead-DEPENDENCY checks; relax the strict unused-export/type check that fits
  // barrel libs like `lib`. (Deviation from lib's strictness — revisit if agent-tools
  // grows public barrels.)
  rules: {
    exports: 'off',
    types: 'off',
    enumMembers: 'off',
  },
};

export default config;
