/** Scenes rendered identically in Vue and React; the parity suite iterates this list. */
export const sceneNames = [
  'buttons',
  'feedback',
  'surfaces',
  'data-display',
  'forms',
  'tabs',
  'dialog-open',
  'tooltip',
  'controls',
  'select-open',
  'menu-open',
  'popover-open',
  'alert-dialog-open',
  'dialog-select',
  'toast',
] as const;
export type SceneName = (typeof sceneNames)[number];
