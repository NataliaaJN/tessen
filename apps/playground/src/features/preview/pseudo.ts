import type { ForcedState } from '../state/model.ts';

/**
 * Forced states (PLG-04): hover, focus and pressed cannot be switched on from outside, so for
 * every rule that depends on a pseudo-class a twin keyed on `[data-force-state]` is added next to
 * it (the technique Storybook's pseudo-states addon uses). The library's CSS stays untouched.
 */
const MAP: [RegExp, string][] = [
  [/:hover/g, 'hover'],
  [/:active/g, 'pressed'],
  [/:focus-visible/g, 'focus'],
  [/:focus-within/g, 'focus'],
  [/:focus(?![-\w])/g, 'focus'],
];

type Container = CSSStyleSheet | CSSGroupingRule | CSSStyleRule;

function visit(container: Container): void {
  for (const rule of Array.from(container.cssRules)) {
    if (rule instanceof CSSStyleRule) {
      let selector = rule.selectorText;
      let changed = false;
      for (const [pattern, state] of MAP) {
        if (pattern.test(selector)) {
          pattern.lastIndex = 0;
          selector = selector.replace(pattern, `[data-force-state~="${state}"]`);
          changed = true;
        }
        pattern.lastIndex = 0;
      }
      if (changed) {
        try {
          container.insertRule(`${selector} { ${rule.style.cssText} }`, container.cssRules.length);
        } catch {
          // A selector the browser cannot express: the state simply cannot be forced there.
        }
      }
    }
    if ('cssRules' in rule) visit(rule as CSSGroupingRule);
  }
}

let installed = false;

export function installForcedStates(): void {
  if (installed) return;
  installed = true;
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet);
    } catch {
      // Cross-origin sheet: not ours.
    }
  }
}

let observer: MutationObserver | undefined;

function mark(stage: HTMLElement, state: ForcedState): void {
  const value = state === 'none' ? null : state;
  const all = [stage, ...stage.querySelectorAll<HTMLElement>('*')];
  for (const el of all) {
    if (value === null) el.removeAttribute('data-force-state');
    else el.setAttribute('data-force-state', value);
  }
}

/** Marks every element of the scene (and of portals) with the forced state. */
export function applyForcedState(state: ForcedState): void {
  observer?.disconnect();
  observer = undefined;
  const run = (): void => {
    for (const root of Array.from(document.body.children)) {
      if (root instanceof HTMLElement) mark(root, state);
    }
  };
  run();
  if (state !== 'none') {
    observer = new MutationObserver(run);
    observer.observe(document.body, { childList: true, subtree: true });
  }
}
