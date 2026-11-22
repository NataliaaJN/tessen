# ADR 0004 — Motor de comportamiento compartido: Zag.js

- **Estado:** Accepted (provisional) — spike S1 superado 5/6 el 2026-11-22; **pendiente de confirmación del propietario (D-05)**
- **Fecha:** 2026-11-22 (spike S1: 2026-11-22)

## Contexto
Los componentes compuestos (Dialog, Select, Tabs, Menu, Tooltip, Toast, Slider, DatePicker…) concentran la complejidad de teclado, foco, ARIA y posicionamiento. Implementarlos dos veces (Vue y React) duplica el coste y el riesgo de divergencia.

## Decisión
Usar **Zag.js** (`@zag-js/<máquina>` + `@zag-js/vue` y `@zag-js/react`) directamente dentro de `@tessen/vue` y `@tessen/react` como motor de comportamiento de los componentes compuestos. Tessen aporta anatomía, clases `t-*`, CSS, tokens y API idiomática. Los componentes fundamentales (Button, Input, Checkbox, Switch…) usan HTML nativo **sin** motor.

Hechos **[V]**: Ark UI usa Zag.js y publica `@ark-ui/{react,solid,vue,svelte}` con paridad por diseño sobre máquinas de estado; Zag es MIT.
Se usa Zag **directamente** (no Ark UI) para que la API pública sea de Tessen, no la de Ark. Ark UI sirve de referencia de implementación.

## Alternativas consideradas
| Alternativa | A favor | En contra |
|---|---|---|
| Radix (React) + Reka UI (Vue) | Mejor idiomatismo por framework; Radix mantenido por WorkOS, Reka es el sucesor de Radix Vue **[V]** | Dos motores distintos → divergencia de comportamiento; el requisito de paridad recae enteramente en tests |
| Base UI (React, 1.0 estable) + Reka UI | Base UI es sólido **[V]** | Igual: dos motores |
| **Ark UI** como capa intermedia | Componentes ya hechos para Vue y React | API definida por Ark; dos capas (Ark+Tessen); estilos y anatomía a adaptar |
| Motor propio (máquinas de estado propias) | Control total | Coste muy alto; reinventar posicionamiento, typeahead, IME, etc. |
| Sin motor (estrategia D) | Sin dependencia externa | Doble coste de lógica y de bugs |

## Consecuencias
(+) Misma lógica para ambos frameworks. (+) Posicionamiento, foco, teclado y a11y probados por terceros. (−) Dependencia de un proyecto de terceros (mitigación: versión fijada, adaptación por componente, contratos propios, contingencia D). (−) Hay que verificar cobertura de máquinas (algunas no existirán: Table/DataGrid → TanStack **[C]**, NavigationMenu/Sidebar/Menubar → propio).

## Resultado del spike S1 (F1-T06)
`Dialog`, `Tabs` y `Tooltip` sobre Zag 1.48.0 en Vue 3.5 y React 19, con una única suite de comportamiento ejecutada contra ambos. Detalle y reproducción en [`spikes/zag-s1/RESULTS.md`](../../../spikes/zag-s1/RESULTS.md).

| # | Criterio (`06` §6) | Resultado |
|---|---|---|
| 1 | Paridad (suite igual en ambos; ≤ 15 % de lógica distinta) | **Límite**: suite de 36 casos verde en ambos; lógica distinta 11,4 % (React) y 15,1 % (Vue) con una métrica tosca que depende del formato |
| 2 | a11y (0 axe + teclado APG) | **Cumple** (en jsdom; sin contraste) |
| 3 | SSR sin avisos de hidratación | **Cumple** con `renderToString` + hidratación; **no** con Nuxt/Next reales |
| 4 | `Dialog` ≤ 25 kB gzip | **Cumple**: 21,7 kB (Vue) / 21,1 kB (React) con todo el motor incluido |
| 5 | DX sin filtrar el motor | **Cumple** |
| 6 | Animación de salida | **Cumple**: `presence` mantiene el nodo hasta `animationend` (~370 ms para 300 ms, medido en Chromium) |

**Decisión:** 5/6 → el motor se aprueba, con estas condiciones para Fase 2:
1. Los componentes se renderizan con `open || presence.present` (si no, en React no se activan trampa ni foco iniciales).
2. La suite de contrato necesita **modo navegador** (Playwright/Vitest browser mode): jsdom no puede validar la activación de pestañas por teclado ni las animaciones de salida.
3. Pendientes de verificar antes de dar por cerrado el riesgo: hidratación en Nuxt/Next reales, `Portal`/`Teleport`, contraste, opciones de Zag no expuestas (i18n de etiquetas, posicionamiento) y trigger polimórfico (D-10).
4. La paridad de Vue es marginalmente superior al umbral con una métrica discutible; se vuelve a medir con los primeros 5 componentes reales (ya previsto en el roadmap F2).

## Disparadores de revisión
Spike S1 fallido; un cambio de licencia o abandono del proyecto; >30 % de los componentes necesitando *forks* del motor.

## Plan de contingencia
Mantener todo lo demás (tokens, CSS, contratos, variantes, tests) y sustituir el motor por implementaciones nativas por framework, componente a componente (estrategia D). Por eso **ningún paquete de fundamentos importa Zag**.
