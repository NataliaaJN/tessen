# 07 — Sistema de motion

> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[H]** hipótesis · **[R]** recomendación.
> Valores numéricos *(inicial)*: se calibran en Fase 1–2 con pruebas reales de sensación y rendimiento.

## 1. Objetivos y principios

Tessen quiere que el motion sea parte de su identidad, pero **opcional, coherente y barato**.

Principios (adaptados de Fluent 2 **[V]**: *Functional, Natural, Consistent, Appealing*; y de la filosofía de rM *«el movimiento explica»* **[V]**):

1. **Funcional**: cada animación comunica un cambio (aparece, se mueve, confirma). Sin decoración gratuita en componentes base.
2. **Natural**: curvas con aceleración/desaceleración; entradas `decelerate`, salidas `accelerate`; elementos grandes tardan más.
3. **Consistente**: ningún componente define sus propios `ms`/curvas; todo sale de tokens y presets.
4. **Atractivo con medida**: lo expresivo vive en la capa creativa opcional.
5. **Opcional y degradable**: `off` produce el estado final sin transición; nunca bloquea la interacción.

## 2. Arquitectura por capas

| Capa | Qué es | Peso | Dónde | Quién la usa |
|---|---|---|---|---|
| **L0 · CSS** | Tokens + `transition`/`@keyframes` + `@starting-style` + `prefers-reduced-motion` | 0 JS | `@tessen/styles` | **Todos** los componentes base (hover, press, focus, expand, spinner, skeleton, entrada/salida simples) |
| **L1 · `@tessen/motion`** | Presets como datos + runtime sobre **Web Animations API** (stagger, scroll-reveal, secuencias, control global, limpieza) | pequeño (objetivo ≤ 4 kB gzip *(inicial)*) | `packages/motion` | Componentes que lo necesiten (Toast, Dialog con salida, Tabs indicador) y la capa creativa |
| **L2 · Motor avanzado opcional** | Motion (motion.dev) para *layout animations*, resortes, gestos; GSAP solo si Fase 7 lo exige | variable | adaptador opcional, `peerDependencies` opcionales | Componentes creativos y usuarios que lo pidan |

### 2.1 Por qué estas tecnologías (comparativa)

| Tecnología | Fortalezas | Limitaciones | Rol en Tessen |
|---|---|---|---|
| **CSS transitions/animations** | Cero JS, composite en GPU, SSR sin coste, respetan `prefers-reduced-motion` por media query | Sin resortes reales (salvo `linear()` aproximado), difícil secuenciar, salida de elementos al desmontar requiere ayuda | **L0 por defecto** |
| **Web Animations API** | Nativo, cancelable/pausable, secuencias con `finished`, mismo motor que CSS, soporte amplio **[C]** | Sin resortes nativos, API de bajo nivel | **L1** (runtime propio fino) |
| **Motion (motion.dev)** | MIT, motor híbrido rAF + WAAPI, APIs para JS/React/Vue (`motion-v`), resortes, layout, gestos **[V]** | Dependencia mayor; abstracciones propias; peso si se usa completo | **L2 opcional** |
| **GSAP** | Muy potente (ScrollTrigger, SplitText, MorphSVG); **ahora gratuito incluidos plugins** bajo licencia estándar desde 2025-04-30 **[V]** | Licencia propia (no MIT) con exclusión para herramientas de animación visual sin código que compitan con Webflow **[V]**; peso; ciclo de vida manual | **No en v1**; evaluar solo en Fase 7 y aislado |
| **CSS scroll-driven animations (`animation-timeline`)** | Sin JS para scroll-reveal/parallax | Soporte no universal **[C]** | Con *fallback* a IntersectionObserver en L1 |
| **View Transitions API** | Transiciones entre páginas/estados nativas | Soporte en evolución **[C]** | Recomendación para *page transitions* en apps (docs), no dentro de componentes |

> Tessen **no** construye su propio motor de resortes: si se necesita física real, se delega en L2.

## 3. Tokens de motion

Definidos en `packages/tokens` (DTCG tipos `duration` y `cubicBezier`, **[V]** presentes en la spec estable) y emitidos como CSS variables:

