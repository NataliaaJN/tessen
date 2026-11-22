# ADR 0003 — Estrategia multiframework

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Requisito crítico: Vue y React **sin** dos librerías independientes, con componentes naturales en cada framework. Evaluación completa en `06-multiframework-architecture.md` §2.

## Decisión
**Implementaciones nativas (SFC y TSX) sobre fundamentos compartidos**: tokens, CSS de componentes, lógica de variantes, contratos, codegen y presets de motion se comparten; el comportamiento complejo se comparte mediante un motor headless (ADR 0004). **No** se comparte código de runtime de Vue/React ni se unifican APIs a un mínimo común.

## Alternativas consideradas
| Alternativa | Por qué no (en v1) |
|---|---|
| Dos librerías independientes | Contradice el requisito; divergencia segura |
| **Web Components** (Lit/FAST/Stencil) + wrappers | Fricción de SSR e hidratación, Shadow DOM complica ARIA/formularios y theming profundo; los eventos/slots no son idiomáticos en Vue/React aunque React 19 mejoró el soporte de custom elements |
| Transpilación (Mitosis) | APIs artificiales, depuración sobre código generado, madurez |
| Solo fundamentos compartidos y comportamiento duplicado | Se mantiene como **contingencia** (ADR 0004) |

## Consecuencias
(+) Naturalidad máxima y SSR sin sorpresas. (+) CSS único. (−) Dos adaptadores finos que mantener (mitigado con plantilla/generador y paridad en CI).

## Disparadores de revisión
Demanda real de consumidores sin framework o Svelte/Solid/Angular con peso en el roadmap → evaluar un paquete `@tessen/elements` (Web Components) construido **a partir** de los mismos contratos y CSS; no sustituye a Vue/React.
