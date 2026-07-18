/**
 * Test Hygiene Enforcement Tests
 *
 * Architectural guard over the suites collected by the primary `pnpm test`
 * gate. It enforces, by TypeScript-AST scan (see `test-hygiene-scanner.ts`
 * for the predicates), these rules from `testing-strategy.md`:
 *
 * - **No filesystem-module imports** (`fs`, `fs/promises`, `node:fs`,
 *   `node:fs/promises`, `fs-extra` — static including side-effect imports,
 *   dynamic, `require`, import-equals, or re-export). Fixture-driven suites
 *   that read from disk belong in the e2e (`tests-e2e/`) or generated
 *   (`tests-generated/`) gates.
 * - **No module-registry mocking** — `vi.mock`, `vi.doMock`, `vi.unmock`,
 *   `vi.doUnmock`.
 * - **No global-state mutation via vitest helpers** — `vi.spyOn` on
 *   `console`/`globalThis`/`process`, `vi.stubGlobal`, `vi.stubEnv`.
 * - **No direct mutation of `console.*` or `process.env.*`** — any
 *   assignment operator (plain or compound), `delete`, or
 *   increment/decrement.
 * - **No `process.env` reads** — `.agent/rules/test-immediate-fails.md`
 *   item 5 and `.agent/rules/no-global-state-in-tests.md` prohibit
 *   touching `process.env` at all (read OR write) in every in-process
 *   test: property/element access, aliasing, destructuring (including
 *   `const { env } = process`), and `globalThis`-qualified forms. The one
 *   sanctioned ambient-env location — smoke composition roots (the Vitest
 *   runner config or spawn invocation) — is not a test file and lies
 *   outside the scanned set.
 *
 * Scanned files: every `*.test.ts` the primary gate collects — mirroring the
 * `include`/`exclude` globs in `vitest.config.ts` (`src/**` and
 * `eslint-rules/**`; `src/characterisation/**` and
 * `src/validation/scalar-guard.test.ts` are excluded there) — minus the
 * architecture suite itself (`*.arch.test.ts`). Architecture tests are the
 * one exemption: they read the source tree by design, so they really import
 * `node:fs` and are reviewed by hand instead of scanned. (Quoting forbidden
 * patterns as string data needs no exemption — the AST scan ignores data, so
 * the scanner's own unit suite is scanned like any other gated test.)
 *
 * Enforcement is baseline-exact: each check asserts its violations equal a
 * named known-violations list (empty for most checks). Any new violation
 * fails the gate, and fixing a listed file forces its baseline entry to be
 * removed — the lists can only shrink. The primary gate is therefore
 * hermetic EXCEPT for the files named in the baselines below, each recorded
 * with the product/tooling change that would retire it.
 *
 * @see .agent/report/initial-review findings M4 and M5 for the violations
 *   this gate keeps fixed.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  mocksModuleRegistry,
  mutatesConsoleOrProcessEnv,
  mutatesGlobalStateViaVitestHelpers,
  touchesProcessEnv,
  usesFsModule,
} from './test-hygiene-scanner.js';

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
 * Individual files excluded from the primary `pnpm test` gate. Mirrors the
 * `exclude` globs in `vitest.config.ts` (the scalar-guard suite runs under
 * its own config, `vitest.scalar-guard.config.ts`).
 */
const TEST_GATE_EXCLUDED_FILES: ReadonlySet<string> = new Set([
  'src/validation/scalar-guard.test.ts',
]);

/**
 * A gate-collected file this guard scans: any `*.test.ts` except the
 * architecture suite (`*.arch.test.ts`) — see the header for why that is the
 * one exemption.
 */
function isScannedTestFile(fileName: string): boolean {
  return fileName.endsWith('.test.ts') && !fileName.endsWith('.arch.test.ts');
}

/**
 * Recursively collect all scanned test files under a directory.
 */
function collectScannedTestFiles(dir: string): string[] {
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
      files.push(...collectScannedTestFiles(fullPath));
    } else if (entry.isFile() && isScannedTestFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Every scanned test file under the primary `pnpm test` gate roots, as
 * `/`-separated paths relative to `lib/`, sorted for deterministic failure
 * output.
 */
function getGatedTestFiles(libRoot: string): string[] {
  return TEST_GATE_ROOTS.flatMap((root) => collectScannedTestFiles(path.join(libRoot, root)))
    .map((filePath) => path.relative(libRoot, filePath).split(path.sep).join('/'))
    .filter((relativePath) => !TEST_GATE_EXCLUDED_FILES.has(relativePath))
    .sort();
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

/**
 * Known filesystem-IO violations (shrink-only baseline). The ESLint-rule
 * suites exercise `ESLint`/`RuleTester` against real temp directories
 * because the behaviour under test is filesystem-defined: config resolution
 * selects rules by on-disk file path, and `max-files-per-dir` counts real
 * directory entries. Retiring these entries means moving the suites to an
 * IO-permitted gate (a tooling change tracked outside this guard).
 */
const KNOWN_FS_VIOLATIONS: readonly string[] = [
  'eslint-rules/max-files-per-dir.test.ts',
  'eslint-rules/type-assertion-policy.test.ts',
];

/**
 * Known module-registry-mocking violations (shrink-only baseline).
 * `loadOpenApiDocument` imports the Scalar bundler directly — there is no
 * injection seam — so its test stubs `@scalar/*` via `vi.mock`. Retiring
 * this entry means adding a dependency seam to the loader (a product change
 * tracked outside this guard).
 */
const KNOWN_MODULE_MOCK_VIOLATIONS: readonly string[] = [
  'src/shared/load-openapi-document.test.ts',
];

describe('Test Hygiene Enforcement', () => {
  const libRoot = path.resolve(__dirname, '../..');
  const gatedTestFiles = getGatedTestFiles(libRoot);

  it('collects test files from the primary gate roots', () => {
    expect(gatedTestFiles.length).toBeGreaterThan(0);
  });

  it('does not use filesystem modules outside the named baseline', () => {
    const violations = findViolations(libRoot, gatedTestFiles, usesFsModule);

    expect(violations).toEqual([...KNOWN_FS_VIOLATIONS]);
  });

  it('does not mock the module registry outside the named baseline', () => {
    const violations = findViolations(libRoot, gatedTestFiles, mocksModuleRegistry);

    expect(violations).toEqual([...KNOWN_MODULE_MOCK_VIOLATIONS]);
  });

  it('does not mutate global state via vitest helpers in any gated test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, mutatesGlobalStateViaVitestHelpers);

    expect(violations).toEqual([]);
  });

  it('does not mutate console or process.env in any gated test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, mutatesConsoleOrProcessEnv);

    expect(violations).toEqual([]);
  });

  it('does not read or write process.env in any gated test', () => {
    const violations = findViolations(libRoot, gatedTestFiles, touchesProcessEnv);

    expect(violations).toEqual([]);
  });
});
