/** Scenes rendered identically in Vue and React; the parity suite iterates this list. */
export const sceneNames = [
  'buttons',
  'feedback',
  'surfaces',
  'forms',
  'tabs',
  'dialog-open',
  'tooltip',
] as const;
export type SceneName = (typeof sceneNames)[number];
