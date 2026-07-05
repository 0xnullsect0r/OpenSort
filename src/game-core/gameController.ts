import { Board, type WinCondition } from './board';
import * as MoveValidator from './moveValidator';
import type { Move, MoveResult } from './move';

/** Drives a single play session: owns the live board, undo history, and move count. */
export class GameController {
  board: Board;
  readonly winCondition: WinCondition;
  movesMade = 0;
  undosUsed = 0;
  private undoStack: Board[] = [];

  constructor(board: Board, winCondition: WinCondition = 'fullStacksOnly') {
    this.board = board;
    this.winCondition = winCondition;
  }

  attemptMove(from: number, to: number): MoveResult {
    const move: Move = { from, to };
    const result = MoveValidator.evaluate(this.board, move);
    if (result.legal) {
      this.undoStack.push(this.board.clone());
      MoveValidator.apply(this.board, move, result.nutsMoved);
      this.movesMade++;
    }
    return result;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  undo(): boolean {
    const previous = this.undoStack.pop();
    if (!previous) return false;
    this.board = previous;
    this.undosUsed++;
    return true;
  }

  get isWon(): boolean {
    return this.board.isSolved(this.winCondition);
  }
}
