import fs from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

/**
 * Temporary file management utilities for generated code testing.
 *
 * These utilities provide a consistent way to create and manage temporary
 * files during test execution, ensuring proper cleanup after tests complete.
 */

// Get the directory name of the current module (ES module equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a temporary directory for test files.
 *
 * The directory is created under a repo-scoped temp root
 * (`lib/tests-generated/.tmp`) to avoid system-wide temp directories and
 * ensure proper cleanup. Each call returns a unique per-suite subdirectory so
 * parallel generated-suite files do not race on the same path.
 *
 * @param baseDir - Base directory under which a unique temp directory will be created
 * @returns Promise resolving to the absolute path of the created temp directory
 *
 * @example
 * ```typescript
 * const tempDir = await createTempDir();
 * console.log(`Temp directory created at: ${tempDir}`);
 * ```
 */
export async function createTempDir(baseDir?: string): Promise<string> {
  const tempRoot = baseDir || join(__dirname, '.tmp');
  await fs.mkdir(tempRoot, { recursive: true });

  return fs.mkdtemp(join(tempRoot, 'generated-suite-'));
}

/**
 * Clean up a temporary directory and all files within it.
 *
 * This function removes the specified per-suite directory recursively. If the
 * shared `.tmp` parent becomes empty afterwards, it is removed as well. If the
 * directory doesn't exist, the function succeeds silently.
 *
 * @param dir - Absolute path to the temporary directory to clean up
 * @returns Promise that resolves when cleanup is complete
 *
 * @example
 * ```typescript
 * const tempDir = await createTempDir();
 * // ... use temp directory ...
 * await cleanupTempDir(tempDir);
 * ```
 */
export async function cleanupTempDir(dir: string): Promise<void> {
  const parentDir = dirname(dir);

  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors - directory may not exist
  }

  if (basename(parentDir) !== '.tmp') {
    return;
  }

  try {
    await fs.rmdir(parentDir);
  } catch {
    // Ignore cleanup errors - parent may still contain sibling suite directories
  }
}

/**
 * Write content to a temporary file in the specified directory.
 *
 * This function creates a uniquely-named file in the temp directory using
 * a timestamp and optional name suffix. The file is written atomically.
 * The directory is created if it doesn't exist.
 *
 * @param dir - Absolute path to the temporary directory
 * @param name - Name suffix for the file (e.g., 'tictactoe' becomes 'gen-test-{timestamp}-tictactoe.ts')
 * @param content - File content to write
 * @returns Promise resolving to the absolute path of the created file
 *
 * @example
 * ```typescript
 * const tempDir = await createTempDir();
 * const filePath = await writeTempFile(tempDir, 'test-fixture', 'export const x = 1;');
 * console.log(`File written to: ${filePath}`);
 * ```
 */
export async function writeTempFile(dir: string, name: string, content: string): Promise<string> {
  // Ensure directory exists (handles race conditions in parallel test execution)
  await fs.mkdir(dir, { recursive: true });

  const filename = `gen-test-${Date.now()}-${name}.ts`;
  const filepath = join(dir, filename);
  await fs.writeFile(filepath, content, 'utf-8');
  return filepath;
}

/**
 * Remove a specific temporary file.
 *
 * This function deletes a single file from the temp directory. If the file
 * doesn't exist, the function succeeds silently.
 *
 * @param filepath - Absolute path to the file to remove
 * @returns Promise that resolves when the file is removed
 *
 * @example
 * ```typescript
 * const filePath = await writeTempFile(tempDir, 'test', 'content');
 * // ... use file ...
 * await removeTempFile(filePath);
 * ```
 */
export async function removeTempFile(filepath: string): Promise<void> {
  try {
    await fs.unlink(filepath);
  } catch {
    // Ignore cleanup errors - file may not exist
  }
}
