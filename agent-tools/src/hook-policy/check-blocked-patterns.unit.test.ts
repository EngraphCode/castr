import { describe, expect, it } from 'vitest';

import {
  buildPreToolUseDenyResponse,
  extractBashCommand,
  findBlockedPattern,
  parseBlockedPatternPolicy,
  parseHookInput,
} from './check-blocked-patterns.js';

describe('findBlockedPattern', () => {
  it('matches dangerous git flags even when arguments appear between tokens', () => {
    const blockedPatterns = ['git push --force', 'git reset --hard'];

    expect(findBlockedPattern('git push origin HEAD --force', blockedPatterns)).toStrictEqual({
      pattern: 'git push --force',
    });
    expect(findBlockedPattern('git reset HEAD~1 --hard', blockedPatterns)).toStrictEqual({
      pattern: 'git reset --hard',
    });
  });

  it('returns null when no blocked pattern matches', () => {
    expect(findBlockedPattern('pnpm lint', ['git push --force'])).toBeNull();
  });

  it('matches substring-mode patterns inside quoted arguments (the 2026-06-11 founding DOS shape)', () => {
    const blockedPatterns = [
      { pattern: 'for(;;)', match: 'substring' as const },
      { pattern: 'while(1)', match: 'substring' as const },
    ];

    expect(
      findBlockedPattern('node -e "for(;;){Math.sqrt(Math.random())}"', blockedPatterns),
    ).toStrictEqual({ pattern: 'for(;;)', match: 'substring' });
    expect(findBlockedPattern("node -e 'while(1){}' &", blockedPatterns)).toStrictEqual({
      pattern: 'while(1)',
      match: 'substring',
    });
  });

  it('substring-mode matching tolerates whitespace inside the shape (spaced busy-loops)', () => {
    const blockedPatterns = [
      { pattern: 'for(;;)', match: 'substring' as const },
      { pattern: 'while(1)', match: 'substring' as const },
    ];

    expect(findBlockedPattern('node -e "for (;;) {}"', blockedPatterns)).toStrictEqual({
      pattern: 'for(;;)',
      match: 'substring',
    });
    expect(findBlockedPattern('node -e "while ( 1 ) {}"', blockedPatterns)).toStrictEqual({
      pattern: 'while(1)',
      match: 'substring',
    });
  });

  it('substring-mode matches a load tool however it is pathed', () => {
    const blockedPatterns = [{ pattern: 'stress-ng', match: 'substring' as const }];

    expect(findBlockedPattern('./tools/stress-ng --cpu 8', blockedPatterns)).toStrictEqual({
      pattern: 'stress-ng',
      match: 'substring',
    });
  });

  it('substring-mode matching is case-insensitive and leaves benign commands alone', () => {
    const blockedPatterns = [{ pattern: 'for(;;)', match: 'substring' as const }];

    expect(findBlockedPattern('node -e "FOR(;;){}"', blockedPatterns)).toStrictEqual({
      pattern: 'for(;;)',
      match: 'substring',
    });
    expect(findBlockedPattern('node -e "console.log(1)"', blockedPatterns)).toBeNull();
    expect(findBlockedPattern('for i in 1 2 3; do echo $i; done', blockedPatterns)).toBeNull();
  });

  it('limits guardrail-bypass flags to git commands when the policy requires git', () => {
    expect(findBlockedPattern('git commit --no-verify', ['git --no-verify'])).toStrictEqual({
      pattern: 'git --no-verify',
    });
    expect(findBlockedPattern('pnpm publish --no-verify', ['git --no-verify'])).toBeNull();
  });

  it('carries the citation through when the entry is an object', () => {
    expect(
      findBlockedPattern('git add .', [
        { pattern: 'git add .', citation: 'distilled.md §Stage by explicit pathspec' },
      ]),
    ).toStrictEqual({
      pattern: 'git add .',
      citation: 'distilled.md §Stage by explicit pathspec',
    });
  });

  it('does not match `git add .` against explicit-pathspec staging', () => {
    const wildcardPattern = 'git add .';
    expect(findBlockedPattern('git add packages/core/foo.ts', [wildcardPattern])).toBeNull();
    expect(findBlockedPattern('git add ./packages/core/foo.ts', [wildcardPattern])).toBeNull();
    expect(findBlockedPattern('git add .gitignore', [wildcardPattern])).toBeNull();
  });

  it('matches the leased force-push spelling, which still rewrites remote history', () => {
    const pattern = 'git push --force-with-lease';
    expect(findBlockedPattern('git push --force-with-lease', [pattern])?.pattern).toBe(pattern);
    expect(findBlockedPattern('git push --force-with-lease origin main', [pattern])?.pattern).toBe(
      pattern,
    );
    // The plain force patterns do NOT cover the leased spelling — that gap is
    // why the policy carries this pattern explicitly (measured firsthand).
    expect(findBlockedPattern('git push --force-with-lease', ['git push --force'])).toBeNull();
  });

  it('matches `git add -u`/`--update` wildcard staging without tripping explicit pathspecs', () => {
    const patterns = ['git add -u', 'git add --update'];
    expect(findBlockedPattern('git add -u', patterns)?.pattern).toBe('git add -u');
    expect(findBlockedPattern('git add --update', patterns)?.pattern).toBe('git add --update');
    expect(findBlockedPattern('git add -- file.ts', patterns)).toBeNull();
    expect(findBlockedPattern('git add subdir/file.ts', patterns)).toBeNull();
  });
});

