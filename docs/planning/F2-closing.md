# F2 · Core components: cierre de fase

> **Estado:** implementación completada (2026-11-22). T1 entregado en Vue y React, motion L1, generador y alpha `0.1.0` empaquetada y validada como tarballs (sin publicar). **El gate de la fase queda cumplido salvo la paridad visual y las pruebas en navegador real** (§5), que no se han construido.

## 1. Qué se entregó

| Lote | PR | Componentes |
| --- | --- | --- |
| F2-T01 | #15 | `Button` ([`F2-T01-button.md`](F2-T01-button.md)) |
| F2-T02 | #16 | `IconButton`, `Link`, `Spinner`, `VisuallyHidden`; runner de contrato generalizado |
| F2-T03 | #17 | `Badge`, `Alert`, `Skeleton`, `Card`, `Divider`, `Stack`, `Grid`, `Container`, `AspectRatio` |
| F2-T04 | #18 | `Field` (+ `FieldLabel`, `FieldDescription`, `FieldError`), `Input`, `Textarea`, `Checkbox`, `Switch`, `RadioGroup`/`Radio`, `NativeSelect` |
| F2-T05 | #19 | `Tabs` (`TabList`, `Tab`, `TabPanel`), `Tooltip` (`TooltipTrigger`, `TooltipContent`), `Dialog` (+ 5 partes) sobre Zag |
| F2-T06 | este | `@tessen-ui/motion` L1 (`animate`, `presence`, `resolveMotionMode`, `setMotionMode`, `stagger`), generador `pnpm new:component`, `pnpm pack:alpha`, integración ampliada |

**24 componentes públicos** por framework (más sus partes), cada uno con: contrato en `@tessen-ui/core` (datos), CSS en `@tessen-ui/styles` (capa `tessen.components`), Vue, React, tests de contrato compartidos y axe.

## 2. Decisiones tomadas por el camino

1. **Un runner, muchos componentes.** `tooling/contract-runner` ganó pasos (`type`, `select`, `hover`, `wait`, `key` con cualquier tecla), comprobaciones (`within`, `queries` por rol/nombre/descripción, propiedades DOM, `emitted`, `tag`, `text`) y reintenta las expectativas unos instantes (máquinas de estado y `requestAnimationFrame`). Los casos siguen siendo **datos**; los componentes compuestos usan *fixtures* descritos en el contrato y construidos por cada framework en su test.
2. **Adaptadores de test compartidos** (`packages/vue/test/adapter.ts`, `packages/react/test/adapter.tsx`): una fábrica por framework para los componentes simples. Excluidos de `deps:check`.
3. **`Field` por contexto, sin efectos.** Genera los ids (`useId` en ambos), conecta `for` y `aria-describedby`. El error solo se renderiza (y solo se enlaza) mientras `invalid`; la descripción se enlaza siempre (un id ausente lo ignoran los lectores). Sin registros ni `useEffect`: SSR-safe.
4. **Entradas con envoltorio.** `Input`, `Checkbox`, `Switch`, `Radio` y `NativeSelect` envuelven al control nativo (que sigue participando en formularios): `class`/`style` van al envoltorio; el resto de atributos y el `ref` al control nativo. Vue usa `inheritAttrs: false` y `defineModel` con `default: undefined` (un `Boolean` ausente se convertiría en `false`).
5. **Tabs: la selección siempre es controlada para Zag** (valor del padre > última elección > `defaultValue` > primera pestaña registrada). Así «primera pestaña por defecto» es síncrono y válido en SSR, sin pedirle a Zag que cambie de opinión después de arrancar.
6. **Compuestos Zag como exports planos** (ADR 0011). El motor solo se importa desde `*.zag.ts(x)` (regla de dependency-cruiser) y `public-api.test` comprueba en ambos paquetes que no se exporta nada con forma de motor (C1 de ADR 0004).
7. **`Portal` y `Presence` internos** (no exportados): el catálogo los clasifica como infraestructura. `FocusScope` no es un componente aparte: la trampa y la restauración de foco las da el motor de `Dialog`. Si una prueba de uso real lo pide, saldrá de ahí.
8. **Dialog sin `DialogBackdrop` suelto.** El fondo, el posicionador y el contenido van dentro de `DialogContent` (un solo portal, un solo `Presence`). Es una desviación de la anatomía de `05` §5.5, que lista el fondo como parte propia; se retoma si alguien necesita personalizarlo por separado.
9. **Tooltip: el disparador es un `<button>` propio.** Garantiza que sea enfocable. Para envolver otro elemento haría falta polimorfismo (D-10, no en v1).
10. **Motion L1 sin dependencias:** Web Animations sobre los mismos presets que el CSS; respeta `data-tessen-motion` y `prefers-reduced-motion`; degrada a «no anima» si falta la API.

## 3. Medición del coste (hito M2 del roadmap)

Fotografía del repositorio tras la fase (no son horas: la sesión no cronometró el trabajo).

