# F1-T07 · Spike del pipeline de paridad con `Button`

> **Estado:** completado (2026-11-22). Código desechable en [`spikes/button-parity`](../../spikes/button-parity) (`private`, nunca publicado). No confundir con el «S2» de [`S2-zag-validation.md`](S2-zag-validation.md), que es la segunda validación de Zag.js.
> **Pregunta:** ¿se puede ir de **un contrato** a Vue y React con comportamiento, API, snippets y píxeles demostrablemente iguales, usando solo el diseño de `06` §4 y `component-architecture.md` §5?
> **Respuesta:** sí. Los cuatro mecanismos (P1–P4) funcionan sobre `Button` y se pueden promover a `@tessen-ui/core` (F1-T08) casi tal cual.

## 1. Qué se construyó

| Pieza | Dónde (en el spike) | Destino previsto |
| --- | --- | --- |
| `defineVariants` (puro, sin framework): `{ class, attrs }` desde props; enumeradas → `data-<x>`, booleanas solo si `true`; valor inválido lanza `RangeError` | `src/core/variants.ts` | `core/variants` |
| `defineContract` + tipos de caso (**casos como datos**: props neutrales → pasos → expectativas) | `src/core/contract.ts` | `core/contracts` |
| Contrato de `Button` (7 props, anatomía, 11 casos) | `src/core/button.contract.ts` | `core/contracts/button.contract.ts` |
| `generateSnippet(contract, 'vue' \| 'react', props)` | `src/core/codegen.ts` | `core/codegen` |
| CSS único de `Button` (capa `tessen.components`, solo tokens semánticos y `--t-button-*`) | `src/css/button.css` | `styles/src/components/button.css` |
| `Button.vue` (SFC) y `Button.tsx` | `src/vue`, `src/react` | `packages/vue`, `packages/react` |
| Runner de contrato sin imports de framework + adaptadores VTU / RTL | `test/runner.ts`, `test/*.adapter.ts(x)` | junto a cada implementación |
| Diff visual Vue↔React con Playwright | `scripts/parity.ts`, `harness/` | `integration/parity` |

## 2. Resultados por mecanismo

| Mecanismo | Resultado | Evidencia |
| --- | --- | --- |
| **P2 · Suite de contrato** | 11 casos × 2 frameworks = 22 verdes con el **mismo** runner. Una mutación deliberada (quitar `aria-busy` en Vue) hace fallar 3 tests: los casos no son decorativos | `test/contract.test.ts` |
| **Paridad de DOM** (apoyo a P2) | 36 combinaciones (5 variantes × 2 tonos × 3 tamaños + estados + iconos + `label` vacío) producen **el mismo DOM normalizado** en Vue y React | `test/parity.test.ts` |
| **P1 · Paridad de API** | Prototipo funcional: Vue por `component.props` en tiempo de ejecución; React por la API del compilador de TypeScript sobre `ButtonProps`. Ambos deben declarar todas las props del contrato; Vue no puede declarar más | `test/parity.test.ts` |
| **P4 · Compilación de snippets** | 6 descripciones × 2 frameworks: el snippet generado se compila (plantilla Vue en tiempo de ejecución; JSX con TypeScript) y renderiza **lo mismo** que el componente directo | `test/codegen.test.tsx` |
| **P3 · Paridad visual** | 8 escenarios (claro/oscuro × estático, `:hover`, `:focus-visible` por teclado, `:active`) con la matriz completa de 40 botones: **0 píxeles distintos** (umbral: ≤ 0,1 %). Chrome 158 estable, Windows, 760×~690 px por panel | `pnpm parity` |

Total: 74 tests (`pnpm test`) + 8 escenarios visuales (`pnpm parity`). `pnpm lint`, `deps:check`, `scope:check` y `typecheck` del spike en verde.

## 3. Hallazgos

