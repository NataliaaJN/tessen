# 06 — Arquitectura multiframework (Vue + React)

> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[H]** hipótesis · **[R]** recomendación.
> Estado: propuesta. La parte «motor de comportamiento» (§3.3) está condicionada al **spike S1** (ver `11`, Fase 1).

## 1. El problema

Compartir **todo lo que tenga sentido** entre Vue y React sin: (a) mantener dos librerías que divergen, ni (b) forzar APIs artificiales a base de un mínimo común. Los componentes deben sentirse naturales: `v-model`, slots y emits tipados en Vue; `value/onValueChange`, `children`, refs en React.

## 2. Estrategias evaluadas

| | **A. Dos librerías nativas independientes** | **B. Web Components + wrappers** | **C. Motor headless compartido + adaptadores nativos + CSS compartido** | **D. Fundamentos compartidos + comportamiento duplicado** | **E. Escribir una vez y transpilar** (p. ej. Mitosis **[C]**) |
|---|---|---|---|---|---|
| Descripción | Cada framework implementa todo (p. ej. Radix/Base UI en React + Reka UI en Vue) | Lit/FAST/Stencil: un elemento, consumido desde ambos | Máquinas de estado/ARIA en un motor agnóstico (Zag.js); cada framework renderiza con su sintaxis; CSS único | Tokens, CSS, variantes y contratos comunes; cada framework reimplementa estado y ARIA | Un fuente genera Vue y React |
| Paridad de comportamiento | Baja: dos motores distintos **[V: ecosistema ya separa Reka (Vue) y Radix/Base UI (React)]** | Alta (un solo código) | **Alta por diseño** (misma máquina) **[V: Ark UI lo hace para 4 frameworks]** | Media: depende de disciplina y tests | Alta pero con output genérico |
| Naturalidad en el framework | Máxima | Media-baja: eventos/propiedades/slots son cosas del DOM, no de Vue/React; en React 19 mejoró (props como propiedades, eventos) **[V]** | Alta (render nativo) | Máxima | Baja-media |
| SSR / hidratación | Excelente | Frágil: Shadow DOM declarativo, hidratación y registro de elementos aún presentan fricciones **[V: ref. a la ausencia de *scoped registries* y a problemas con Shadow DOM]**; **[H]** más riesgo con Next/Nuxt | Excelente (no hay Shadow DOM) | Excelente | Depende |
| Accesibilidad | Depende de cada motor | Shadow DOM complica relaciones ARIA entre fronteras (`aria-labelledby`, formularios) **[C]** | Buena y **única** | Duplicada | Heredada del generador |
| Estilos | Compartibles | Encapsulados (theming vía CSS variables/`::part`) | **Compartidos 100 %** (CSS global con capas) | Compartidos | Compartidos |
| DX (tipos, autocompletado) | Excelente | Tipos extra y manifiestos (CEM) | Excelente | Excelente | Mala (depurar código generado) |
| Mantenibilidad | **Mala** (dos bases de código) | Buena en código, regular en integración | **Buena** (el pegamento es fino) | Regular | Regular-mala (depender del generador) |
| Complejidad | Alta (x2) | Media + puentes | Media | Alta (x2 en lógica) | Media-alta |
| Riesgo principal | Divergencia | Fricción de integración y SSR | Dependencia de un motor externo | Divergencia | Madurez de la herramienta |

**Decisión [R] (ADR 0003 y 0004):** estrategia **C** como base, con **D como plan de contingencia explícito** si el spike S1 falla (se mantienen tokens, CSS, variantes y contratos; se sustituye el motor por implementaciones nativas por framework, empezando por los componentes que lo necesiten). **B** se descarta para v1 y se reevalúa si aparece demanda real de usuarios sin framework (disparador documentado en el ADR). **A** se descarta por contradecir el requisito «no dos librerías independientes». **E** se descarta por riesgo de APIs artificiales.

## 3. Arquitectura propuesta

### 3.1 Mapa de paquetes (modificación razonada de la hipótesis inicial)

```text
packages/
  tokens/   Fuente DTCG canónica + build (CSS/TS/JSON/Tailwind)
  theme/    API de theming en runtime y utilidades (OKLCH, contraste, createTheme, export)
  styles/   CSS de reset opcional, base y componentes + capas + importación de tokens
  icons/    SVG fuente + generación de componentes (vue/react) y sprite
  core/     Contratos, variantes (puras), codegen de snippets, tipos neutrales
  motion/   Presets y runtime de animación (WAAPI), agnóstico de framework
  vue/      @tessen/vue   — component-oriented
  react/    @tessen/react — component-oriented
apps/
  docs/  theme-studio/  playground/        — feature-first
integration/   (privado) apps consumidoras de prueba: vite-vue, vite-react, nuxt, next
tooling/       (privado) tsconfig, eslint, vite-config compartidos, scripts de docs-gen
```

**Cambios respecto a la hipótesis inicial:**

