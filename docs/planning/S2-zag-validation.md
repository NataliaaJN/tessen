# S2 — Segunda validación de Zag.js (cierre de la decisión del motor)

> Fecha: 2026-11-22 · Zag 1.48.0 · Vue 3.5.46 · React 19.3.1 · Nuxt 4.6.4 · Next 16.4.6.
> **Nombre:** este documento se llama «S2» por petición del propietario y es la **segunda validación del spike S1** ([ADR 0004](./13-architecture-decisions/0004-behavior-engine-zagjs.md)). No es el «Spike S2» del roadmap (F1-T07: contrato → codegen → paridad), que sigue pendiente.
> Leyenda: **[V]** verificado en esta sesión (ejecutado o consultado en el registro) · **[C]** conocimiento previo, sin comprobar hoy.
> Código y reproducción: [`spikes/zag-s2`](../../spikes/zag-s2) (componentes y suite), [`spikes/zag-s2-nuxt`](../../spikes/zag-s2-nuxt) y [`spikes/zag-s2-next`](../../spikes/zag-s2-next) (SSR real). Todo es desechable y `private`.

## 1. Objetivo

Cerrar la decisión sobre el motor de comportamiento de los componentes complejos de TESSEN, comprobando lo que S1 dejó pendiente: `Combobox`, `Select`, `Menu`, un `DatePicker` representativo, portales (React Portal / Vue Teleport) y SSR real (Nuxt y Next). No se repite lo ya validado en S1 (`Dialog`, `Tabs`, `Tooltip` inline, bundle del `Dialog`).

## 2. Alcance

| Dentro | Fuera |
|---|---|
| Combobox, Select, Menu, Popover, Dialog y Tooltip en portal, DatePicker (vista de día, selección simple), caso anidado Select-en-Dialog | Resto del catálogo (Toast, Slider, Tree…), rango y tiempo en DatePicker, calendarios no gregorianos |
| Vue y React con la misma suite de comportamiento | Estilos reales (solo CSS mínimo para pruebas de apilamiento) |
| Nuxt y Next reales en desarrollo y build de producción | Despliegue, publicación, cuentas externas (nada de esto se hizo) |
| Comparación final con alternativas y licencias | Pruebas con lectores de pantalla reales |

No se tocó `@tessen-ui/tokens` ni ninguna otra tarea del roadmap (F1-T02 ya estaba hecha antes de esta validación).

## 3. Metodología

1. **Un componente por patrón, escrito dos veces** (Vue con `defineComponent` + `h`, React con TSX), con API pública propia de TESSEN (`items`, `label`, `value`/`v-model`, `onValueChange`, `open`…), sin exponer nada de Zag.
2. **Una suite de comportamiento única** (`test/contract.ts`) que habla solo con el DOM y se ejecuta contra ambos frameworks mediante adaptadores. Mismo código de aserciones = mismo comportamiento observable.
3. **Dos entornos para la misma suite:**
   - **jsdom** (rápido, determinista): ARIA, estructura, hidratación, estado controlado/no controlado.
   - **Chromium real** (Vitest en modo navegador, proveedor `preview`): foco, cierre al interactuar fuera, selección con puntero, animaciones y apilamiento. jsdom daba resultados distintos entre ejecuciones en estos casos, así que 14 casos por framework se ejecutan **solo** en navegador.
4. **SSR real:** una app mínima de Nuxt y otra de Next con los mismos componentes; carga con servidor de desarrollo (aviso de hidratación más estricto), build de producción y pruebas con teclado y ratón reales en el navegador integrado.
5. **Comprobaciones de frontera:** un test con la API del compilador de TypeScript imprime el tipo de cada export público y falla si menciona Zag; se verificó con un control negativo (exportar un tipo de Zag lo hace fallar).
6. **Medición** de bundle individual y marginal (Vite, minificado, `vue`/`react` externos, gzip).

