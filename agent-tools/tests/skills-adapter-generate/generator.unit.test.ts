import { describe, expect, it } from 'vitest';

import { checkAdapters, type CheckerFs } from '../../src/skills-adapter-generate/checker';
import {
  adapterTargetPath,
  assertUniqueLeafIds,
  buildAdapterFrontmatter,
  parseFrontmatter,
  renderAdapter,
  type AdapterSurface,
  type ParsedCanonicalSkill,
} from '../../src/skills-adapter-generate/generator';

const sampleCanonicalSkill = `---
name: start-right-quick
classification: active
description: Apply the repository start-right quick grounding workflow to the active session.
---

# Start Right (Quick)

## Goal

Workflow content here.
`;

describe('parseFrontmatter', () => {
  it('extracts name and description from a fenced canonical SKILL, discarding extra keys', () => {
    const result = parseFrontmatter(sampleCanonicalSkill);

    expect(result).toEqual({
      name: 'start-right-quick',
      description:
        'Apply the repository start-right quick grounding workflow to the active session.',
    });
  });

  it('returns undefined when the file lacks a frontmatter fence', () => {
    const result = parseFrontmatter('# Just a heading\n\nNo frontmatter.');

    expect(result).toBeUndefined();
  });

  it('returns undefined when frontmatter omits the required description', () => {
    const result = parseFrontmatter('---\nname: foo\n---\n\nbody');

    expect(result).toBeUndefined();
  });

  it('handles folded-scalar descriptions', () => {
    const folded = `---
name: commit
description: >-
  Create a well-formed commit for current changes with conventional
  message format.
---

body
`;
    const result = parseFrontmatter(folded);

    expect(result).toMatchObject({
      name: 'commit',
      description:
        'Create a well-formed commit for current changes with conventional message format.',
    });
  });
});

describe('buildAdapterFrontmatter', () => {
  it('renames the skill with the configured prefix and preserves the description', () => {
    const result = buildAdapterFrontmatter(
      { name: 'go', description: 'Re-ground execution.' },
      'engraph-',
      'go',
    );

    expect(result).toEqual({
      name: 'engraph-go',
      description: 'Re-ground execution.',
    });
  });

  it('uses an empty prefix when configured', () => {
    const result = buildAdapterFrontmatter(
      { name: 'go', description: 'Re-ground execution.' },
      '',
      'go',
    );

    expect(result).toEqual({ name: 'go', description: 'Re-ground execution.' });
  });
});

function makeFs(files: ReadonlyMap<string, string>): CheckerFs {
  return {
    async readFileOrUndefined(path) {
      return files.get(path);
    },
    async listSubdirectoryNames(path) {
      return path === '/repo/.agent/skills' ? ['sample'] : [];
    },
  };
}

describe('checkAdapters', () => {
  const repoRoot = '/repo';
  const prefix = 'oak-';
  const sampleCanonical: ParsedCanonicalSkill = {
    id: 'sample',
    relativeDir: 'sample',
    frontmatter: { name: 'sample', description: 'A sample canonical skill.' },
    canonicalPath: '/repo/.agent/skills/sample/SKILL-CANONICAL.md',
    canonicalFilename: 'SKILL-CANONICAL.md',
  };

  function expectedAdapter(surface: AdapterSurface): { path: string; content: string } {
    return {
      path: adapterTargetPath(repoRoot, prefix, sampleCanonical.id, surface),
      content: renderAdapter(sampleCanonical, prefix, surface),
    };
  }

  it('reports no drift when adapters match what the generator would emit', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, claude.content],
        [agents.path, agents.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.drifted).toEqual([]);
    expect(result.missing).toEqual([]);
  });

  it('detects drift in a modified adapter', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, `${claude.content}\n<!-- drift -->\n`],
        [agents.path, agents.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.drifted).toEqual([claude.path]);
    expect(result.missing).toEqual([]);
  });

  it('detects missing adapters', async () => {
    const claude = expectedAdapter('claude');
    const agents = expectedAdapter('agents');
    const fs = makeFs(
      new Map([
        [
          sampleCanonical.canonicalPath,
          '---\nname: sample\ndescription: A sample canonical skill.\n---\n\nbody\n',
        ],
        [claude.path, claude.content],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(result.missing).toEqual([agents.path]);
    expect(result.drifted).toEqual([]);
  });
});

function makeNestedFs(files: ReadonlyMap<string, string>): CheckerFs {
  return {
    async readFileOrUndefined(path) {
      return files.get(path);
    },
    async listSubdirectoryNames(path) {
      if (path === '/repo/.agent/skills') {
        return ['cognition'];
      }
      if (path === '/repo/.agent/skills/cognition') {
        return ['metacognition'];
      }
      return [];
    },
  };
}

describe('checkAdapters with a nested skill tree', () => {
  const repoRoot = '/repo';
  const prefix = 'engraph-';
  const nestedCanonical: ParsedCanonicalSkill = {
    id: 'metacognition',
    relativeDir: 'cognition/metacognition',
    frontmatter: { name: 'metacognition', description: 'Reflective thinking.' },
    canonicalPath: '/repo/.agent/skills/cognition/metacognition/SKILL-CANONICAL.md',
    canonicalFilename: 'SKILL-CANONICAL.md',
  };

  it('discovers skills nested under a group directory and flat-names their adapters', async () => {
    const claudeTarget = adapterTargetPath(repoRoot, prefix, nestedCanonical.id, 'claude');
    const agentsTarget = adapterTargetPath(repoRoot, prefix, nestedCanonical.id, 'agents');
    const claudeContent = renderAdapter(nestedCanonical, prefix, 'claude');
    const fs = makeNestedFs(
      new Map([
        [
          nestedCanonical.canonicalPath,
          '---\nname: metacognition\ndescription: Reflective thinking.\n---\n\nbody\n',
        ],
        [claudeTarget, claudeContent],
      ]),
    );

    const result = await checkAdapters({ repoRoot, prefix }, fs);

    expect(claudeTarget).toBe('/repo/.claude/skills/engraph-metacognition/SKILL.md');
    expect(result.drifted).toEqual([]);
    expect(result.missing).toEqual([agentsTarget]);
  });

  it('links the adapter body back to the nested canonical path', () => {
    const rendered = renderAdapter(nestedCanonical, prefix, 'claude');

    expect(rendered).toContain(
      'Read and follow `.agent/skills/cognition/metacognition/SKILL-CANONICAL.md`.',
    );
  });
});

describe('assertUniqueLeafIds', () => {
  const skillAt = (relativeDir: string): ParsedCanonicalSkill => ({
    id: relativeDir.split('/').at(-1) ?? relativeDir,
    relativeDir,
    frontmatter: { name: 'x', description: 'y' },
    canonicalPath: `/repo/.agent/skills/${relativeDir}/SKILL-CANONICAL.md`,
    canonicalFilename: 'SKILL-CANONICAL.md',
  });

  it('accepts a tree whose leaf names are unique', () => {
    expect(() =>
      assertUniqueLeafIds([skillAt('commit'), skillAt('cognition/reason')]),
    ).not.toThrow();
  });

  it('fails loud when two leaves share a name (adapter names flatten to the leaf)', () => {
    expect(() => assertUniqueLeafIds([skillAt('reason'), skillAt('cognition/reason')])).toThrow(
      /duplicate skill leaf id "reason"/,
    );
  });
});
