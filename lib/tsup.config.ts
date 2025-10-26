import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library: ESM + CJS
  {
    entry: {
      'openapi-zod-client': 'src/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },
  // CLI: CJS only (Node.js executable, avoid ESM import issues)
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
  },
]);
