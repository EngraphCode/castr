import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import fg from 'fast-glob';
import { describe, expect, it } from 'vitest';

interface Violation {
  readonly file: string;
  readonly packageName: '@apidevtools/swagger-parser' | 'openapi-types';
  readonly lineNumber: number;
  readonly lineText: string;
}

describe('Scalar pipeline guard', () => {
  it('rejects legacy SwaggerParser and openapi-types imports in production sources', async () => {
    const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
    const sourceRoot = path.resolve(currentDirectory, '..');
    const files = await fg(['**/*.ts'], {
      cwd: sourceRoot,
      ignore: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.char.test.ts',
        '**/__fixtures__/**',
        '**/*.d.ts',
      ],
    });

    const violations: Violation[] = [];
    await Promise.all(
      files.map(async (relativePath) => {
        const normalizedPath = relativePath.split(path.sep).join('/');
        const filePath = path.join(sourceRoot, relativePath);
        const content = await readFile(filePath, 'utf8');
        const lines = content.split(/\r?\n/u);
        lines.forEach((lineText, lineIndex) => {
          const trimmedLine = lineText.trimStart();
          const isModuleStatement =
            trimmedLine.startsWith('import') || trimmedLine.startsWith('export');
          if (!isModuleStatement) {
            return;
          }
          if (
            trimmedLine.includes("'@apidevtools/swagger-parser'") ||
            trimmedLine.includes('"@apidevtools/swagger-parser"')
          ) {
            violations.push({
              file: normalizedPath,
              packageName: '@apidevtools/swagger-parser',
              lineNumber: lineIndex + 1,
              lineText,
            });
            return;
          }
          if (trimmedLine.includes("'openapi-types'") || trimmedLine.includes('"openapi-types"')) {
            violations.push({
              file: normalizedPath,
              packageName: 'openapi-types',
              lineNumber: lineIndex + 1,
              lineText,
            });
          }
        });
      }),
    );

    const formattedViolations = violations.map(
      ({ file, packageName, lineNumber, lineText }) =>
        `${packageName} import in ${file}:${lineNumber}\n${lineText.trim()}`,
    );

    expect(formattedViolations).toStrictEqual([]);
  });
});
