import { describe, expect, it } from 'vitest';

import { ARC_PALETTE_SIZE } from '../../src/arc/arc-channel-grammar';
import { ARC_ERROR_FOREGROUND, arcBadgeForeground } from '../../src/claude/statusline-arc-palette';

// ESC is asserted as a string prefix (a control character inside a regex
// trips no-control-regex); the anchored tail regex covers the rest of the SGR.
const ESC = '\u001b';
const TRUECOLOR_FOREGROUND_TAIL = /^\[38;2;\d{1,3};\d{1,3};\d{1,3}m$/;

function expectTruecolorForeground(sgr: string): void {
  expect(sgr.startsWith(ESC)).toBe(true);
  expect(sgr.slice(1)).toMatch(TRUECOLOR_FOREGROUND_TAIL);
}

describe('statusline arc palette', () => {
  it('carries exactly ARC_PALETTE_SIZE well-formed truecolor foregrounds', () => {
    const foregrounds = Array.from({ length: ARC_PALETTE_SIZE }, (_, index) =>
      arcBadgeForeground(index),
    );
    for (const foreground of foregrounds) {
      expectTruecolorForeground(foreground);
    }
  });

  it('keeps every palette slot visually distinct (no duplicate foregrounds)', () => {
    const foregrounds = Array.from({ length: ARC_PALETTE_SIZE }, (_, index) =>
      arcBadgeForeground(index),
    );
    expect(new Set(foregrounds).size).toBe(ARC_PALETTE_SIZE);
  });

  it('wraps an out-of-range index mod palette size rather than crashing', () => {
    expect(arcBadgeForeground(ARC_PALETTE_SIZE)).toBe(arcBadgeForeground(0));
    expect(arcBadgeForeground(ARC_PALETTE_SIZE + 3)).toBe(arcBadgeForeground(3));
  });

  it('keeps the error foreground distinct from every palette slot', () => {
    expectTruecolorForeground(ARC_ERROR_FOREGROUND);
    for (let index = 0; index < ARC_PALETTE_SIZE; index += 1) {
      expect(ARC_ERROR_FOREGROUND).not.toBe(arcBadgeForeground(index));
    }
  });

  it('keeps every slot legible as ink on BOTH light and dark backgrounds (owner ruling 2026-07-10)', () => {
    // The both-backgrounds band: relative luminance in [0.14, 0.30] clears
    // 3:1 non-text contrast against white AND #1E1E1E (4.5:1 on both is
    // mathematically impossible — the bands are disjoint). This invariant
    // RECOMPUTES the property from the emitted SGR values so a future retune
    // cannot silently reintroduce the illegible-pastel defect this ruling
    // cured — the constraint lives here as a gate, not only as module prose.
    const channel = (c: number): number => {
      const s = c / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    const luminance = (r: number, g: number, b: number): number =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const contrast = (a: number, b: number): number =>
      (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const WHITE = luminance(255, 255, 255);
    const DARK = luminance(30, 30, 30);

    for (let index = 0; index < ARC_PALETTE_SIZE; index += 1) {
      const match = /38;2;(\d{1,3});(\d{1,3});(\d{1,3})m/.exec(arcBadgeForeground(index));
      expect(match).not.toBeNull();
      if (match === null) {
        continue;
      }
      const slot = luminance(Number(match[1]), Number(match[2]), Number(match[3]));
      expect(slot).toBeGreaterThanOrEqual(0.14);
      expect(slot).toBeLessThanOrEqual(0.3);
      expect(contrast(slot, WHITE)).toBeGreaterThanOrEqual(3);
      expect(contrast(slot, DARK)).toBeGreaterThanOrEqual(3);
    }
  });
});
