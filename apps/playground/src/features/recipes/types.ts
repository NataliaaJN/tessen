import type { Scene } from '@tessen-ui/core';

export type ControlValue = string | number | boolean;
/** The whole editable state of one component: one entry per control. */
export type ControlState = Record<string, ControlValue>;

interface ControlBase {
  name: string;
  label: string;
}

export type Control =
  | (ControlBase & { kind: 'select'; options: readonly string[]; default: string })
  | (ControlBase & { kind: 'boolean'; default: boolean })
  | (ControlBase & { kind: 'text'; default: string })
  | (ControlBase & {
      kind: 'number';
      default: number;
      min?: number;
      max?: number;
      step?: number;
    });

/** What the Playground needs to know about one component. */
export interface Recipe {
  slug: string;
  /** React-spelling name (`Button`). */
  name: string;
  category: string;
  /** Contract-derived controls first, then the recipe's own. */
  controls: Control[];
  initial: ControlState;
  /** Names of the controls that are props of the root component. */
  rootProps: readonly string[];
  /** The same state always gives the same scene: preview and code come from it. */
  build: (state: ControlState) => Scene;
}
