# ADR 0007 — Motion por capas

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
El motion es parte de la identidad, pero no puede ser una dependencia pesada ni ser inconsistente entre componentes. Detalle en `07-motion-system.md`.

## Decisión
- **L0 CSS** (tokens + transiciones/keyframes + `prefers-reduced-motion`) para todos los componentes base; 0 JS.
- **L1 `@tessen/motion`**: presets como **datos**, runtime sobre **Web Animations API**, stagger, scroll-reveal, presencia, control global `data-tessen-motion` (`off|reduced|full`). Dependencia **opcional** de `vue`/`react`.
- **L2 opcional**: **Motion (motion.dev, MIT; `motion-v` para Vue)** para layout/resortes/gestos **[V]**. **GSAP** solo se evaluará en Fase 7 (ahora gratuito pero con licencia propia y exclusión para herramientas de animación visual que compitan con Webflow **[V]**).
- Prohibido definir duraciones/curvas literales en CSS de componentes (se verifica con lint).

## Alternativas
| Alternativa | Motivo |
|---|---|
| Solo CSS | No cubre secuencias, presencia ni scroll con fallback |
| Motion como base de todo | Dependencia mayor para quien no la necesita |
| GSAP como base | Licencia propia, peso, ciclo de vida manual |
| Motor propio de resortes | Coste y riesgo sin necesidad (delegar en L2) |

## Consecuencias
(+) Quien no quiere animación no paga nada. (+) Coherencia vía tokens/presets. (−) Dos representaciones (CSS y WAAPI) de cada preset: se generan desde el mismo dato.

## Disparadores de revisión
Soporte universal de `animation-timeline`/View Transitions (simplificar L1); necesidades de física que L1 no cubra con Motion.
