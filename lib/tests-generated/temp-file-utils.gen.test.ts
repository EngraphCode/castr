import fs from 'fs/promises';
import { basename, dirname } from 'path';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanupTempDir, createTempDir, writeTempFile } from './temp-file-utils.js';

describe('Generated Code - Temp File Utils', () => {
  const dirsToCleanup = new Set<string>();

  afterEach(async () => {
    await Promise.all(
      [...dirsToCleanup].map(async (dir) => {
        await cleanupTempDir(dir);
        dirsToCleanup.delete(dir);
      }),
    );
  });

  it('creates isolated per-suite temp directories under the repo-scoped .tmp root', async () => {
    const dirA = await createTempDir();
    const dirB = await createTempDir();

    dirsToCleanup.add(dirA);
    dirsToCleanup.add(dirB);

    expect(dirA).not.toBe(dirB);
    expect(basename(dirname(dirA))).toBe('.tmp');
    expect(basename(dirname(dirB))).toBe('.tmp');
    await expect(fs.access(dirA)).resolves.toBeUndefined();
    await expect(fs.access(dirB)).resolves.toBeUndefined();
  });

  it('cleanupTempDir only removes the requested suite directory', async () => {
    const dirA = await createTempDir();
    const dirB = await createTempDir();

    dirsToCleanup.add(dirB);

    const fileA = await writeTempFile(dirA, 'alpha', 'export const alpha = 1;');
    const fileB = await writeTempFile(dirB, 'beta', 'export const beta = 2;');

    await cleanupTempDir(dirA);

    await expect(fs.access(dirA)).rejects.toThrow();
    await expect(fs.access(fileA)).rejects.toThrow();
    await expect(fs.access(dirB)).resolves.toBeUndefined();
    await expect(fs.access(fileB)).resolves.toBeUndefined();
  });
});
