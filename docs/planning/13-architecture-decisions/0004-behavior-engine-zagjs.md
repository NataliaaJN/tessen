# ADR 0004 — Motor de comportamiento compartido: Zag.js

- **Estado:** **Accepted con condiciones** — spike S1 (5/6) y segunda validación [S2](../S2-zag-validation.md) (*APPROVE WITH CONDITIONS*), ambas el 2026-11-22. Cierra D-05.
- **Fecha:** 2026-11-22

## Contexto
Los componentes compuestos (Dialog, Select, Tabs, Menu, Tooltip, Toast, Slider, DatePicker…) concentran la complejidad de teclado, foco, ARIA y posicionamiento. Implementarlos dos veces (Vue y React) duplica el coste y el riesgo de divergencia.

## Decisión

### Arquitectura

```text
API pública de TESSEN        (props, eventos, slots; sin tipos ni nombres de Zag)
        ↓
Componentes de TESSEN        (anatomía, clases t-*, markup; Select.vue / Select.tsx)
        ↓
Adaptadores por framework    (select.zag.ts / select.zag.tsx: único lugar que importa @zag-js/*)
        ↓
Zag                          (máquinas de estado: teclado, foco, ARIA, posicionamiento)
```

### Reglas
1. **Zag solo para comportamiento complejo** (Dialog, Popover, Tooltip, Select, Combobox, Menu, Tabs, DatePicker…). Los componentes sencillos (Button, Input, Checkbox, Switch…) se escriben directamente con HTML nativo, sin motor.
2. **API pública independiente de Zag:** ningún tipo, nombre, evento de máquina ni objeto `api` de Zag aparece en exports públicos, props, eventos o documentación.
3. **Frontera por archivo, no por interfaz genérica:** solo los archivos `*.zag.ts(x)` de `packages/vue` y `packages/react` importan `@zag-js/*` (regla `zag-only-in-adapter-files` de dependency-cruiser; los fundamentos ya no pueden importarlo). **No** se crea una capa `behavior-engine` con varios proveedores: sustituir Zag es reescribir los adaptadores de un componente, no cambiar una abstracción.
4. **Vue y React mantienen implementaciones idiomáticas** (`computed`/slots/`v-model` frente a props/callbacks) con **contratos funcionales equivalentes**.
5. **Tests de comportamiento compartidos** (una suite que solo toca el DOM, ejecutada contra ambos frameworks) y **pruebas en navegador real** para lo que jsdom no valida (foco, clic fuera, puntero, animaciones, apilamiento).
6. Versión de Zag **fijada exacta**; se actualiza a mano con la suite en verde.

### Qué es responsabilidad de Zag y qué de TESSEN

| Zag (interno, sustituible) | TESSEN (propio, estable) |
|---|---|
| Máquinas de estado, teclado, typeahead, foco y trampa de foco, descarte, inertización, ids y relaciones ARIA, posicionamiento (floating-ui), presencia (`animationend`), aritmética de fechas | API pública, nombres, valores por defecto, anatomía y clases `t-*`, CSS y tokens (incluidas las capas de `z-index`), `Portal`, política de filtrado del Combobox, modelo de valor y formato del DatePicker, textos traducibles, `'use client'`, contratos y tests |

### Condiciones de adopción (detalle y verificación en S2 §18)
C1 frontera por archivo y test de superficie pública · C2 plantilla con `open || presence.present` y `Portal` tras montar · C3 pruebas en navegador real en CI (Playwright) · C4 `'use client'` en `@tessen-ui/react` · C5 capa de `z-index` para popups portados dentro de modales (decidir en tokens, ADR 0005) · C6 entradas de texto en Vue (patrón `defaultValue`) · C7 Zag fijado exacto · C8 DatePicker fuera de T1 hasta resolver las decisiones de producto P1–P8 y política de filtrado del Combobox · C9 revisión con lector de pantalla antes de la alpha · C10 avisos de terceros y lista blanca de licencias.

### Decisión original
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
3. Pendientes de verificar antes de dar por cerrado el riesgo: hidratación en Nuxt/Next reales, `Portal`/`Teleport`, contraste, opciones de Zag no expuestas (i18n de etiquetas, posicionamiento) y trigger polimórfico (D-10). **Resuelto en S2** salvo contraste, i18n de etiquetas y trigger polimórfico.
4. La paridad de Vue es marginalmente superior al umbral con una métrica discutible; se vuelve a medir con los primeros 5 componentes reales (ya previsto en el roadmap F2).

## Resultado de la segunda validación (S2)
Select, Combobox, Menu, Popover, Dialog y Tooltip en portal, DatePicker representativo y el caso Select-en-Dialog, en Vue y React, con una suite única: **122/122 en Chromium real**. Nuxt 4 y Next 16 reales: hidratación sin avisos, ids y ARIA idénticos, interacción correcta. Bundle: `Dialog` 21,7 / 21,2 kB gzip; los siete juntos ≈ 90 kB (núcleo compartido ≈ 11 kB). Licencias: todo el árbol de producción es permisivo (MIT, Apache-2.0, BSD, ISC). Problemas encontrados y resueltos o acotados en las condiciones: montaje de contenido en React, `defaultValue` de `@zag-js/vue`, capas de `z-index`, límites de jsdom. Detalle en [`S2-zag-validation.md`](../S2-zag-validation.md).

## Disparadores de revisión
Spike S1 fallido (no ocurrió); un cambio de licencia o abandono del proyecto; >30 % de los componentes necesitando *forks* del motor; una actualización de Zag que rompa la suite compartida sin arreglo razonable; que las condiciones C3 (navegador real en CI) o C9 (lector de pantalla) revelen incumplimientos de accesibilidad no corregibles en el adaptador.

## Plan de contingencia
Mantener todo lo demás (tokens, CSS, contratos, variantes, tests) y sustituir el motor por implementaciones nativas por framework, componente a componente (estrategia D), reescribiendo solo los archivos `*.zag.ts(x)`; la suite compartida define el comportamiento a igualar. Por eso **ningún paquete de fundamentos importa Zag** y, dentro de `vue`/`react`, solo los adaptadores.
