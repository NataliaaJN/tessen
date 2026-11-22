# ADR 0012 — Distribución: npm primero; registry estilo shadcn diferido

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
shadcn/ui popularizó distribuir **código fuente** mediante CLI y un `registry.json` (instalación por URL, registries privados con namespaces) **[V]**. Tessen prioriza paquetes versionados y personalización por tokens.

## Decisión
- v1: **paquetes npm** (`@tessen/*`) con versionado enlazado; personalización por tokens/variables.
- Después de v1 se **evalúa** un modo opcional «copiar el código» (CLI + registry propio) para equipos que quieran poseer el código, reutilizando los mismos contratos y CSS.

## Alternativas
| Alternativa | Motivo |
|---|---|
| Solo registry de código | El consumidor mantiene el código; contradice «personalizar sin tocar la fuente» y la paridad verificada |
| Ambos desde el inicio | Doble superficie de soporte |

## Consecuencias
(+) Menos soporte en v1. (−) Posible fricción con quien prefiera poseer el código (mitigable más tarde).

## Disparadores de revisión
Peticiones recurrentes de personalización que tokens/variables no cubren.
