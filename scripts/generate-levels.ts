/**
 * Offline content-generation CLI: builds the full campaign level set and writes
 * public/levels/levels.json. Run with `npm run generate-levels`. Not shipped
 * to the browser — the app only ever reads the resulting static JSON.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { configForLevel } from '../src/game-core/levelGen/levelConfig';
import { generateLevel } from '../src/game-core/levelGen/levelGenerator';
import { serializeLevel, type SerializedLevel } from '../src/game-core/levelGen/levelSerialization';

const TOTAL_LEVELS = 100;
const BASE_SEED = 20260705; // fixed so regenerating without changing the algorithm reproduces the same set

function main(): void {
  const levels: SerializedLevel[] = [];

  for (let levelNumber = 1; levelNumber <= TOTAL_LEVELS; levelNumber++) {
    const config = configForLevel(levelNumber);
    const seed = BASE_SEED + levelNumber * 1000;
    const level = generateLevel(config, seed);
    levels.push(serializeLevel(levelNumber, level));
    process.stdout.write(
      `level ${levelNumber}/${TOTAL_LEVELS}: colors=${config.numColors} capacity=${config.screwCapacity} empties=${config.numEmptyScrews} optimalMoves=${level.optimalMoves}\n`,
    );
  }

  const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/levels');
  const outPath = resolve(outDir, 'levels.json');
  writeFileSync(outPath, JSON.stringify({ levels }, null, 2));
  process.stdout.write(`\nWrote ${levels.length} levels to ${outPath}\n`);
}

main();
