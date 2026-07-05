import type { NutColor } from '../../game-core/nut';

export interface ColorStyle {
  /** Hex color, chosen from a colorblind-safe categorical palette. */
  readonly hex: string;
  /** A short glyph rendered on every nut of this color, since color must never
   *  be the only signal distinguishing two colors (a known accessibility gap
   *  across this whole game genre). */
  readonly glyph: string;
}

// Palette hues loosely follow Okabe-Ito / ColorBrewer-style categorical sets,
// chosen for pairwise distinguishability under common color-vision deficiencies.
// Every color also gets a distinct glyph so hue is never the sole signal.
export const COLOR_STYLES: Record<NutColor, ColorStyle> = {
  red: { hex: '#e0475a', glyph: '●' },
  orange: { hex: '#e8832d', glyph: '▲' },
  yellow: { hex: '#e0c53f', glyph: '■' },
  green: { hex: '#4caf6b', glyph: '◆' },
  blue: { hex: '#3fa9f5', glyph: '★' },
  purple: { hex: '#9b6fd6', glyph: '✚' },
  pink: { hex: '#f28ec2', glyph: '▼' },
  teal: { hex: '#3ec8b8', glyph: '◀' },
  brown: { hex: '#9c6b45', glyph: '▶' },
  gray: { hex: '#9aa3b2', glyph: '◈' },
  lime: { hex: '#a9d443', glyph: '✦' },
  navy: { hex: '#4a5fc1', glyph: '✖' },
};

export function styleFor(color: NutColor): ColorStyle {
  return COLOR_STYLES[color];
}
