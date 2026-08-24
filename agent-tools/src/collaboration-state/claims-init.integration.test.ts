import { describe, expect, it } from 'vitest';

import {
  ACTIVE_CLAIMS_SEED_TEXT,
  CLOSED_CLAIMS_SEED_TEXT,
  initClaimsState,
  type ClaimsInitIo,
} from './claims-init.js';
import { type Options } from './cli-options.js';

interface FakeIoState {
  readonly io: ClaimsInitIo;
  readonly files: Map<string, string>;
  readonly validated: string[];
}

function fakeIo(initialFiles: readonly (readonly [string, string])[]): FakeIoState {
  const files = new Map(initialFiles);
  const validated: string[] = [];
  const io: ClaimsInitIo = {
    readTextIfPresent: (path) => Promise.resolve(files.get(path)),
    createExclusively: (path, text) => {
      if (files.has(path)) {
        const collision = new Error(`EEXIST: file already exists: ${path}`);
        Object.defineProperty(collision, 'code', { value: 'EEXIST' });
        return Promise.reject(collision);
      }
      files.set(path, text);
      return Promise.resolve();
    },
    validateForKind: (kind, text) => {
      validated.push(`${kind}:${text.includes('INVALID') ? 'invalid' : 'ok'}`);
      if (text.includes('INVALID')) {
        return Promise.reject(new Error(`schema validation failed for ${kind}`));
      }
      return Promise.resolve();
    },
  };
  return { io, files, validated };
}

const options: Options = {
  command: 'init',
  topic: 'claims',
  values: new Map([
    ['active', '/state/active-claims.json'],
    ['closed', '/state/closed-claims.archive.json'],
  ]),
  files: [],
  areaPatterns: [],
  tags: [],
};

describe('initClaimsState', () => {
  it('seeds both missing files with their per-kind shapes, validating each seed before writing', async () => {
    const { io, files, validated } = fakeIo([]);
    const result = await initClaimsState(options, io);
    expect(files.get('/state/active-claims.json')).toBe(ACTIVE_CLAIMS_SEED_TEXT);
    expect(files.get('/state/closed-claims.archive.json')).toBe(CLOSED_CLAIMS_SEED_TEXT);
    expect(validated).toEqual(['active:ok', 'closed:ok']);
    expect(result).toContain('seeded active state at /state/active-claims.json');
    expect(result).toContain('seeded closed state at /state/closed-claims.archive.json');
    expect(result.endsWith('\n')).toBe(true);
  });

  it('leaves valid existing files untouched (idempotent re-init)', async () => {
    const { io, files } = fakeIo([
      ['/state/active-claims.json', '{"existing":"active"}'],
      ['/state/closed-claims.archive.json', '{"existing":"closed"}'],
    ]);
    const result = await initClaimsState(options, io);
    expect(files.get('/state/active-claims.json')).toBe('{"existing":"active"}');
    expect(files.get('/state/closed-claims.archive.json')).toBe('{"existing":"closed"}');
    expect(result).toContain('already initialised');
    expect(result).not.toContain('seeded');
  });

  it('is all-or-nothing: an invalid second file prevents seeding the first', async () => {
    const { io, files } = fakeIo([['/state/closed-claims.archive.json', 'INVALID content']]);
    const attempt = initClaimsState(options, io);
    await expect(attempt).rejects.toThrow(/refusing to overwrite/i);
    await expect(attempt).rejects.toThrow(/closed/i);
    expect(files.has('/state/active-claims.json')).toBe(false);
  });

  it('resolves a lost create race to already-initialised when the peer seed is valid', async () => {
    const { io, files } = fakeIo([]);
    const racedIo: ClaimsInitIo = {
      ...io,
      readTextIfPresent: (path) =>
        Promise.resolve(files.get(path) ?? (files.set(path, 'peer seed'), undefined)),
      createExclusively: (path) => {
        const collision = new Error(`EEXIST: file already exists: ${path}`);
        Object.defineProperty(collision, 'code', { value: 'EEXIST' });
        return Promise.reject(collision);
      },
    };
    const result = await initClaimsState(options, racedIo);
    expect(result).toContain('active state already initialised');
    expect(result).toContain('closed state already initialised');
    expect(result).not.toContain('seeded');
  });

  it('fails loud when a lost create race reveals an invalid peer seed', async () => {
    const { io, files } = fakeIo([]);
    const racedIo: ClaimsInitIo = {
      ...io,
      readTextIfPresent: (path) =>
        Promise.resolve(files.get(path) ?? (files.set(path, 'INVALID peer'), undefined)),
      createExclusively: (path) => {
        const collision = new Error(`EEXIST: file already exists: ${path}`);
        Object.defineProperty(collision, 'code', { value: 'EEXIST' });
        return Promise.reject(collision);
      },
    };
    await expect(initClaimsState(options, racedIo)).rejects.toThrow(/refusing to overwrite/i);
  });

  it('rethrows a non-EEXIST create failure untouched', async () => {
    const { io } = fakeIo([]);
    const brokenIo: ClaimsInitIo = {
      ...io,
      createExclusively: () => Promise.reject(new Error('EACCES: permission denied')),
    };
    await expect(initClaimsState(options, brokenIo)).rejects.toThrow(/EACCES/);
  });
});
