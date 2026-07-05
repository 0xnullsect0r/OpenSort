import { Board } from '../game-core/board';
import { Screw } from '../game-core/screw';
import { solve } from '../game-core/solver/solver';
import type { Move } from '../game-core/move';
import type { NutColor } from '../game-core/nut';

// Cast rather than pull in the "webworker" lib, which would conflict with the
// app-wide "dom" lib in the same TS program (they declare overlapping globals
// like `self` incompatibly) — this file only needs postMessage/onmessage.
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<SolveRequest>) => void) | null;
  postMessage: (message: SolveResponse) => void;
};

export interface SolveRequest {
  screwCapacity: number;
  screws: NutColor[][];
  maxStates?: number;
}

export interface SolveResponse {
  solution: Move[] | null;
}

ctx.onmessage = (event) => {
  const { screwCapacity, screws, maxStates } = event.data;
  const board = new Board(screws.map((colors) => new Screw(screwCapacity, colors.map((color) => ({ color })))));
  const solution = solve(board, { maxStates });
  ctx.postMessage({ solution });
};
