import { renderHomeScreen } from './ui/screens/homeScreen';
import { renderLevelSelectScreen } from './ui/screens/levelSelectScreen';
import { renderGameScreen } from './ui/screens/gameScreen';
import { renderDailyChallengeScreen } from './ui/screens/dailyChallengeScreen';
import { renderSettingsScreen } from './ui/screens/settingsScreen';

const app = document.getElementById('app')!;

function route(): void {
  const hash = window.location.hash || '#/';

  const gameMatch = hash.match(/^#\/game\/(\d+)$/);
  if (gameMatch) {
    void renderGameScreen(app, Number(gameMatch[1]));
    return;
  }

  switch (hash) {
    case '#/levels':
      void renderLevelSelectScreen(app);
      return;
    case '#/daily':
      renderDailyChallengeScreen(app);
      return;
    case '#/settings':
      renderSettingsScreen(app);
      return;
    default:
      renderHomeScreen(app);
  }
}

window.addEventListener('hashchange', route);
route();
