import { beforeEach, describe, expect, it } from 'vitest';
import { ProgressService } from '../../src/services/progressService';

describe('ProgressService.starsFor', () => {
  it('awards 3 stars for at-or-under optimal moves', () => {
    expect(ProgressService.starsFor(7, 7)).toBe(3);
    expect(ProgressService.starsFor(5, 7)).toBe(3);
  });

  it('awards 2 stars within 1.5x optimal', () => {
    expect(ProgressService.starsFor(10, 7)).toBe(2); // ceil(7*1.5) = 11
  });

  it('awards 1 star beyond that', () => {
    expect(ProgressService.starsFor(12, 7)).toBe(1);
  });
});

describe('ProgressService instance', () => {
  let service: ProgressService;

  beforeEach(() => {
    localStorage.clear();
    service = new ProgressService();
  });

  it('starts with only level 1 unlocked', () => {
    expect(service.isUnlocked(1)).toBe(true);
    expect(service.isUnlocked(2)).toBe(false);
  });

  it('unlocks the next level and records stars/best-moves on completion', () => {
    const progress = service.recordLevelComplete(1, 7, 7);
    expect(progress.stars).toBe(3);
    expect(progress.bestMoves).toBe(7);
    expect(service.isUnlocked(2)).toBe(true);
  });

  it('keeps the best stars and lowest move count across repeated completions', () => {
    service.recordLevelComplete(1, 12, 7); // 1 star, 12 moves
    const better = service.recordLevelComplete(1, 7, 7); // 3 stars, 7 moves
    expect(better.stars).toBe(3);
    expect(better.bestMoves).toBe(7);

    const worseAfter = service.recordLevelComplete(1, 20, 7);
    expect(worseAfter.stars).toBe(3); // doesn't regress
    expect(worseAfter.bestMoves).toBe(7);
  });

  it('persists across instances via localStorage', () => {
    service.recordLevelComplete(1, 7, 7);
    const reloaded = new ProgressService();
    expect(reloaded.isUnlocked(2)).toBe(true);
    expect(reloaded.getLevelProgress(1)?.stars).toBe(3);
  });

  it('tracks daily challenge progress independently of campaign levels', () => {
    service.recordDailyChallengeComplete('2026-7-5', 10, 10);
    expect(service.getDailyChallengeProgress('2026-7-5')?.stars).toBe(3);
    expect(service.getDailyChallengeProgress('2026-7-6')).toBeUndefined();
  });
});