Criterios de decisión: los del encargo (paridad de comportamiento, accesibilidad, API oculta, bundle, mantenibilidad, sustituibilidad). La métrica de porcentaje de líneas de S1 se trata como secundaria.

## 4. Componentes probados

| Componente | Patrón (APG) | Qué se montó |
|---|---|---|
| Select | Select-only combobox | Lista en portal, deshabilitados, `<select>` oculto para formularios |
| Combobox | Combobox con autocompletado de lista | Filtrado propio, «sin resultados», valor seleccionado |
| Menu | Menu button | Elementos deshabilitados, `select`, apertura controlada |
| Popover | Dialog no modal | Título, cierre, portal |
| Dialog | Dialog modal | Portal, trampa de foco, inertización del resto de la página |
| Tooltip | Tooltip | Portal, descripción del disparador |
| DatePicker | Date picker (cuadrícula) | Entrada de texto + calendario del mes, min/max, fechas no disponibles, `locale` |
| Select dentro de Dialog | — | Portal dentro de portal |

Tamaño de los adaptadores (líneas no vacías, Vue / React): Select 83/77, Combobox 90/84, Menu 54/45, Popover 65/57, Dialog 65/62, Tooltip 47/37, DatePicker 130/103, utilidades compartidas 31/23.

## 5. Resultados Vue

- **Suite compartida:** 61/61 en Chromium real; 47 casos en jsdom (14 solo navegador).
- **Hidratación:** sin avisos en jsdom (`renderToString` + `createSSRApp`) ni en Nuxt real.
- **Hallazgo propio de Vue:** el `normalizeProps` de `@zag-js/vue` convierte `defaultValue` en `value`. El campo de texto del DatePicker dejaba de ser no controlado: al teclear `12/25/2026` el cursor saltaba al inicio y el resultado era `01/01/2252`. Solución en el adaptador: valor inicial una sola vez + sincronización manual de cambios posteriores (≈10 líneas, en `src/vue/date-picker.ts`). El Combobox no se ve afectado.
- **Gotcha de Vue:** en SSR, `Teleport` hacia `body` exige un destino en Nuxt; el `Portal` propio no renderiza nada hasta montarse (ver §10), así que no hace falta.

## 6. Resultados React

- **Suite compartida:** 61/61 en Chromium real; 47 casos en jsdom.
- **Hidratación:** sin avisos en jsdom ni en Next real (ids de `useId` estables).
- **Hallazgo propio de React:** con un valor ya seleccionado, teclear carácter a carácter con `user-event` (sintético) **pierde teclas** de forma reproducible (`elder` → `eder`, `eldr`, incluso con 40 ms entre teclas) y no ocurre en Vue. **No se reproduce con teclado real** en el navegador (`elderb` y `cherry` íntegros en el Combobox con valor seleccionado), ni con un componente mínimo que usa Zag directamente. Se trata como riesgo de baja confianza: el test «controlado» usa `paste` y se añade a las condiciones una prueba de tecleo real en CI (§18).
- **Next:** la página que usa los componentes necesita `'use client'`; los componentes de `@tessen-ui/react` deberán emitirlo (§18).

## 7. Comparación Vue / React

| Aspecto | Resultado |
|---|---|
| Comportamiento observable | **Equivalente.** Misma suite, mismos atributos `data-*` y ARIA, mismo orden de foco, mismas transiciones de estado |
| Contrato funcional | Idéntico por construcción: la lógica de teclado, foco, ARIA, resaltado y posicionamiento vive en las máquinas de Zag |
| Código específico | Vue ≈ 16 % más líneas que React en total (565 frente a 488 líneas no vacías, sobre todo `computed()`, `emits` y la sincronización del input del DatePicker). No hay lógica de comportamiento duplicada |
| Diferencias reales | 1) `defaultValue`→`value` en Vue (DatePicker); 2) estilo reactivo (`computed`/`Ref` frente a valores); 3) `'use client'` solo en React; 4) la pérdida de teclas sintética solo en React |

