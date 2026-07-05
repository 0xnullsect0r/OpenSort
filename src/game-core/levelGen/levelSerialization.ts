import { Board } from '../board';
import { Screw } from '../screw';
import type { NutColor } from '../nut';
import type { LevelData } from './levelGenerator';

/** On-disk/JSON shape for a single level, as bundled in public/levels/levels.json. */
export interface SerializedLevel {
  readonly id: number;
  readonly screwCapacity: number;
  /** Each screw's nuts, bottom-to-top. */
  readonly screws: NutColor[][];
  readonly optimalMoves: number;
  readonly seed: number;
}

export function serializeLevel(id: number, level: LevelData): SerializedLevel {
  return {
    id,
    screwCapacity: level.config.screwCapacity,
    screws: level.initialBoard.screws.map((s) => s.nuts.map((n) => n.color)),
    optimalMoves: level.optimalMoves,
    seed: level.seed,
  };
}

export function deserializeLevel(serialized: SerializedLevel): Board {
  const screws = serialized.screws.map(
    (colors) => new Screw(serialized.screwCapacity, colors.map((color) => ({ color }))),
  );
  return new Board(screws);
}
