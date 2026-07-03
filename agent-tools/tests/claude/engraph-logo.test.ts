import { resolveLogoRows, resolveLogoStyle } from '../../src/claude/engraph-logo';

/**
 * The castr asset-contract module ships with NO mark art (owner directive:
 * castr authors its own logo later; no Oak acorn byte crosses). These tests
 * pin the empty-asset contract; when the castr mark lands, this file grows
 * the mechanism invariants Oak pins for its asset (row count per style,
 * uniform code-point display width, frame-0-canonical, all-frames-distinct,
 * fallback matrix) re-derived from the castr art.
 */
describe('resolveLogoStyle — empty-asset contract', () => {
  it.each(['none', undefined, '', 'braille-sharp', 'sextant', 'anything-unrecognised'])(
    'resolves %s to the only available style, none',
    (raw) => {
      expect(resolveLogoStyle(raw)).toBe('none');
    },
  );
});

describe('resolveLogoRows — empty-asset contract', () => {
  it.each([0, 1, 3, -2, 7.5])(
    'renders no rows for none regardless of the frame counter (%s)',
    (frame) => {
      expect(resolveLogoRows('none', frame)).toBeUndefined();
    },
  );
});
