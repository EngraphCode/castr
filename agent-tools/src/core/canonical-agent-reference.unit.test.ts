import { describe, expect, it } from 'vitest';

import {
  canonicalAgentReferenceIssue,
  extractCanonicalAgentPaths,
  isCanonicalAgentReferenceInside,
} from './canonical-agent-reference.js';

describe('canonical agent reference admission', () => {
  it.each([
    '.agent/sub-agents/templates/reviewer.md',
    '.agent/sub-agents/components/personas/barney.md',
  ])('accepts normalized repository-relative path %s', (reference) => {
    expect(canonicalAgentReferenceIssue(reference)).toBeNull();
  });

  it.each([
    '.agent/../outside.md',
    '.agent/sub-agents/templates/../rules/example.md',
    '.agent/sub-agents//templates/reviewer.md',
    '.agent\\sub-agents\\templates\\reviewer.md',
    '.agent/sub-agents/templates/reviewer.md/',
    '.agent/sub-agents/templates/reviewer\0.md',
  ])('rejects non-canonical path %s', (reference) => {
    expect(canonicalAgentReferenceIssue(reference)).toContain(
      'must be a normalized path beneath .agent',
    );
  });

  it('uses path semantics when classifying a canonical directory descendant', () => {
    expect(
      isCanonicalAgentReferenceInside(
        '.agent/sub-agents/templates/reviewer.md',
        '.agent/sub-agents/templates',
      ),
    ).toBe(true);
    expect(
      isCanonicalAgentReferenceInside(
        '.agent/sub-agents/templates-archive/reviewer.md',
        '.agent/sub-agents/templates',
      ),
    ).toBe(false);
  });

  it('extracts unique canonical-looking references for explicit admission', () => {
    expect(
      extractCanonicalAgentPaths(
        'Read `.agent/sub-agents/templates/reviewer.md`, `.agent/../outside.md`, and `.agent/sub-agents/templates/reviewer.md`.',
      ),
    ).toEqual(['.agent/../outside.md', '.agent/sub-agents/templates/reviewer.md']);
  });
});