| Cambio | Motivo |
|---|---|
| **No se crea `packages/utils`** | «Utils» tiende a convertirse en cajón de sastre. Se crea **solo** cuando ≥ 2 paquetes necesiten el mismo helper puro y no encaje en `core`. Hasta entonces los helpers viven en el paquete que los usa. |
| `theme` se **mantiene** pero se acota | Es la lógica de Theme Studio (escalas OKLCH, contraste, serialización) que no debe vivir en una app y que los usuarios pueden usar por código. Los *valores* de los temas viven en `tokens`. |
| `icons` expone subrutas `./vue` y `./react` | Los iconos son por naturaleza framework-específicos en su capa final; se generan desde un único SVG. `vue`/`react` como `peerDependencies` **opcionales**. |
| `integration/` y `tooling/` añadidos como espacios de trabajo **privados** | Necesarios para tests de integración/SSR y configuración compartida; no se publican. |

### 3.2 Dirección de dependencias entre paquetes

```text
tokens ◄── theme
tokens ◄── styles        (en build: importa CSS generado de tokens)
tokens ◄── motion        (valores de duración/easing como TS generado)
core   (sin dependencias de paquetes Tessen)
icons  (sin dependencias de paquetes Tessen)

vue    ──► core, motion*, icons*     (* opcional/peer)   + @zag-js/*   + peer: vue
react  ──► core, motion*, icons*                          + @zag-js/*   + peer: react, react-dom
apps   ──► vue/react, styles, theme, core, icons, motion, tokens
```

Reglas: **`vue` ↮ `react`** (jamás se importan); nada en `packages/*` importa de `apps/*`; `core`, `tokens`, `theme`, `styles` **no importan Vue ni React** (lint). Reglas completas y configuración en `docs/architecture/dependency-rules.md`.

### 3.3 Qué se comparte y qué no

| Se comparte (una sola vez) | Dónde | Cómo se consume |
|---|---|---|
| Tokens, paletas, tipografía, espaciado, radios, sombras, motion tokens | `tokens` | CSS variables + TS/JSON generados |
| Variables CSS y **estilos de todos los componentes** | `styles` | `import '@tessen/styles'` (o por componente) |
| Temas, escalas, contraste, export | `theme` | Import directo |
| Iconografía | `icons` | SVG → componentes por framework |
| **Lógica de variantes** (qué atributos/clases resultan de `variant/size/tone`) | `core/variants` | Función pura usada por ambos |
| **Contratos** (anatomía, API, teclado, ARIA, motion, casos de prueba) | `core/contracts` | Docs, Playground, tests de paridad, agentes |
| Generación de snippets Vue/React | `core/codegen` | Docs y Playground |
| Presets y runtime de animación | `motion` | Funciones puras + helpers por framework |
| **Comportamiento complejo** (foco, teclado, posicionamiento, estado) | Motor Zag.js | Adaptadores `@zag-js/vue` y `@zag-js/react` dentro de `vue`/`react` |
| Documentación, guidelines, tests de contrato (datos) | `apps/docs`, `core` | MDX + datos |

| **No** se comparte (decisión consciente) | Por qué |
|---|---|
| Código de componentes (SFC vs TSX) | Cada framework usa sus reactividad, slots/children, refs, ciclo de vida |
| Tipos de props ni de eventos | Vue (`PropType`, emits) y React (`ReactNode`, `ComponentProps`) divergen; se mapean desde el contrato |
| Harness de pruebas de montaje | Cada framework usa sus herramientas (VTU / RTL) |
| Composables vs hooks | Mismo propósito, implementaciones separadas y finas |

**Regla anti-abstracción** [R]: nada se mueve a `core` por «anticipación». Para entrar en `core` debe (1) ser puro TS sin DOM de framework, y (2) estar usado por **Vue y React** (o por docs/playground).

### 3.4 Cómo se ve un componente compuesto (ilustrativo)

```text
Dialog contract (core)  ──────────────►  docs / playground / paridad / agentes
        │
        ├─ Vue:   Dialog.vue   usa  useMachine(dialog.machine) + normalizeProps  (@zag-js/vue)
        └─ React: Dialog.tsx   usa  useMachine(dialog.machine) + normalizeProps  (@zag-js/react)
                    │
                    └─ ambos renderizan partes con clases `t-dialog*` + atributos del motor
                       y el CSS único de @tessen/styles/components/dialog.css
```

El código de cada implementación es el «pegamento» fino: mapear props ↔ `machine context`, eventos ↔ `onOpenChange`, slots/children ↔ partes, y animación de salida (`Presence`). **[C]** Ark UI usa exactamente este patrón.

### 3.5 Convenciones de API por framework

| Aspecto | Vue (`@tessen/vue`) | React (`@tessen/react`) |
|---|---|---|
| Nombre de componente | `TButton`, `TDialog`, `TDialogContent` (prefijo `T`: evita colisión con elementos HTML y respeta la guía de nombres multi-palabra de Vue **[C]**) | `Button`, `Dialog`, `DialogContent` |
| Valor controlado | `v-model` / `v-model:open` (`defineModel`) | `value` + `onValueChange`, `open` + `onOpenChange` |
| Eventos | `emit` tipados (`update:modelValue`, `click`) | callbacks `onX` |
| Composición | Slots con nombre (`#leading`) y subcomponentes | `children` y subcomponentes; props de ReactNode para huecos simples |
| Atributos nativos | `$attrs` con `inheritAttrs` deliberado | `...rest`, `className`, `style`, `ref` |
| Utilidades reactivas | composables `useTheme()`, `useMotion()` | hooks `useTheme()`, `useMotion()` |
| Instalación global | plugin `createTessen({ motion, theme })` (opcional; registrar componentes **no** es requisito: se importan explícitamente) | `<TessenProvider>` (opcional) |
| Refs | `defineExpose` solo cuando necesario | `ref` como prop (React 19) / `forwardRef` (18.x) **[C]** |

