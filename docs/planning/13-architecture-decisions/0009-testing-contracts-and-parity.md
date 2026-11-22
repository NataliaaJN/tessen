# ADR 0009 — Calidad: contratos, paridad Vue↔React y pruebas

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Hay que verificar comportamiento **y** consistencia visual entre frameworks sin forzar un único harness de montaje. Detalle en `10-quality-and-testing.md`.

## Decisión
- Cada componente tiene un **contrato** en `@tessen/core` que incluye **casos de prueba como datos** (acciones → expectativas de rol, nombre, estado ARIA, foco, valor emitido).
- Cada framework ejecuta esos casos con su **harness nativo** (VTU / RTL + user-event) en Vitest.
- **Paridad**: (P1) API vs contrato por análisis de tipos, (P2) suite de contrato, (P3) diff visual Vue↔React con Playwright, (P4) compilación de snippets generados.
- Regresión visual: Playwright `toHaveScreenshot` sobre Storybook (runner Linux de CI); accesibilidad: axe-core en cada nivel + checklist manual.
- Los tests unitarios/de componente viven **junto a la implementación**; los de integración en `integration/`; E2E en las apps.

## Alternativas
| Alternativa | Motivo de descarte |
|---|---|
| Un único runner que monte ambos frameworks | Infraestructura frágil |
| Solo tests por framework sin contrato | Sin garantía de paridad |
| Chromatic | Servicio externo con cuenta y planes de pago; descartado (ADR 0014) |
| Vitest `toMatchScreenshot` como oficial | Parte visual más reciente **[V]** |

## Consecuencias
(+) La paridad es medible y el contrato sirve también a docs/agentes. (−) Mantener el contrato es trabajo extra: se amortiza porque lo reutilizan docs, Playground y agentes.

## Disparadores de revisión
Coste de baselines visuales excesivo; maduración del visual de Vitest 4.
