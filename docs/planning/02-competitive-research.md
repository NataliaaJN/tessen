# 02 — Research competitivo y de referencias

> Leyenda: **[V]** verificado en esta sesión · **[C]** conocimiento previo no re-verificado · **[H]** hipótesis/inferencia · **[R]** recomendación.
> Fecha de la investigación: 2026-11-22.

## 0. Metodología y límites

- **Navegadas directamente** (navegador integrado, varias secciones e interacciones): `rmtheme.uodyne.com` y `fluent2.microsoft.design`.
- **Verificadas con búsqueda web** (fuentes citadas al final): Ark UI/Zag.js, Reka UI, Base UI, Radix (estado de mantenimiento), Storybook 10, shadcn registry, GSAP, Motion, DTCG, Style Dictionary, Vitest 4, Fluent UI Web Components/React v9, Web Components en React 19, Magic UI.
- **Conocimiento previo [C]**: Material Design 3, Ant Design, PrimeVue, Vuetify, Park UI, React Aria, Aceternity UI (licencia), detalles finos de cada librería.
- **No accesible / no verificado**: el *contenido exportado* por el botón «Exportar configuración» de Theme Studio (se pulsó pero no se pudo inspeccionar el archivo descargado); si Fluent 2 ofrece pestañas «Design/Code» por componente (solo se observó la ruta `/usage`; la ruta `/code` devuelve 404 — **[V]**). No se asume su comportamiento.

---

## 1. Referencia prioritaria 1 — rM Native · Theme Studio (`rmtheme.uodyne.com`)

### 1.1 Qué es (hechos verificados)

**[V]** Un «estudio» web de un tema para **Vue 3 + PrimeVue 4**. Según su propia página *Fundamentos*: preset propio sobre **Aura** (`@primeuix/themes`), tipografía **Manrope Variable**, iconos **Lucide**, publicado en Cloudflare Workers. Insignia de cabecera: «VUE 3 PRIMEVUE». Versión «v0.1 · Preview». Sin servidor de usuarios: *«Preferencias guardadas en este navegador»*.

### 1.2 Arquitectura de información (verificada)

Navegación lateral (rutas por **hash**: `#overview`, `#components`, `#spaces`, `#templates`, `#motion`, `#guide`, `#collection`):

| Sección | Contenido observado |
|---|---|
| **Escritorio** | Escena interactiva personal (objeto 3D rotable, 3 escenas: Estudio/Foco/Ideas), reloj, panel «Atmósfera» con slider de luz y 19 acentos |
| **Componentes (32)** | «Biblioteca de interfaces»: hero que demuestra Ventana/Inspector/Contexto, «Native Originals» (acción con presencia, selector de material, slider), catálogo filtrable por **Acciones / Formularios / Datos / Feedback / Overlays / Estructura** con cada componente funcionando |
| **Espacios (6)** | Apps de ejemplo completas: Proyectos (kanban), Archivos, Control, Editor, Correo, Landing |
| **Templates (10)** | 5 familias (Comercial, Panel, Portal, Landing, Editorial) con botones **Código / Previsualizar** |
| **Motion lab (55)** | 55 experimentos de movimiento categorizados (UX aplicado 20, Navegar 13, Materia 11, Actuar 11), cada uno con nombre, descripción y gesto de prueba |
| **Fundamentos** | Filosofía en 3 principios, guía de implementación (código de instalación del preset), alcance actual, stack |
| **Colección** | (No inspeccionada en detalle) |

Elementos transversales **[V]**: búsqueda global «Ctrl K», panel «Atajos de teclado», «Guía de inicio», migas de pan (Theme Studio › sección), enlace «Saltar al contenido», regiones ARIA (`complementary`, `banner`, `radiogroup`, `dialog`).

### 1.3 El panel «Apariencia» (la pieza clave) — hechos verificados