Ejemplos de la API deseada (no definitiva):
```ts
import { TButton } from '@tessen/vue'       // Vue
import { Button } from '@tessen/react'      // React
import '@tessen/styles'                     // CSS (una vez)
```

### 3.6 Distribución y compatibilidad

- **ESM puro** con declaraciones `.d.ts`; sin CJS salvo petición justificada. `exports` map por componente (`@tessen/react/button`) **generado** por script para evitar drift; barrel raíz con `"sideEffects": ["**/*.css"]`.
- **Peers**: `vue ^3.5`, `react ^18.3 || ^19`, `react-dom` equivalente. Se usan APIs de 3.5 (`useId`, `defineModel`) tras comprobar el rango declarado **[C]**.
- **CSS no se importa desde JS** en los paquetes de componentes: el consumidor importa `@tessen/styles` (todo) o `@tessen/styles/components/<x>.css`. Ventajas: un único CSS para ambos frameworks, SSR/CSP simples, tree-shaking de CSS explícito.
- **SSR**: ids con `useId`; sin acceso a `window` en render; *portals* y posicionamiento solo tras montar; fixtures Nuxt y Next en `integration/`.
- **Tailwind**: opcional (puente CSS-first de `tokens`). Los paquetes **no** requieren Tailwind ni incluyen su *preflight*.
- **Versionado**: Changesets, **versiones enlazadas** (`fixed`/`linked`) para `vue` y `react` para que una versión signifique lo mismo en ambos; `tokens/theme/styles` también enlazadas al *minor*.

## 4. Paridad: cómo se garantiza (D1 de `01`)

| Mecanismo | Qué detecta | Dónde corre |
|---|---|---|
| **P1 · Paridad de API**: script lee tipos de Vue (`vue-component-meta` **[C]**) y React (TS compiler API/`react-docgen-typescript` **[C]**) y compara con el contrato (props, valores permitidos, eventos) | Props que faltan o difieren | CI (`pnpm parity:api`) |
| **P2 · Suite de contrato**: casos del contrato (teclado, ARIA, estados) ejecutados en VTU y RTL | Divergencia de comportamiento | Vitest, por framework |
| **P3 · Paridad visual**: la misma historia renderizada en ambos frameworks se captura con Playwright y se compara entre sí y contra baseline | Divergencia de apariencia | CI con Docker (render estable) |
| **P4 · Compilación de snippets**: los snippets generados por `core/codegen` se compilan en una app Vue y una app React | Código generado inválido | CI (`integration/`) |
| **P5 · Definition of Done** de `cross-framework-component` (skill del repo) | Procesos saltados | PR template |

Umbral inicial de paridad visual *(inicial, a calibrar)*: ≤ 0.1 % de píxeles distintos con tolerancia anti-aliasing por defecto.

## 5. Riesgos específicos

| Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|
| El motor (Zag.js) no cubre un componente o impone API incómoda | Media | Medio | Spike S1; capa de adaptación propia por componente; contingencia D |
| Cambios *breaking* en el motor | Media | Medio | Versión fijada (`~`), tests de contrato, ADR de actualización |
| Divergencia gradual de ejemplos/docs | Media | Alto | `?raw` + `docs:check`; paridad en CI |
| Sobre-abstracción en `core` | Media | Medio | Regla anti-abstracción (§3.3) y revisión en PR |
| Peso de dependencias del motor por componente | Baja-media | Medio | Importar solo máquinas usadas; `size-limit` en CI |
| Cuota de mantenimiento de dos adaptadores | Alta (inherente) | Medio | Plantilla y generador de esqueletos (`pnpm new:component`) tras los 5 primeros componentes |

## 6. Criterios de salida del spike S1 (decide el motor)

Implementar `Dialog`, `Select` (o `Tabs`) y `Tooltip` en Vue y React con Zag y medir:

1. Paridad: misma suite de contrato verde en ambos con **≤ 15 %** de código distinto en lógica.
2. a11y: 0 violaciones axe + checklist de teclado APG completo.
3. SSR: hidratación sin avisos en Nuxt y Next.
4. Bundle: `Dialog` ≤ X kB gzip (umbral fijado al inicio del spike según tamaño de la máquina + adaptador).
5. DX: API pública natural (sin filtrarse conceptos del motor).
6. Animación de salida resoluble limpiamente.

Si ≥ 5/6 se cumplen → motor aprobado. Si no → ADR 0004 se actualiza hacia estrategia D (o Ark UI/Radix+Reka según el motivo del fallo).
