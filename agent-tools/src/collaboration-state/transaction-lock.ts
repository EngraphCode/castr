import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';

export async function acquireFileTransactionLock(input: {
  readonly filePath: string;
  readonly staleMs: number;
  readonly attempts: number;
}): Promise<() => Promise<void>> {
  const lockDir = `${input.filePath}.transaction`;
  for (let attempt = 1; attempt <= input.attempts; attempt += 1) {
    if (await tryCreateLock(lockDir)) {
      return () => rm(lockDir, { recursive: true, force: true });
    }
    await removeStaleLock(lockDir, input.staleMs);
    await delay(Math.min(attempt * 10, 100));
  }

  throw new Error(`could not acquire state transaction for ${input.filePath}`);
}

async function tryCreateLock(lockDir: string): Promise<boolean> {
  try {
    await mkdir(lockDir);
    await writeFile(`${lockDir}/owner.json`, `${JSON.stringify(lockMetadata(), null, 2)}\n`);
    return true;
  } catch (error) {
    if (isFileExistsError(error)) {
      return false;
    }
    throw error;
  }
}

async function removeStaleLock(lockDir: string, staleMs: number): Promise<void> {
  const metadata = await readLockMetadata(lockDir);
  if (metadata === undefined) {
    // A lock directory without readable owner metadata (crash between mkdir
    // and the owner.json write, or corrupt contents) must still age out, or
    // it wedges every future writer until someone removes it by hand. The
    // directory's own mtime stands in for the missing created_at.
    await removeStaleLockByDirTime(lockDir, staleMs);
    return;
  }
  const ageMs = Date.now() - Date.parse(metadata.created_at);
  if (Number.isNaN(ageMs)) {
    // Metadata parsed but its created_at is not a date: every age comparison
    // would be false forever, wedging the lock until manual cleanup. Fall
    // back to the same directory-mtime recovery path as missing metadata.
    await removeStaleLockByDirTime(lockDir, staleMs);
    return;
  }
  if (ageMs > staleMs) {
    await rm(lockDir, { recursive: true, force: true });
  }
}

async function removeStaleLockByDirTime(lockDir: string, staleMs: number): Promise<void> {
  try {
    const stats = await stat(lockDir);
    if (Date.now() - stats.mtimeMs > staleMs) {
      await rm(lockDir, { recursive: true, force: true });
    }
  } catch {
    // The lock directory vanished mid-check (released or reaped by a peer).
  }
}

async function readLockMetadata(
  lockDir: string,
): Promise<{ readonly created_at: string } | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(`${lockDir}/owner.json`, 'utf8'));
    return isLockMetadata(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function lockMetadata(): { readonly owner_id: string; readonly created_at: string } {
  return {
    owner_id: randomUUID(),
    created_at: new Date().toISOString(),
  };
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function isLockMetadata(value: unknown): value is { readonly created_at: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'created_at' in value &&
    typeof value.created_at === 'string'
  );
}

function isFileExistsError(error: unknown): error is Error & { readonly code: 'EEXIST' } {
  return error instanceof Error && 'code' in error && error.code === 'EEXIST';
}
