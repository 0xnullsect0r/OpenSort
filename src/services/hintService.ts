import type { Board } from '../game-core/board';
import type { Move } from '../game-core/move';
import type { SolveRequest, SolveResponse } from '../workers/solverWorker';

const HINT_STATE_BUDGET = 300_000;

/** Solves `board` off the main thread so a worst-case search never freezes the UI. */
export function solveInWorker(board: Board): Promise<Move[] | null> {
  return new Promise((resolvePromise, reject) => {
    const worker = new Worker(new URL('../workers/solverWorker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = (event: MessageEvent<SolveResponse>) => {
      resolvePromise(event.data.solution);
      worker.terminate();
    };
    worker.onerror = (event) => {
      reject(event.error ?? new Error('Solver worker failed'));
      worker.terminate();
    };

    const request: SolveRequest = {
      screwCapacity: board.screws[0]?.capacity ?? 0,
      screws: board.screws.map((s) => s.nuts.map((n) => n.color)),
      maxStates: HINT_STATE_BUDGET,
    };
    worker.postMessage(request);
  });
}