Ninguna diferencia justifica rechazar el motor: las dos primeras se resuelven en el adaptador, la tercera es un detalle de empaquetado, la cuarta no se reproduce con teclado real.

## 8. Accesibilidad

Combinación de métodos, sin dar por suficiente ninguno solo:

| Método | Cobertura | Resultado |
|---|---|---|
| Roles/ARIA por patrón (DOM) | Select: `combobox` + `aria-haspopup=listbox`, `aria-expanded`, `listbox`/`option` con `aria-disabled`, `aria-labelledby`. Combobox: `aria-autocomplete=list`, `aria-controls`, `aria-activedescendant` con foco en el input. Menu: `aria-haspopup=menu`, `menu`/`menuitem`. Dialog: `aria-modal`, nombre y descripción. DatePicker: `grid`, `gridcell`, día con nombre accesible completo | Conforme |
| Teclado (APG) en Chromium | Flechas saltando deshabilitados, Home/End, typeahead, Enter, Escape, retorno de foco, trampa de foco, una capa por Escape (lista → diálogo), cierre al interactuar fuera | Conforme |
| axe-core | Estados cerrado y abierto de todos los componentes, en jsdom **y** en Chromium (reglas `color-contrast` y `region` desactivadas: no hay estilos) | 0 violaciones |
| Lectores de pantalla (NVDA, VoiceOver) | **No realizado** | Pendiente (condición C9) |

Observaciones: en el DatePicker Zag marca la fila de nombres de día `aria-hidden` y etiqueta cada día como «Choose Wednesday, November 11, 2026». No sigue al pie de la letra el ejemplo de APG (cabeceras de columna anunciadas), aunque cada celda es autoexplicativa; hay que validarlo con lector de pantalla. En el Combobox, Home/End resaltan la primera/última opción mientras la lista está abierta y mueven el cursor cuando está cerrada.

## 9. SSR

| Comprobación | Nuxt 4.6.4 (Vue) | Next 16.4.6 (React) |
|---|---|---|
| Hidratación sin avisos (servidor de desarrollo) | Sin avisos | Sin errores |
| Build de producción | Compila | Compila y prerrenderiza |
| Ids | Los 19 ids del HTML del servidor existen idénticos en el cliente (`select:v-0…`) | Ídem (`select:_R_…`) |
| Relaciones ARIA tras hidratar | `aria-labelledby` resuelve | Ídem |
| Estado controlado en servidor | `fruit=cherry` y «Cherry» ya en el HTML | Ídem |
| Interacción posterior | Abrir, foco en la lista, elegir, el estado del padre cambia | Ídem; el foco vuelve al botón |
| Diálogo | Se abre en portal, foco dentro, Escape lo cierra, foco devuelto, sin estilos residuales en `body` | Ídem |

Qué no se verificó: streaming, rutas anidadas, `defaultOpen` en servidor (por diseño no se renderiza, §10), producción de Nuxt en navegador (solo compilada), foco durante una hidratación lenta. Nuxt dev se ejecutó con la telemetría desactivada.

## 10. Portal / Teleport

| Comprobación | Resultado |
|---|---|
| Contenido fuera del contenedor, en `body` | Sí en ambos (Dialog, Popover, Tooltip, Menu, Select, Combobox, DatePicker) |
| Foco: entrada, trampa, retorno | Correcto en ambos (en React exige `open \|\| presence.present`, ver §14) |
| Dialog: resto de la página inerte y restauración | `aria-hidden` y `pointer-events` se limpian al cerrar y **al desmontar con el diálogo abierto** |
| Descarte: Escape, clic fuera | Correcto; con Select dentro de Dialog, cada Escape cierra una capa |
| Posicionamiento | Las capas portadas salen posicionadas (`absolute`/`fixed`) por el cálculo de Zag; **no** se verificó la colocación exacta respecto al disparador ni el volteo en los bordes de la ventana |
| Apilamiento | **Hallazgo de tokens:** con las capas actuales (`layer.dropdown` 1000 < `layer.modal` 1300) una lista dentro de un modal queda **detrás** del modal; con ≥ 1300 queda encima (medido en ambos frameworks). Los popups portados dentro de modales deben usar `layer.popover` (1400) o similar |
| SSR | El `Portal` propio no renderiza hasta montarse en cliente: sin riesgo de desajuste y sin destino de Teleport en Nuxt. Consecuencia: un contenido portado que empiece abierto (`defaultOpen`) no está en el HTML del servidor |
| Limpieza al desmontar | Sin nodos, atributos ni estilos residuales |

