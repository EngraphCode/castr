import { describe, expect, it } from 'vitest';

import {
  buildPreToolUseDenyResponse,
  findBlockedPattern,
  loadBlockedPatterns,
  runPreToolUseGuard,
} from './check-blocked-patterns.js';

describe('runPreToolUseGuard', () => {
  it('writes a deny payload when the command matches a blocked pattern', async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    async function* stdin(): AsyncGenerator<Buffer> {
      yield Buffer.from(
        JSON.stringify({
          tool_name: 'Bash',
          tool_input: {
            command: 'git commit --no-verify',
          },
        }),
      );
    }

    await expect(
      runPreToolUseGuard({
        stdin: stdin(),
        stdout: {
          write(text: string) {
            stdout.push(text);
          },
        },
        stderr: {
          write(text: string) {
            stderr.push(text);
          },
        },
        blockedPatterns: ['git --no-verify'],
      }),
    ).resolves.toStrictEqual({ exitCode: 0 });

    expect(stderr).toStrictEqual([]);
    expect(JSON.parse(stdout.join(''))).toStrictEqual(
      buildPreToolUseDenyResponse({ pattern: 'git --no-verify' }),
    );
  });
});

describe('canonical policy: explicit-pathspec staging discipline (WS6)', () => {
  const expectedCitation = '.agent/rules/stage-by-explicit-pathspec.md';

  it('blocks the wildcard staging commands and teaches the explicit-pathspec concept', async () => {
    const patterns = await loadBlockedPatterns();

    for (const command of ['git add -A', 'git add --all', 'git add .']) {
      const entry = findBlockedPattern(command, patterns);
      expect(entry).toMatchObject({
        pattern: command,
        concept: 'wildcard-staging',
        citation: expectedCitation,
      });
      // The block must TEACH, not only refuse: a non-empty reappraisal travels to the agent.
      expect(entry?.reappraisal?.trim()).toBeTruthy();
    }
  });

  it('does not block explicit-pathspec staging via the canonical policy', async () => {
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern('git add packages/core/foo.ts', patterns)).toBeNull();
    expect(findBlockedPattern('git add ./packages/core/foo.ts', patterns)).toBeNull();
    expect(findBlockedPattern('git add .gitignore', patterns)).toBeNull();
  });
});

describe('canonical policy: a matched command teaches a reappraisal end-to-end', () => {
  it('frames a destructive command as a concept to reappraise, carrying its citation', async () => {
    const patterns = await loadBlockedPatterns();
    const entry = findBlockedPattern('git reset --hard HEAD~1', patterns);
    if (entry === null) {
      throw new Error('expected `git reset --hard` to be blocked by the canonical policy');
    }

    const reason = buildPreToolUseDenyResponse(entry).hookSpecificOutput.permissionDecisionReason;
    expect(reason).toContain('git reset --hard');
    expect(reason).toContain('worktree-destruction');
    expect(reason).toContain('not a command to swap for a sibling');
    expect(reason).toContain('Citation: .agent/rules/never-use-git-to-remove-work.md');
  });
});

describe('canonical policy: the founding 2026-06-11 host-DOS busy-loop is blocked (substring mode)', () => {
  it('blocks an inline busy-loop carried inside one quoted token and teaches the host-load concept', async () => {
    const patterns = await loadBlockedPatterns();
    const entry = findBlockedPattern('node -e "for(;;){Math.sqrt(Math.random())}"', patterns);
    if (entry === null) {
      throw new Error(
        'expected the founding busy-loop shape to be blocked by the canonical policy',
      );
    }

    expect(entry.match).toBe('substring');
    const reason = buildPreToolUseDenyResponse(entry).hookSpecificOutput.permissionDecisionReason;
    expect(reason).toContain('host-dos-unbounded-load');
    expect(reason).toContain('shared substrate');
    expect(reason).toContain('Citation: .agent/rules/no-unbounded-host-load.md');
  });

  it('blocks a busy-loop even when whitespace is smuggled inside the shape, via the real policy', async () => {
    const patterns = await loadBlockedPatterns();
    // The canonical policy stores `for(;;)` with no spaces; this pins the
    // whitespace-strip in findBlockedPattern against the shipped entry.
    expect(findBlockedPattern('node -e "for (;;) {}"', patterns)).toMatchObject({
      pattern: 'for(;;)',
      concept: 'host-dos-unbounded-load',
      match: 'substring',
    });
  });

  it('blocks the fork-bomb and stress-ng load-tool shapes via the real policy', async () => {
    const patterns = await loadBlockedPatterns();

    expect(findBlockedPattern(':(){ :|:& };:', patterns)).toMatchObject({
      concept: 'host-dos-forkbomb',
      citation: '.agent/rules/no-unbounded-host-load.md',
      match: 'substring',
    });
    expect(findBlockedPattern('./tools/stress-ng --cpu 8', patterns)).toMatchObject({
      pattern: 'stress-ng',
      concept: 'host-dos-unbounded-load',
      match: 'substring',
    });
  });
});
