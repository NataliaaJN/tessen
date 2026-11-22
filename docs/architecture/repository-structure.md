# Estructura del repositorio

> **Decisión que no debe modificarse sin un ADR** ([ADR 0002](../planning/13-architecture-decisions/0002-component-oriented-packages-feature-first-apps.md)): TESSEN usa **component-oriented** para sus paquetes de componentes y **feature-first** para sus aplicaciones. No se unifican bajo una única estrategia.
>
> Documentos hermanos: [component-architecture](component-architecture.md) · [feature-architecture](feature-architecture.md) · [dependency-rules](dependency-rules.md) · [naming-conventions](naming-conventions.md).

## 1. Análisis de la estructura actual

Estado del repositorio en el momento de este análisis (2026-11-22):

| Elemento | Hallazgo |
|---|---|
| Contenido | Solo `README.md`, `.gitignore` y `docs/` (planificación + arquitectura). **No existe código** (ni `packages/`, ni `apps/`) |
| Mezcla de estrategias sin criterio | **Ninguna** (no hay estructura) |
| Duplicaciones, dependencias incorrectas, responsabilidades mal ubicadas | **Ninguna detectada** |
| Migraciones necesarias | **Ninguna.** No se mueve ni renombra código existente |
| Rutas de import / exports a actualizar | **Ninguna** |
| Builds, tests, tipos | No hay nada que pueda romperse; la validación es la **definición ejecutable** (reglas en [dependency-rules](dependency-rules.md)) que se instalará en `F1-T01` |

**Consecuencia:** se aplica el principio *«no crear carpetas vacías para anticipar funcionalidades futuras»*. Este documento define la estructura **definitiva y las reglas de crecimiento**; las carpetas se **crean cuando aparece su primer contenido real** (según el roadmap, Fase 1 en adelante).

### 1.1 Coherencia con el monorepo Vue + React
La arquitectura es coherente con [`06-multiframework-architecture`](../planning/06-multiframework-architecture.md): comparten fundamentos (`tokens`, `styles`, `core`, `motion`, `icons`, `theme`) y se separan las implementaciones nativas (`vue`, `react`) sin dependencia mutua.

## 2. Clasificación

| Tipo | Ubicación | Estrategia interna | Se publica |
|---|---|---|---|
| **Paquetes de componentes** | `packages/vue`, `packages/react` | **Component-oriented** | Sí |
| **Paquetes de fundamentos** | `packages/tokens`, `theme`, `styles`, `icons`, `core`, `motion` | **Por responsabilidad / dominio técnico** | Sí |
| **Aplicaciones** | `apps/docs`, `apps/theme-studio`, `apps/playground` | **Feature-first** (`app/ pages/ features/ shared/`) | No (se despliegan) |
| **Integración** (privado) | `integration/*` | Una app consumidora mínima por caso (vite-vue, vite-react, nuxt, next) | No |
| **Tooling** (privado) | `tooling/*` | Por herramienta (`tsconfig`, `eslint`, `vite-config`, `docs-gen`, `scripts`) | No |

## 3. Estructura definitiva

```text
tessen/
├── apps/
│   ├── docs/                    # Astro — feature-first
│   ├── theme-studio/            # Vite + Vue — feature-first
│   └── playground/              # Vite + Vue — feature-first
├── packages/
│   ├── tokens/                  # por responsabilidad
│   ├── theme/
│   ├── styles/
│   ├── icons/
│   ├── core/
│   ├── motion/
│   ├── vue/                     # component-oriented
│   └── react/                   # component-oriented
├── integration/                 # privado
├── tooling/                     # privado
├── docs/
│   ├── planning/                # Fase 0 (research, PRD, ADRs)
│   ├── architecture/            # este conjunto de reglas
│   └── brand/                   # (pendiente: logotipo, ver D-01)
├── .changeset/
├── .github/workflows/
├── .dependency-cruiser.cjs      # F1-T01
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

### 3.1 Paquetes de fundamentos (por responsabilidad)

```text
packages/tokens/
├── src/
│   ├── primitives/     color.json  space.json  typography.json  radius.json  shadow.json  motion.json
│   ├── semantic/       color.json  typography.json  focus.json  motion.json
│   ├── components/     button.json …   # solo si el componente necesita token propio
│   └── themes/         light.json  dark.json  density.json
├── scripts/            build-tokens.ts  check-tokens.ts
└── dist/               (generado, solo lectura)  css/  js/  json/  tailwind/

