import { describe, expect, it } from 'vitest';

import { readAgentProjection } from './agent-projection.js';

const TEMPLATE_PATH = '.agent/sub-agents/templates/task-worker.md';

describe('readAgentProjection', () => {
  it('defaults a template with no frontmatter to the reviewer posture', () => {
    expect(readAgentProjection(TEMPLATE_PATH, '# Task Worker\n')).toEqual({
      agentClass: 'reviewer',
      tools: [],
    });
  });

  it('defaults frontmatter WITHOUT a projection key to the reviewer posture', () => {
    const template = '---\nname: task-worker\n---\n\n# Task Worker\n';
    expect(readAgentProjection(TEMPLATE_PATH, template)).toEqual({
      agentClass: 'reviewer',
      tools: [],
    });
  });

  it('reads a worker projection with its portable tools allowlist', () => {
    const template = '---\nprojection:\n  class: worker\n  tools:\n    - Read\n---\n\n# W\n';
    expect(readAgentProjection(TEMPLATE_PATH, template)).toEqual({
      agentClass: 'worker',
      tools: ['Read'],
    });
  });

  it('fails fast with helpful context on malformed YAML, carrying the cause', () => {
    const template = '---\nprojection:\n  class: [unclosed\n---\n\n# W\n';
    let caught: unknown;
    try {
      readAgentProjection(TEMPLATE_PATH, template);
    } catch (error) {
      caught = error;
    }
    if (!(caught instanceof Error)) {
      throw new Error('expected readAgentProjection to throw an Error on malformed YAML');
    }
    expect(caught.message).toMatch(/task-worker\.md.*invalid projection metadata/u);
    expect(caught.cause).toBeInstanceOf(Error);
  });
});
