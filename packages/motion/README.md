# @tessen-ui/motion

Motion level 0 (CSS, zero JavaScript at runtime): presets as data, generated `@keyframes`, and the `data-tessen-motion` modes. Internal package (`private`, never published, see [ADR 0015](../../docs/planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md)); docs call it `@tessen/motion`. Spec: [`docs/planning/07-motion-system.md`](../../docs/planning/07-motion-system.md).

Level 1 is a small Web Animations runtime over the same presets: `animate(el, preset)`, `presence(el)` (resolves when running animations end), `resolveMotionMode`, `setMotionMode` (global control) and `stagger`. It honours `data-tessen-motion` and `prefers-reduced-motion`, and returns `null` (no animation) when the mode, the preset or the browser say so. `inView` and scroll reveals are not built.

## Use

```css
@import '@tessen-ui/styles';
@import '@tessen-ui/motion/motion.css';

.t-dialog[data-state='open'] {
  animation: var(--tessen-motion-preset-scale-in);
}
.t-dialog[data-state='closed'] {
  animation: var(--tessen-motion-preset-scale-out);
}
```

Each preset becomes one custom property holding a full `animation` shorthand built from motion tokens (`--tessen-motion-preset-<name>`). Components never write `ms` or curves of their own.

| Presets                                                                                           | Notes                                         |
| ------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `fade-in/out`, `scale-in/out`, `pop-in`, `slide-{up,down,left,right}-{in,out}`, `collapse-in/out` | Exits use a shorter duration and `accelerate` |
| `shake`                                                                                           | Error feedback, 3 cycles of ±`distance.xs`    |

`import { presets } from '@tessen-ui/motion'` gives the same definitions as data.

## Modes

```html
<html data-tessen-motion="full | reduced | off"></html>
```

| Mode      | Effect                                                                                                                        |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `full`    | Presets as defined                                                                                                            |
| `reduced` | Slides, scales and pops become a fade; `shake` is off; durations capped to `fast`; distances 0; press scale 1; collapse stays |
| `off`     | Every preset is `none`; every duration is `instant`                                                                           |
| (none)    | `prefers-reduced-motion: reduce` behaves as `reduced`                                                                         |

The OS preference wins over `full`; opt out explicitly with `data-tessen-motion="full" data-tessen-motion-override`. Modes work by overriding variables, so anything built on motion tokens obeys them. Set the attribute on the root; nested `off`/`reduced` also work, a nested `full` does not undo a reduced ancestor.

## Decisions made while implementing F1-T05

- **The CSS lives here, not in `@tessen-ui/styles`**, although spec 07 §2 places L0 in styles: the dependency matrix lets `styles` depend only on `tokens`, and presets must also feed the L1 runtime from one definition. Consumers import `motion.css` next to styles. Revisit when the first component needs it (F2).
- Added the missing token `motion.scale.press` (0.98) from spec 07 §3. `motion.distance` and `stagger` already existed.
- `motion.easing.emphasized` has no overshoot (`linear()`) variant yet; it equals `standard`.
- Not built: `press` as a keyframe preset (components use `--tessen-motion-scale-press` on `:active`), stagger-children, reveal-on-scroll, creative presets.
