import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { expect, test } from '@playwright/test';
import { deserializeLevel, type SerializedLevel } from '../src/game-core/levelGen/levelSerialization';
import { solve } from '../src/game-core/solver/solver';

const here = dirname(fileURLToPath(import.meta.url));

function loadLevel(id: number): SerializedLevel {
  const raw = readFileSync(resolve(here, '../public/levels/levels.json'), 'utf-8');
  const { levels } = JSON.parse(raw) as { levels: SerializedLevel[] };
  const level = levels.find((l) => l.id === id);
  if (!level) throw new Error(`level ${id} not found in bundled levels.json`);
  return level;
}

test('home screen navigates to level select and into a level', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('OpenSort')).toBeVisible();

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('heading', { name: 'Select Level' })).toBeVisible();

  await page.getByLabel('Level 1', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();
});

test('tap-select, tap-deselect, and invalid-move feedback', async ({ page }) => {
  await page.goto('/#/game/1');
  await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();

  // Level 1's initial layout (public/levels/levels.json): screw 1 top=orange,
  // screw 3 is empty, screw 5 top=yellow (its top color mismatches screw 1's).
  const screw1 = page.getByLabel('Screw 1');
  const screw3 = page.getByLabel('Screw 3');
  const screw5 = page.getByLabel('Screw 5');

  // select then deselect the same screw
  await screw1.click();
  await expect(screw1).toHaveClass(/selected/);
  await screw1.click();
  await expect(screw1).not.toHaveClass(/selected/);

  // an invalid move (mismatched top colors) should trigger the shake animation, not a move
  await screw5.click();
  await expect(page.getByText('Moves: 0')).toBeVisible();
  await screw1.click();
  await expect(page.locator('.board')).toHaveClass(/shake-invalid/);
  await expect(page.getByText('Moves: 0')).toBeVisible();
  await expect(screw5).not.toHaveClass(/selected/); // selection clears even on an invalid move

  // a legal move onto the empty screw should succeed and count as a move
  await screw1.click();
  await screw3.click();
  await expect(page.getByText('Moves: 1')).toBeVisible();

  // undo should revert it
  await page.getByLabel('Undo').click();
  await expect(page.getByText('Moves: 1')).toBeVisible(); // undo itself isn't counted as a move
});

test('solving a full level shows the win overlay with a star rating', async ({ page }) => {
  const level = loadLevel(1);
  const board = deserializeLevel(level);
  const solution = solve(board);
  expect(solution).not.toBeNull();

  await page.goto('/#/game/1');
  await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();

  for (const move of solution!) {
    await page.getByLabel(`Screw ${move.from + 1}`).click();
    await page.getByLabel(`Screw ${move.to + 1}`).click();
  }

  await expect(page.getByText('Solved!')).toBeVisible();
  await expect(page.locator('.win-stars')).toBeVisible();
});