| Token | Valor *(inicial)* | Uso |
|---|---|---|
| `motion.duration.instant` | `0ms` | Estado final inmediato |
| `motion.duration.fast` | `100ms` | Hover, press, foco, tooltips |
| `motion.duration.normal` | `200ms` | Apertura de menús/popovers, cambios de estado |
| `motion.duration.slow` | `300ms` | Diálogos, drawers, acordeones grandes |
| `motion.duration.slower` | `500ms` | Transiciones de página/escena, creativos |
| `motion.easing.standard` | `cubic-bezier(.2,0,0,1)` | Cambios dentro de pantalla |
| `motion.easing.decelerate` | `cubic-bezier(0,0,0,1)` | **Entradas** |
| `motion.easing.accelerate` | `cubic-bezier(.3,0,1,1)` | **Salidas** |
| `motion.easing.emphasized` | `cubic-bezier(.2,0,0,1)` (+ `linear()` con *overshoot* opcional) | Énfasis puntual |
| `motion.distance.{xs,sm,md}` | `4 / 8 / 16 px` | Desplazamientos de entrada/salida |
| `motion.stagger.step` / `max` | `40ms` / `8` | Escalonado; tope para no alargar listas |
| `motion.scale.press` | `0.98` | Feedback al pulsar |

Reglas de duración: salida ≈ 60–70 % de la entrada; elementos mayores → más tiempo; distancia mayor → más tiempo; **nada > 500 ms** en componentes base.

## 4. Presets

Un **preset** es un dato: `{ keyframes, options }` expresado con tokens. Se usa tanto en L0 (generado a `@keyframes` CSS) como en L1 (WAAPI).

| Preset | Tipo | Definición resumida |
|---|---|---|
| `fade` | in/out | opacity 0↔1 |
| `slide-up` / `slide-down` / `slide-left` / `slide-right` | in/out | translate `distance.sm` + fade |
| `scale-in` | in | scale .98→1 + fade (diálogos, popovers) |
| `pop` | in | scale .9→1 con `emphasized` (menús contextuales, toasts) |
| `collapse` | in/out | altura/`grid-template-rows` 0↔1fr |
| `press` | interacción | scale `.98` |
| `shake` | feedback | translateX ±4px 3 ciclos (error) — no si reduced |
| `stagger-children` | secuencia | aplica `slide-up` con `stagger.step` |
| `reveal-on-scroll` | scroll | fade + `slide-up` al entrar en viewport (una vez) |
| `text-reveal` | texto | por palabra/línea con máscara (creativo) |
| `counter` | valor | interpola número con `ease-out` (creativo) |

Los presets creativos (`text-reveal`, `counter`, `parallax`…) viven en la entrada `@tessen/motion/creative`.

## 5. API y configuración

### 5.1 Control global y por componente

```html
<html data-tessen-motion="full">   <!-- off | reduced | full -->
```
- `full`: presets completos. `reduced`: se eliminan **desplazamientos, escalas y rotaciones**, se conservan fundidos cortos (≤ `fast`). `off`: sin transiciones.
- Sin atributo: se sigue `prefers-reduced-motion` (`reduce` → `reduced`).
- **El usuario del SO manda**: si el SO pide reducir, `full` no se aplica salvo override explícito y documentado (`data-tessen-motion="full" data-tessen-motion-override`).

Por componente (props):
```ts
motion?: false | 'default' | PresetName | { preset: PresetName; duration?: DurationToken|number; easing?: EasingToken|string; delay?: number }
```
- `false` = sin animación · `'default'` = preset del contrato · `PresetName` = otro preset · objeto = personalizado.

Configuración global por framework: plugin Vue `createTessen({ motion: { mode: 'full', presets: { 'dialog-in': {...} } } })` / `<TessenProvider motion={...}>` React. Los overrides de presets se registran por nombre (**tokenizados**, no valores sueltos).

### 5.2 `@tessen/motion` (L1) — superficie pública *(inicial)*

```ts
animate(el, preset | keyframes, options?) : Controls   // play/pause/finish/cancel, thenable (finished)
presence(el, { in, out })                              // anima salida antes de desmontar
stagger(elements, preset, { step, from })              // secuencias
inView(el, cb, { once, margin })                       // IntersectionObserver
scrollProgress(el, cb)                                 // scroll-timeline si existe; si no, fallback
resolveMotionMode(root?)                               // 'off'|'reduced'|'full'
registerPreset(name, definition)
```
Adaptadores finos: `@tessen/vue` (`useMotion`, directiva `v-motion`) y `@tessen/react` (`useMotion`, `<Presence>`). **Ninguna** lógica de decisión (qué anima, cuánto) vive en los adaptadores; solo ciclo de vida.

