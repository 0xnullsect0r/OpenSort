import type { Board } from './board';
import type { Move, MoveResult } from './move';

/** Pure check: is `move` legal on `board` right now, and if so how many nuts would transfer? */
export function evaluate(board: Board, move: Move): MoveResult {
  if (move.from === move.to) return { legal: false, reason: 'sameScrew' };

  const src = board.screws[move.from];
  const dst = board.screws[move.to];

  if (src.isEmpty) return { legal: false, reason: 'sourceEmpty' };
  if (dst.isFull) return { legal: false, reason: 'destinationFull' };
  if (!dst.isEmpty && dst.topNut!.color !== src.topNut!.color) {
    return { legal: false, reason: 'colorMismatch' };
  }

  const nutsMoved = Math.min(src.topRunLength, dst.freeSpace);
  if (nutsMoved <= 0) return { legal: false, reason: 'noCapacity' };

  return { legal: true, nutsMoved };
}

/** Mutates `board` in place, transferring `nutsMoved` nuts from `move.from` to `move.to`. */
export function apply(board: Board, move: Move, nutsMoved: number): void {
  const run = board.screws[move.from].removeTop(nutsMoved);
  board.screws[move.to].addTop(run);
}

/**
 * All currently-legal moves on `board`, each paired with how many nuts it would move.
 * Precomputes each screw's top color/run length/free space once (rather than recomputing
 * them per candidate pair, as a naive per-pair `evaluate()` call would) since this function
 * sits in the solver's hottest inner loop and its cost dominates search performance.
 */
export function enumerateLegalMoves(board: Board): { move: Move; nutsMoved: number }[] {
  const screws = board.screws;
  const n = screws.length;
  const topColor = new Array<string | undefined>(n);
  const topRun = new Array<number>(n);
  const freeSpace = new Array<number>(n);
  const isEmpty = new Array<boolean>(n);

  for (let i = 0; i < n; i++) {
    const screw = screws[i];
    isEmpty[i] = screw.isEmpty;
    freeSpace[i] = screw.freeSpace;
    topColor[i] = screw.topNut?.color;
    topRun[i] = screw.topRunLength;
  }

  const results: { move: Move; nutsMoved: number }[] = [];
  for (let from = 0; from < n; from++) {
    if (isEmpty[from] || topRun[from] === 0) continue;
    for (let to = 0; to < n; to++) {
      if (from === to || freeSpace[to] === 0) continue;
      if (!isEmpty[to] && topColor[to] !== topColor[from]) continue;

      const nutsMoved = Math.min(topRun[from], freeSpace[to]);
      if (nutsMoved > 0) results.push({ move: { from, to }, nutsMoved });
    }
  }
  return results;
}
