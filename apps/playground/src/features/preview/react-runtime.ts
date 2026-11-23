import * as TessenReact from '@tessen-ui/react';
import type { Scene, SceneChild } from '@tessen-ui/core';
import { createElement, Fragment } from 'react';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';
import { connect } from './bridge.ts';
import { createScope, resolveValue } from './evaluate.ts';
import type { Scope } from './evaluate.ts';

const library = TessenReact as unknown as Record<string, unknown>;

function toElement(child: SceneChild, scope: Scope, key?: number): ReactNode {
  if (typeof child === 'string') return child;
  const props: Record<string, unknown> = { key };
  for (const [name, value] of Object.entries(child.p ?? {})) {
    props[name] = resolveValue(value, scope);
  }
  for (const [name, content] of Object.entries(child.s ?? {})) {
    props[name] =
      content.length === 1
        ? toElement(content[0] as SceneChild, scope)
        : createElement(Fragment, null, ...content.map((c, i) => toElement(c, scope, i)));
  }
  const kids = (child.k ?? []).map((k, i) => toElement(k, scope, i));
  const type = /^[a-z]/.test(child.c) ? child.c : library[child.c];
  if (!type) throw new Error(`@tessen-ui/react does not export ${child.c}`);
  return createElement(type as never, props, ...kids);
}

let root: Root | undefined;
let counter = 0;

connect((scene: Scene) => {
  root ??= createRoot(document.getElementById('stage') as HTMLElement);
  const scope = createScope(scene, library);
  // A new key remounts the tree, so `default*` props start over like a fresh page would.
  root.render(
    createElement(
      'div',
      { key: ++counter, className: 'stage-inner' },
      toElement(scene.root, scope),
    ),
  );
});
