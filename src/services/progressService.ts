const STORAGE_KEY = 'opensort:progress:v1';

export interface LevelProgress {
  stars: number;
  bestMoves: number;
}

interface ProgressState {
  highestUnlocked: number;
  levels: Record<number, LevelProgress>;
  dailyChallenge: Record<string, LevelProgress>;
}

const INITIAL_STATE: ProgressState = {
  highestUnlocked: 1,
  levels: {},
  dailyChallenge: {},
};

export class ProgressService {
  private state: ProgressState;

  constructor() {
    this.state = this.load();
  }

  private load(): ProgressState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(INITIAL_STATE);
      return { ...structuredClone(INITIAL_STATE), ...(JSON.parse(raw) as Partial<ProgressState>) };
    } catch {
      return structuredClone(INITIAL_STATE);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      // localStorage unavailable — progress just won't persist across sessions.
    }
  }

  isUnlocked(levelId: number): boolean {
    return levelId <= this.state.highestUnlocked;
  }

  getLevelProgress(levelId: number): LevelProgress | undefined {
    return this.state.levels[levelId];
  }

  /** Computes a 1-3 star rating from how close movesMade is to the level's solver-optimal count. */
  static starsFor(movesMade: number, optimalMoves: number): number {
    if (movesMade <= optimalMoves) return 3;
    if (movesMade <= Math.ceil(optimalMoves * 1.5)) return 2;
    return 1;
  }

  recordLevelComplete(levelId: number, movesMade: number, optimalMoves: number): LevelProgress {
    const stars = ProgressService.starsFor(movesMade, optimalMoves);
    const existing = this.state.levels[levelId];
    const progress: LevelProgress = {
      stars: Math.max(stars, existing?.stars ?? 0),
      bestMoves: Math.min(movesMade, existing?.bestMoves ?? Infinity),
    };
    this.state.levels[levelId] = progress;
    this.state.highestUnlocked = Math.max(this.state.highestUnlocked, levelId + 1);
    this.save();
    return progress;
  }

  getDailyChallengeProgress(dateKey: string): LevelProgress | undefined {
    return this.state.dailyChallenge[dateKey];
  }

  recordDailyChallengeComplete(dateKey: string, movesMade: number, optimalMoves: number): LevelProgress {
    const stars = ProgressService.starsFor(movesMade, optimalMoves);
    const existing = this.state.dailyChallenge[dateKey];
    const progress: LevelProgress = {
      stars: Math.max(stars, existing?.stars ?? 0),
      bestMoves: Math.min(movesMade, existing?.bestMoves ?? Infinity),
    };
    this.state.dailyChallenge[dateKey] = progress;
    this.save();
    return progress;
  }
}

export const progressService = new ProgressService();
