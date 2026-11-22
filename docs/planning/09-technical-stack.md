# 09 — Stack técnico

> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[H]** hipótesis · **[R]** recomendación.
> **Política de versiones [R]:** no se fijan números de versión en este documento salvo los verificados. Al inicio de la Fase 1 se **audita** la última versión estable de cada herramienta, se registran en el catálogo de pnpm (`pnpm-workspace.yaml` → `catalog:`) y se actualizan con Dependabot (integrado en GitHub) en PRs agrupados. Esto sigue la indicación del pack de skills del repositorio («auditar y confirmar versiones exactas antes de implementar»).
> Principio rector: **un stack coherente y pequeño**. Cada herramienta debe justificar su existencia; no se eligen «todas por defecto».

## 1. Resumen del stack propuesto

| Área | Elección **[R]** | Alternativas evaluadas |
|---|---|---|
| Runtime de desarrollo | Node LTS ≥ 22 (Storybook 10 exige 20.16+/22.19+/24+ **[V]**) | — |
| Gestor de paquetes / workspaces | **pnpm workspaces** (+ catalogs) | npm/yarn workspaces |
| Orquestación y caché | **Turborepo** | Nx, solo pnpm, Lerna |
| Versionado y changelogs | **Changesets** (versiones enlazadas). **Publicación deshabilitada** (ADR 0014, 0015) | semantic-release, Lerna publish |
| Lenguaje | **TypeScript `strict`** | JS+JSDoc |
| Build de librerías | **Vite library mode** (todos los paquetes publicables) + `tsc`/`vue-tsc` para `.d.ts` | tsup, tsdown, unbuild, Rollup puro |
| Estilos | **CSS autorado** + `@layer` + variables CSS; Lightning CSS vía Vite | Tailwind, CSS-in-JS (Griffel, vanilla-extract, Panda), CSS Modules |
| Tokens | **DTCG 2025.10 + Style Dictionary 5** | Terrazzo, Tokens Studio |
| Motor de comportamiento | **Zag.js** (`@zag-js/*`) *(sujeto a spike S1)* | Radix+Reka UI, Base UI+Reka, Ark UI, propio |
| Motion | CSS + `@tessen/motion` (WAAPI); **Motion** opcional | GSAP, solo CSS |
| Docs (plataforma pública) | **Astro** + MDX + islas Vue/React + Pagefind | Starlight, VitePress, Nuxt Content, Docusaurus |
| Theme Studio / Playground | **Vite + Vue 3 + TypeScript** (SPAs) | React, Astro islas |
| Workbench QA | **Storybook 10** (Vue y React) | Histoire, Ladle, sin workbench |
| Tests unitarios/componente | **Vitest 4** (+ VTU/RTL/user-event) | Jest |
| Tests en navegador real | **Vitest Browser Mode + Playwright** (Fase 2+ para overlays) | Playwright CT, Cypress CT |
| E2E / visual / SSR | **Playwright** | Cypress |
| A11y automatizada | **axe-core** (vitest + Storybook + Playwright) | Pa11y, Lighthouse |
| Lint/format | **ESLint (flat) + typescript-eslint + plugins Vue/React/a11y**, **Prettier** | Biome, oxlint |
| Límites arquitectónicos | **dependency-cruiser** | eslint-plugin-boundaries, Nx module boundaries |
| QA de paquetes | **publint**, **@arethetypeswrong/cli**, **size-limit**, **knip** | — |
| CI | **GitHub Actions** (runners estándar, gratuitos en repos públicos). **Sin CD** | otros |
| Hosting | **Ninguno**: docs, Theme Studio y Playground se ejecutan en local (ADR 0014); GitHub Pages solo como opción futura con aprobación | Cloudflare Pages, Vercel, Netlify, GitHub Pages |

## 2. Decisiones con alternativas y justificación

### 2.1 Monorepo: pnpm + Turborepo (ADR 0001)

| | pnpm workspaces solo | **pnpm + Turborepo** | Nx |
|---|---|---|---|
| Caché de tareas | No | Sí (local/remota) | Sí |
| Grafo de tareas (`dependsOn`) | Manual | Declarativo (`turbo.json`) | Declarativo + inferencia |
| Curva/configuración | Mínima | Baja | Media-alta (plugins, generadores) |
| Límites de módulos | No | No (usar otra herramienta) | **Sí** (lint rule nativa) |
| Encaje con Vue + React + Astro + Vite | Neutral | Neutral y ligero | Bueno, pero más maquinaria |

**Elección:** Turborepo por ser el mínimo que da caché y orden de tareas sin imponer una forma de proyecto. Nx aportaría *module boundaries* y generadores, pero añade un sistema entero que Tessen no necesita (los límites los cubre dependency-cruiser y los generadores son un script propio). Las comparativas encontradas son de baja autoridad y sus benchmarks son contradictorios **[V: búsqueda]**; la decisión se basa en **complejidad**, no en velocidad. *Disparador de revisión:* si el número de paquetes > ~25 o el tiempo de CI > 15 min con caché.

