import type { SerializedLevel } from '../game-core/levelGen/levelSerialization';

let cache: SerializedLevel[] | null = null;

export async function loadLevels(): Promise<SerializedLevel[]> {
  if (cache) return cache;
  const response = await fetch(`${import.meta.env.BASE_URL}levels/levels.json`);
  if (!response.ok) {
    throw new Error(`Failed to load levels.json: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as { levels: SerializedLevel[] };
  cache = data.levels;
  return cache;
}

export async function loadLevel(id: number): Promise<SerializedLevel | undefined> {
  const levels = await loadLevels();
  return levels.find((level) => level.id === id);
}
