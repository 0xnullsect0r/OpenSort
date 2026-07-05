export interface LevelConfig {
  /** Number of distinct nut colors used (and thus the number of initially-full screws). */
  numColors: number;
  /** Capacity of every screw on the board. */
  screwCapacity: number;
  /** Number of extra empty "buffer" screws beyond one per color. */
  numEmptyScrews: number;
  /** How many relaxed-shuffle steps to apply when scrambling the solved board. */
  shuffleDepth: number;
  /** Reject a generated level whose solver-optimal move count is below this. */
  minAcceptableMoves: number;
  /** Safety cap on solver states explored before giving up on a candidate. */
  solverStateBudget: number;
}

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  numColors: 5,
  screwCapacity: 5,
  numEmptyScrews: 2,
  shuffleDepth: 40,
  minAcceptableMoves: 8,
  solverStateBudget: 500_000,
};

/**
 * A gentle-then-sawtooth difficulty curve for a numbered level (1-based).
 * Ramps slowly for the first 30 levels, then increases with an oscillating
 * "hard level, breather" pattern so the game doesn't feel monotonically brutal.
 */
export function configForLevel(levelNumber: number): LevelConfig {
  const n = Math.max(1, levelNumber);

  // Plain BFS (see solver.ts) is exact but its cost grows sharply with color
  // count and shuffle depth, so this curve is deliberately conservative rather
  // than chasing genre-typical "12+ colors" late-game numbers — it keeps every
  // generated level solvable in well under a second of search.
  const rampStage = Math.min(n, 50);
  const numColors = Math.min(3 + Math.floor(rampStage / 10), 6); // 3 colors -> capped at 6
  const postRamp = Math.max(0, n - 50);
  const extraColors = Math.min(Math.floor(postRamp / 50), 1); // tiny late-game growth, cap +1

  const totalColors = Math.min(numColors + extraColors, 7);
  // A rare 1-empty-screw difficulty spike, only when color count is low enough
  // to keep the search cheap despite the reduced buffer space.
  const numEmptyScrews = n >= 15 && n % 7 === 0 && totalColors <= 5 ? 1 : 2;
  const screwCapacity = n < 15 ? 4 : 5;

  const shuffleDepth = 20 + Math.min(n, 60);

  return {
    numColors: totalColors,
    screwCapacity,
    numEmptyScrews,
    shuffleDepth,
    minAcceptableMoves: Math.min(6 + Math.floor(n / 10), 18),
    solverStateBudget: 200_000,
  };
}
