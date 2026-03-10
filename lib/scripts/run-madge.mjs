import madge from 'madge';

const KNOWN_EXTERNAL_MODULE_SKIPS = new Set([
  '@scalar/openapi-types',
  '@scalar/json-magic/bundle',
  '@scalar/json-magic/bundle/plugins/node',
  'prettier/parser-typescript',
]);

const mode = process.argv[2];

if (mode !== 'circular' && mode !== 'orphans') {
  throw new Error(`Unsupported Madge mode: ${mode}`);
}

const result = await madge('src', {
  baseDir: process.cwd(),
  fileExtensions: ['ts'],
});

const skippedModules = result.warnings().skipped;
const unexpectedSkippedModules = skippedModules.filter(
  (moduleName) => !KNOWN_EXTERNAL_MODULE_SKIPS.has(moduleName),
);

if (unexpectedSkippedModules.length > 0) {
  console.error('Unexpected skipped modules:');
  for (const moduleName of unexpectedSkippedModules) {
    console.error(moduleName);
  }
  process.exitCode = 1;
} else if (mode === 'circular') {
  const circularDependencies = result.circular();

  if (circularDependencies.length === 0) {
    console.log('✔ No circular dependency found!');
  } else {
    for (const dependency of circularDependencies) {
      console.log(dependency);
    }
    process.exitCode = 1;
  }
} else {
  for (const orphan of result.orphans()) {
    console.log(orphan);
  }
}
