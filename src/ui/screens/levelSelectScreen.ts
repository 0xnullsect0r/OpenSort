import { loadLevels } from '../../services/levelRepository';
import { progressService } from '../../services/progressService';
import { renderStars } from '../components/starRating';

export async function renderLevelSelectScreen(container: HTMLElement): Promise<void> {
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = `
    <div class="topbar">
      <button class="icon-button" data-nav="#/">←</button>
      <h1>Select Level</h1>
      <span style="width:40px"></span>
    </div>
    <div class="level-grid" role="list"></div>
  `;
  container.appendChild(screen);

  screen.querySelector<HTMLButtonElement>('[data-nav]')!.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  const grid = screen.querySelector('.level-grid')!;
  const levels = await loadLevels();

  for (const level of levels) {
    const unlocked = progressService.isUnlocked(level.id);
    const progress = progressService.getLevelProgress(level.id);

    const tile = document.createElement('button');
    tile.className = 'level-tile';
    tile.disabled = !unlocked;
    tile.setAttribute('aria-label', `Level ${level.id}`);
    tile.innerHTML = `
      <span>${level.id}</span>
      <span class="stars">${progress ? renderStars(progress.stars) : ''}</span>
    `;
    if (unlocked) {
      tile.addEventListener('click', () => {
        window.location.hash = `#/game/${level.id}`;
      });
    }
    grid.appendChild(tile);
  }
}
