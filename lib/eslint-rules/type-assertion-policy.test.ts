import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { ESLint } from 'eslint';
import { afterAll, describe, expect, it } from 'vitest';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempProductDir = fs.mkdtempSync(path.join(repoRoot, 'assertion-policy-product-'));
const tempSnapshotDir = fs.mkdtempSync(path.join(repoRoot, 'tests-snapshot/assertion-policy-'));
const tempScriptsDir = fs.mkdtempSync(path.join(repoRoot, 'scripts/assertion-policy-'));
const eslint = new ESLint({ cwd: repoRoot });

afterAll(() => {
  fs.rmSync(tempProductDir, { recursive: true, force: true });
  fs.rmSync(tempSnapshotDir, { recursive: true, force: true });
  fs.rmSync(tempScriptsDir, { recursive: true, force: true });
});

function isAssertionRuleViolation(ruleId: string | null): boolean {
  return ruleId === '@typescript-eslint/consistent-type-assertions';
}

async function lintAssertionMessages(
  code: string,
  relativeFilePath: string,
): Promise<{ ruleId: string | null; message: string; severity: number }[]> {
  const absoluteFilePath = path.join(repoRoot, relativeFilePath);
  fs.mkdirSync(path.dirname(absoluteFilePath), { recursive: true });
  fs.writeFileSync(absoluteFilePath, code);
  const [result] = await eslint.lintText(code, { filePath: absoluteFilePath });

  return (result?.messages ?? [])
    .filter((message) => isAssertionRuleViolation(message.ruleId))
    .map((message) => ({
      ruleId: message.ruleId,
      message: message.message,
      severity: message.severity,
    }));
}

describe('type assertion policy', () => {
  it('allows as const in product code', async () => {
    const messages = await lintAssertionMessages(
      'const x = { a: 1 } as const;\n',
      path.relative(repoRoot, path.join(tempProductDir, 'example.ts')),
    );

    expect(messages).toEqual([]);
  }, 15000); // Cold ESLint startup under clean hook runs can exceed Vitest's 5s default.

  it('allows as const in snapshot tests', async () => {
    const messages = await lintAssertionMessages(
      "const x = ['a', 'b'] as const;\n",
      path.relative(repoRoot, path.join(tempSnapshotDir, 'example.test.ts')),
    );

    expect(messages).toEqual([]);
  });

  it('allows as const in scripts', async () => {
    const messages = await lintAssertionMessages(
      "const x = 'value' as const;\n",
      path.relative(repoRoot, path.join(tempScriptsDir, 'example.mts')),
    );

    expect(messages).toEqual([]);
  });

  it('rejects non-const as assertions in product code', async () => {
    const messages = await lintAssertionMessages(
      'const foo = {};\ntype Bar = { value?: string };\nconst x = foo as Bar;\n',
      path.relative(repoRoot, path.join(tempProductDir, 'example.ts')),
    );

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        (message) => message.ruleId === '@typescript-eslint/consistent-type-assertions',
      ),
    ).toBe(true);
    expect(messages.every((message) => message.severity === 2)).toBe(true);
  });

  it('rejects non-const as assertions in tests', async () => {
    const messages = await lintAssertionMessages(
      'const foo = {};\ntype Bar = { value?: string };\nconst x = foo as Bar;\n',
      path.relative(repoRoot, path.join(tempSnapshotDir, 'example.test.ts')),
    );

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        (message) => message.ruleId === '@typescript-eslint/consistent-type-assertions',
      ),
    ).toBe(true);
    expect(messages.every((message) => message.severity === 2)).toBe(true);
  });

  it('rejects chained casts in product code', async () => {
    const messages = await lintAssertionMessages(
      'const foo = {};\ntype Bar = { value?: string };\nconst x = foo as unknown as Bar;\n',
      path.relative(repoRoot, path.join(tempProductDir, 'example.ts')),
    );

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        (message) => message.ruleId === '@typescript-eslint/consistent-type-assertions',
      ),
    ).toBe(true);
    expect(messages.every((message) => message.severity === 2)).toBe(true);
  });

  it('rejects angle-bracket assertions in product code', async () => {
    const messages = await lintAssertionMessages(
      'const foo = {};\ntype Bar = { value?: string };\nconst x = <Bar>foo;\n',
      path.relative(repoRoot, path.join(tempProductDir, 'example.ts')),
    );

    expect(messages.length).toBeGreaterThan(0);
    expect(
      messages.every(
        (message) => message.ruleId === '@typescript-eslint/consistent-type-assertions',
      ),
    ).toBe(true);
    expect(messages.every((message) => message.severity === 2)).toBe(true);
  });
});
