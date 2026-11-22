/** Messages between the Studio and its preview iframe (same origin only). */
export type PreviewScene = 'components' | 'forms' | 'dashboard' | 'landing' | 'typography';

export interface ApplyMessage {
  type: 'tessen-studio:apply';
  /** Output of `toCss(theme)`. */
  css: string;
  mode: 'light' | 'dark';
  motion: 'full' | 'reduced' | 'off';
  scene: PreviewScene;
}

export interface ReadyMessage {
  type: 'tessen-studio:ready';
}

export const isApplyMessage = (data: unknown): data is ApplyMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as { type?: unknown }).type === 'tessen-studio:apply' &&
  typeof (data as { css?: unknown }).css === 'string';
