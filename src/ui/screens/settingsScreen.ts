import { settingsService } from '../../services/settingsService';

export function renderSettingsScreen(container: HTMLElement): void {
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen';
  screen.innerHTML = `
    <div class="topbar">
      <button class="icon-button" data-nav="#/">←</button>
      <h1>Settings</h1>
      <span style="width:40px"></span>
    </div>
    <div class="settings-list">
      <div class="settings-row">
        <span>Colorblind patterns always on</span>
        <button class="toggle" data-setting="colorblindPatternsAlwaysOn"></button>
      </div>
      <div class="settings-row">
        <span>Sound</span>
        <button class="toggle" data-setting="soundEnabled"></button>
      </div>
      <div class="settings-row">
        <span>Haptics</span>
        <button class="toggle" data-setting="hapticsEnabled"></button>
      </div>
    </div>
  `;
  container.appendChild(screen);

  screen.querySelector('[data-nav]')!.addEventListener('click', () => {
    window.location.hash = '#/';
  });

  const toggles = screen.querySelectorAll<HTMLButtonElement>('[data-setting]');
  function sync(): void {
    const settings = settingsService.get();
    toggles.forEach((toggle) => {
      const key = toggle.dataset.setting as keyof typeof settings;
      toggle.classList.toggle('on', Boolean(settings[key]));
    });
  }

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const key = toggle.dataset.setting as 'colorblindPatternsAlwaysOn' | 'soundEnabled' | 'hapticsEnabled';
      settingsService.update({ [key]: !settingsService.get()[key] });
      sync();
    });
  });

  sync();
}
