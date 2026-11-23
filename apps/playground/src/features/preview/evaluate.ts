import { isExpr } from '@tessen-ui/core';
import type { Scene, SceneValue } from '@tessen-ui/core';

/**
 * Scenes carry a few JavaScript expressions (`toaster`, `() => toaster.create(...)`) so the same
 * text can be shown as code. They are written by the recipes in this repository, never typed by
 * the user, and they only run inside this same-origin preview frame.
 */
export type Scope = Record<string, unknown>;

/** Runs the scene's setup statements once and returns the names they define. */
export function createScope(scene: Scene, library: Record<string, unknown>): Scope {
  const setup = scene.setup;
  if (!setup) return {};
  const body = `${setup.lines.join('\n')}\nreturn { ${setup.names.join(', ')} };`;
  const run = new Function(...setup.uses, body) as (...args: unknown[]) => Scope;
  return run(...setup.uses.map((name) => library[name]));
}

function evaluate(expr: string, scope: Scope): unknown {
  const names = Object.keys(scope);
  const run = new Function(...names, `return (${expr});`) as (...args: unknown[]) => unknown;
  return run(...names.map((n) => scope[n]));
}

/** Resolves expressions anywhere inside a prop value. */
export function resolveValue(value: SceneValue | undefined, scope: Scope): unknown {
  if (value === undefined) return undefined;
  if (isExpr(value)) return evaluate(value.$expr, scope);
  if (Array.isArray(value)) return value.map((v) => resolveValue(v, scope));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveValue(v as SceneValue, scope)]),
    );
  }
  return value;
}
