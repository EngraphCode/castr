import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library: ESM only
  {
    entry: {
      'openapi-zod-validation': 'src/index.ts',
    },
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },
  // CLI: CJS for now (ESM bundling has dynamic require issues with some deps)
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['cjs'],
    platform: 'node',
    target: 'node20',
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },
]);