## 11. Bundle

Gzip, minificado, `vue`/`react` externos, dependencias de Zag incluidas. Umbral de S1: `Dialog` ≤ 25 kB.

| Componente | Vue solo | Vue marginal tras Dialog | React solo | React marginal tras Dialog |
|---|---|---|---|---|
| Dialog | **21,74** | — | **21,24** | — |
| Tooltip | 23,08 | +15,49 | 22,76 | +15,60 |
| Popover | 33,08 | +14,10 | 32,78 | +14,25 |
| Menu | 34,79 | +22,98 | 34,68 | +23,36 |
| Select | 34,27 | +23,04 | 34,11 | +23,36 |
| Combobox | 35,78 | +25,16 | 35,68 | +25,52 |
| DatePicker | 44,88 | +33,56 | 44,75 | +33,83 |
| **Los 7 juntos** | **89,79** (suma de solos: 227,63) | | **89,21** (suma de solos: 226,00) | |

Lectura: el `Dialog` sigue bajo 25 kB aun con portal. El núcleo compartido pesa ≈ 11 kB; cada componente adicional añade 14–34 kB, el DatePicker el que más (incluye `@internationalized/date`). Una app con los siete paga ≈ 90 kB frente a ≈ 227 kB de sumarlos por separado. No se comparó con las alternativas en bundle; sus cifras no se midieron.

## 12. DX

- **API pública TESSEN-shaped, sin Zag:** props (`items`, `label`, `value`/`v-model`, `open`, `disabledDates`, `locale`), eventos (`onValueChange`/`update:modelValue`, `onOpenChange`/`update:open`, `select`) y slots. Los tests de frontera lo comprueban sobre los tipos exportados.
- **Glue por componente:** 50–130 líneas por framework. Lo repetitivo es el cableado (`getXProps` → elementos). Con los patrones de §14 queda poco código propio no trivial.
- **Decisiones de producto que Zag no toma y hay que tomar:** política de filtrado del Combobox (Zag solo renderiza la colección que se le da), modelo de fecha (cadena ISO en el spike, provisional), formato de entrada del DatePicker, textos traducibles.
- **Costes de aprendizaje:** el modelo «máquina + `connect` + `normalizeProps`» es pequeño; la semántica fina (cuándo un valor controlado se resincroniza con el texto del input) hay que aprenderla leyendo las máquinas.

## 13. Licencias

Comprobado en el registro de npm y en los `package.json` instalados **[V]**:

| Proyecto | Licencia | Obligaciones relevantes |
|---|---|---|
| Zag (`@zag-js/*`, 1.48.0) | **MIT** (todos los paquetes instalados; © Chakra UI) | Conservar el aviso de copyright y la licencia en las copias redistribuidas |
| Ark UI (`@ark-ui/react`, `@ark-ui/vue` 5.40.0) | **MIT** | Ídem |
| Radix (`radix-ui` 1.8.1, `@radix-ui/react-*`) | **MIT** | Ídem |
| Reka UI (port de Radix a Vue, 2.11.0) | **MIT** | Ídem |
| React Aria (`react-aria-components` 1.22.1, `@react-aria/*`) | **Apache-2.0** | Incluir copia de la licencia; conservar avisos y `NOTICE` si existe; indicar modificaciones |
| Headless UI (`@headlessui/react` 2.2.10, `@headlessui/vue` 1.7.23) | **MIT** | Ídem MIT |

