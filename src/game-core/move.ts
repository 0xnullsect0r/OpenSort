export interface Move {
  readonly from: number;
  readonly to: number;
}

export function reverseMove(move: Move): Move {
  return { from: move.to, to: move.from };
}

export function movesEqual(a: Move, b: Move): boolean {
  return a.from === b.from && a.to === b.to;
}

export type MoveRejectReason =
  | 'sameScrew'
  | 'sourceEmpty'
  | 'destinationFull'
  | 'colorMismatch'
  | 'noCapacity';

export type MoveResult =
  | { readonly legal: true; readonly nutsMoved: number }
  | { readonly legal: false; readonly reason: MoveRejectReason };
