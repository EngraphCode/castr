import {
  EMPTY_REGISTRY,
  readRegistryWithSoloFloor,
} from '../../src/claude/statusline-registry-read';
import { parseCollaborationRegistry } from '../../src/collaboration-state/state-parsers';
import { type CollaborationRegistry } from '../../src/collaboration-state/types';

const PATH = '/primary/.agent/state/collaboration/active-claims.json';

const throwWith = (cause: unknown): ((path: string) => string) => {
  return () => {
    throw cause;
  };
};

const enoent = (): NodeJS.ErrnoException => {
  const error: NodeJS.ErrnoException = new Error('ENOENT: no such file or directory');
  error.code = 'ENOENT';
  return error;
};

const eacces = (): NodeJS.ErrnoException => {
  const error: NodeJS.ErrnoException = new Error('EACCES: permission denied');
  error.code = 'EACCES';
  return error;
};

describe('readRegistryWithSoloFloor — the absent-registry solo-floor contract', () => {
  it('maps an ABSENT registry file (ENOENT) to the empty registry, so the resolver reads a truthful solo', () => {
    const outcome = readRegistryWithSoloFloor(
      PATH,
      throwWith(enoent()),
      parseCollaborationRegistry,
    );
    expect(outcome).toEqual(EMPTY_REGISTRY);
    expect(outcome?.claims).toHaveLength(0);
  });

  it('maps every OTHER read failure to undefined (unknown — never a false solo on an unreadable registry)', () => {
    for (const cause of [eacces(), new Error('boom'), 'string-throw', null]) {
      expect(
        readRegistryWithSoloFloor(PATH, throwWith(cause), parseCollaborationRegistry),
      ).toBeUndefined();
    }
  });

  it('maps a CORRUPT registry (parse failure) to undefined, never a false solo', () => {
    expect(
      readRegistryWithSoloFloor(PATH, () => 'not json at all', parseCollaborationRegistry),
    ).toBeUndefined();
    expect(
      readRegistryWithSoloFloor(
        PATH,
        () => '{"claims": "wrong-shape"}',
        parseCollaborationRegistry,
      ),
    ).toBeUndefined();
  });

  it('returns the parsed registry on a clean read, passing the reader the registry path', () => {
    const registry: CollaborationRegistry = EMPTY_REGISTRY;
    const seenPaths: string[] = [];
    const outcome = readRegistryWithSoloFloor(
      PATH,
      (path) => {
        seenPaths.push(path);
        return 'raw-registry-text';
      },
      (raw) => {
        expect(raw).toBe('raw-registry-text');
        return registry;
      },
    );
    expect(outcome).toBe(registry);
    expect(seenPaths).toEqual([PATH]);
  });
});
