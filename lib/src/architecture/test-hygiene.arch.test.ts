/**
 * Test Hygiene Enforcement Tests
 *
 * These architectural tests enforce the in-process testing doctrine from
 * `testing-strategy.md`:
 *
 * - **No filesystem IO in unit/integration tests.** The primary `pnpm test`
 *   gate must be hermetic: integration tests do not trigger IO. Fixture-driven
 *   suites that read from disk belong in the e2e (`tests-e2e/`) or generated
 *   (`tests-generated/`) gates.
 * - **No global-state mutation in unit/integration tests.** No
 *   `vi.spyOn(console, ...)`, `vi.stubGlobal`/`vi.stubEnv`, or direct
 *   assignment to `console.*`/`process.env.*` — product code must accept
 *   configuration (e.g. an output sink) as parameters so tests assert on an
 *   injected fake instead of mutating globals.
 *
 * Scope: every `*.unit.test.ts` and `*.integration.test.ts` file collected by
 * the primary `pnpm test` gate (`vitest.config.ts`: `src/**` and
 * `eslint-rules/**`, excluding `src/characterisation/**`). Architecture tests
 * (`*.arch.test.ts`) scan the source tree by design and are out of scope.
 *
 * @see .agent/report/initial-review findings M4 and M5 for the violations
 *   this gate keeps fixed.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Extracts the module specifier from `import ... from`, `import(...)`, and
 * `require(...)` forms.
 */
const IMPORT_SPECIFIER_PATTERN = /(?:from|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/g;

/**
 * Filesystem modules that unit/integration tests must not import.
 */
const FS_MODULE_SPECIFIERS: ReadonlySet<string> = new Set([
  'fs',
  'fs/promises',
  'node:fs',
  'node:fs/promises',
  'fs-extra',
]);

/**
 * True when the file content imports a filesystem module (static or dynamic).
 */
function usesFsModule(content: string): boolean {
  return Array.from(content.matchAll(IMPORT_SPECIFIER_PATTERN)).some(
    (match) => match[1] !== undefined && FS_MODULE_SPECIFIERS.has(match[1]),
  );
}

/**
 * Global-state mutation via vitest helpers: spying on `console`,
 * `globalThis`, or `process`, and `vi.stubGlobal`/`vi.stubEnv`.
 */
const VI_GLOBAL_MUTATION_PATTERN =
  /vi\s*\.\s*(?:spyOn\s*\(\s*(?:console|globalThis|process)\b|stubGlobal\s*\(|stubEnv\s*\()/;

/**
 * Direct assignment to global `console` methods or `process.env` entries
 * (e.g. `console.warn = ...`, `process.env.FOO = ...`,
 * `process.env['FOO'] = ...`). Reads are fine; only assignment mutates
 * global state.
 */
const DIRECT_GLOBAL_ASSIGNMENT_PATTERN =
  /(?:console\.\w+|process\.env(?:\.\w+|\[[^\]]+\]))\s*=[^=]/;

/**
 * Directories collected by the primary `pnpm test` gate (relative to
 * `lib/`). Mirrors the `include` globs in `vitest.config.ts`.
 */
const TEST_GATE_ROOTS = ['src', 'eslint-rules'] as const;

/**
 * Directory subtrees excluded from the primary `pnpm test` gate. Mirrors the
 * `exclude` globs in `vitest.config.ts` (`node_modules` never appears inside
 * the scanned roots, and `tests-snapshot/**` is outside them).
 */
const TEST_GATE_EXCLUDED_SEGMENTS = [`${path.sep}characterisation${path.sep}`] as const;

/**
 * A unit or integration test file: the in-process suites whose hermeticity
 * this gate protects.
 */
function isUnitOrIntegrationTestFile(fileName: string): boolean {
  return fileName.endsWith('.unit.test.ts') || fileName.endsWith('.integration.test.ts');
}

/**
 * Recursively collect all unit/integration test files under a directory.
 */
function getUnitAndIntegrationTestFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (TEST_GATE_EXCLUDED_SEGMENTS.some((segment) => fullPath.includes(segment))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...getUnitAndIntegrationTestFiles(fullPath));
    } else if (entry.isFile() && isUnitOrIntegrationTestFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Collect every unit/integration test file under the primary `pnpm test`
 * gate roots, as paths relative to `lib/` for stable failure output.
 */
function getGatedTestFiles(libRoot: string): string[] {
  return TEST_GATE_ROOTS.flatMap((root) =>
    getUnitAndIntegrationTestFiles(path.join(libRoot, root)),
  ).map((filePath) => path.relative(libRoot, filePath));
}

/**
 * Return the (relative) paths whose content the forbidden-usage predicate
 * matches.
 */
function findViolations(
  libRoot: string,
  relativePaths: string[],
  isForbidden: (content: string) => boolean,
): string[] {
  return relativePaths.filter((relativePath) =>
    isForbidden(fs.readFileSync(path.join(libRoot, relativePath), 'utf-8')),
  );
}

describe('Test Hygiene Enforcement', () => {
  const libRoot = path.resolve(__dirname, '../..');
  const gatedTestFiles = getGatedTestFiles(libRoot);

  it('has unit/integration test files to check', () => {
    expect(gatedTestFiles.length).toBeGreaterThan(0);
  });

  it('does not use filesystem modules in any unit/integration test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, usesFsModule);

    expect(violations).toEqual([]);
  });

  it('does not mutate global state via vitest helpers in any unit/integration test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, (content) =>
      VI_GLOBAL_MUTATION_PATTERN.test(content),
    );

    expect(violations).toEqual([]);
  });

  it('does not assign to console or process.env in any unit/integration test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, (content) =>
      DIRECT_GLOBAL_ASSIGNMENT_PATTERN.test(content),
    );

    expect(violations).toEqual([]);
  });
});
