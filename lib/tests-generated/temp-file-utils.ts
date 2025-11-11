import fs from 'fs/promises';
import { join, dirname } from 'path';
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
 * The directory is created in a repo-scoped location (lib/tests-generated/.tmp)
 * to avoid system-wide temp directories and ensure proper cleanup. If the
 * directory already exists, this function succeeds silently.
 *
 * @param baseDir - Base directory where .tmp folder will be created (defaults to tests-generated directory)
 * @returns Promise resolving to the absolute path of the created temp directory
 *
 * @example
 * ```typescript
 * const tempDir = await createTempDir();
 * console.log(`Temp directory created at: ${tempDir}`);
 * ```
 */
export async function createTempDir(baseDir?: string): Promise<string> {
  // Default to tests-generated/.tmp directory
  const tempDir = baseDir || join(__dirname, '.tmp');

  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch {
    // Directory may already exist, ignore error
  }

  return tempDir;
}

/**
 * Clean up a temporary directory and all files within it.
 *
 * This function removes all files in the specified directory and then removes
 * the directory itself. If the directory doesn't exist or is already empty,
 * the function succeeds silently.
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
  try {
    const files = await fs.readdir(dir);
    await Promise.all(files.map((file) => fs.unlink(join(dir, file))));
    await fs.rmdir(dir);
  } catch {
    // Ignore cleanup errors - directory may not exist or may be empty
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
