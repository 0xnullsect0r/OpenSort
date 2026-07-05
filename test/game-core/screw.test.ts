import { describe, expect, it } from 'vitest';
import { Screw } from '../../src/game-core/screw';

describe('Screw', () => {
  it('reports empty/full/freeSpace correctly', () => {
    const s = Screw.empty(4);
    expect(s.isEmpty).toBe(true);
    expect(s.isFull).toBe(false);
    expect(s.freeSpace).toBe(4);

    const full = Screw.full(4, 'red');
    expect(full.isEmpty).toBe(false);
    expect(full.isFull).toBe(true);
    expect(full.freeSpace).toBe(0);
  });

  it('computes topRunLength for mixed stacks', () => {
    const s = new Screw(5, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }, { color: 'red' }]);
    expect(s.topRunLength).toBe(3);
    expect(s.topNut?.color).toBe('red');
  });

  it('topRunLength is 0 for an empty screw', () => {
    expect(Screw.empty(4).topRunLength).toBe(0);
  });

  it('isSingleColor is true for empty, uniform, and false for mixed', () => {
    expect(Screw.empty(4).isSingleColor).toBe(true);
    expect(Screw.full(4, 'green').isSingleColor).toBe(true);
    const mixed = new Screw(4, [{ color: 'green' }, { color: 'red' }]);
    expect(mixed.isSingleColor).toBe(false);
  });

  it('removeTop and addTop transfer nuts correctly', () => {
    const s = new Screw(5, [{ color: 'blue' }, { color: 'red' }, { color: 'red' }]);
    const run = s.removeTop(2);
    expect(run).toEqual([{ color: 'red' }, { color: 'red' }]);
    expect(s.nuts).toEqual([{ color: 'blue' }]);

    const dst = Screw.empty(4);
    dst.addTop(run);
    expect(dst.nuts).toEqual(run);
  });

  it('throws when removing more nuts than present', () => {
    const s = Screw.empty(4);
    expect(() => s.removeTop(1)).toThrow();
  });

  it('throws when adding more nuts than free space allows', () => {
    const s = Screw.full(4, 'red');
    expect(() => s.addTop([{ color: 'blue' }])).toThrow();
  });

  it('clone produces an independent copy', () => {
    const s = new Screw(4, [{ color: 'red' }]);
    const c = s.clone();
    c.addTop([{ color: 'red' }]);
    expect(s.nuts.length).toBe(1);
    expect(c.nuts.length).toBe(2);
  });
});
