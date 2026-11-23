import '@tessen-ui/styles';
import '../../styles/stage.css';
import type { Scene } from '@tessen-ui/core';
import { applyForcedState, installForcedStates } from './pseudo.ts';
import { isAppearanceMessage, isSceneMessage } from './protocol.ts';

/** Wires a preview page to the Playground that embeds it. `render` mounts a fresh scene. */
export function connect(render: (scene: Scene) => void): void {
  const style = document.getElementById('playground-theme');

  const onMessage = (event: MessageEvent): void => {
    // Only the Playground that embeds this page may drive it.
    if (event.origin !== location.origin || event.source !== window.parent) return;
    const data: unknown = event.data;
    if (isAppearanceMessage(data)) {
      if (style) style.textContent = data.css;
      document.documentElement.dataset['tessenTheme'] = data.mode;
      applyForcedState(data.force);
    } else if (isSceneMessage(data)) {
      render(data.scene);
      // The forced state is re-applied by the observer once the new DOM is there.
    }
  };

  window.addEventListener('message', onMessage);
  const ready = (): void => {
    installForcedStates();
    window.parent.postMessage({ type: 'tessen-playground:ready' }, location.origin);
  };
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready, { once: true });
}