1. **El contrato como datos basta.** Un caso es `props neutrales → pasos (click, focus, Enter, Space) → expectativas (rol, nombre, atributos presentes/ausentes, partes, clics, foco)`. El runner no importa Vue ni React; cada adaptador solo traduce props (`onClick`/`@click`, `leadingIcon`/slot `leading`). El mismo vocabulario servirá a docs y Playground.
2. **La paridad visual entre frameworks no necesita baselines.** Se comparan dos renders entre sí en la misma ejecución: no hay imágenes versionadas ni ruido de máquina. Las baselines (regresión contra el pasado) son un mecanismo distinto y siguen pendientes de `10` §5.
3. **Un diff real se detecta.** La primera ejecución dio 0,87 % en `hover`: no era divergencia sino un artefacto del harness (la captura del segundo panel hacía scroll y el puntero dejaba de estar sobre el botón). Subir el viewport lo resolvió. Lección para `integration/parity`: **evitar scroll** (o fijar la posición del puntero tras cada captura) en escenarios con puntero.
4. **Chrome del sistema vía `playwright-core` (`channel: 'chrome'`) funciona sin descargar navegadores.** En CI Linux habrá que instalar Chromium (`playwright install chromium`, gratuito); **no se ha probado en CI**.
5. **Booleanos entre frameworks.** Vue convierte un `Boolean` ausente en `false`; React deja `undefined`. Como `defineVariants` solo emite `data-block` si vale `true`, ambos dan el mismo DOM. Las props enumeradas en Vue necesitan `withDefaults(..., { variant: undefined, ... })` para delegar el valor por defecto a `defineVariants` y no duplicarlo.
6. **Espaciado en snippets Vue multilínea.** Con slots con nombre el snippet es multilínea y el compilador condensa el salto de línea en un espacio colapsable alrededor de la etiqueta (` Next `). No tiene efecto visual. La comparación P4 recorta espacios; si no se quiere ese ruido, el generador puede emitir la etiqueta en línea con el último `</template>`.
7. **El tipado del snippet React no se comprueba.** P4 transpila y renderiza, pero `transpileModule` no valida tipos (props inexistentes pasarían). Para F1-T09 conviene compilar los snippets con `tsc` en `integration/vite-react` (`vue-tsc` en Vue).
8. **Brecha en el contrato de `Button`.** Faltan casos para `class`/`style` y atributos nativos del consumidor (`aria-label`, `data-*`), `ref` y `IconButton` (`label` obligatorio por tipo). Vue los hereda por *fallthrough* y React por `...rest`: distinto mecanismo, mismo requisito, y hoy no está comprobado.
9. **CSS: `secondary` + `tone=danger` se ve igual que el neutro.** Es una decisión de diseño pendiente (no del pipeline); se anota para F2.
10. **Los casos de `loading` que dependen de CSS** (ancho conservado, spinner centrado) no se pueden comprobar en jsdom; se ven en el diff visual pero no hay aserción de layout. Candidato a un caso de contrato «solo navegador» (misma etiqueta que en el spike S2 de Zag).

## 4. Qué entra en `@tessen-ui/core` (F1-T08) y qué no

Cumple la regla anti-abstracción de `06` §3.3 (puro TS, usado por Vue **y** React o por docs/Playground):

- Entra: `defineVariants`, `defineContract` + tipos (`ContractCase`, `Step`, `Expectation`, `NeutralProps`), `generateSnippet`.
- Se queda por framework: SFC/TSX, adaptadores de test (VTU/RTL), runner (solo comparte tipos con el contrato).
- `NeutralProps` es genérico hoy para `Button` (`label`, `leading`, `trailing`). Al llegar `Field`/`Tabs` habrá que decidir si se generaliza (`slots`, `children`) o si cada contrato tipa sus propios casos. **No se anticipa aquí.**
- Pendiente de decidir en T08: cómo se escribe el contrato de un componente compuesto (partes y eventos), que este spike no ejercita.

## 5. Veredicto

**Gate de la Fase 1 (parte «pipeline de paridad demostrado con `Button`»): cumplido.** Sin cambios en ADR 0004. [ADR 0009](13-architecture-decisions/0009-testing-contracts-and-parity.md) gana evidencia (contrato como datos + P1–P4 operativos) y se mantiene `Proposed` hasta F2. Siguiente: **F1-T08** (`@tessen-ui/core` mínimo) y después **F1-T09** (validación por tarballs).