describe('extractBashCommand', () => {
  it('returns the Bash command from Claude hook input', () => {
    const hookInput = {
      tool_name: 'Bash',
      tool_input: {
        command: 'git commit --no-verify',
      },
    };

    expect(extractBashCommand(hookInput)).toBe('git commit --no-verify');
  });

  it('accepts command-bearing input from runners that flatten the payload', () => {
    const hookInput = {
      command: 'git push origin HEAD --force',
    };

    expect(extractBashCommand(hookInput)).toBe('git push origin HEAD --force');
  });

  it('throws when the hook input does not contain a Bash command', () => {
    const hookInput = {
      tool_name: 'Bash',
      tool_input: {},
    };

    expect(() => extractBashCommand(hookInput)).toThrow(
      'Claude PreToolUse hook input did not include a Bash command.',
    );
  });
});

describe('parseHookInput', () => {
  it('throws a helpful error for invalid JSON', () => {
    expect(() => parseHookInput('{')).toThrow('Claude PreToolUse hook input was not valid JSON:');
  });
});

describe('parseBlockedPatternPolicy', () => {
  it('extracts blocked command patterns from policy data', () => {
    expect(
      parseBlockedPatternPolicy({
        hooks: {
          preToolUse: {
            blocked_patterns: ['git push --force', 'git --no-verify'],
          },
        },
      }),
    ).toStrictEqual(['git push --force', 'git --no-verify']);
  });

  it('accepts entries that pair a pattern with a doctrinal citation', () => {
    expect(
      parseBlockedPatternPolicy({
        hooks: {
          preToolUse: {
            blocked_patterns: [
              'git push --force',
              { pattern: 'git add .', citation: 'distilled.md §Stage by explicit pathspec' },
            ],
          },
        },
      }),
    ).toStrictEqual([
      'git push --force',
      { pattern: 'git add .', citation: 'distilled.md §Stage by explicit pathspec' },
    ]);
  });

  it('throws when an object entry omits the pattern field', () => {
    expect(() =>
      parseBlockedPatternPolicy({
        hooks: {
          preToolUse: {
            blocked_patterns: [{ citation: 'orphan citation' }],
          },
        },
      }),
    ).toThrow('The canonical hook policy did not contain hooks.preToolUse.blocked_patterns.');
  });

  it('throws when an object entry has a non-string citation', () => {
    expect(() =>
      parseBlockedPatternPolicy({
        hooks: {
          preToolUse: {
            blocked_patterns: [{ pattern: 'git add .', citation: 42 }],
          },
        },
      }),
    ).toThrow('The canonical hook policy did not contain hooks.preToolUse.blocked_patterns.');
  });

  it('throws when policy data has no blocked_patterns array', () => {
    expect(() => parseBlockedPatternPolicy({ hooks: {} })).toThrow(
      'The canonical hook policy did not contain hooks.preToolUse.blocked_patterns.',
    );
  });
});

