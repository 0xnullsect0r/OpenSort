import { describe, expect, it } from 'vitest';
import { configForLevel, DEFAULT_LEVEL_CONFIG } from '../../src/game-core/levelGen/levelConfig';
import { generateLevel } from '../../src/game-core/levelGen/levelGenerator';
import { solve } from '../../src/game-core/solver/solver';
import * as MoveValidator from '../../src/game-core/moveValidator';

describe('generateLevel', () => {
  it('produces a board that is not already solved', () => {
    const level = generateLevel(DEFAULT_LEVEL_CONFIG, 1);
    expect(level.initialBoard.isSolved()).toBe(false);
  });

  it('produces a board whose solver-reported optimal solution actually solves it', () => {
    const level = generateLevel(DEFAULT_LEVEL_CONFIG, 42);
    const solution = solve(level.initialBoard, { maxStates: level.config.solverStateBudget });
    expect(solution).not.toBeNull();
    expect(solution!.length).toBe(level.optimalMoves);

    const replay = level.initialBoard.clone();
    for (const move of solution!) {
      const result = MoveValidator.evaluate(replay, move);
      expect(result.legal).toBe(true);
      if (result.legal) MoveValidator.apply(replay, move, result.nutsMoved);
    }
    expect(replay.isSolved()).toBe(true);
  });

  it('respects minAcceptableMoves', () => {
    const config = { ...DEFAULT_LEVEL_CONFIG, minAcceptableMoves: 8 };
    const level = generateLevel(config, 7);
    expect(level.optimalMoves).toBeGreaterThanOrEqual(8);
  });

  it('is deterministic for a fixed seed', () => {
    const a = generateLevel(DEFAULT_LEVEL_CONFIG, 99);
    const b = generateLevel(DEFAULT_LEVEL_CONFIG, 99);
    expect(a.initialBoard.canonicalKey()).toBe(b.initialBoard.canonicalKey());
    expect(a.optimalMoves).toBe(b.optimalMoves);
  });

  it('produces solvable levels across the difficulty curve used for campaign generation', () => {
    for (const levelNumber of [1, 5, 15, 30, 50, 70, 100]) {
      const config = configForLevel(levelNumber);
      const level = generateLevel(config, 1000 + levelNumber);
      const solution = solve(level.initialBoard, { maxStates: config.solverStateBudget });
      expect(solution, `level ${levelNumber} should be solvable`).not.toBeNull();
    }
  }, 20_000);
});