### 2.2 Build de librerías: Vite library mode (ADR 0010)

- Los paquetes `vue` necesitan compilar SFC → el plugin `@vitejs/plugin-vue` ya vive en Vite; usar **una sola herramienta** (Vite) para `vue`, `react` y paquetes TS puros reduce variedad de configuración.
- **tsup**: opción por defecto histórica, pero el ecosistema está migrando a **tsdown** (basado en Rolldown/Oxc) **[V: búsqueda]**. **tsdown** aún es pre-1.0 (cambios *breaking* en minor) y requiere Node ≥ 22.18 **[V]**; **unbuild** brilla con *stub mode* para monorepos pero añade otra herramienta. Ninguno resuelve SFC de Vue por sí solo.
- Salida: **ESM sin empaquetar** (`preserveModules`) para maximizar tree-shaking y subrutas por componente; `.d.ts` con `tsc`/`vue-tsc` (declaraciones) y validación con publint + attw.
- *Disparador de revisión:* tsdown 1.0 estable **y** soporte probado de SFC → reconsiderar para paquetes TS puros.

### 2.3 Estilos (ADR 0006)

| Opción | A favor | En contra | Veredicto |
|---|---|---|---|
| **CSS autorado + `@layer` + variables** | Un único CSS para Vue y React, cero runtime, SSR trivial, personalizable por consumidor sin fork, CSS nesting nativo | Disciplina de naming; sin utilidades por defecto | **Elegido** |
| Tailwind dentro de la librería | Rápido de escribir | Acopla a consumidores; *preflight*; clases generadas; contradice «funciona sin Tailwind» | Solo **puente opcional** para consumidores |
| CSS-in-JS (Griffel, Panda, vanilla-extract) | Tipado de estilos, atomic CSS | Cada framework necesita su integración; coste de build/runtime; no compartible limpiamente | Descartado |
| CSS Modules | Encapsulación simple | Nombres hash dificultan override; no compartible entre frameworks sin duplicar | Descartado |

Navegadores objetivo: *evergreen* (`@layer`, nesting, `color-mix`, container queries, `oklch()` ampliamente disponibles **[C]**). Lightning CSS (vía Vite) para nesting/minificación/prefijos.

### 2.4 Tokens (ADR 0005)

**Style Dictionary 5** implementa DTCG 2025.10 y es implementación de referencia (con Tokens Studio y Terrazzo) **[V]**; v5.5 añade soporte del tipo `dimension` como objeto **[V]**. Alternativa **Terrazzo** (también de referencia **[V]**) se descarta por ahora por menor ecosistema de transformaciones **[C]**; la decisión es reversible porque la **fuente es DTCG estándar** (portabilidad).

### 2.5 Plataforma web (ADR 0008)

| | Astro (custom) | Starlight | VitePress | Nuxt Content | Docusaurus |
|---|---|---|---|---|---|
| Islas Vue **y** React | **Sí** nativo **[V: búsqueda]** | Sí (hereda Astro) | Solo Vue **[V]** | Solo Vue/Nuxt | Solo React |
| Libertad de diseño («no aburrida») | **Alta** | Media (layout propio de docs) | Media | Alta pero app completa | Media |
| Búsqueda/i18n/versionado de serie | Con Pagefind/propio | **Sí** de serie **[V]** | Parcial | Plugins | Sí |
| Complejidad | Media | Baja | Baja | Alta | Media |

**Elección:** **Astro custom** porque la plataforma debe renderizar demos **Vue y React** y tener identidad propia; Starlight ahorra trabajo pero condiciona el layout (se mantiene como plan B si el coste de búsqueda/versionado se dispara). **Theme Studio y Playground** son SPAs intensivas en estado → **Vite + Vue 3** (decisión de framework de shell en ADR 0008 / D-04; lo que se muestre **se renderiza con los componentes reales**; como el tema es 100 % CSS variables, el Theme Studio solo necesita un framework para previsualizar).

### 2.6 Testing y calidad (detalle en `10`)

- **Vitest 4**: Browser Mode estable y regresión visual integrada (`toMatchScreenshot`) **[V]**, con proveedor Playwright en paquete aparte (`@vitest/browser-playwright`) **[V]**. Un artículo advierte que la parte visual es más reciente que el núcleo **[V: precaución]** → la **regresión visual oficial se hará con Playwright `toHaveScreenshot` sobre Storybook/Docs** (madurez), dejando `toMatchScreenshot` para pruebas locales.
- **Storybook 10** (ESM-only, `@storybook/addon-vitest`, a11y addon mejorado) **[V]** como **banco de pruebas interno** por framework (`@storybook/vue3-vite`, `@storybook/react-vite`); **no** es la documentación pública.
- **Playwright**: E2E de las apps, matriz de navegadores, SSR (fixtures Nuxt/Next), capturas.

### 2.7 Lint, formato y límites

