import { describe, expect, it } from 'vitest';
import { Board } from '../../src/game-core/board';
import { Screw } from '../../src/game-core/screw';
import * as MoveValidator from '../../src/game-core/moveValidator';

function board(...screws: Screw[]): Board {
  return new Board(screws);
}

describe('MoveValidator.evaluate', () => {
  it('rejects moving a screw onto itself', () => {
    const b = board(Screw.full(4, 'red'), Screw.empty(4));
    const result = MoveValidator.evaluate(b, { from: 0, to: 0 });
    expect(result).toEqual({ legal: false, reason: 'sameScrew' });
  });

  it('rejects moving from an empty source', () => {
    const b = board(Screw.empty(4), Screw.empty(4));
    expect(MoveValidator.evaluate(b, { from: 0, to: 1 })).toEqual({
      legal: false,
      reason: 'sourceEmpty',
    });
  });

  it('rejects moving onto a full destination', () => {
    const b = board(Screw.full(4, 'red'), Screw.full(4, 'red'));
    expect(MoveValidator.evaluate(b, { from: 0, to: 1 })).toEqual({
      legal: false,
      reason: 'destinationFull',
    });
  });

  it('rejects a color mismatch', () => {
    const b = board(Screw.full(4, 'red'), new Screw(4, [{ color: 'blue' }]));
    expect(MoveValidator.evaluate(b, { from: 0, to: 1 })).toEqual({
      legal: false,
      reason: 'colorMismatch',
    });
  });

  it('allows moving onto an empty destination, transferring the whole top run', () => {
    const b = board(
      new Screw(5, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }]),
      Screw.empty(5),
    );
    const result = MoveValidator.evaluate(b, { from: 0, to: 1 });
    expect(result).toEqual({ legal: true, nutsMoved: 2 });
  });

  it('allows moving onto a matching top color', () => {
    const b = board(
      new Screw(5, [{ color: 'red' }]),
      new Screw(5, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }]),
    );
    const result = MoveValidator.evaluate(b, { from: 1, to: 0 });
    expect(result).toEqual({ legal: true, nutsMoved: 2 });
  });

  it('limits a partial transfer to the destination free capacity', () => {
    const b = board(
      new Screw(5, [{ color: 'red' }, { color: 'red' }, { color: 'red' }]),
      new Screw(5, [{ color: 'gray' }, { color: 'gray' }, { color: 'gray' }, { color: 'red' }]),
    );
    // destination has 1 free slot, source top run is 3 red -> only 1 should move
    const result = MoveValidator.evaluate(b, { from: 0, to: 1 });
    expect(result).toEqual({ legal: true, nutsMoved: 1 });
  });

  it('rejects when destination matches color but has zero free capacity', () => {
    const b = board(new Screw(5, [{ color: 'red' }]), Screw.full(1, 'red'));
    expect(MoveValidator.evaluate(b, { from: 0, to: 1 })).toEqual({
      legal: false,
      reason: 'destinationFull',
    });
  });
});

describe('MoveValidator.apply', () => {
  it('mutates the board, moving exactly nutsMoved nuts', () => {
    const b = board(
      new Screw(5, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }]),
      Screw.empty(5),
    );
    MoveValidator.apply(b, { from: 0, to: 1 }, 2);
    expect(b.screws[0].nuts).toEqual([{ color: 'blue' }]);
    expect(b.screws[1].nuts).toEqual([{ color: 'red' }, { color: 'red' }]);
  });
});

describe('MoveValidator.enumerateLegalMoves', () => {
  it('finds all legal moves on a board', () => {
    const b = board(Screw.full(4, 'red'), Screw.empty(4), Screw.full(4, 'blue'));
    const moves = MoveValidator.enumerateLegalMoves(b);
    expect(moves).toContainEqual({ move: { from: 0, to: 1 }, nutsMoved: 4 });
    expect(moves).toContainEqual({ move: { from: 2, to: 1 }, nutsMoved: 4 });
    expect(moves.length).toBe(2);
  });

  it('returns an empty list when no moves are legal', () => {
    const b = board(Screw.full(4, 'red'), Screw.full(4, 'blue'));
    expect(MoveValidator.enumerateLegalMoves(b)).toEqual([]);
  });
});
