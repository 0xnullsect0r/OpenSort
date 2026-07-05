import { loadLevel, loadLevels } from '../../services/levelRepository';
import { deserializeLevel } from '../../game-core/levelGen/levelSerialization';
import { progressService } from '../../services/progressService';
import { mountGameSession } from './gameSession';

export async function renderGameScreen(container: HTMLElement, levelId: number): Promise<void> {
  const [level, allLevels] = await Promise.all([loadLevel(levelId), loadLevels()]);

  if (!level) {
    container.innerHTML = '';
    const screen = document.createElement('div');
    screen.className = 'screen';
    screen.innerHTML = `<div class="topbar"><h1>Level not found</h1></div>`;
    container.appendChild(screen);
    return;
  }

  const hasNext = allLevels.some((l) => l.id === levelId + 1);

  mountGameSession({
    container,
    title: `Level ${level.id}`,
    board: deserializeLevel(level),
    optimalMoves: level.optimalMoves,
    backHash: '#/levels',
    onComplete: (movesMade) => {
      progressService.recordLevelComplete(level.id, movesMade, level.optimalMoves);
    },
    onNext: hasNext ? () => { window.location.hash = `#/game/${levelId + 1}`; } : undefined,
  });
}
