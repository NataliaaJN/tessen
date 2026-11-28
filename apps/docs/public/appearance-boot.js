// Runs in <head> before first paint, in all three apps: restores the surface, the light/dark mode
// that goes with it and the accent/radius CSS saved by the docs appearance panel.
// Copied to each app's public/ folder (see apps/shared/README.md).
(function () {
  var root = document.documentElement;
  var light = { porcelana: true, bruma: true };
  var dark = { grafito: true, pizarra: true, medianoche: true };
  var surface = 'grafito';
  try {
    var saved = localStorage.getItem('tessen:surface');
    if (saved && (light[saved] || dark[saved])) surface = saved;
  } catch {
    // Storage blocked: keep the default surface.
  }
  root.dataset.surface = surface;
  root.dataset.tessenTheme = light[surface] ? 'light' : 'dark';
  try {
    var raw = localStorage.getItem('tessen:docs:appearance');
    var css = raw && JSON.parse(raw).css;
    if (css) {
      var style = document.createElement('style');
      style.id = 'appearance-style';
      style.textContent = css;
      document.head.appendChild(style);
    }
  } catch {
    // Damaged value: ignore it.
  }
})();
