const STORAGE_KEY = 'opensort:settings:v1';

export interface Settings {
  colorblindPatternsAlwaysOn: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  colorblindPatternsAlwaysOn: false,
  soundEnabled: true,
  hapticsEnabled: true,
};

type Listener = (settings: Settings) => void;

class SettingsService {
  private settings: Settings;
  private listeners = new Set<Listener>();

  constructor() {
    this.settings = this.load();
  }

  private load(): Settings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SETTINGS };
      return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // localStorage unavailable (private browsing, quota) — settings just won't persist.
    }
  }

  get(): Settings {
    return this.settings;
  }

  update(partial: Partial<Settings>): void {
    this.settings = { ...this.settings, ...partial };
    this.save();
    this.listeners.forEach((listener) => listener(this.settings));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

export const settingsService = new SettingsService();