Árbol de producción de los componentes de S2 **[V]** (`pnpm licenses`): 55 MIT, 2 Apache-2.0 (`@internationalized/date`, `@swc/helpers`), 1 BSD-2-Clause, 1 BSD-3-Clause, 1 ISC. **Sin copyleft ni licencias con restricción de uso.** `@internationalized/date` (Adobe) lo necesita el DatePicker de Zag y es Apache-2.0: su `LICENSE` ya viaja con el paquete (no trae `NOTICE`). Para TESSEN, todas son permisivas y sin coste de uso comercial; basta con mantener un fichero de avisos de terceros cuando se distribuya. Herramientas solo de desarrollo: `axe-core` es **MPL-2.0** (copyleft de archivo, no se distribuye ni se enlaza en los paquetes); Testing Library, jsdom y Vitest son MIT.

## 14. Riesgos

| Riesgo | Probabilidad / impacto | Mitigación |
|---|---|---|
| El contenido se monta un render después de abrir y en React no se activa trampa ni foco inicial | Ocurrió. Alto si se ignora | Regla de plantilla `open \|\| presence.present` en todos los componentes con presencia (verificada en Dialog, Popover, Tooltip) |
| `normalizeProps` de Vue convierte `defaultValue` en `value` | Ocurrió. Medio (afecta a entradas de texto) | Patrón de adaptador (valor inicial una vez + sincronización manual); test «el texto tecleado llega a `onValueChange`» por cada componente con input |
| Pérdida de teclas en React con tecleo sintético y valor seleccionado | Baja confianza; no se reproduce con teclado real | Prueba de tecleo real en CI (Playwright `keyboard.type`) |
| Capas de `z-index`: popups dentro de modales quedan detrás | Cierto con los tokens actuales | Decidir en tokens (ADR 0005) una capa para popups portados ≥ modal antes del primer Select/Menu |
| jsdom no sirve para foco, clic fuera, animaciones | Cierto | Pruebas en navegador real en CI (§18) |
| Dependencia de un proyecto de terceros (cambio de licencia, abandono) | Bajo (MIT, publicado activamente: última versión 2026-11-13 **[V]**; Ark UI lo usa como base **[C]**) | Versión exacta fijada, frontera por archivo, plan de contingencia del ADR |
| DatePicker: peso (45 kB) y decisiones de producto abiertas | Medio | No es T1; ver §17 y condición C8 |
| Rotura silenciosa en una actualización de Zag | Medio | La suite compartida es el detector; actualizar a mano con la suite en verde |

## 15. Limitaciones

- **Sin lectores de pantalla reales** (NVDA, VoiceOver, JAWS): no se puede afirmar conformidad WAI-ARIA completa, solo que los roles, relaciones y teclado coinciden con APG y axe no encuentra violaciones.
- **Un solo navegador** (Chrome 158, motor Chromium **[V]**). Firefox y WebKit no se probaron; el posicionamiento y el foco pueden diferir. La colocación exacta de los popups tampoco se midió.
- **Nuxt y Next solo con una página**; sin streaming, sin rutas, sin carga lenta de hidratación. La producción de Nuxt se compiló pero no se cargó en el navegador.
- **Modo navegador local** (`preview`): abre el navegador por defecto del usuario y es frágil con pestañas antiguas; no sirve para CI. Para CI hará falta Playwright (§18).
- **DatePicker parcial:** solo vista de día, selección simple y un idioma extra (`es-ES`); sin rango, hora, mes/año ni calendarios no gregorianos.
- **Medición de bundle sin tree-shaking de la aplicación**; cada entrada incluye todo el código de su máquina.
- **Estilos mínimos:** el contraste y el modo de contraste forzado no se evaluaron.
- **Teclado en jsdom:** la activación de pestañas por flechas (S1) y varias interacciones de S2 solo se validan en navegador.

