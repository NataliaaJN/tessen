# 03 — Requisitos de producto

> Prioridad: **P0** imprescindible v1.0 · **P1** importante (segunda fase, v1.x) · **P2** avanzado/posterior.
> «Fase» remite a `11-roadmap.md`. Los IDs son estables y se referencian desde tests, ADRs y el roadmap.

## 1. Requisitos funcionales

### 1.1 Fundamentos y theming (FND)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| FND-01 | Fuente canónica de tokens en formato DTCG 2025.10 (JSON) con 3 capas: primitivo, semántico, componente | P0 | 1 |
| FND-02 | Generación determinista de CSS custom properties (`--tessen-*`), TypeScript, JSON y puente Tailwind v4 | P0 | 1 |
| FND-03 | Temas `light` y `dark` completos, selección explícita (`data-tessen-theme`) y estrategia `prefers-color-scheme` documentada | P0 | 1 |
| FND-04 | Modo de alto contraste/`forced-colors` soportado en componentes base | P1 | 2 |
| FND-05 | Escalas de densidad (`data-tessen-density`: compact/default/comfortable) y radio base derivable | P1 | 2 |
| FND-06 | Sistema de iconos (`@tessen/icons`) con componentes Vue/React generados y sprite SVG opcional | P0 | 1 |
| FND-07 | Estilos base opcionales (reset/typography) **separados** de los estilos de componentes; ninguno obligatorio | P0 | 1 |
| FND-08 | Validación automática de tokens: ciclos de alias, referencias sin resolver, completitud por tema, contraste | P0 | 1 |

### 1.2 Componentes (CMP)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| CMP-01 | Cada componente público tiene **contrato** framework-neutral (anatomía, variantes, estados, teclado, ARIA, motion) antes de implementarse | P0 | 2 |
| CMP-02 | Implementación nativa en `@tessen/vue` (SFC, `defineProps/Emits/Slots`, `v-model`) | P0 | 3 |
| CMP-03 | Implementación nativa en `@tessen/react` (props, `children`, `value`/`onValueChange`, `ref` como prop/forwardRef según peer) | P0 | 3 |
| CMP-04 | Imports individuales y tree-shaking verificado (`@tessen/react/button` o barrel con `sideEffects` correctos) | P0 | 2 |
| CMP-05 | Componentes complejos usan un motor de comportamiento compartido (ADR 0004) | P0 | 2 |
| CMP-06 | Todos los componentes soportan los 3 modos de motion: sin animación / por defecto / personalizado | P0 | 2 |
| CMP-07 | Catálogo inicial v1.0: ≥ 25 componentes (ver `05` §4, tier T1+T2) | P0 | 2–3 |
| CMP-08 | Componentes avanzados/creativos opcionales, cargables por separado (`@tessen/vue/creative`) | P2 | 7 |
| CMP-09 | SSR seguro (Nuxt, Next.js): sin acceso a `window` en render, IDs estables | P0 | 2 |

### 1.3 Motion (MOT)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| MOT-01 | Tokens de motion (duración, easing, distancia, stagger) en la fuente canónica | P0 | 1 |
| MOT-02 | Animaciones básicas solo con CSS (sin JS) respetando `prefers-reduced-motion` | P0 | 1 |
| MOT-03 | Paquete `@tessen/motion` con presets, `animate` basado en WAAPI, stagger, scroll-reveal, control global (`off/reduced/full`) | P1 | 2 |
| MOT-04 | Gestión de ciclo de vida: cancelación al desmontar en Vue y React | P1 | 2 |
| MOT-05 | Integración opcional con Motion (motion.dev) para efectos avanzados; GSAP solo si Fase 7 lo exige | P2 | 7 |

