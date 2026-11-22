# ADR 0004 — Motor de comportamiento compartido: Zag.js

- **Estado:** Proposed — **condicionado al spike S1** (Fase 1, criterios en `06` §6)
- **Fecha:** 2026-11-22

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

## Disparadores de revisión
Spike S1 fallido; un cambio de licencia o abandono del proyecto; >30 % de los componentes necesitando *forks* del motor.

## Plan de contingencia
Mantener todo lo demás (tokens, CSS, contratos, variantes, tests) y sustituir el motor por implementaciones nativas por framework, componente a componente (estrategia D). Por eso **ningún paquete de fundamentos importa Zag**.