## 6. Ciclo de vida y limpieza

| Problema | Regla |
|---|---|
| Fugas al desmontar | Toda animación creada por un componente devuelve `Controls`; el adaptador llama `cancel()` en `onBeforeUnmount` (Vue) / cleanup de `useEffect` (React) |
| Strict Mode (React) | `animate` idempotente: doble montaje cancela y reinicia sin parpadeo |
| Salida animada | `presence` retiene el nodo hasta que `finished` resuelva (o expire un *timeout* de seguridad `slower + 100ms`) |
| Listeners (scroll/IO) | un solo `IntersectionObserver` compartido por *margin*; se desuscribe al desmontar |
| Interrupciones | una animación nueva sobre el mismo elemento cancela/compone la anterior desde el estado actual (`commitStyles`) |
| SSR | L1 no se ejecuta en servidor; el estado inicial se renderiza **ya visible** salvo `reveal` (que usa CSS `@starting-style`/`animation-timeline` o clase tras hidratar para evitar *flash*) |

## 7. Accesibilidad y rendimiento

**Accesibilidad**
- `prefers-reduced-motion` respetado en CSS (`@media`) y JS (`resolveMotionMode`). Criterio WCAG 2.3.3 (AAA) como práctica y 2.2.2 (pausar contenido en movimiento > 5 s: `Marquee` con botón de pausa).
- Nada parpadea > 3 veces/s (2.3.1).
- Efectos de puntero (`Spotlight`, `Magnetic`, `CursorEffects`) **solo** con `pointer: fine` y `hover: hover`; el contenido no depende de ellos.
- Los textos animados (`TextReveal`) mantienen el texto completo accesible (`aria-label`/contenido original, partes `aria-hidden`).

**Rendimiento**
- Animar **solo** `transform` y `opacity` (composite) en componentes base; `filter`/`clip-path` bajo demanda y probados; evitar animar `width/height/top/left`.
- `will-change` solo durante la animación (lo gestiona L1), nunca permanente.
- Altura automática: `grid-template-rows: 0fr→1fr` o `interpolate-size` con *fallback* **[C]**.
- Presupuesto: L0 = 0 B de JS; L1 ≤ 4 kB gzip; cada componente creativo declara su coste y se carga por separado (`import()`).
- Medición: tests de rendimiento (Playwright trace + `long-animation-frame`/`PerformanceObserver` **[C]**) en componentes creativos antes de publicar.

## 8. Cómo se ve el «sin animación, por defecto, personalizada»

| Modo | Cómo se logra | Coste |
|---|---|---|
| **Sin animación** | `motion={false}` por componente o `data-tessen-motion="off"` global | 0 |
| **Por defecto** | L0 CSS (siempre) + L1 solo en componentes que animan salidas/secuencias; si el consumidor no importa `@tessen/motion`, los componentes **degradan a L0** (aparecen/desaparecen con fundido CSS) | CSS ya incluido |
| **Personalizada** | `motion={{ preset, duration, easing }}` o `registerPreset` / override de tokens CSS (`--tessen-motion-duration-normal: 300ms`) | opt-in |

> Nota de diseño: `@tessen/motion` es **dependencia opcional** (peer opcional) de `vue`/`react`; los componentes la importan dinámicamente solo cuando una prop de motion avanzada lo requiere.

## 9. Referencias y contenido de «laboratorio»

La plataforma incluirá una sección **Motion** (inspirada en el *Motion lab* de rM, que presenta 55 experimentos categorizados con descripción y gesto de prueba **[V]**) con: tokens interactivos (curvas editables), presets reproducibles y guía de uso. Se construye en Fase 4–5 sobre los presets reales (no maquetas).

## 10. Riesgos

| Riesgo | Mitigación |
|---|---|
| Que cada componente «invente» su animación | Lint/regla de revisión: prohibido `transition: … Xms` literal en `styles` (stylelint `declaration-property-value-disallowed-list` o regla propia **[R]**) |
| Doble implementación CSS/WAAPI diverge | Presets como **datos**; el generador produce ambos |
| Peso de L2 | Opt-in, `peerDependencies` opcionales y entrada separada |
| Licencia GSAP | No se incorpora en v1; si se evalúa en Fase 7 se revisa la licencia vigente en ese momento |