describe('buildPreToolUseDenyResponse', () => {
  it('returns the structured deny payload Claude expects', () => {
    expect(buildPreToolUseDenyResponse({ pattern: 'git push --force' })).toStrictEqual({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Blocked by repo hook policy: matched dangerous pattern "git push --force".',
      },
    });
  });

  it('appends the doctrinal citation to the reason when present', () => {
    expect(
      buildPreToolUseDenyResponse({
        pattern: 'git add .',
        citation: 'distilled.md §Stage by explicit pathspec',
      }),
    ).toStrictEqual({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          'Blocked by repo hook policy: matched dangerous pattern "git add .". Citation: distilled.md §Stage by explicit pathspec.',
      },
    });
  });

  it('frames the block as a concept to reappraise when the entry carries a concept', () => {
    const response = buildPreToolUseDenyResponse({
      pattern: 'git reset --hard',
      concept: 'history-destruction',
      reappraisal:
        'Preserve in-flight work; never use git to remove work — make forward-going filesystem changes instead.',
      citation: '.agent/rules/never-use-git-to-remove-work.md',
    });

    expect(response.hookSpecificOutput.permissionDecision).toBe('deny');
    const reason = response.hookSpecificOutput.permissionDecisionReason;
    // The reason must TEACH, not only refuse: name the pattern and its concept,
    // carry the positive reappraisal direction and the citation, and steer the
    // agent away from swapping in a sibling destructive command.
    expect(reason).toContain('git reset --hard');
    expect(reason).toContain('history-destruction');
    expect(reason).toContain('never use git to remove work');
    expect(reason).toContain('not a command to swap for a sibling');
    expect(reason).toContain('Citation: .agent/rules/never-use-git-to-remove-work.md');
  });

  it('falls back to a default reappraisal when a concept entry omits its own', () => {
    const reason = buildPreToolUseDenyResponse({
      pattern: 'git clean -fd',
      concept: 'worktree-destruction',
    }).hookSpecificOutput.permissionDecisionReason;

    expect(reason).toContain('worktree-destruction');
    expect(reason).toContain('Step back and reappraise');
  });
});

describe('findBlockedPattern — short-option cluster equivalence', () => {
  const policy = [{ pattern: 'git clean -f', concept: 'worktree-destruction' }];

  it.each([
    'git clean -fd',
    'git clean -df',
    'git clean -d -f',
    'git clean -fdx',
    'git clean -xdf',
  ])('matches the flag-cluster spelling %s against the pattern "git clean -f"', (command) => {
    expect(findBlockedPattern(command, policy)?.pattern).toBe('git clean -f');
  });

  it('does not match a git clean dry run that never carries the force flag', () => {
    expect(findBlockedPattern('git clean -nd', policy)).toBeNull();
  });
});

describe('findBlockedPattern — no-verify short alias', () => {
  const policy = [{ pattern: 'git commit -n', concept: 'gate-bypass' }];

  it.each(['git commit -n', 'git commit -an', 'git commit -anm "msg"'])(
    'matches the hook-bypass spelling %s',
    (command) => {
      expect(findBlockedPattern(command, policy)?.pattern).toBe('git commit -n');
    },
  );

  it('does not match a plain message commit or an unrelated dry-run flag', () => {
    expect(findBlockedPattern('git commit -m "msg"', policy)).toBeNull();
    expect(findBlockedPattern('git clean -n && git status', policy)).toBeNull();
  });
});