Se abre como **drawer lateral derecho** desde un botón de cabecera, desde la barra lateral («Personaliza tu tema») o desde botones en las páginas («Cambiar apariencia»). Título: *«Un tema. Tu carácter.»* / *«Cada cambio se aplica a todo el sistema.»* Contiene:

| Control | Detalle verificado |
|---|---|
| **Apariencia** (preset) | 12 presets visuales con miniatura y lema: 6 claros + 6 oscuros (Soft Slate, Grafito, Porcelana, Medianoche, Atelier, Ópalo, Bruma, Nácar, Mono Claro, Mono Oscuro, Prisma, Cobalto) |
| **Acento** | 19 swatches (Lima, Azul, Lavanda, … Blanco y negro) con nombre accesible |
| **Geometría** | Slider de radio de esquinas «Preciso ↔ Orgánico», valor en px (10 px por defecto) |
| **Movimiento** | Switch «Transiciones con intención» |
| **Cristal** | Switch «Superficies translúcidas» |
| **Densidad compacta** | Switch «Más espacio para tus ideas» |
| **EN VIVO** | Tarjeta de previsualización dentro del propio panel («Así se siente tu tema») |
| **Exportar configuración** / **Restablecer tema** | Acciones al pie |

### 1.4 Cómo funciona por dentro (inspección del DOM, verificada)

- Estado del tema como **atributos en `<html>`**: `class="rm-dark"`, `data-appearance="slate"`, `data-motion="true"`, `data-compact="false"`, `data-glass="true"`, `data-contrast="standard"`, `data-monochrome="false"`.
- Valores derivados como **CSS custom properties inline** en `<html>`: `--rm-radius: 10px; --accent: #c5e484; --on-accent: #172236; --accent-hover: color-mix(in srgb, #c5e484 85%, white); --accent-ink; --button-tint; --control-highlight`.
- ~40 variables en la hoja de estilos: `--bg --sidebar --surface --surface-raised --surface-hover --glass --line --line-strong --text --muted --faint --shadow --ease-out --spring --duration --space`, escala de radios (`--radius-control/-inner/-card/-panel/-floating`), materiales (`--material-light/mid/dark/edge`), etc.
- Persistencia en `localStorage` clave `rm-native-theme` con JSON `{"appearance":"slate","accent":"lime","radius":10,"motion":true,"compact":false,"glass":true}`.
- Cambio instantáneo sin recarga: el tema es **datos pequeños + variables CSS**, no recompilación.

### 1.5 Decisiones de producto detrás (inferencias **[H]**, no hechos)

1. **Personalización acotada y opinada**: pocas palancas de alto impacto (preset, acento, radio, 3 interruptores) en lugar de exponer cientos de tokens. Reduce la parálisis y garantiza resultados coherentes.
2. **El tema es global y está siempre a mano** (drawer accesible desde cualquier pantalla), no una página aparte: refuerza «cada cambio se aplica a todo el sistema».
3. **La propia plataforma es la demo**: al cambiar el tema, el catálogo, los espacios y los templates cambian; sirve de prueba de que el sistema es consistente.
4. **Prueba social por composición**: Espacios y Templates muestran el sistema en aplicaciones reales, no solo componentes aislados.
5. **El movimiento es un producto en sí** (Motion lab): diferencia visual y de marca frente a catálogos estáticos.
6. **Sin backend**: reduce coste y fricción; el estado vive en el navegador.

### 1.6 Limitaciones observadas

- **[V]** Vue-only y atado a PrimeVue; el propio sitio indica que *«el catálogo prueba 32 componentes; el resto hereda los tokens y requiere validación»*.
- **[V]** Sin vista por componente con API/props/código: el catálogo muestra la pieza y un lema, no documentación técnica (los templates sí tienen «Código»).
- **[V]** Routing por hash (sin URLs profundas por componente), interfaz solo en español.
- **[V]** «Exportar configuración» existe, pero **no se verificó el formato** de salida.
- **[H]** La personalización no es a nivel de token individual; no hay editor de contraste ni diffs.

