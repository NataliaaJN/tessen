# ADR 0013 — Reglas de dependencias aplicadas con dependency-cruiser

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
ADR 0002 fija reglas de dependencias entre capas (pages→features→shared; packages↛apps; vue↮react…). Deben comprobarse automáticamente.

## Decisión
Usar **dependency-cruiser** con configuración declarativa (`.dependency-cruiser.cjs`) ejecutada en `pnpm deps:check` y en CI. Las reglas concretas están en `docs/architecture/dependency-rules.md`. Complementos: `exports` de `package.json` impiden imports profundos de consumidores; publint/attw validan.

## Alternativas
| Alternativa | Motivo |
|---|---|
| eslint-plugin-boundaries | Bueno para capas dentro de un paquete; peor para el grafo entre paquetes y detección de ciclos |
| Nx module boundaries | Requiere adoptar Nx (ADR 0001) |
| Revisión manual | No escala |

## Consecuencias
(+) Reglas ejecutables y versionadas; (+) detección de ciclos. (−) Configuración que mantener al añadir features.

## Disparadores de revisión
Adopción de Nx; ruido excesivo de falsos positivos.
