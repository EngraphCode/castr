import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export default defineConfig({
  // All code: ESM only (library + CLI)
  // Use glob pattern to preserve directory structure when bundle: false
  entry: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/__tests__/**'],
  format: ['esm'],
  platform: 'node',
  target: 'es2024',
  dts: true,
  sourcemap: true,
  clean: true,
  bundle: false,
  splitting: false,
  treeshake: false, // Can't tree-shake when bundle: false
  outDir: 'dist',
  onSuccess: async () => {
    // Copy templates to dist/rendering/templates (preserving directory structure)
    const templatesDir = 'src/rendering/templates';
    const distTemplatesDir = 'dist/rendering/templates';

    mkdirSync(distTemplatesDir, { recursive: true });

    const files = readdirSync(templatesDir);
    for (const file of files) {
      if (file.endsWith('.hbs')) {
        copyFileSync(join(templatesDir, file), join(distTemplatesDir, file));
      }
    }
    console.log(
      `✅ Copied ${files.filter((f: string) => f.endsWith('.hbs')).length} template files to ${distTemplatesDir}`,
    );
  },
});
