# F2-T01 · Button: primera rebanada vertical

> **Estado:** completado (2026-11-22). Primer componente real de la Fase 2: contrato → CSS → Vue → React → tests → consumo desde tarballs. Sale del spike [`T07-button-parity.md`](T07-button-parity.md) y de [`component-architecture.md`](../architecture/component-architecture.md) §5.

## 1. Qué se entregó

| Pieza | Dónde |
| --- | --- |
| Contrato (+ casos `passthrough-class` y `passthrough-attrs`) | `packages/core/src/contracts/button.contract.ts` |
| CSS (capa `tessen.components`, solo tokens semánticos y `--t-button-*`) | `packages/styles/src/components/button.css`; export `@tessen-ui/styles/components/*.css` (deuda de T09 saldada) |
| `TButton` (Vue ≥ 3.5) | `packages/vue/src/components/button/` (`@tessen-ui/vue`, paquete nuevo) |
| `Button` (React 18.3 / 19) | `packages/react/src/components/button/` (`@tessen-ui/react`, paquete nuevo) |
| Runner de contrato + axe compartidos | `tooling/contract-runner` (`@tessen-ui/contract-runner`, privado, solo tests) |
| Consumo desde tarballs | `integration/vite-vue` y `integration/vite-react` usan `TButton`/`Button`; `dist:verify` verde |

## 2. Resultados

- **Contrato:** 13 casos × 2 frameworks, ejecutados por el mismo runner. Más 5 estados con **axe** por framework, y tests de `ref`, `style` y evento.
- **Tipos:** en Vue, `ButtonProps` se escribe con uniones literales (el compilador de SFC no resuelve tipos de otro paquete) y un test de tipos comprueba que sigue siendo igual a `ButtonVariantProps` del contrato.
- **Distribución:** `publint` + `attw` (perfil `esm-only`) verdes para ambos paquetes; ambos proyectos de integración compilan e inspeccionan el bundle (el contrato y sus casos siguen sin entrar).

## 3. Decisiones tomadas por el camino

1. **React usa `forwardRef`, no `ref` como prop.** D-11 fija React ≥ 18.3; con `ref` como prop solo funcionaría en 19. `'use client'` queda en `Button.tsx` (condición C de ADR 0004).
2. **El runner es compartido, no se copia por paquete.** T07 lo dejaba por framework, pero el runner no importa ni Vue ni React: copiarlo duplicaría la semántica del contrato. Vive en `tooling/` y solo lo importan archivos de test (excluidos por `deps:check`).
3. **Vue: declaraciones.** `vue-tsc` deja `from './Button.vue'` en los `.d.ts`, que `node16` no resuelve. Un paso post-build (`scripts/fix-declarations.ts`) lo reescribe a `./Button.vue.js`; el JS sale de `vite build` en un solo módulo.
4. **`@keyframes` dentro de la capa.** Una regla fuera de `@layer` rompe la comprobación «todo en capa» de `styles`.
5. `NeutralProps` gana `class` y `attrs` (cierra la brecha 8 de T07, salvo `ref`, que es mecánica de framework y se prueba en `button.test.ts(x)`).

## 4. Pendiente (no bloquea)

- `exports` por subruta (`./button`) generados desde `components/*/index.ts`: hoy solo hay `.`; se hará al llegar el segundo componente.
- `IconButton` y el contrato de un componente compuesto (se decide con `Field` o `Tabs`).
- Diff visual de paridad en CI Linux (`integration/parity`): el spike sigue en `spikes/button-parity`.
- Stories y ejemplos de docs (llegan con F4); matriz React 18.3 vs 19 en CI.
- `secondary` + `tone=danger` sigue viéndose como el neutro (decisión de diseño).
- Tras el 5.º componente: generador `pnpm new:component` y medición de coste (hito M2).
