import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { deserializeLevel, type SerializedLevel } from '../../src/game-core/levelGen/levelSerialization';
import { solve } from '../../src/game-core/solver/solver';
import * as MoveValidator from '../../src/game-core/moveValidator';

// This is the CI content-validation gate: every level shipped in the bundled
// public/levels/levels.json must be provably solvable, and its stored
// optimalMoves must match a real solver run — never trust generation-time
// output blindly, since that's exactly how this genre ships "impossible"
// levels to players.
describe('public/levels/levels.json content validation', () => {
  const raw = readFileSync(resolve(process.cwd(), 'public/levels/levels.json'), 'utf-8');
  const { levels } = JSON.parse(raw) as { levels: SerializedLevel[] };

  it('bundles a non-empty, sequentially-id\'d level set', () => {
    expect(levels.length).toBeGreaterThan(0);
    levels.forEach((level, index) => expect(level.id).toBe(index + 1));
  });

  it('every bundled level is solvable and its stored optimalMoves is achievable', () => {
    for (const serialized of levels) {
      const board = deserializeLevel(serialized);
      expect(board.isSolved(), `level ${serialized.id} should not start solved`).toBe(false);

      const solution = solve(board, { maxStates: 1_000_000 });
      expect(solution, `level ${serialized.id} should be solvable`).not.toBeNull();
      expect(solution!.length, `level ${serialized.id} optimalMoves mismatch`).toBe(
        serialized.optimalMoves,
      );

      const replay = board.clone();
      for (const move of solution!) {
        const result = MoveValidator.evaluate(replay, move);
        expect(result.legal, `level ${serialized.id} replay move should be legal`).toBe(true);
        if (result.legal) MoveValidator.apply(replay, move, result.nutsMoved);
      }
      expect(replay.isSolved(), `level ${serialized.id} replayed solution should solve it`).toBe(true);
    }
  }, 60_000);
});
