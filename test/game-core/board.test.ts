import { describe, expect, it } from 'vitest';
import { Board } from '../../src/game-core/board';
import { Screw } from '../../src/game-core/screw';

describe('Board.isSolved', () => {
  it('fullStacksOnly requires every non-empty screw to be full and single-color', () => {
    const solved = new Board([Screw.full(4, 'red'), Screw.full(4, 'blue'), Screw.empty(4)]);
    expect(solved.isSolved('fullStacksOnly')).toBe(true);

    const partiallyFilled = new Board([
      new Screw(4, [{ color: 'red' }, { color: 'red' }]),
      Screw.empty(4),
    ]);
    expect(partiallyFilled.isSolved('fullStacksOnly')).toBe(false);
    expect(partiallyFilled.isSolved('singleColorAnyFill')).toBe(true);

    const mixed = new Board([
      new Screw(4, [{ color: 'red' }, { color: 'blue' }]),
      Screw.empty(4),
    ]);
    expect(mixed.isSolved('fullStacksOnly')).toBe(false);
    expect(mixed.isSolved('singleColorAnyFill')).toBe(false);
  });

  it('defaults to fullStacksOnly', () => {
    const solved = new Board([Screw.full(4, 'red'), Screw.empty(4)]);
    expect(solved.isSolved()).toBe(true);
  });
});

describe('Board.canonicalKey', () => {
  it('produces identical keys for equal boards and different keys otherwise', () => {
    const a = new Board([new Screw(4, [{ color: 'red' }]), Screw.empty(4)]);
    const b = new Board([new Screw(4, [{ color: 'red' }]), Screw.empty(4)]);
    const c = new Board([new Screw(4, [{ color: 'blue' }]), Screw.empty(4)]);
    expect(a.canonicalKey()).toBe(b.canonicalKey());
    expect(a.canonicalKey()).not.toBe(c.canonicalKey());
  });
});

describe('Board.clone', () => {
  it('produces an independent deep copy', () => {
    const original = new Board([new Screw(4, [{ color: 'red' }])]);
    const copy = original.clone();
    copy.screws[0].addTop([{ color: 'red' }]);
    expect(original.screws[0].nuts.length).toBe(1);
    expect(copy.screws[0].nuts.length).toBe(2);
  });
});
