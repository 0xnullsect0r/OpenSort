import type { Board } from '../board';
import { solve } from '../solver/solver';
import type { LevelConfig } from './levelConfig';
import { buildSolvedBoard, relaxedShuffle } from './shuffle';
import { Rng } from './rng';

export interface LevelData {
  readonly initialBoard: Board;
  readonly optimalMoves: number;
  readonly seed: number;
  readonly config: LevelConfig;
}

/**
 * Generates a guaranteed-solvable level: build a solved board, relax-shuffle it,
 * then verify with the solver (rejecting boards that are trivially solved, too
 * easy, or that the solver can't crack within its state budget) before accepting.
 */
export function generateLevel(config: LevelConfig, seed: number, maxAttempts = 25): LevelData {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const attemptSeed = seed + attempt;
    const rng = new Rng(attemptSeed);

    const solved = buildSolvedBoard(config);
    const candidate = relaxedShuffle(solved, config.shuffleDepth, rng);

    if (candidate.isSolved()) continue; // shuffled straight back to solved; retry

    const solution = solve(candidate, { maxStates: config.solverStateBudget });
    if (solution && solution.length >= config.minAcceptableMoves) {
      return { initialBoard: candidate, optimalMoves: solution.length, seed: attemptSeed, config };
    }
  }

  throw new Error(`generateLevel: failed to produce a valid level after ${maxAttempts} attempts (seed ${seed})`);
}