packages/styles/
├── src/
│   ├── layers.css                      # orden de @layer
│   ├── reset.css  base.css             # opcionales
│   ├── themes/                         # overrides por tema/densidad/contraste
│   └── components/                     # un archivo por componente (ver §4.c)
│       button.css  dialog.css …
└── package.json                        # exports: ".", "./tokens.css", "./components/*.css"

packages/core/
└── src/
    ├── contracts/      button.contract.ts  dialog.contract.ts …      # por componente, framework-neutral
    ├── variants/       define-variants.ts                           # mecanismo genérico
    ├── codegen/        vue.ts  react.ts  snippet.ts                 # estado → snippet
    └── testing/        contract-case.types.ts                       # tipos de casos de contrato

packages/theme/   src/{scale,contrast,serialize,apply}/      # utilidades de tema (OKLCH, WCAG, export)
packages/motion/  src/{presets,runtime,scroll,presence}/     # L1 de motion
packages/icons/   src/{svg,vue,react}/  scripts/             # SVG fuente y generación
```

*Dentro de estos paquetes la agrupación es por **dominio técnico**; que `core/contracts/` contenga un archivo por componente no lo convierte en component-oriented: son metadatos de contrato, no implementaciones.*

### 3.2 Paquetes de componentes (component-oriented)

```text
packages/vue/src/
├── components/
│   ├── button/
│   ├── input/
│   ├── dialog/
│   └── …                        # una carpeta por componente
├── composables/                 # useTheme, useMotion, useControllableState…
├── directives/                  # v-motion
├── internal/                    # utilidades privadas, NUNCA exportadas
└── index.ts                     # punto de entrada público

