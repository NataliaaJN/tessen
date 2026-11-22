# ADR 0008 — Plataforma: Astro (docs) + Vite/Vue (Theme Studio y Playground)

- **Estado:** Proposed (la elección de Vue como framework de las SPAs está marcada como decisión D-04, a confirmar por el propietario)
- **Fecha:** 2026-11-22

## Contexto
La plataforma agrupa documentación (contenido, SEO, búsqueda), Theme Studio y Playground (SPAs con mucho estado). Debe renderizar demos de **Vue y React**.

## Decisión
- `apps/docs`: **Astro** (sitio estático, MDX, colecciones de contenido, islas Vue y React, Pagefind para búsqueda).
- `apps/theme-studio` y `apps/playground`: **SPAs Vite + Vue 3 + TypeScript**. Tres apps separadas con arquitectura **feature-first** (ADR 0002).
- El Theme Studio previsualiza con un solo framework porque el tema son **CSS variables** compartidas; el Playground renderiza **Vue y React** en `iframe` de preview propios (necesarios también para vista responsive real) con protocolo `postMessage`.
- Los snippets mostrados provienen de los mismos archivos que se ejecutan (`?raw`).
- Las apps consumen componentes Tessen **solo desde paquetes públicos**.

## Alternativas
| Alternativa | Motivo |
|---|---|
| Starlight | Excelente, pero condiciona layout; plan B si costes de búsqueda/versionado crecen |
| VitePress | Solo Vue **[V]**; React solo vía hacks |
| Docusaurus | Solo React |
| Una única SPA para todo | Mala indexación/SEO y arranque lento de las docs |
| Apps con React como shell | Válido; se elige Vue por afinidad con las referencias (rM Native es Vue 3 **[V]**) y el orden de las skills del repo. Reversible porque las apps son independientes |

## Consecuencias
(+) Docs rápidas y con identidad propia; (+) Theme Studio/Playground con arranque ágil. (−) Dos stacks de app (Astro y Vite). (−) Se dogfoodea más Vue que React en el *shell* (React se dogfoodea en previews y docs).

## Disparadores de revisión
Necesidad de SSR dinámico en el Playground; coste de mantener Astro+Vite; decisión de usar React como shell.
