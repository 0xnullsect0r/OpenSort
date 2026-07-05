import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('settingsService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('defaults to sound and haptics on, colorblind patterns off', async () => {
    const { settingsService } = await import('../../src/services/settingsService');
    expect(settingsService.get()).toEqual({
      colorblindPatternsAlwaysOn: false,
      soundEnabled: true,
      hapticsEnabled: true,
    });
  });

  it('persists updates to localStorage and notifies subscribers', async () => {
    const { settingsService } = await import('../../src/services/settingsService');
    const listener = vi.fn();
    const unsubscribe = settingsService.subscribe(listener);

    settingsService.update({ colorblindPatternsAlwaysOn: true });

    expect(settingsService.get().colorblindPatternsAlwaysOn).toBe(true);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ colorblindPatternsAlwaysOn: true }));
    unsubscribe();
  });

  it('loads persisted settings on a fresh instance', async () => {
    const first = await import('../../src/services/settingsService');
    first.settingsService.update({ soundEnabled: false });

    vi.resetModules();
    const second = await import('../../src/services/settingsService');
    expect(second.settingsService.get().soundEnabled).toBe(false);
  });
});