- **ESLint flat config**: `typescript-eslint`, `eslint-plugin-vue`, `eslint-plugin-vuejs-accessibility`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`, reglas propias para prohibir valores visuales literales en CSS (o stylelint). **Prettier** para formato (soporte SFC consolidado). Biome/oxlint se reconsiderarán cuando cubran plugins Vue/a11y.
- **dependency-cruiser** (ADR 0013): reglas declarativas de capas (pages→features→shared), ciclos, imports profundos prohibidos, `vue↮react`, `packages↛apps`. Cubre paquetes **y** apps con una herramienta.
- **publint + attw**: validan `exports`/tipos de cada paquete publicado. **size-limit**: presupuestos de tamaño. **knip**: código/exports sin uso.

## 3. Dependencias previstas

### 3.1 Paquetes (hoy `private`; publicables en el futuro)

> `@tessen/*` es un marcador ilustrativo; el scope real es provisional (`@tessen-ui/*`, ADR 0015). Ningún paquete se publica.

| Paquete | `dependencies` | `peerDependencies` | Notas |
|---|---|---|---|
| `@tessen/tokens` | — | — | Solo artefactos generados + fuente |
| `@tessen/theme` | `culori` *(color OKLCH/contraste, **[H]** validar contra colorjs.io)* | — | Sin framework |
| `@tessen/styles` | — | — | CSS puro |
| `@tessen/icons` | — | `vue`, `react` (opcionales) | SVG → componentes |
| `@tessen/core` | — | — | TS puro, 0 dependencias en runtime |
| `@tessen/motion` | — | — | Usa WAAPI/IO nativos |
| `@tessen/vue` | `@zag-js/vue` + máquinas usadas, `@tessen/core` | `vue ^3.5`, `@tessen/styles` | `@tessen/motion` y `@tessen/icons` peers opcionales |
| `@tessen/react` | `@zag-js/react` + máquinas usadas, `@tessen/core` | `react ^18.3\|\|^19`, `react-dom`, `@tessen/styles` | ídem |

> Importar **solo las máquinas Zag que cada componente use** (NFR-05). No se usan `clsx`/`tailwind-merge`: la resolución de variantes es `core/variants`.

### 3.2 Apps y herramientas (devDependencies relevantes)

Astro + `@astrojs/mdx`, `@astrojs/vue`, `@astrojs/react`, Pagefind · Vue 3.5, Vue Router, (Pinia solo si hace falta estado entre features) · `culori`, `lz-string` (URL compartible), CodeMirror 6 *(Playground P2)* · `vue-component-meta` y `react-docgen-typescript` o TS Compiler API (generación de API) · `@vue/test-utils`, `@testing-library/react`, `@testing-library/user-event`, `axe-core`/`vitest-axe` · `@playwright/test` · `@changesets/cli` · `style-dictionary`.

## 4. CI/CD (GitHub Actions) — jobs previstos

| Job | Contenido | Se ejecuta en |
|---|---|---|
| `verify` | install (caché pnpm), lint, `tsc`/`vue-tsc`, `tokens:check`, `deps:check` (dependency-cruiser) | PR |
| `test-unit` | Vitest (matriz `core/vue/react/theme/motion`) | PR |
| `test-browser` | Vitest Browser Mode + axe | PR (componentes con overlays) |
| `build` | `turbo build`, `publint`, `attw`, `size-limit` | PR |
| `parity` | `parity:api`, visual vue↔react (Playwright en runner Linux de CI) | PR |
| `docs-check` | API generada vs contrato, compilación de snippets | PR |
| `pack-integration` | `pnpm pack:all` + apps `integration/*` instaladas desde **tarballs** (ADR 0016), SSR Nuxt/Next | PR (subconjunto) / nightly (completo) |
| `e2e-apps` | Playwright sobre docs, studio, playground | PR / main |
| ~~`release`~~ | **Deshabilitado**: no se publica en npm (ADR 0015). Changesets solo versiona y genera changelog | — |
| ~~`deploy-docs`~~ | **No existe**: sin despliegue (ADR 0014) | — |

Flujo de ramas: `main` (releases) ← `develop` (integración) ← ramas de trabajo con nomenclatura en inglés (`feat/…`, `fix/…`, `docs/…`, `chore/…`), merge a `develop` y borrado de la rama al terminar (`docs/architecture/repository-structure.md` §Git).

## 5. Riesgos del stack

| Riesgo | Mitigación |
|---|---|
| Herramientas pre-1.0 (tsdown) | No se adoptan en v1; Vite lib mode estable |
| Parte visual de Vitest 4 reciente | Visual con Playwright `toHaveScreenshot` |
| Tipado de `.vue` en declaraciones | `vue-tsc` + attw en CI desde el primer componente |
| Cambios de licencia de dependencias | Revisión de licencias en CI (`license-checker`/`pnpm licenses`) **[C]** |
| Número de herramientas | Máximo una por función; documentar en ADR cualquier adición |
