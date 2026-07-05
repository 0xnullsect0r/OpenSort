import { describe, expect, it } from 'vitest';
import { Board } from '../../src/game-core/board';
import { Screw } from '../../src/game-core/screw';
import { GameController } from '../../src/game-core/gameController';

function freshController(): GameController {
  const board = new Board([
    new Screw(4, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }]),
    Screw.empty(4),
  ]);
  return new GameController(board);
}

describe('GameController.attemptMove', () => {
  it('applies a legal move and increments movesMade', () => {
    const controller = freshController();
    const result = controller.attemptMove(0, 1);
    expect(result.legal).toBe(true);
    expect(controller.movesMade).toBe(1);
    expect(controller.board.screws[1].nuts).toEqual([{ color: 'red' }, { color: 'red' }]);
  });

  it('does not mutate the board or count a move for an illegal move', () => {
    const controller = freshController();
    const before = controller.board.canonicalKey();
    const result = controller.attemptMove(1, 0); // source (1) is empty
    expect(result.legal).toBe(false);
    expect(controller.movesMade).toBe(0);
    expect(controller.board.canonicalKey()).toBe(before);
  });
});

describe('GameController.undo', () => {
  it('reverts the board to its pre-move state without counting as a move', () => {
    const controller = freshController();
    controller.attemptMove(0, 1);
    const undone = controller.undo();
    expect(undone).toBe(true);
    expect(controller.movesMade).toBe(1);
    expect(controller.undosUsed).toBe(1);
    expect(controller.board.screws[0].nuts).toEqual([
      { color: 'blue' },
      { color: 'red' },
      { color: 'red' },
    ]);
    expect(controller.board.screws[1].isEmpty).toBe(true);
  });

  it('returns false when there is nothing to undo', () => {
    const controller = freshController();
    expect(controller.undo()).toBe(false);
    expect(controller.canUndo).toBe(false);
  });
});

describe('GameController.isWon', () => {
  it('is false for a mixed board and true once sorted (singleColorAnyFill)', () => {
    const board = new Board([new Screw(2, [{ color: 'red' }, { color: 'blue' }]), Screw.empty(2)]);
    const controller = new GameController(board, 'singleColorAnyFill');
    expect(controller.isWon).toBe(false);

    controller.attemptMove(0, 1); // moves the top blue nut off
    expect(controller.isWon).toBe(true); // both screws are now single-color, though not full
  });

  it('fullStacksOnly requires the sorted screw to also be full', () => {
    const board = new Board([Screw.full(4, 'red').clone(), Screw.empty(4)]);
    const controller = new GameController(board, 'fullStacksOnly');
    expect(controller.isWon).toBe(true);
  });
});