## 16. Comparación con alternativas

Comparación breve y acotada (sin nuevo estudio). Datos de licencia, versión y *peers* **[V]**; el resto **[C]**.

| Criterio | **Zag.js** | **Ark UI** | **Radix** | **React Aria** | **Headless UI** | **Propia** |
|---|---|---|---|---|---|---|
| Vue + React | Sí, misma máquina | Sí (`@ark-ui/vue` ≥ 3.5) | Solo React; Vue vía Reka UI (otro código) | Solo React | React 2.x y Vue 1.x (versiones y catálogo distintos) | Sí, a coste doble o con núcleo común |
| Comportamiento compartido | **Sí, una máquina** | Sí (es Zag) | No (dos motores) | No | No | Solo con núcleo propio |
| Accesibilidad | Patrones APG; validado aquí | La de Zag | Muy buena en React | Referencia del sector, con i18n completa | Buena, catálogo corto | La que se pruebe |
| SSR | Validado (Nuxt/Next) | La de Zag | Buena | Buena | Buena | A construir |
| Bundle | 21–45 kB gzip por componente; núcleo ≈ 11 kB | Zag + capa Ark | Ligero por primitivo | Pesado por componente complejo | Ligero | A medir |
| DX | Cableado propio (50–130 líneas) | Componentes compuestos ya hechos | Compuestos, muy pulidos | Hooks de bajo nivel o componentes | Componentes sencillos | Todo propio |
| Licencia | MIT | MIT | MIT | Apache-2.0 | MIT | Propia |
| Lock-in | Medio, contenido por frontera de archivo | **Más alto:** API de Ark + Zag | Alto en React | Alto en React | Medio | Ninguno |
| Catálogo útil (Combobox, DatePicker…) | Sí, ambos | Sí | Sin Combobox ni DatePicker **[C]** | **Completo**, con DatePicker y calendarios **[C]** | Sin DatePicker ni Tooltip **[C]** | A escribir |
| Adecuación a TESSEN | **Alta** | Media: añade una capa y una API ajenas | Media-alta solo si fuera React-only | Referencia, no solución para Vue | Baja-media | Baja: reinventa lo ya resuelto |

Las celdas de bundle, DX y catálogo de las alternativas son cualitativas **[C]**; solo se midió Zag.

Notas:

- **Ark UI no es independiente de Zag.** Es Zag más componentes y utilidades (Portal, Presence, composición, `asChild`). Elegirlo no evita Zag: decide cuánto cableado se posee. Aquí el cableado fue de 50–130 líneas por componente y framework, asumible, y poseerlo mantiene la API pública de TESSEN. Ark queda como **implementación de referencia**, como ya fijaba el ADR.
- **Radix y React Aria** son las referencias de accesibilidad y de interacción en React; no se adoptan porque exigirían otra solución para Vue (Reka UI) y la paridad pasaría a depender solo de tests. Se usan como criterio de calidad al revisar cada componente.
- **Headless UI** tiene una cobertura menor y versiones dispares entre Vue y React.
- **Implementación propia** reintroduce justo el coste que se quería evitar (foco, capas de descarte, posicionamiento, typeahead, IME, fechas) dos veces.

## 17. Decisión final

# **APPROVE WITH CONDITIONS**

Zag.js es adecuado como motor interno de comportamiento de TESSEN para Vue 3.5+ y React 19+. En esta validación los siete patrones se comportaron igual en ambos frameworks (122/122 casos en Chromium real), el SSR real de Nuxt y Next es limpio, los portales y el caso anidado funcionan, la frontera impide que Zag llegue a la API pública y el bundle y las licencias son aceptables. Los problemas encontrados tienen solución localizada en el adaptador o en los tokens. No hay una alternativa claramente superior para este conjunto de requisitos.