| Métrica | Valor |
| --- | --- |
| Líneas de contratos (`core`, incluye casos) | 2 160 |
| Líneas de CSS de componentes | 1 526 |
| Líneas de código Vue (SFC, adaptadores `*.zag.ts`, barriles) | 1 433 |
| Líneas de código React | 1 554 |
| Líneas de tests Vue / React | 946 / 893 |
| Tests Vue / React / core / motion | 216 / 215 / 11 / 23 |
| `@tessen-ui/vue` `dist/index.js` | 31 kB (6,6 kB gzip), sin Vue ni Zag |
| `@tessen-ui/react` `dist/**/*.js` | 37 kB (6,8 kB gzip), sin React ni Zag |
| `@tessen-ui/styles` `index.css` | 77 kB (10,4 kB gzip), tokens incluidos |

Lecturas:

- **La paridad cuesta poco en código y mucho en contrato.** Vue y React pesan casi lo mismo (1 433 vs 1 554 líneas); lo caro es el contrato con sus casos (2 160 líneas), que se escribe una vez y vale para los dos y para docs/Playground. Esa es la apuesta de ADR 0003.
- **Un componente simple (elemento + variantes) ya es un comando.** `pnpm new:component <Nombre> --tag span --variant tone=a,b --boolean pulse` genera contrato, CSS, Vue, React y sus tests; probado con un componente de prueba que pasó los tests de ambos frameworks sin tocar nada. Lo que sigue costando es lo no repetitivo: anatomía compuesta, estados con contexto, motor Zag y el CSS real.
- **Los compuestos con Zag son la parte cara.** Tabs, Tooltip y Dialog necesitaron el contexto, el adaptador por framework y varias rondas con jsdom (foco por teclado vs programático, valor `Boolean` de Vue, selección inicial). Cada uno dejó una decisión en §2.
- **Riesgo R3 (coste de dos implementaciones):** controlado para T1; el generador y el runner compartido son las mitigaciones que funcionaron. Reevaluar con T2 (Select, Combobox, Menu).

## 4. Alpha `0.1.0` por tarballs

`pnpm build && pnpm pack:alpha && pnpm tarball:check && pnpm integration:install && pnpm integration:test` (sello `0.1.0-alpha.local.<sha>.<tiempo>`; los `package.json` siguen en `0.0.0` y `private`, ADR 0015).

- Siete tarballs: `tokens`, `styles`, `icons`, `motion`, `core`, `vue`, `react`; `publint` + `attw` verdes y lista blanca de archivos.
- `integration/vite-vue` y `integration/vite-react` consumen desde tarballs una pantalla con `Tabs`, `Field`/`Input`/`Checkbox`, `Alert`, `Button`, `Dialog` y `Stack`; tipos bajo `NodeNext`, build, orden de capas CSS, tokens y keyframes presentes, **contratos y casos fuera del bundle** (tree-shaking) y las clases de los componentes usados presentes.
- `@tessen-ui/vue` y `@tessen-ui/react` dependen de `@zag-js/*` en versión **exacta 1.48.0** (C7 de ADR 0004).
- `dist:verify` (CI) sigue empaquetando con el sello `0.0.0-local`.

## 5. Pendiente y deuda (no se ha hecho)

| Pendiente | Origen | Nota |
| --- | --- | --- |
| **Paridad visual Vue ↔ React** (diff de capturas en CI Linux) | Gate de F2, `integration/parity` | El spike `spikes/button-parity` lo demostró con `Button`; no se ha extendido |
| **Pruebas en navegador real** (Playwright en CI) | C3 de ADR 0004 | Todo lo de foco real, clic fuera, animación de salida y posicionamiento solo está probado en jsdom (límites anotados en cada test) |
| **Revisión con lector de pantalla** (NVDA, VoiceOver) de `Dialog` | C9 | Antes de una alpha publicada |
| Fixtures SSR de Nuxt y Next | T09, C4 | `'use client'` está en los componentes React; la hidratación solo se probó en el spike |
| Aviso de terceros (MIT de Zag) en los paquetes y lista blanca de licencias | C10 | Aún no hay paquetes publicables |
| `size-limit` y matriz React 18.3 / 19, Vue 3.5 | F3 | Los tests corren con React 19 |
| Casos de contrato de componentes con `Tooltip` sobre elementos deshabilitados | `05` §5.7 | Requiere polimorfismo (D-10) |
| `Tabs` con indicador deslizante (`TabIndicator`) y motion L1 en componentes | `05` §5.4, `07` | Hoy usan CSS (L0); L1 está disponible pero ningún componente lo usa |
| `exports` por subruta (`./button`) en vue/react | F2-T01 | Un solo punto de entrada `.` |
| Stories y ejemplos de docs | F4 | |
| `secondary` + `tone=danger` se ve como el neutro | F2-T01 | Decisión de diseño |
| `Checkbox` indeterminado: si el consumidor mantiene `indeterminate` tras un clic, no se limpia solo | §2 | Documentar o resolver en el contrato |

## 6. Gate de F2

| Criterio del roadmap | Estado |
| --- | --- |
| T1 completo en ambos frameworks | **Cumplido** (24 componentes; `FocusScope` absorbido por el motor, §2.7) |
| Contrato y axe verdes | **Cumplido** (jsdom; contraste y navegador real pendientes, §5) |
| Paridad visual verde | **No cumplido**: no hay diff visual |
| Alpha `0.1.0` empaquetada y validada como tarballs | **Cumplido** (§4) |

Decisión pendiente para el propietario: cerrar F2 con la paridad visual y Playwright como primera tarea de F3, o hacerlos antes de abrir F3.
