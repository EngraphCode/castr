/**
 * @file Tests for the max-files-per-dir ESLint rule.
 *
 * Uses @typescript-eslint/rule-tester with Vitest and fs.mkdtempSync to
 * test the Anchor File pattern under real I/O conditions in isolation.
 *
 * @see lib/eslint-rules/max-files-per-dir.ts
 */
import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { maxFilesPerDir } from './max-files-per-dir.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Wire Vitest into RuleTester lifecycle
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester();

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eslint-max-files-test-'));

// Ensure cleanup when vitest finishes
afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

const createTestFiles = (dirName: string, count: number): string[] => {
  const dirPath = path.join(tmpDir, dirName);
  fs.mkdirSync(dirPath, { recursive: true });

  const filePaths: string[] = [];
  for (let i = 1; i <= count; i++) {
    // Pad with zeros to ensure alphabetical sorting matches numerical sorting
    const fileName = `file${String(i).padStart(2, '0')}.ts`;
    const filePath = path.join(dirPath, fileName);
    fs.writeFileSync(filePath, `// Test file ${i}`);
    filePaths.push(filePath);
  }

  // Create ignored files to ensure they are filtered
  fs.writeFileSync(path.join(dirPath, 'ignored.txt'), 'Not a source file');
  fs.writeFileSync(path.join(dirPath, 'component.test.ts'), '// Test file');
  fs.writeFileSync(path.join(dirPath, 'types.d.ts'), '// Declarations');

  return filePaths.sort();
};

const compliantPaths = createTestFiles('compliant', 3);
const breachedPaths = createTestFiles('breached', 3);

ruleTester.run('max-files-per-dir', maxFilesPerDir, {
  valid: [
    ...compliantPaths.map((filePath) => ({
      code: `// Test code`,
      filename: filePath,
      options: [{ maxFiles: 5 }] as const,
    })),
    // Other files in the breached directory should NOT report errors
    {
      code: `// Test code`,
      filename: breachedPaths[1] ?? '', // file02.ts
      options: [{ maxFiles: 2 }],
    },
    {
      code: `// Test code`,
      filename: breachedPaths[2] ?? '', // file03.ts
      options: [{ maxFiles: 2 }],
    },
  ],
  invalid: [
    // ONLY the anchor file reports the error
    {
      code: `// Test code`,
      filename: breachedPaths[0] ?? '', // file01.ts
      options: [{ maxFiles: 2 }],
      errors: [{ messageId: 'directoryComplexitySupportive' }],
    },
  ],
});

// Test custom ignore suffixes
const customIgnorePaths = createTestFiles('custom-ignore', 4);
const customDir = path.dirname(customIgnorePaths[0] ?? '');

ruleTester.run('max-files-per-dir-custom', maxFilesPerDir, {
  valid: [
    // If we ignore nothing, threshold 10 is fine for the 6 total source files
    {
      code: `// Test code`,
      filename: customIgnorePaths[0] ?? '',
      options: [{ maxFiles: 10, ignoreSuffixes: [] }],
    },
  ],
  invalid: [
    {
      code: `// Test file`,
      filename: path.join(customDir, 'component.test.ts'), // alphabetically first when ignore is off
      options: [{ maxFiles: 2, ignoreSuffixes: [] }],
      errors: [{ messageId: 'directoryComplexitySupportive' }],
    },
  ],
});
