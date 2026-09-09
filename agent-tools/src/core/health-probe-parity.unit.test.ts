import { describe, expect, it } from 'vitest';

import { collectReviewerAdapterParityDetails } from './health-probe-parity.js';

describe('collectReviewerAdapterParityDetails', () => {
  it('accepts the supported three-seat Codex and four-seat Claude/Cursor Cricket rosters', () => {
    const codexAgents = [
      'cricket-judgement-low',
      'cricket-judgement-medium',
      'cricket-procedure-xhigh',
    ];
    const allAgentNames = [...codexAgents, 'cricket-judgement-high'];

    expect(
      collectReviewerAdapterParityDetails(allAgentNames, {
        cursorAgents: allAgentNames,
        claudeAgents: allAgentNames,
        codexAgents,
      }),
    ).toEqual([]);
  });

  it('reports the deliberately unsupported high-judgement Codex adapter when present', () => {
    const allAgentNames = [
      'cricket-judgement-high',
      'cricket-judgement-low',
      'cricket-judgement-medium',
      'cricket-procedure-xhigh',
    ];

    expect(
      collectReviewerAdapterParityDetails(allAgentNames, {
        cursorAgents: allAgentNames,
        claudeAgents: allAgentNames,
        codexAgents: allAgentNames,
      }),
    ).toEqual(['Codex has unsupported reviewer adapter cricket-judgement-high.']);
  });
});
