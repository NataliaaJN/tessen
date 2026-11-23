import type { Scene } from '@tessen-ui/core';
import type { ForcedState } from '../state/model.ts';

/** Messages between the Playground and its preview iframes (same origin only). */
export interface SceneMessage {
  type: 'tessen-playground:scene';
  scene: Scene;
}

export interface AppearanceMessage {
  type: 'tessen-playground:appearance';
  /** Output of `toCss(theme)`; empty for the base theme. */
  css: string;
  mode: 'light' | 'dark';
  force: ForcedState;
}

export interface ReadyMessage {
  type: 'tessen-playground:ready';
}

const hasType = (data: unknown, type: string): boolean =>
  typeof data === 'object' && data !== null && (data as { type?: unknown }).type === type;

export const isSceneMessage = (data: unknown): data is SceneMessage =>
  hasType(data, 'tessen-playground:scene') && typeof (data as SceneMessage).scene === 'object';

export const isAppearanceMessage = (data: unknown): data is AppearanceMessage =>
  hasType(data, 'tessen-playground:appearance') &&
  typeof (data as AppearanceMessage).css === 'string';

export const isReadyMessage = (data: unknown): data is ReadyMessage =>
  hasType(data, 'tessen-playground:ready');
