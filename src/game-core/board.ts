import { Screw } from './screw';

export type WinCondition = 'fullStacksOnly' | 'singleColorAnyFill';

export class Board {
  readonly screws: Screw[];

  constructor(screws: readonly Screw[]) {
    this.screws = [...screws];
  }

  clone(): Board {
    return new Board(this.screws.map((s) => s.clone()));
  }

  isSolved(rule: WinCondition = 'fullStacksOnly'): boolean {
    return this.screws.every((s) => {
      if (s.isEmpty) return true;
      if (rule === 'fullStacksOnly') return s.isFull && s.isSingleColor;
      return s.isSingleColor;
    });
  }

  /** Canonical string encoding of this board's state, used for solver visited-state dedup. */
  canonicalKey(): string {
    return this.screws.map((s) => s.nuts.map((n) => n.color).join(',')).join('|');
  }
}
