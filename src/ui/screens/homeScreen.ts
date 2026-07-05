export function renderHomeScreen(container: HTMLElement): void {
  container.innerHTML = '';
  const screen = document.createElement('div');
  screen.className = 'screen home-screen';

  screen.innerHTML = `
    <div class="home-title">🔩 OpenSort</div>
    <div class="home-subtitle">Sort the nuts, one screw at a time.</div>
    <div class="home-menu">
      <button class="primary-button" data-nav="#/levels">Play</button>
      <button class="secondary-button" data-nav="#/daily">Daily Challenge</button>
      <button class="secondary-button" data-nav="#/settings">Settings</button>
    </div>
  `;

  screen.querySelectorAll<HTMLButtonElement>('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      window.location.hash = button.dataset.nav!;
    });
  });

  container.appendChild(screen);
}