### 1.4 Plataforma web (PLT)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| PLT-01 | Home/Overview con filosofía, accesos y componentes destacados | P0 | 4 |
| PLT-02 | Página por componente: descripción, demo interactiva, variantes, tamaños, estados, API, accesibilidad, ejemplos Vue y React, código | P0 | 4 |
| PLT-03 | API Reference generada desde tipos reales + contratos; fallo de CI si hay drift | P0 | 4 |
| PLT-04 | Ejemplos mostrados = ejemplos ejecutados (código importado `?raw` del mismo archivo) | P0 | 4 |
| PLT-05 | Búsqueda global (Ctrl/⌘ K), tabla de contenidos, navegación por categorías | P0 | 4 |
| PLT-06 | Documentación: Getting Started, Installation, Theming, Tokens, Accessibility, Composition, Framework guides | P0 | 4 |
| PLT-07 | Guidelines: principios, uso correcto, accesibilidad, responsive, motion, patrones | P1 | 4–5 |
| PLT-08 | Versionado de documentación y changelog por paquete | P1 | 8 |
| PLT-09 | Recursos: iconos, tokens descargables, snippets, plantillas; kit Figma | P1 | 7 |
| PLT-10 | `llms.txt` y JSON por componente para agentes | P1 | 4 |
| PLT-11 | Internacionalización de la plataforma (ES/EN) | P2 | 8+ |

### 1.5 Theme Studio (THS)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| THS-01 | **Modo rápido**: presets, acento, radio, densidad, motion, claro/oscuro, vista en vivo | P0 | 5 |
| THS-02 | **Modo avanzado**: árbol de tokens editable (semánticos y primitivos), alias, validación | P1 | 5 |
| THS-03 | Generación de escala de acento (OKLCH) y comprobación de contraste WCAG 2.2 en tiempo real | P0 | 5 |
| THS-04 | Previsualización con galería de componentes reales (Vue; CSS es compartido) y plantillas de pantalla | P0 | 5 |
| THS-05 | Guardar (localStorage), importar y exportar temas: CSS, DTCG JSON, Tailwind v4 `@theme`, TS | P0 | 5 |
| THS-06 | Compartir tema por URL (estado codificado y comprimido) | P1 | 5 |
| THS-07 | Deshacer/rehacer, restablecer, comparar con tema base | P1 | 5 |
| THS-08 | Editor de tipografía (familias, escala) con carga de fuentes | P1 | 5 |
| THS-09 | Exportar a Tokens Studio/Figma Variables (formato de intercambio) | P2 | 8+ |

### 1.6 Playground (PLG)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| PLG-01 | Selector de componente, panel de props generado desde el contrato (controles por tipo) | P0 | 6 |
| PLG-02 | Vista previa en vivo en **Vue y React** a partir del mismo estado | P0 | 6 |
| PLG-03 | Generador de código Vue y React (copiar, descargar) que compila sin cambios | P0 | 6 |
| PLG-04 | Controles de estado (hover/focus/disabled/invalid/loading) y de tema (claro/oscuro/custom) | P0 | 6 |
| PLG-05 | Vista responsive con iframe (anchos predefinidos y libre) | P1 | 6 |
| PLG-06 | Restablecer, estado compartible por URL, «Abrir en Playground» desde docs | P1 | 6 |
| PLG-07 | Composición de varios componentes y edición de código en vivo | P2 | 7+ |

### 1.7 Distribución y calidad (DST/QA)

| ID | Requisito | Prio | Fase |
|---|---|---|---|
| DST-01 | Versionado y changelog con Changesets; **publicación npm solo con aprobación explícita del propietario** (hoy: paquetes `private`, distribuibles como tarballs validados) | P0 versionado · P2 publicación | 8 |
| DST-02 | Validación de `exports`/tipos (publint + arethetypeswrong) en CI | P0 | 3 |
| DST-03 | Reglas de dependencias entre capas aplicadas por herramienta (ADR 0013) | P0 | 1 |
| DST-04 | Cada paquete se valida como **tarball** (`pnpm pack`) en proyectos de integración independientes, sin publicar (ADR 0016) | P0 | 1–3 |
| DST-05 | Todo el ciclo (build, tests, docs, Theme Studio, Playground) funciona en local sin servicios de pago; GitHub es la única plataforma externa (ADR 0014) | P0 | 1 |
| QA-01 | Suite de **contrato** ejecutada contra Vue y React | P0 | 3 |
| QA-02 | axe-core automatizado + checklist manual de teclado/lector de pantalla | P0 | 2 |
| QA-03 | Regresión visual por componente/tema y **diff de paridad Vue↔React** | P0/P1 | 3 |
| QA-04 | Fixtures SSR (Nuxt y Next) en integración | P1 | 8 |