Decisiones de producto pendientes que **no** se han inventado y bloquean un DatePicker de producción: (P1) modelo de valor (cadena ISO, `Date`, objeto de fecha); (P2) rango, múltiple y límites; (P3) formato y análisis de texto por *locale*, inicio de semana; (P4) calendarios no gregorianos y zona horaria; (P5) vistas de mes y año, atajos; (P6) política de fechas no disponibles (`min`, `max`, función); (P7) integración con formularios (`name`, valor oculto); (P8) textos traducibles. Combobox además necesita la política de filtrado (síncrono, asíncrono, *debounce*, `allowCustomValue`).

## 18. Condiciones de adopción

Concretas y verificables; las cumple el trabajo de Fase 2 (F2) salvo que se indique otra cosa.

| # | Condición | Verificación |
|---|---|---|
| C1 | **Frontera por archivo:** en `packages/vue` y `packages/react`, solo los archivos `*.zag.ts(x)` importan `@zag-js/*`; ningún export público incluye tipos de Zag | Regla `zag-only-in-adapter-files` de dependency-cruiser (añadida) + test de superficie pública por paquete (portar `spikes/zag-s2/test/boundary.test.ts`) |
| C2 | **Plantilla de componente con presencia:** renderizar `open \|\| presence.present`; `Portal` que no renderiza hasta montarse | Casos «foco entra y vuelve» de la suite |
| C3 | **Pruebas en navegador real en CI** para foco, clic fuera, selección con puntero y animaciones; jsdom solo para ARIA, estructura e hidratación | Proveedor Playwright de Vitest (`@vitest/browser-playwright`, MIT; Playwright es Apache-2.0 **[V]**) en GitHub Actions, sin coste; la misma suite compartida |
| C4 | **`'use client'`** en los entry points de `@tessen-ui/react` que usen hooks | Fixture Next del spike convertido en prueba de integración (ADR 0016) |
| C5 | **Tokens de capa** para popups portados dentro de modales (≥ `layer.modal`); decidir antes del primer Select/Menu | Test de apilamiento del spike (`stacks the list above the modal`) |
| C6 | **Entradas de texto en Vue:** patrón «valor inicial una vez + sincronización manual» y test «el texto tecleado llega al evento» para todo componente con `<input>` | Suite compartida |
| C7 | **Versión de Zag fijada exacta** y actualización manual con la suite compartida en verde | `package.json` sin rangos; revisión en cada subida |
| C8 | **DatePicker no entra en T1:** no se construye hasta resolver P1–P8; Combobox espera a decidir el filtrado | `docs/planning/12-open-decisions.md` |
| C9 | **Revisión con lector de pantalla** (NVDA y VoiceOver) de Select, Combobox, Menu, Dialog y DatePicker antes de la alpha | Lista de comprobación en el PR de cada componente |
| C10 | **Avisos de terceros** en cada paquete distribuido (MIT de Zag; Apache-2.0 de `@internationalized/date`) y lista blanca de licencias (MIT, Apache-2.0, ISC, BSD) | `pnpm licenses` en CI cuando existan paquetes distribuibles |

Estructura aprobada (ver ADR 0004): API pública TESSEN → componentes TESSEN → adaptadores por framework (`*.zag.ts(x)`) → Zag. Sin capa genérica `behavior-engine`: la sustituibilidad se obtiene de la frontera por archivo.

## 19. Qué queda fuera del alcance

- Resto del catálogo con máquina de Zag (Toast, Slider, Tree, Tags, Pin, Number, etc.) y los componentes que Zag no cubre (Table/DataGrid, NavigationMenu, Sidebar).
- DatePicker de producción (rango, hora, mes/año, calendarios no gregorianos) y sus decisiones de producto (§17).
- Estilos, tokens y temas reales; el diseño de la capa de apilamiento (solo se midió el problema).
- El «Spike S2» del roadmap (F1-T07): contrato, *codegen* y paridad visual.
- Firefox, WebKit y móviles; lectores de pantalla; rendimiento en listas grandes (virtualización).
- Publicación, despliegue o cualquier servicio externo (no se hizo ninguno).
