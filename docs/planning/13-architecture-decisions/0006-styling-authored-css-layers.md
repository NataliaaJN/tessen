# ADR 0006 — Estilos: CSS autorado con `@layer` y variables

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Debe existir **un único** conjunto de estilos para Vue y React, personalizable sin fork, SSR-friendly y que no obligue a Tailwind.

## Decisión
- El CSS de los componentes se **autora como CSS** (con nesting nativo) en `@tessen/styles`, organizado por responsabilidad (`reset`, `base`, `themes`, `components/<x>.css`), dentro de capas: `tessen.reset, tessen.tokens, tessen.base, tessen.components, tessen.utilities`.
- Variantes/tamaños/estados se aplican con **atributos de datos** (`data-variant`, `data-size`, `data-tone`, `data-state`…) y pseudo-clases.
- Personalización por (1) tokens semánticos, (2) variables locales `--t-<componente>-*`, (3) CSS del consumidor sin capa.
- Tailwind v4 es un **consumidor opcional** (puente `@theme inline`); sin *preflight* incluido.
- Los paquetes `vue`/`react` **no importan CSS desde JS**; el consumidor importa `@tessen/styles`.

## Alternativas
| Alternativa | Motivo de descarte |
|---|---|
| Tailwind en la librería | Acopla; clases generadas; preflight |
| CSS-in-JS | Integración distinta por framework; coste runtime/build |
| CSS Modules | Hash dificulta override y no se comparte sin duplicar |
| CSS dentro de cada componente (`<style>` SFC / CSS-in-TSX) | Duplica estilos entre Vue y React |

## Consecuencias
(+) Cero duplicación de estilos; cero runtime. (+) Orden de cascada predecible. (−) El CSS de un componente vive en `styles` y no junto a su `.vue/.tsx`: **excepción consciente a la co-location** documentada en `docs/architecture/component-architecture.md` (el CSS es compartido por dos implementaciones, no pertenece a ninguna). (−) Requiere disciplina de naming (`t-*`).

## Disparadores de revisión
Soporte de `@layer`/nesting insuficiente en navegadores objetivo; demanda de estilos *scoped* por Shadow DOM.
