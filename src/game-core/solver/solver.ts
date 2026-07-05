import { Board } from '../board';
import { enumerateLegalMoves } from '../moveValidator';
import { movesEqual, reverseMove, type Move } from '../move';

export interface SolveOptions {
  /** Safety bound on explored states so a search can never hang. */
  maxStates?: number;
}

const DEFAULT_MAX_STATES = 500_000;

/**
 * Breadth-first search for the shortest sequence of legal moves that solves `board`.
 * Returns null if no solution is found within `maxStates` explored states.
 */
export function solve(board: Board, options: SolveOptions = {}): Move[] | null {
  const maxStates = options.maxStates ?? DEFAULT_MAX_STATES;

  if (board.isSolved()) return [];

  // Parent pointers (keyed by canonical board state) rather than a full move-path
  // per queued node — this keeps memory at O(states) instead of O(states * depth),
  // which matters a lot once the search explores hundreds of thousands of states.
  const startKey = board.canonicalKey();
  const cameFrom = new Map<string, { parentKey: string; move: Move }>();
  const visited = new Set<string>([startKey]);
  const queue: { board: Board; key: string; lastMove?: Move }[] = [{ board, key: startKey }];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];

    for (const { move, nutsMoved } of enumerateLegalMoves(current.board)) {
      // Prune moves that immediately undo the previous move — never useful in a shortest path.
      if (current.lastMove && movesEqual(move, reverseMove(current.lastMove))) continue;

      const next = current.board.clone();
      const run = next.screws[move.from].removeTop(nutsMoved);
      next.screws[move.to].addTop(run);

      const key = next.canonicalKey();
      if (visited.has(key)) continue;
      visited.add(key);
      cameFrom.set(key, { parentKey: current.key, move });

      if (next.isSolved()) return reconstructPath(cameFrom, key);
      if (visited.size > maxStates) return null;

      queue.push({ board: next, key, lastMove: move });
    }
  }

  return null;
}

function reconstructPath(
  cameFrom: Map<string, { parentKey: string; move: Move }>,
  goalKey: string,
): Move[] {
  const path: Move[] = [];
  let key = goalKey;
  for (;;) {
    const step = cameFrom.get(key);
    if (!step) break;
    path.push(step.move);
    key = step.parentKey;
  }
  return path.reverse();
}
