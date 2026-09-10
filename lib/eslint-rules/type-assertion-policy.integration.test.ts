import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';
import castrConfig from '../eslint.config.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const eslint = new ESLint({
  cwd: repoRoot,
  overrideConfigFile: true,
  overrideConfig: castrConfig,
});
const assertionError = {
  ruleId: '@typescript-eslint/consistent-type-assertions',
  message: 'Do not use any type assertions.',
  severity: 2,
};

async function lintDiagnostics(
  code: string,
  relativeFilePath: string,
): Promise<{ ruleId: string | null; message: string; severity: number }[][]> {
  const results = await eslint.lintText(code, {
    filePath: path.join(repoRoot, relativeFilePath),
  });

  return results.map((result) =>
    result.messages.map((message) => ({
      ruleId: message.ruleId,
      message: message.message,
      severity: message.severity,
    })),
  );
}

describe.each([
  {
    name: 'ordinary TypeScript',
    file: 'assertion-policy-product/example.ts',
  },
  {
    name: 'snapshot TypeScript',
    file: 'tests-snapshot/assertion-policy/example.ts',
  },
  {
    name: 'script TypeScript',
    file: 'scripts/assertion-policy/example.mts',
  },
])('$name assertion policy', ({ file }) => {
  it('allows const assertions', async () => {
    const diagnostics = await lintDiagnostics('export const value = { key: 1 } as const;\n', file);

    expect(diagnostics).toEqual([[]]);
  });

  it('rejects non-const assertions', async () => {
    const diagnostics = await lintDiagnostics(
      'export const value = {} as { readonly key?: string };\n',
      file,
    );

    expect(diagnostics).toEqual([[assertionError]]);
  });
});

it.each([
  {
    name: 'chained casts',
    code: 'export const value = {} as unknown as { readonly key?: string };\n',
    expected: [assertionError, assertionError],
  },
  {
    name: 'angle-bracket assertions',
    code: 'export const value = <{ readonly key?: string }>{};\n',
    expected: [assertionError],
  },
])('rejects $name', async ({ code, expected }) => {
  const diagnostics = await lintDiagnostics(code, 'assertion-policy-product/example.ts');

  expect(diagnostics).toEqual([expected]);
});
