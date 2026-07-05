import { settingsService } from './settingsService';

/** Thin wrapper over the Vibration API — a no-op where unsupported (e.g. iOS Safari, desktop). */
class HapticsService {
  private canVibrate(): boolean {
    return settingsService.get().hapticsEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  invalidMove(): void {
    if (this.canVibrate()) navigator.vibrate(40);
  }

  win(): void {
    if (this.canVibrate()) navigator.vibrate([30, 40, 30, 40, 60]);
  }
}

export const hapticsService = new HapticsService();