## 2. Requisitos no funcionales

| ID | Categoría | Requisito | Verificación |
|---|---|---|---|
| NFR-01 | Accesibilidad | WCAG 2.2 AA como objetivo: contraste 4.5:1 texto / 3:1 iconos y bordes de UI, foco visible (2.4.7/2.4.11), tamaño objetivo ≥ 24 px (2.5.8), navegación completa por teclado | axe, tests de teclado, manual |
| NFR-02 | Tipado | TypeScript `strict`, `exactOptionalPropertyTypes` evaluado, sin `any` en API pública | `tsc`/`vue-tsc` en CI |
| NFR-03 | Rendimiento | CSS completo de componentes ≤ 40 kB gzip (objetivo inicial, revisar en Fase 3); componente individual sin motion JS ≤ 3 kB gzip (sin motor) | size-limit en CI |
| NFR-04 | Tree-shaking | ESM, `sideEffects` correcto, cada componente importable por separado | test de bundle con Vite/esbuild |
| NFR-05 | Dependencias | Runtime mínimas; `vue`/`react` como peers; motion JS y GSAP **opcionales** | `knip`, revisión de `package.json` |
| NFR-06 | SSR | Sin efectos en render, hidratación sin warnings en Nuxt y Next | tests de integración |
| NFR-07 | Compatibilidad | Navegadores *evergreen* (Chrome/Edge/Firefox/Safari últimas 2 versiones mayores); Vue ≥ 3.5; React ≥ 18.3 (probar 19) | matriz Playwright |
| NFR-08 | Temas | Dark mode y densidad sin duplicar implementaciones | tests visuales por tema |
| NFR-09 | Movimiento | `prefers-reduced-motion` respetado en CSS y JS; el modo `off` produce DOM final sin transiciones | tests unitarios + visual |
| NFR-10 | Mantenibilidad | Añadir un componente = contrato + 2 implementaciones + docs, siguiendo plantilla; arquitectura sin dependencias circulares | dependency-cruiser |
| NFR-11 | Documentación | Cero drift de API entre docs y código | `docs:check` en CI |
| NFR-12 | Seguridad de cadena de suministro | `pnpm` con lockfile, comprobación del scope interno (`scope:check`), `provenance` solo si se publica en el futuro, revisión de licencias de dependencias | CI |
| NFR-13 | Internacionalización | Sin cadenas hardcodeadas en componentes (props/slots para etiquetas); soporte `dir="rtl"` desde el diseño (verificación completa P1) | tests RTL |

## 3. Historias de usuario y criterios de aceptación

Formato: *Como* [persona] *quiero* … *para* …  ·  Criterios en Dado/Cuando/Entonces.

### US-01 · Instalar y usar un botón (P1/P2) — FND, CMP — **P0**
- **Dado** un proyecto Vue 3.5 nuevo, **cuando** instalo `@tessen/vue @tessen/styles` e importo el CSS, **entonces** `<TButton>Guardar</TButton>` se renderiza con estilos Tessen sin configuración adicional.
- **Dado** un proyecto React, **cuando** importo `Button` de `@tessen/react`, **entonces** obtengo el mismo aspecto visual (diff de paridad dentro del umbral).
- **Dado** que no uso motion, **cuando** compilo, **entonces** `@tessen/motion` no aparece en mi bundle.

### US-02 · Cambiar el tema sin tocar la librería (P3) — THS-01/05 — **P0**
- **Dado** el Theme Studio, **cuando** elijo un acento y radio, **entonces** toda la vista previa cambia en < 100 ms sin recargar.
- **Cuando** exporto CSS, **entonces** pegarlo en mi app cambia el aspecto de los componentes sin recompilar.
- **Dado** un acento que no cumple 4.5:1 con su texto, **entonces** Theme Studio muestra aviso y propone la variante corregida.

