import { describe, it, expect } from 'vitest';

import { findPdrCountDrift } from './validate-drift-helpers.js';

describe('findPdrCountDrift', () => {
  it('passes when a definite estate claim matches the file count', () => {
    const surfaces = [{ name: 'README.md', content: 'delivered the 91-PDR estate, plus more.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([]);
  });

  it('flags a drifted "N-PDR estate" claim (the propagated-miscount catch)', () => {
    const surfaces = [{ name: 'README.md', content: 'delivered the 92-PDR estate, plus more.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([
      { surface: 'README.md', detail: 'claims "92-PDR" but 91 PDR files exist' },
    ]);
  });

  it('flags a drifted "all N PDRs" claim', () => {
    const surfaces = [{ name: 'ref.md', content: 'all 92 PDRs transplanted together.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([
      { surface: 'ref.md', detail: 'claims "all 92 PDRs" but 91 PDR files exist' },
    ]);
  });

  it('does NOT flag a legitimate sub-count ("across 10 PDRs")', () => {
    const surfaces = [{ name: 'ref.md', content: '8 distinct cites across 10 PDRs resolve.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([]);
  });

  it('does NOT flag an approximate claim ("~90 PDRs")', () => {
    const surfaces = [{ name: 'contract.md', content: 'BRING ~90 PDRs + provenance.yml.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([]);
  });

  it('does NOT flag "approximately 90 PDRs"', () => {
    const surfaces = [{ name: 'contract.md', content: 'approximately 90 PDRs are portable.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([]);
  });

  it('passes when "all N PDR files" matches', () => {
    const surfaces = [{ name: 'ref.md', content: 'all 91 PDR files transplanted together.' }];
    expect(findPdrCountDrift(surfaces, 91)).toEqual([]);
  });
});
