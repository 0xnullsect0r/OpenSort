import type { Nut, NutColor } from './nut';

/** A screw is a fixed-capacity LIFO stack of nuts. Index 0 is the bottom (base of the rod). */
export class Screw {
  readonly capacity: number;
  private nutsInternal: Nut[];

  constructor(capacity: number, nuts: readonly Nut[] = []) {
    if (nuts.length > capacity) {
      throw new Error(`Screw given ${nuts.length} nuts but capacity is ${capacity}`);
    }
    this.capacity = capacity;
    this.nutsInternal = [...nuts];
  }

  get nuts(): readonly Nut[] {
    return this.nutsInternal;
  }

  get isEmpty(): boolean {
    return this.nutsInternal.length === 0;
  }

  get isFull(): boolean {
    return this.nutsInternal.length === this.capacity;
  }

  get freeSpace(): number {
    return this.capacity - this.nutsInternal.length;
  }

  get topNut(): Nut | undefined {
    return this.nutsInternal[this.nutsInternal.length - 1];
  }

  /** Number of contiguous same-color nuts counting down from the top. */
  get topRunLength(): number {
    const nuts = this.nutsInternal;
    if (nuts.length === 0) return 0;
    const color = nuts[nuts.length - 1].color;
    let count = 0;
    for (let i = nuts.length - 1; i >= 0 && nuts[i].color === color; i--) count++;
    return count;
  }

  /** True if the screw is empty, or every nut on it shares the same color. */
  get isSingleColor(): boolean {
    if (this.nutsInternal.length === 0) return true;
    const color = this.nutsInternal[0].color;
    return this.nutsInternal.every((n) => n.color === color);
  }

  clone(): Screw {
    return new Screw(this.capacity, this.nutsInternal);
  }

  /** Removes and returns the top `count` nuts (in bottom-to-top order). */
  removeTop(count: number): Nut[] {
    if (count < 0 || count > this.nutsInternal.length) {
      throw new Error(`Cannot remove ${count} nuts from a screw with ${this.nutsInternal.length}`);
    }
    return this.nutsInternal.splice(this.nutsInternal.length - count, count);
  }

  /** Appends nuts (bottom-to-top order) onto the top of the screw. */
  addTop(run: readonly Nut[]): void {
    if (run.length > this.freeSpace) {
      throw new Error(`Cannot add ${run.length} nuts to a screw with only ${this.freeSpace} free space`);
    }
    this.nutsInternal.push(...run);
  }

  static full(capacity: number, color: NutColor): Screw {
    return new Screw(
      capacity,
      Array.from({ length: capacity }, () => ({ color })),
    );
  }

  static empty(capacity: number): Screw {
    return new Screw(capacity, []);
  }
}
