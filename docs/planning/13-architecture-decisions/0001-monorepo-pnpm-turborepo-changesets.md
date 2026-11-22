# ADR 0001 — Monorepo con pnpm + Turborepo + Changesets

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Tessen tendrá ~8 paquetes publicables, 3 apps y fixtures de integración. Necesita orden de build/test, caché y versionado coherente entre `@tessen/vue` y `@tessen/react`.

## Decisión
- **pnpm workspaces** (con *catalogs* para versiones únicas de dependencias compartidas).
- **Turborepo** para el grafo de tareas y caché.
- **Changesets** con versiones **enlazadas** entre paquetes que deben evolucionar juntos (`vue`/`react`; `tokens`/`theme`/`styles`), **solo para versionado y changelogs**: la **publicación a npm está deshabilitada** hasta aprobación explícita (ADR 0014, 0015). La caché de Turborepo es **local** (sin caché remota de pago). Las actualizaciones de dependencias usan Dependabot (integrado en GitHub).

## Alternativas consideradas
| Alternativa | A favor | En contra | Por qué no |
|---|---|---|---|
| Solo pnpm workspaces | Mínimo | Sin caché ni orden declarativo de tareas | Costes de CI crecen pronto |
| Nx | Boundaries nativos, generadores, inferencia | Sistema grande; más conceptos | La necesidad real (boundaries) se cubre con ADR 0013; generadores = script propio |
| Lerna | Conocido | Hoy se suele combinar con Nx/Turbo para lo útil | Aporta poco |
| semantic-release | Automático por commits | Versionado de monorepo menos explícito; conflictos con enlazadas | Changesets da control por PR |

## Consecuencias
(+) Configuración pequeña, fácil de entender para otro agente. (+) Changelogs por paquete revisables en PR. (−) Los límites de dependencias requieren herramienta adicional. (−) Dependemos del formato de `.changeset/`.

## Disparadores de revisión
> ~25 paquetes, CI > 15 min con caché, o necesidad de generadores de código complejos → reevaluar Nx.
