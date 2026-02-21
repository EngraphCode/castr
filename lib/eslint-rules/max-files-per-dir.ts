/**
 * @file ESLint rule: max-files-per-dir
 *
 * Enforces a strict upper limit on the number of files permitted in a single directory
 * (non-recursive) to prevent "junk drawer" architectures.
 *
 * Uses the Anchor File pattern: counts directory files once and only reports the
 * error on the alphabetically *first* file in that directory. This prevents N duplicate
 * warnings for the same directory violation in parallel linting.
 *
 * @see .agent/directives/directory-complexity.md
 */
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import fs from 'node:fs';
import path from 'node:path';

// Module-level cache to prevent re-reading the filesystem repeatedly for the same directory.
// Keys are absolute directory paths; values are sorted arrays of file basenames.
const dirFileCache = new Map<string, string[]>();

const createRule = ESLintUtils.RuleCreator(
  () => `https://github.com/engraph/castr/blob/main/.agent/directives/directory-complexity.md`,
);

type Options = [{ maxFiles: number; ignoreSuffixes?: string[] }];
type MessageIds = 'directoryComplexitySupportive';

/**
 * Reads a directory, filters for source files, sorts alphabetically, and caches the result.
 */
function getSortedFilesForDirectory(dirPath: string, ignoreSuffixes: string[]): string[] {
  const cacheKey = `${dirPath}::${ignoreSuffixes.join(',')}`;
  if (dirFileCache.has(cacheKey)) {
    const cached = dirFileCache.get(cacheKey);
    return cached ?? [];
  }

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    const files = entries
      .filter((entry) => entry.isFile())
      .filter(
        (entry) =>
          entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js'),
      )
      .filter((entry) => !ignoreSuffixes.some((suffix) => entry.name.endsWith(suffix)))
      .map((entry) => entry.name)
      .sort((a, b) => a.localeCompare(b));

    dirFileCache.set(cacheKey, files);
    return files;
  } catch {
    dirFileCache.set(cacheKey, []);
    return [];
  }
}

export const maxFilesPerDir = createRule<Options, MessageIds>({
  name: 'max-files-per-dir',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce a maximum number of files per directory to encourage modularity.',
    },
    messages: {
      directoryComplexitySupportive:
        'Directory "{{dirName}}" has grown to {{actual}} files (limit: {{max}}), indicating it might represent multiple sub-domains. Consider extracting cohesive modules into subdirectories. For guidance, see: .agent/directives/directory-complexity.md',
    },
    schema: [
      {
        type: 'object',
        properties: {
          maxFiles: {
            type: 'number',
            minimum: 1,
          },
          ignoreSuffixes: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    { maxFiles: 8, ignoreSuffixes: ['.test.ts', '.spec.ts', '.d.ts', '.map', '.integration.ts'] },
  ],
  create(context) {
    const currentFilePath = context.filename || context.physicalFilename;

    if (!currentFilePath || currentFilePath === '<input>') {
      return {};
    }

    const dirPath = path.dirname(currentFilePath);
    const fileName = path.basename(currentFilePath);
    const options = context.options[0] ?? {
      maxFiles: 8,
      ignoreSuffixes: ['.test.ts', '.spec.ts', '.d.ts', '.map', '.integration.ts'],
    };
    const ignoreSuffixes = options.ignoreSuffixes ?? [
      '.test.ts',
      '.spec.ts',
      '.d.ts',
      '.map',
      '.integration.ts',
    ];

    return {
      Program(node: TSESTree.Program): void {
        const sortedFiles = getSortedFilesForDirectory(dirPath, ignoreSuffixes);

        // If this directory is within limits, do nothing
        if (sortedFiles.length <= options.maxFiles) {
          return;
        }

        // Anchor File Pattern: Only report the error on the very first file in this directory alphabetically.
        // This ensures the user only sees ONE error per directory, rather than N errors.
        if (sortedFiles.length > 0 && sortedFiles[0] === fileName) {
          const dirBaseName = path.basename(dirPath);

          context.report({
            node,
            messageId: 'directoryComplexitySupportive',
            data: {
              dirName: dirBaseName,
              actual: sortedFiles.length,
              max: options.maxFiles,
            },
          });
        }
      },
    };
  },
});
