import { describe, expect, it } from 'vitest';

import { ACTIVE_CLAIMS_SEED_TEXT, CLOSED_CLAIMS_SEED_TEXT } from './claims-init.js';
import { parseClosedClaimsArchive, parseCollaborationRegistry } from './state-parsers.js';

describe('claims init seed constants', () => {
  it('active seed carries the registry shape (commit_queue included) and parses canonically', () => {
    const parsed = parseCollaborationRegistry(ACTIVE_CLAIMS_SEED_TEXT);
    expect(parsed.claims).toEqual([]);
    expect(parsed.commit_queue).toEqual([]);
  });

  it('closed seed carries the archive shape (no commit_queue) and parses canonically', () => {
    // The measured 2026-08-24 defect: seeding the archive with the registry
    // shape (commit_queue present) passes JSON.parse but fails the blocking
    // repo validator (additionalProperties: false). The two seeds must
    // differ exactly here.
    const parsed = parseClosedClaimsArchive(CLOSED_CLAIMS_SEED_TEXT);
    expect(parsed.claims).toEqual([]);
    expect(JSON.parse(CLOSED_CLAIMS_SEED_TEXT)).not.toHaveProperty('commit_queue');
  });
});
