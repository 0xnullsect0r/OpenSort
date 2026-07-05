import { settingsService } from './settingsService';

/**
 * Short synthesized tones via WebAudio rather than bundled audio files —
 * keeps the whole game self-contained (no external asset licensing to track)
 * and the sounds are just simple move/invalid/win cues, not music.
 */
class AudioService {
  private context: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (!settingsService.get().soundEnabled) return null;
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!this.context) this.context = new AudioContextClass();
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  private tone(frequency: number, durationMs: number, when = 0): void {
    const ctx = this.getContext();
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.15, ctx.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + when + durationMs / 1000);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime + when);
    oscillator.stop(ctx.currentTime + when + durationMs / 1000);
  }

  move(): void {
    this.tone(520, 90);
  }

  invalidMove(): void {
    this.tone(160, 140);
  }

  win(): void {
    [660, 880, 1100].forEach((frequency, i) => this.tone(frequency, 160, i * 0.09));
  }
}

export const audioService = new AudioService();
