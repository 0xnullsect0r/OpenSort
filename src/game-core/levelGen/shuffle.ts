import { Board } from '../board';
import { NUT_COLORS } from '../nut';
import { Screw } from '../screw';
import type { LevelConfig } from './levelConfig';
import type { Rng } from './rng';

/** Builds the target solved board: one full screw per color, plus the configured empty buffers. */
export function buildSolvedBoard(config: LevelConfig): Board {
  if (config.numColors > NUT_COLORS.length) {
    throw new Error(`numColors (${config.numColors}) exceeds available palette (${NUT_COLORS.length})`);
  }
  const screws: Screw[] = [];
  for (let i = 0; i < config.numColors; i++) {
    screws.push(Screw.full(config.screwCapacity, NUT_COLORS[i]));
  }
  for (let i = 0; i < config.numEmptyScrews; i++) {
    screws.push(Screw.empty(config.screwCapacity));
  }
  return new Board(screws);
}

/**
 * Scrambles a solved board into a puzzle by repeatedly peeling a random-size
 * top run off a random screw and dropping it onto another screw with room,
 * ignoring the color-match rule (this is a construction step, not gameplay —
 * the color-match rule only needs to hold for moves the *player* makes).
 * The result is fed through the solver before being accepted as a level, since
 * this relaxed shuffle does not by itself guarantee the color-match rule is
 * satisfiable in reverse.
 */
export function relaxedShuffle(solved: Board, depth: number, rng: Rng): Board {
  const board = solved.clone();

  for (let step = 0; step < depth; step++) {
    const nonEmpty = board.screws
      .map((_, i) => i)
      .filter((i) => !board.screws[i].isEmpty);
    if (nonEmpty.length === 0) break;

    const from = rng.pick(nonEmpty);
    const maxRun = board.screws[from].topRunLength;
    const k = 1 + rng.nextInt(maxRun);

    const candidates = board.screws
      .map((_, i) => i)
      .filter((i) => i !== from && board.screws[i].freeSpace >= k);
    if (candidates.length === 0) continue;

    const to = rng.pick(candidates);
    const run = board.screws[from].removeTop(k);
    board.screws[to].addTop(run);
  }

  return board;
}