### US-03 · Probar un componente y copiar código (P1/P2) — PLG-01..04 — **P0**
- **Dado** el Playground con `Button`, **cuando** cambio `variant=danger`, `size=lg`, `loading`, **entonces** la vista previa y el código generado se actualizan.
- **Cuando** alterno Vue/React, **entonces** el código está en la sintaxis del framework (`v-model` vs `value/onValueChange`) y **compila sin cambios** (verificado por test de compilación de snippets).

### US-04 · Formulario accesible (P1/P2) — CMP — **P0**
- **Dado** `Field` + `Input` con error, **entonces** el input tiene `aria-invalid`, `aria-describedby` apuntando al mensaje, y el mensaje se anuncia al aparecer.
- **Cuando** navego solo con teclado, **entonces** el orden de tabulación es lógico y el foco es visible (contraste ≥ 3:1).

### US-05 · Diálogo modal (P1/P2) — CMP — **P0**
- **Cuando** abro `Dialog`, **entonces** el foco se mueve dentro, queda atrapado, `Esc` cierra y el foco vuelve al disparador; el resto de la página queda inerte.
- **Con** `prefers-reduced-motion: reduce`, **entonces** no hay animación de escala/desplazamiento (solo cambio de opacidad ≤ 100 ms o ninguna).

### US-06 · Documentación siempre sincronizada (P4) — PLT-03/04 — **P0**
- **Dado** que cambio un prop en el componente Vue, **cuando** ejecuto CI, **entonces** falla si el contrato, la API generada o el equivalente React no coinciden.
- **Dado** un ejemplo en la docs, **entonces** el código mostrado es el archivo importado `?raw` que se ejecuta.

### US-07 · Motion opt-in (P1/P2) — MOT — **P1**
- **Cuando** activo `<MotionProvider mode="full">`, **entonces** los componentes usan los presets de entrada/salida por defecto.
- **Cuando** el usuario del SO tiene `prefers-reduced-motion`, **entonces** `mode` efectivo es `reduced` aunque la app pida `full`, salvo override explícito documentado.

### US-08 · Agente que implementa un componente (P5) — PLT-10, CMP-01 — **P1**
- **Dado** el contrato `select.contract.ts`, **entonces** contiene anatomía, estados, teclado, ARIA, motion y casos de prueba suficientes para implementar sin decisiones adicionales.

### US-09 · Explorar el catálogo (P1/P2/P3) — PLT-01/02/05 — **P0**
- **Cuando** busco «date», **entonces** aparecen `DatePicker`, `Calendar`, `DateRangePicker` ordenados por relevancia; navegación por teclado en resultados.

### US-10 · Compartir un tema (P3) — THS-06 — **P1**
- **Cuando** copio la URL del Theme Studio, **entonces** otra persona al abrirla ve exactamente el mismo tema (y puede guardarlo).

## 4. Priorización consolidada

| Release | Contenido |
|---|---|
| **v0.x (Fases 1–3)** | FND completo P0, componentes T1 (Button…Tooltip, ~15) con contrato + Vue + React, QA-01/02/03, DST-02/03 |
| **v1.0 (Fases 4–6, 8)** | Plataforma (PLT P0), Theme Studio modo rápido (THS P0), Playground (PLG P0), empaquetado validado (DST-01/04), ≥ 25 componentes |
| **v1.x (P1)** | Theme Studio avanzado, motion JS (`@tessen/motion`), densidad/alto contraste, recursos Figma, `llms.txt`, SSR fixtures, versionado de docs |
| **v2 (P2)** | Componentes creativos, motion avanzado con Motion/GSAP, edición de código en Playground, i18n de la plataforma, interop Tokens Studio |

## 5. Trazabilidad

Cada ID `XXX-nn` se referencia en: contratos (`@tessen/core`), issues del roadmap (`11`) y tests (`describe('CMP-05 …')`). Cambiar o eliminar un ID requiere actualizar este documento.
