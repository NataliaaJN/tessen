# ADR 0010 — Build: Vite library mode, ESM sin empaquetar

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Hay paquetes TS puros, paquetes con SFC Vue y paquetes React/TSX; todos ESM, tree-shakeables, con tipos.

## Decisión
**Vite library mode** para todos los paquetes publicables, salida **ESM con `preserveModules`**, declaraciones con `tsc`/`vue-tsc`, validación con publint + attw + size-limit. El mapa `exports` (incluidas subrutas por componente) se **genera** por script.

## Alternativas
| Alternativa | Motivo |
|---|---|
| tsup | Válida y estable, pero el ecosistema migra a tsdown **[V]**; no compila SFC |
| tsdown | Pre-1.0, Node ≥ 22.18 **[V]**; no compila SFC por sí solo |
| unbuild | Buen *stub*, otra herramienta más |
| Rollup puro | Más configuración manual |

## Consecuencias
(+) Una sola herramienta de build; SFC resuelto. (−) Config de d.ts en Vue requiere cuidado (vue-tsc).

## Disparadores de revisión
tsdown 1.0 estable con soporte probado de SFC para simplificar los paquetes TS puros.
