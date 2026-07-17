import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['tests-transforms/**/*.test.ts', 'tests-snapshot/**/*.test.ts'],
  project: ['src/**/*.ts'],
  ignoreBinaries: ['tsx'],
  ignoreDependencies: ['degit', 'madge'],
  // Knip catches dead code, unused files, and unused exports.
  // We want strict barrel-files, so if an internal util isn't exported in index.ts
  // AND isn't used by siblings, it should be flagged as dead code.
};

export default config;