### 1.7 Qué trasladamos a Tessen **[R]**

| Tomar | Adaptación |
|---|---|
| Drawer global de apariencia con presets + acento + palancas | **Modo rápido** de Theme Studio (y mini-panel en docs/playground) |
| Tema = atributos `data-*` + CSS variables, persistido en localStorage | Contrato público: `data-tessen-theme`, `data-tessen-density`, `data-tessen-motion` + `--tessen-*` |
| Estado «EN VIVO» y botón Reset | Mismo patrón; añadir deshacer/rehacer |
| Catálogo filtrable por categoría y Motion lab | Component Explorer + sección Motion con presets reales |
| Spaces/Templates como prueba de composición | Sección «Templates/Patterns» a partir de Fase 7 |
| Atajos de teclado + Ctrl K | Búsqueda global y paleta de comandos de la plataforma |

| Mejorar / no copiar | Por qué |
|---|---|
| Vue-only | Tessen es Vue **y** React |
| Sin API/código por componente | Tessen las incluye en la misma página (inspirado en Fluent) |
| Sin editor de tokens | **Modo avanzado**: árbol de tokens DTCG, alias, contraste WCAG |
| Hash routing | URLs profundas y compartibles (tema/estado codificado en URL) |

---

## 2. Referencia prioritaria 2 — Microsoft Fluent 2 (`fluent2.microsoft.design`)

### 2.1 Arquitectura de navegación (verificada)

- **Portada** con doble entrada: **Design** («Dive into our Figma UI kits») y **Develop** («installation guides and tooling tips») — separa audiencias desde el primer clic. Selector de plataforma: **Web · iOS · Android · Windows**. Secciones «Newsworthy» (casos reales) y «Resources» (plugins de Figma).
- **Menú lateral global** (rutas observadas): *What's new*, *Get started* (design / develop), *Design principles*, **fundamentos** (*Color, Elevation, Iconography, Layout, Material, Motion, Shapes, Typography*), *Accessibility*, *Content design*, **Design tokens** (+ *Color tokens*), *Handoffs*, *Onboarding*, *Wait UX*, *Responsible AI*, *AI harm*, *Content engineering* (serie de guías), y **Componentes por plataforma** (`/components/web/react/core/<nombre>/usage`) en orden alfabético (Accordion, Avatar, AvatarGroup, Badge, Breadcrumb, Button, Card, Carousel, Checkbox, Combobox, Dialog, Divider, Drawer, Dropdown, Field, FluentProvider, Icon, Image, InfoLabel, Input, Label, Link…).
- Los componentes están **agrupados por plataforma y por implementación** («web/react»): la plataforma es un eje de primer nivel.

### 2.2 Anatomía de una página de componente (verificada con *Button*)

