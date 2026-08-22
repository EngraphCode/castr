import { describe, it, expect } from 'vitest';

import { findGitleaksPinDrift, findPdrCountDrift } from './validate-drift-helpers.js';

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

describe('findGitleaksPinDrift', () => {
  const pinEnv = 'GITLEAKS_VERSION=8.30.0\nGITLEAKS_SHA256_LINUX_X64=abc\n';

  it('passes when the pin and minVersion agree', () => {
    expect(findGitleaksPinDrift(pinEnv, 'minVersion = "8.30.0"\n')).toEqual([]);
  });

  it('flags a minVersion that disagrees with the pin', () => {
    expect(findGitleaksPinDrift(pinEnv, 'minVersion = "8.31.0"\n')).toEqual([
      {
        surface: '.gitleaks.toml',
        detail:
          'minVersion "8.31.0" != pinned GITLEAKS_VERSION "8.30.0" (.claude/hooks/_lib/gitleaks-pin.env) — gitleaks treats minVersion as a warning only, so this drift scans silently',
      },
    ]);
  });

  it('flags duplicate GITLEAKS_VERSION assignments (shell consumers use the LAST)', () => {
    const dup = 'GITLEAKS_VERSION=8.30.0\nGITLEAKS_VERSION=8.20.0\n';
    expect(findGitleaksPinDrift(dup, 'minVersion = "8.30.0"\n')).toEqual([
      {
        surface: '.claude/hooks/_lib/gitleaks-pin.env',
        detail:
          '2 GITLEAKS_VERSION= assignments found — shell consumers use the last, so the pin must have exactly one',
      },
    ]);
  });

  it('flags an unparseable pin file', () => {
    expect(findGitleaksPinDrift('# empty\n', 'minVersion = "8.30.0"\n')).toEqual([
      {
        surface: '.claude/hooks/_lib/gitleaks-pin.env',
        detail: 'GITLEAKS_VERSION= line not found — the security pin has no readable source',
      },
    ]);
  });

  it('flags a gitleaks config with no minVersion', () => {
    expect(findGitleaksPinDrift(pinEnv, '[allowlist]\n')).toEqual([
      {
        surface: '.gitleaks.toml',
        detail: 'minVersion = "…" line not found — the config no longer declares the version floor',
      },
    ]);
  });
});
