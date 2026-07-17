/**
 * Manifest honesty guard (initial-review finding L18).
 *
 * The spec-compliance suite imports `ajv-draft-04` directly
 * (openapi-spec-compliance.test.ts), so the package must be declared in this
 * workspace's own manifest (`lib/package.json`) rather than inherited as a
 * phantom dependency hoisted from the repository root manifest.
 */

import { describe, expect, test } from 'vitest';

import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const manifestSchema = z.object({
  devDependencies: z.record(z.string(), z.string()),
});

describe('manifest-honesty', () => {
  test('ajv-draft-04 is declared in lib devDependencies', () => {
    const manifestPath = join(process.cwd(), 'package.json');
    const rawManifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    const manifest = manifestSchema.parse(rawManifest);
    expect(Object.keys(manifest.devDependencies)).toContain('ajv-draft-04');
  });
});
