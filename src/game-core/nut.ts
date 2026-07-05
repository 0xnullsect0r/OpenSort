export const NUT_COLORS = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'teal',
  'brown',
  'gray',
  'lime',
  'navy',
] as const;

export type NutColor = (typeof NUT_COLORS)[number];

export interface Nut {
  readonly color: NutColor;
}

export function makeNut(color: NutColor): Nut {
  return { color };
}
