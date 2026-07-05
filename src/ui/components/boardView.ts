import { GameController } from '../../game-core/gameController';
import type { MoveResult } from '../../game-core/move';
import { renderScrew } from './screwView';

export interface BoardViewOptions {
  container: HTMLElement;
  controller: GameController;
  colorblindMode: boolean;
  onMove: (result: MoveResult) => void;
  onWin: () => void;
}

/** Drives the tap-source-then-tap-destination interaction and re-renders the board on change. */
export class BoardView {
  private selected: number | null = null;

  constructor(private options: BoardViewOptions) {
    this.render();
  }

  private handleTap(index: number): void {
    const { controller, onMove, onWin } = this.options;

    if (this.selected === null) {
      if (controller.board.screws[index].isEmpty) return; // nothing to pick up
      this.selected = index;
      this.render();
      return;
    }

    if (this.selected === index) {
      this.selected = null;
      this.render();
      return;
    }

    const from = this.selected;
    this.selected = null;
    const result = controller.attemptMove(from, index);
    onMove(result);
    this.render(); // clears the stale "selected" state regardless of legality

    if (!result.legal) {
      this.flashInvalid();
      return;
    }

    if (controller.isWon) onWin();
  }

  private flashInvalid(): void {
    const board = this.options.container.querySelector('.board');
    board?.classList.remove('shake-invalid');
    // Force reflow so the animation can re-trigger on repeated invalid taps.
    void (board as HTMLElement | null)?.offsetWidth;
    board?.classList.add('shake-invalid');
  }

  setColorblindMode(enabled: boolean): void {
    this.options.colorblindMode = enabled;
    this.render();
  }

  render(): void {
    const { container, controller, colorblindMode } = this.options;
    container.innerHTML = '';

    const board = document.createElement('div');
    board.className = 'board';
    board.style.setProperty('--board-cols', String(Math.min(controller.board.screws.length, 5)));

    controller.board.screws.forEach((screw, index) => {
      const screwEl = renderScrew({
        screw,
        index,
        selected: this.selected === index,
        colorblindMode,
        onTap: (i) => this.handleTap(i),
      });
      board.appendChild(screwEl);
    });

    container.appendChild(board);
  }
}
