/** @type {import('knip').KnipConfig} */
const config = {
  entry: ['tests-transforms/**/*.test.ts', 'tests-snapshot/**/*.test.ts'],
  project: ['src/**/*.ts'],
  ignoreBinaries: ['tsx'],
  ignoreDependencies: ['ajv-draft-04', '@types/degit', 'degit', 'madge'],
  // Knip catches dead code, unused files, and unused exports.
  // We want strict barrel-files, so if an internal util isn't exported in index.ts
  // AND isn't used by siblings, it should be flagged as dead code.
};

export default config;
