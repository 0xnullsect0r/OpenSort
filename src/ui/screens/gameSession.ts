import { GameController } from '../../game-core/gameController';
import { Board } from '../../game-core/board';
import { BoardView } from '../components/boardView';
import { renderStars } from '../components/starRating';
import { solveInWorker } from '../../services/hintService';
import { settingsService } from '../../services/settingsService';
import { ProgressService } from '../../services/progressService';
import { audioService } from '../../services/audioService';
import { hapticsService } from '../../services/hapticsService';

export interface GameSessionOptions {
  container: HTMLElement;
  title: string;
  board: Board;
  optimalMoves: number;
  backHash: string;
  /** Called once, when the player reaches a solved board. */
  onComplete: (movesMade: number, stars: number) => void;
  /** If provided, rendered as a "Next" action on the win card (e.g. next campaign level). */
  onNext?: () => void;
}

/** Shared game-play screen used by both the campaign and the daily challenge. */
export function mountGameSession(options: GameSessionOptions): void {
  const { container, title, board, optimalMoves, backHash, onComplete, onNext } = options;
  container.innerHTML = '';

  const controller = new GameController(board);
  let completed = false;

  const screen = document.createElement('div');
  screen.className = 'screen game-screen';
  screen.innerHTML = `
    <div class="topbar">
      <button class="icon-button" data-nav="back">←</button>
      <h1>${title}</h1>
      <button class="icon-button" data-nav="undo" aria-label="Undo">↩</button>
    </div>
    <div class="game-hud">
      <span data-hud="moves">Moves: 0</span>
      <span data-hud="status"></span>
      <span data-hud="optimal">Best possible: ${optimalMoves}</span>
    </div>
    <div class="board-container"></div>
    <div class="game-footer">
      <button class="secondary-button" data-nav="hint">💡 Hint</button>
    </div>
  `;
  container.appendChild(screen);

  const movesEl = screen.querySelector<HTMLElement>('[data-hud="moves"]')!;
  const statusEl = screen.querySelector<HTMLElement>('[data-hud="status"]')!;
  const undoButton = screen.querySelector<HTMLButtonElement>('[data-nav="undo"]')!;
  const hintButton = screen.querySelector<HTMLButtonElement>('[data-nav="hint"]')!;
  const boardContainer = screen.querySelector<HTMLElement>('.board-container')!;

  const boardView = new BoardView({
    container: boardContainer,
    controller,
    colorblindMode: settingsService.get().colorblindPatternsAlwaysOn,
    onMove: (result) => {
      movesEl.textContent = `Moves: ${controller.movesMade}`;
      undoButton.disabled = !controller.canUndo;
      statusEl.textContent = '';
      if (result.legal) {
        audioService.move();
      } else {
        audioService.invalidMove();
        hapticsService.invalidMove();
      }
    },
    onWin: () => {
      if (completed) return;
      completed = true;
      const stars = ProgressService.starsFor(controller.movesMade, optimalMoves);
      onComplete(controller.movesMade, stars);
      audioService.win();
      hapticsService.win();
      showWinOverlay(stars);
    },
  });

  const unsubscribeSettings = settingsService.subscribe((settings) => {
    boardView.setColorblindMode(settings.colorblindPatternsAlwaysOn);
  });

  screen.querySelector('[data-nav="back"]')!.addEventListener('click', () => {
    unsubscribeSettings();
    window.location.hash = backHash;
  });

  undoButton.disabled = true;
  undoButton.addEventListener('click', () => {
    if (controller.undo()) {
      movesEl.textContent = `Moves: ${controller.movesMade}`;
      undoButton.disabled = !controller.canUndo;
      statusEl.textContent = 'Undone';
      boardView.render();
    }
  });

  hintButton.addEventListener('click', async () => {
    hintButton.disabled = true;
    statusEl.textContent = 'Thinking…';
    try {
      const solution = await solveInWorker(controller.board);
      if (!solution || solution.length === 0) {
        statusEl.textContent = solution ? 'Already solved!' : 'No hint found';
      } else {
        const [move] = solution;
        statusEl.textContent = `Try screw ${move.from + 1} → screw ${move.to + 1}`;
      }
    } catch {
      statusEl.textContent = 'Hint unavailable';
    } finally {
      hintButton.disabled = false;
    }
  });

  function showWinOverlay(stars: number): void {
    const overlay = document.createElement('div');
    overlay.className = 'win-overlay';
    overlay.innerHTML = `
      <div class="win-card">
        <div>🎉 Solved!</div>
        <div class="win-stars">${renderStars(stars)}</div>
        <div>${controller.movesMade} moves (best possible: ${optimalMoves})</div>
        <div style="display:flex; gap:12px;">
          <button class="secondary-button" data-action="back">Levels</button>
          ${onNext ? '<button class="primary-button" data-action="next">Next ▶</button>' : ''}
        </div>
      </div>
    `;
    overlay.querySelector('[data-action="back"]')!.addEventListener('click', () => {
      unsubscribeSettings();
      window.location.hash = backHash;
    });
    overlay.querySelector('[data-action="next"]')?.addEventListener('click', () => {
      unsubscribeSettings();
      onNext?.();
    });
    container.appendChild(overlay);
  }
}
