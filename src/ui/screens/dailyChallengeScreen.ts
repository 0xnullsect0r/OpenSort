import { generateLevel } from '../../game-core/levelGen/levelGenerator';
import { configForLevel } from '../../game-core/levelGen/levelConfig';
import { seedFromDate } from '../../game-core/levelGen/rng';
import { progressService } from '../../services/progressService';
import { mountGameSession } from './gameSession';

function todayKey(date: Date): string {
  return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
}

export function renderDailyChallengeScreen(container: HTMLElement): void {
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = `<div class="topbar"><h1>Loading daily challenge…</h1></div>`;
  container.appendChild(screen);

  // A fixed, moderate difficulty (comparable to a mid-campaign level) so the
  // one-off generation-time solver pass stays well under a second on-device.
  const today = new Date();
  const dateKey = todayKey(today);
  const seed = seedFromDate(today);
  const config = configForLevel(25);

  // Deferred to a microtask so the "Loading…" placeholder actually paints first.
  setTimeout(() => {
    const level = generateLevel(config, seed);
    const existing = progressService.getDailyChallengeProgress(dateKey);

    mountGameSession({
      container,
      title: `Daily Challenge`,
      board: level.initialBoard,
      optimalMoves: level.optimalMoves,
      backHash: '#/',
      onComplete: (movesMade) => {
        progressService.recordDailyChallengeComplete(dateKey, movesMade, level.optimalMoves);
      },
    });

    if (existing) {
      const status = container.querySelector<HTMLElement>('[data-hud="status"]');
      if (status) status.textContent = `Best: ${existing.bestMoves} moves`;
    }
  }, 0);
}
