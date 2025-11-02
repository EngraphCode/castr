import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

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
      cli: 'src/cli/index.ts',
    },
    format: ['cjs'],
    platform: 'node',
    target: 'node20',
    dts: true,
    sourcemap: true,
    splitting: false,
    treeshake: true,
    outDir: 'dist',
    onSuccess: async () => {
      // Copy templates to dist/templates (keeping same structure as src)
      const templatesDir = 'src/rendering/templates';
      const distTemplatesDir = 'dist/templates';

      mkdirSync(distTemplatesDir, { recursive: true });

      const files = readdirSync(templatesDir);
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          copyFileSync(join(templatesDir, file), join(distTemplatesDir, file));
        }
      }
      console.log(
        `✅ Copied ${files.filter((f) => f.endsWith('.hbs')).length} template files to ${distTemplatesDir}`,
      );
    },
  },
]);