packages/react/src/
├── components/
│   ├── button/
│   └── …
├── hooks/                       # useTheme, useMotion…
├── internal/
└── index.ts
```
Detalle de un componente simple y uno complejo, con ejemplos reales, en [component-architecture](component-architecture.md).

### 3.3 Aplicaciones (feature-first)

```text
apps/<app>/src/
├── app/            # arranque, router, providers, layouts, configuración global
├── pages/          # rutas; composición delgada de features
├── features/       # funcionalidades completas e independientes
│   └── <feature>/  # ver feature-architecture.md
└── shared/         # solo lo verdaderamente transversal
```
Features previstas por app y ejemplo real en [feature-architecture](feature-architecture.md).

## 4. Decisiones y desviaciones respecto a los ejemplos del encargo (justificadas)

Los ejemplos del encargo se tomaron como *conceptuales*. Cambios y por qué:

| # | Ejemplo del encargo | Decisión | Justificación |
|---|---|---|---|
| a | `button/src/Button.vue` + `button/index.ts` (dos niveles: `src/` e índices dobles) | **Sin `src/` anidado**; un único `button/index.ts` | `src/` dentro de cada componente añade profundidad sin función; el paquete ya tiene `src/`. Menos carpetas y un solo punto de export por componente |
| b | Tests en `__tests__/` | **Tests junto al archivo**: `button.test.ts`, `button.a11y.test.ts` | Co-location real (el test cambia con el componente) y sin carpeta extra. Excluidos del build por patrón |
| c | `button.variants.ts` dentro del componente (Vue y React) | La definición de variantes vive **una vez** en `@tessen/core/contracts/button` y los dos frameworks la consumen | Regla 11 del encargo: *evitar duplicaciones entre Vue y React*. Es declarativa y sin dependencias de framework |
| d | Estilos «dentro del componente» (implícito) | CSS de cada componente en `@tessen/styles/components/<x>.css` | Los estilos los comparten **dos** implementaciones; no pertenecen a ninguna. **Excepción consciente** a la co-location ([ADR 0006](../planning/13-architecture-decisions/0006-styling-authored-css-layers.md)) |
| e | `packages/utils` en la hipótesis inicial | **No se crea** hasta que ≥ 2 paquetes compartan un helper puro que no encaje en `core` | Evita el cajón de sastre; mismo criterio que `shared/` en apps |
| f | Solo `packages/` y `apps/` | Se añaden `integration/` y `tooling/` (privados) | Hacen falta para tests de integración/SSR y configuración común; no se publican |
| g | Carpetas `directives/` etc. | Solo se crean si existen (p. ej. `directives/` en Vue cuando haya `v-motion`) | *No crear carpetas vacías* |

## 5. Reglas de crecimiento

1. **Una carpeta nueva solo se crea con su primer archivo real.**
2. Un componente empieza como **un archivo** y se divide cuando exista razón funcional o técnica (ver [component-architecture §3](component-architecture.md)).
3. Antes de mover algo a `shared/` (apps) o a `core` (paquetes): comprobar que se **comparte realmente** (≥ 2 consumidores) o que es una abstracción transversal.
4. Las apps **no contienen componentes de la librería**: los consumen de `@tessen/vue|react`.
5. Todo artefacto generado (`dist/`, `api.json`, CSS de tokens) es de solo lectura y no se edita a mano.

## 6. Localizar la documentación y las pruebas de un componente

| Qué | Dónde |
|---|---|
| Contrato (especificación canónica) | `packages/core/src/contracts/<c>.contract.ts` |
| Implementación Vue / React | `packages/vue/src/components/<c>/` · `packages/react/src/components/<c>/` |
| Estilos | `packages/styles/src/components/<c>.css` |
| Tests unitarios/componente/a11y | junto a la implementación (`<c>.test.ts`, `<c>.a11y.test.ts`) |
| Runner de contrato | `<c>.contract.test.ts` en cada paquete (usa los casos del contrato) |
| Stories (QA interno) | junto a la implementación (`Button.stories.ts`) |
| Prosa y ejemplos de documentación | `apps/docs/src/features/component-explorer/content/<c>/` (`index.mdx`, `examples/*.vue|*.tsx`) |
| API Reference | generada: `apps/docs/.../api/<c>.json` (nunca editar) |
| Integración / SSR | `integration/*` |
| E2E | `apps/*/e2e` |

La documentación centralizada enlaza cada componente con todas estas ubicaciones desde su página (bloque «Código fuente»).

## 7. Flujo de Git (resumen)

| Rama | Propósito |
|---|---|
| `main` | Releases estables |
| `develop` | Integración |
| `feat/<tema>`, `fix/<tema>`, `docs/<tema>`, `chore/<tema>`, `refactor/<tema>` | Trabajo. **Nombres en inglés**, kebab-case, desde `develop` |

Cada fase/spec se desarrolla en su rama, se **fusiona a `develop` con `--no-ff`** y la rama se **elimina** al terminar. Commits en inglés con *Conventional Commits*. Cuando exista CI, el merge será vía PR.

## 8. Criterios de aceptación (estado)

| Criterio | Estado |
|---|---|
| `packages/vue` y `packages/react` component-oriented | Definido (§3.2); se materializa en F2 |
| Fundamentos por responsabilidad | Definido (§3.1) |
| Apps feature-first | Definido (§3.3) |
| `pages`, `features`, `shared` diferenciados | [feature-architecture](feature-architecture.md) |
| Sin componentes de Tessen duplicados en apps | Regla + comprobación ([dependency-rules §4](dependency-rules.md)) |
| Dependencias respetan límites | Reglas ejecutables definidas; se activan en F1-T01 |
| Sin capas/archivos/carpetas innecesarios | Decisiones §4 y §5 |
| Decisiones documentadas | Este documento + ADR 0002 y 0013 |