Cabecera (nombre + una frase) → descripción de cuándo usarlo y alternativas («para navegar usa un link») → **ejemplo interactivo** con selector de tema («Web Light») y «Open in CodeSandbox» → **Resources** (Storybook React, Storybook Web Components, patrón WAI-ARIA APG, guía de migración) → secciones ancladas con índice lateral: **Types** (Button, Split, Menu, Compound), **Behavior** (Toggle), **Layout** (un solo primario; pares *Do/Don't* con imágenes), **Accessibility** (contraste 4.5:1 texto y 3:1 iconos; tooltips en deshabilitados; `aria-describedby` en split buttons), **Content** (verbos, «New X», «Next» no «Continue», «Done/Finish/Close/Dismiss»).

### 2.3 Cómo logra que una librería sea un sistema de diseño (verificado salvo indicación)

1. **Guidance (diseño) y código viven en capas distintas pero enlazadas**: la página explica *cuándo y por qué*; Storybook da API y código. **[V]** (los enlaces de Resources apuntan a `react.fluentui.dev` y `web-components.fluentui.dev`).
2. **Tokens en dos capas**: *global* (valores crudos) y *alias* (significado semántico); soportan temas claro/oscuro/alto contraste/de marca de serie. **[V]** (página Design tokens).
3. **Fundamentos como disciplina**: Color, Elevation, Motion, Shapes, Typography, Layout, Material con principios propios (p. ej. Motion: *Functional, Natural, Consistent, Appealing*). **[V]**
4. **Contenido (copywriting) como parte del sistema**: reglas de etiquetas por componente. **[V]**
5. **Recursos para diseñadores**: UI kits de Figma y plugins (A11y Focus Order, Color Contrast Checker, Content Reel, Icon Scaling Tool). **[V]**
6. **Más de una implementación técnica** del mismo diseño: React v9 (con Griffel, CSS-in-JS casi sin runtime) y Web Components (FAST Element) en el mismo monorepo. **[V]** (búsqueda)
7. **Referencia a estándares**: enlaces a patrones WAI-ARIA APG. **[V]**

### 2.4 Limitaciones / aprendizajes

- **[V]** El conocimiento está **fragmentado en tres sitios** (guía Fluent 2, Storybook React, Storybook WC). Tessen puede unificar guía + demo + API + código en una sola página.
- **[V]** La arquitectura es amplia (IA, content engineering, handoffs…): demasiado para un v1; adoptar el patrón, no el alcance.
- **[H]** Identidad fuertemente ligada a Microsoft; el theming de marca es posible pero el lenguaje visual base es el suyo.
- **No verificado:** pestañas Design/Code por componente; versionado visible; buscador (no se inspeccionó).

### 2.5 Qué trasladamos a Tessen **[R]**

| De Fluent | En Tessen |
|---|---|
| Doble entrada Design/Develop | Portada con accesos «Diseñar» (Theme Studio, Guidelines, Recursos) y «Desarrollar» (Docs, Components, Playground) |
| Plantilla de página de componente con anclas | `Overview · Demo · Variants · Anatomy · Behavior · Accessibility · Content · API · Code (Vue/React)` en **una** página |
| Tokens en 2+ capas (global/alias) | Tres capas: primitivo / semántico / componente (ver `04`) |
| Principios de motion | `07-motion-system.md` |
| Content guidelines por componente | Sección «Content» en cada contrato |
| Do/Don't visuales | Bloques `<DoDont>` en MDX |
| Enlace a APG | Campo `apgPattern` obligatorio en el contrato |

---

## 3. Otras referencias

| Referencia | Qué hace bien | Limitaciones | Lección para Tessen |
|---|---|---|---|
| **Radix UI Primitives** | Primitivas headless accesibles y composables (`Root/Trigger/Content`), MIT, mantenido por WorkOS **[V]** | Solo React; el sentimiento de la comunidad sobre su ritmo de mantenimiento es mixto **[V: artículo de opinión; no hecho]** | Referente de composición y accesibilidad (API *compound components*) |
| **Base UI (MUI)** | 1.0 estable (11-dic-2025), 35 componentes sin estilos, equipo dedicado **[V]** | Solo React | Alternativa seria a Radix si se eligiera motor por framework |
| **Reka UI** (ex-Radix Vue) | Primitivas headless Vue; v2 tras renombrado; shadcn-vue instala Reka **[V]** | Solo Vue; distinto motor que el de React | Referente Vue; evidencia de que el ecosistema ya separa motor Vue / motor React |
| **Ark UI + Zag.js** | **Una máquina de estados por componente con adaptadores React, Solid, Vue y Svelte** → paridad por diseño; docs `llms.txt` **[V]** | Capa extra (máquinas + API de «connect»); estilos propios del consumidor | **Candidato principal a motor de comportamiento compartido** (ADR 0004) |
| **Park UI** | Estilos (Panda/Tailwind) sobre Ark para varios frameworks **[C]** | Estilos atados a su toolchain | Confirma el patrón «headless + capa de estilos» multi-framework |
| **shadcn/ui** | Código abierto *copiado al proyecto*; CLI y **registry** (`registry.json`, instalación por URL, registries privados con namespaces) **[V]** | El consumidor mantiene el código; Tailwind-céntrico; React (shadcn-vue es proyecto aparte) | Aprender su DX de instalación; **no** copiar el modelo de propiedad del código como base |
| **React Aria / React Spectrum** | Referencia de accesibilidad y comportamiento (hooks, interacciones, i18n) **[C]** | Solo React | Fuente de criterios de comportamiento y pruebas de a11y |
| **Storybook 10** | ESM-only, a11y addon renovado (10.3), `@storybook/addon-vitest`, CSF Factories en preview **[V]** | No es plataforma de producto/branding; Docs aparte | Úsalo como **banco de trabajo/QA interno**, no como docs públicas |
| **Motion (motion.dev)** | MIT, API para JS/React/Vue (`motion-v`), motor híbrido rAF + WAAPI **[V]** | Peso si se usa entero; abstracciones propias | Capa opcional avanzada (ADR 0007) |
| **GSAP** | Ahora gratis (incl. plugins) con licencia estándar desde 30-abr-2025; excluye uso en herramientas visuales de animación sin código que compitan con Webflow **[V]** | Licencia propia (no MIT); peso | Opcional y aislado; **no** dependencia del core |
| **Material Design 3** | Fundamentos, tokens de rol, color dinámico, motion con *easing* y *duration* tokens **[C]** | Identidad Google; web components oficiales en mantenimiento limitado **[C]** | Estructura de fundamentos y tokens de rol |
| **Ant Design** | Amplitud (tablas, formularios, datos), docs exhaustivas **[C]** | Identidad marcada, CSS-in-JS pesado históricamente **[C]** | Inventario de componentes de datos y patrones enterprise |
| **PrimeVue** | Gran variedad en Vue, modo *unstyled*/pass-through, presets de tema **[C]**; base de rM Native **[V]** | Vue-only | Mostrar que un *preset* puede dar personalidad sobre una base de comportamiento |
| **Vuetify** | Integración profunda en Vue, material design **[C]** | Vue-only, opinionated | Referente de DX en Vue |
| **Aceternity UI / Magic UI** | Componentes visualmente impactantes y animados, copy-paste; **Magic UI es MIT [V]**; la licencia de Aceternity **no se pudo verificar** | React + Tailwind + Motion; sin sistema ni accesibilidad uniforme **[H]** | Inspiración para la categoría *Advanced & Creative*; Tessen las integra en el sistema de tokens/motion |
| **Fluent UI Web Components v3** | Componentes estándar sobre FAST Element, registro con `define()` **[V]** | Ecosistema acoplado a Fluent | Referencia de estrategia Web Components (ADR 0003: evaluada y no elegida para v1) |

## 4. Comparativa de funcionalidades (resumen)

| Capacidad | shadcn/ui | Fluent 2 | Ark UI | PrimeVue | rM Native | **Tessen (objetivo)** |
|---|---|---|---|---|---|---|
| Vue **y** React | No (proyectos separados) | React + WC | **Sí** (4 frameworks) | Solo Vue | Solo Vue | **Sí, con gate de paridad** |
| Docs unificadas (guía+demo+API+código) | Parcial | Fragmentada | Parcial | Sí (Vue) | No | **Sí** |
| Theme editor en vivo | No (temas por CLI/web aparte) | Figma / tokens | No | Sí (designer, **[C]**) | **Sí (rápido)** | **Rápido + avanzado** |
| Generación de código con props | No | No | No | No | No | **Sí (Vue/React)** |
| Motion como sistema | No | Guías | No | No | **Sí (laboratorio)** | **Sí (tokens + presets)** |
| Componentes creativos | Pocos | No | No | No | Sí (Originals) | **Sí, opcionales** |

> Las celdas marcadas «No» para productos ajenos reflejan lo observado/encontrado; no son afirmaciones exhaustivas sobre cada producto.

## 5. Matriz de decisiones que se desprenden del research

| Pregunta | Conclusión [R] | Documento |
|---|---|---|
| ¿Motor de comportamiento compartido? | Zag.js (validar con spike) con adaptadores nativos Vue/React | ADR 0004, `06` |
| ¿Web Components como base? | No en v1 | ADR 0003 |
| ¿Estilos? | CSS autorado + cascade layers sobre tokens CSS; Tailwind solo como puente opcional | ADR 0006, `04` |
| ¿Tokens? | DTCG 2025.10 + Style Dictionary, 3 capas | ADR 0005 |
| ¿Docs? | Astro (islas Vue/React), contenido MDX + metadatos de contrato | ADR 0008, `08` |
| ¿Storybook? | Solo QA/regresión visual interna | `10` |

## 6. Oportunidades de diferenciación (valor real vs. complejidad)

| Idea | Valor | Complejidad | Veredicto |
|---|---|---|---|
| Paridad Vue↔React verificada automáticamente (contratos + diff visual entre frameworks) | Muy alto | Media | **Hacer** (Fase 3) |
| Theme Studio dual (rápido/avanzado) con contraste y export DTCG/CSS/Tailwind | Alto | Media-alta | **Hacer** (Fase 5) |
| Playground con código Vue y React desde un mismo estado | Alto | Media | **Hacer** (Fase 6) |
| Docs generadas de contratos+tipos+ejemplos ejecutados | Alto | Media | **Hacer** (Fase 4) |
| `llms.txt` y JSON de contrato por componente | Medio | Baja | **Hacer** (Fase 4) |
| Motion por capas con presets y control global | Medio-alto | Media | **Hacer** (Fases 1–2, 7) |
| Registry estilo shadcn («poseer el código») | Medio | Media | Evaluar tras v1 |
| Plugin Figma bidireccional | Incierto | Alta | Posponer; solo export DTCG |
| Generación de temas con IA | Bajo-incierto | Media | Descartar en v1 |
| Colaboración en tiempo real | Bajo | Muy alta | Descartar |

## 7. Fuentes consultadas

- rM Native Theme Studio — https://rmtheme.uodyne.com/ (navegación directa, secciones `#overview`, `#components`, `#spaces`, `#templates`, `#motion`, `#guide`)
- Fluent 2 — https://fluent2.microsoft.design/ (home, `/components/web/react`, `/components/web/react/core/button/usage`, `/design-tokens`, `/motion`)
- Ark UI — https://ark-ui.com/docs/vue/overview/introduction · https://github.com/chakra-ui/ark
- Reka UI — https://reka-ui.com/docs/guides/migration
- Base UI v1 — https://www.infoq.com/news/2026/02/baseui-v1-accessible
- Radix Primitives — https://radix-ui.com/primitives/docs/overview/releases
- Storybook 10 — https://storybook.js.org/blog/whats-new/storybook-10
- shadcn registry — https://ui.shadcn.com/docs/registry/getting-started
- GSAP gratuito — https://webflow.com/blog/gsap-becomes-free · https://gsap.com/community/standard-license/
- Motion — https://motion.dev/ (README del paquete `motion`)
- DTCG estable — https://www.designtokens.org/tr/2025.10/ · https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
- Style Dictionary — https://github.com/amzn/style-dictionary/releases
- Vitest 4 — https://main.vitest.dev/blog/vitest-4
- Fluent UI web components / React v9 — https://github.com/microsoft/fluentui · https://fluent2.microsoft.design/get-started/develop
- React 19 y custom elements — https://frontendmasters.com/blog/react-19-and-web-component-examples/
- Magic UI — https://github.com/magicuidesign/magicui
