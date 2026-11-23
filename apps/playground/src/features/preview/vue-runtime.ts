import * as TessenVue from '@tessen-ui/vue';
import type { Scene, SceneChild, SceneNode } from '@tessen-ui/core';
import { createApp, h, shallowRef } from 'vue';
import type { App, VNode } from 'vue';
import { connect } from './bridge.ts';
import { createScope, resolveValue } from './evaluate.ts';
import type { Scope } from './evaluate.ts';

const library = TessenVue as unknown as Record<string, unknown>;

function toVNode(child: SceneChild, scope: Scope): VNode | string {
  if (typeof child === 'string') return child;
  const props: Record<string, unknown> = {};
  for (const [name, value] of Object.entries(child.p ?? {})) {
    props[name] = resolveValue(value, scope);
  }
  const kids = (child.k ?? []).map((k) => toVNode(k, scope));
  if (/^[a-z]/.test(child.c)) return h(child.c, props, kids);

  const component = library[`T${child.c}`];
  if (!component) throw new Error(`@tessen-ui/vue does not export T${child.c}`);
  const slots: Record<string, () => (VNode | string)[]> = {};
  if (kids.length > 0) slots['default'] = () => kids;
  for (const [name, content] of Object.entries(child.s ?? {})) {
    const nodes = content.map((c) => toVNode(c, scope));
    slots[name] = () => nodes;
  }
  return h(component as never, props, slots);
}

const current = shallowRef<{ id: number; root: SceneNode; scope: Scope } | undefined>();
let counter = 0;
let app: App | undefined;

connect((scene: Scene) => {
  const scope = createScope(scene, library);
  current.value = { id: ++counter, root: scene.root, scope };
  if (app) return;
  app = createApp({
    render() {
      const c = current.value;
      // A new id remounts the tree, so `default*` props start over like a fresh page would.
      return c ? h('div', { key: c.id, class: 'stage-inner' }, [toVNode(c.root, c.scope)]) : null;
    },
  });
  app.mount('#stage');
});
