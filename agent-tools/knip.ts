import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  // Reachable-from-outside surfaces: CLI bins, the statusline hook, validator/hook/
  // bootstrap/version-guard entries, and the test estate. Anything not reachable from
  // these is dead code (unused files / dependencies — the checks we keep ON below).
  entry: [
    'src/bin/**/*.ts',
    'src/arc/arc-next-colour-cli.ts',
    'src/claude/statusline-identity.ts',
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
  // `.tsx` must be in the project set: the collaboration-state TUI React layer
  // (tui/cli.tsx → app.tsx → controller.ts) is reached from the CLI bins via
  // cli-specs.ts, and its imports only count as references when the tsx files
  // are analysed.
  project: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'e2e-tests/**/*.ts'],
};

export default config;
