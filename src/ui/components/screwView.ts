import type { Screw } from '../../game-core/screw';
import { styleFor } from '../styles/colorPalette';

export interface ScrewViewOptions {
  screw: Screw;
  index: number;
  selected: boolean;
  colorblindMode: boolean;
  onTap: (index: number) => void;
}

/** Renders one screw (rod + stacked nut chips) as a DOM element. */
export function renderScrew(options: ScrewViewOptions): HTMLElement {
  const { screw, index, selected, colorblindMode } = options;

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'screw' + (selected ? ' selected' : '') + (screw.isSingleColor && screw.isFull ? ' solved' : '');
  el.style.setProperty('--capacity', String(screw.capacity));
  el.setAttribute('aria-label', `Screw ${index + 1}`);
  el.addEventListener('click', () => options.onTap(index));

  const rod = document.createElement('div');
  rod.className = 'screw-rod';
  el.appendChild(rod);

  const slots = document.createElement('div');
  slots.className = 'screw-slots';
  slots.style.minHeight = `${screw.capacity * 26}px`;

  for (const nut of screw.nuts) {
    const style = styleFor(nut.color);
    const nutEl = document.createElement('div');
    nutEl.className = 'nut';
    nutEl.style.background = style.hex;
    const glyph = document.createElement('span');
    glyph.className = 'glyph';
    glyph.textContent = style.glyph;
    nutEl.appendChild(glyph);
    slots.appendChild(nutEl);
  }

  el.appendChild(slots);

  if (screw.isSingleColor && screw.isFull) {
    const cap = document.createElement('div');
    cap.className = 'screw-cap';
    cap.textContent = '✓';
    el.appendChild(cap);
  }

  if (colorblindMode) el.classList.add('colorblind-mode');

  return el;
}
