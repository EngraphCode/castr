import { describe, expect, it } from 'vitest';

import {
  runSemanticMergeDriver,
  SEMANTIC_MERGE_DRIVER_NAME,
  semanticMergeDriverRefusal,
} from './semantic-merge-driver.js';

// LC2 stage-2 — the conflict-time refuse-and-route merge driver. git invokes it
// as `<cmd> %O %A %B %P` on a conflict in a `merge_class` path; it must FAIL LOUD
// (non-zero, no line-merge) and route to the engraph-semantic-merge skill, so a
// silent line-merge of memory/state files cannot happen. It cannot perform the
// concept-merge (git cannot, nor can a script) — it converts silent corruption
// into a loud halt.

describe('semanticMergeDriverRefusal', () => {
  it('refuses (non-zero) and routes to the skill, naming the path', () => {
    const result = semanticMergeDriverRefusal('.agent/memory/active/napkin.md');

    expect(result.exitCode).not.toBe(0);
    expect(result.message).toContain('.agent/memory/active/napkin.md');
    expect(result.message).toContain(SEMANTIC_MERGE_DRIVER_NAME);
    expect(result.message).toMatch(/do not|don't|never/i);
    expect(result.message).toMatch(/line-merge/i);
  });
});

describe('runSemanticMergeDriver', () => {
  it('takes the pathname from the last arg (git %P), refuses, and writes the message', () => {
    const written: string[] = [];
    // git passes %O %A %B %P — the pathname is last.
    const exitCode = runSemanticMergeDriver(
      ['/tmp/O', '/tmp/A', '/tmp/B', '.agent/memory/operational/repo-continuity.md'],
      (line) => written.push(line),
    );

    expect(exitCode).not.toBe(0);
    expect(written.join('\n')).toContain('.agent/memory/operational/repo-continuity.md');
    expect(written.join('\n')).toContain(SEMANTIC_MERGE_DRIVER_NAME);
  });

  it('still refuses loudly when git passes no pathname (defensive)', () => {
    const written: string[] = [];
    const exitCode = runSemanticMergeDriver([], (line) => written.push(line));

    expect(exitCode).not.toBe(0);
    expect(written.join('\n')).toContain(SEMANTIC_MERGE_DRIVER_NAME);
  });
});
