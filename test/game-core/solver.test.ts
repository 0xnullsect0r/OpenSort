import { describe, expect, it } from 'vitest';
import { Board } from '../../src/game-core/board';
import { Screw } from '../../src/game-core/screw';
import { solve } from '../../src/game-core/solver/solver';
import * as MoveValidator from '../../src/game-core/moveValidator';

describe('solve', () => {
  it('returns an empty solution for an already-solved board', () => {
    const board = new Board([Screw.full(4, 'red'), Screw.empty(4)]);
    expect(solve(board)).toEqual([]);
  });

  it('finds the one-move solution for a trivially scrambled board', () => {
    const board = new Board([
      new Screw(4, [{ color: 'red' }, { color: 'red' }, { color: 'red' }]),
      new Screw(4, [{ color: 'red' }]),
    ]);
    const solution = solve(board);
    expect(solution).toEqual([{ from: 0, to: 1 }]);
  });

  it('finds a multi-step solution for a small 3-color puzzle', () => {
    // 3 colors, capacity 3, 1 empty buffer screw, hand-scrambled but solvable.
    const board = new Board([
      new Screw(3, [{ color: 'red' }, { color: 'blue' }, { color: 'green' }]),
      new Screw(3, [{ color: 'blue' }, { color: 'green' }, { color: 'red' }]),
      new Screw(3, [{ color: 'green' }, { color: 'red' }, { color: 'blue' }]),
      Screw.empty(3),
    ]);
    const solution = solve(board);
    expect(solution).not.toBeNull();

    // Replaying the solution from the solver must actually reach a solved board.
    const replay = board.clone();
    for (const move of solution!) {
      const result = MoveValidator.evaluate(replay, move);
      expect(result.legal).toBe(true);
      if (result.legal) MoveValidator.apply(replay, move, result.nutsMoved);
    }
    expect(replay.isSolved()).toBe(true);
  });

  it('returns null for a deadlocked board with no legal moves and no empty screw', () => {
    // Both screws are full and mismatched at the top, so no move is ever legal.
    const board = new Board([
      new Screw(2, [{ color: 'red' }, { color: 'blue' }]),
      new Screw(2, [{ color: 'blue' }, { color: 'red' }]),
    ]);
    expect(solve(board, { maxStates: 1000 })).toBeNull();
  });
});
