# 13 — Architecture Decision Records (ADR)

Cada ADR documenta **una** decisión arquitectónica: contexto, decisión, alternativas, consecuencias y disparadores de revisión. Formato: [MADR](https://adr.github.io/madr/) simplificado, en español.

**Estados:** `Accepted` (decisión firme) · `Proposed` (recomendada; pendiente de validación del propietario o de un spike) · `Superseded` · `Deprecated`.
**Regla:** una decisión `Accepted` solo se modifica creando un ADR nuevo que la *supersede*.

| ADR | Título | Estado |
|---|---|---|
| [0001](0001-monorepo-pnpm-turborepo-changesets.md) | Monorepo con pnpm + Turborepo + Changesets | Proposed |
| [0002](0002-component-oriented-packages-feature-first-apps.md) | Component-oriented en packages, feature-first en apps | **Accepted** (definida por el propietario) |
| [0003](0003-multiframework-strategy.md) | Estrategia multiframework: implementaciones nativas sobre fundamentos compartidos | Proposed |
| [0004](0004-behavior-engine-zagjs.md) | Motor de comportamiento compartido: Zag.js (sujeto a spike S1) | Proposed |
| [0005](0005-design-tokens-dtcg-style-dictionary.md) | Tokens en DTCG 2025.10 con Style Dictionary y 3 capas | Proposed |
| [0006](0006-styling-authored-css-layers.md) | Estilos: CSS autorado con `@layer` y variables; Tailwind solo como puente | Proposed |
| [0007](0007-motion-layered-system.md) | Motion por capas: CSS → WAAPI propio → Motion opcional | Proposed |
| [0008](0008-platform-astro-and-vue-spas.md) | Plataforma: Astro (docs) + Vite/Vue (Theme Studio y Playground) | Proposed |
| [0009](0009-testing-contracts-and-parity.md) | Calidad: contratos, paridad Vue↔React y estrategia de pruebas | Proposed |
| [0010](0010-build-vite-library-mode.md) | Build: Vite library mode, ESM sin empaquetar | Proposed |
| [0011](0011-public-api-naming.md) | Nomenclatura de API pública (Vue `T`-prefijo, React sin prefijo) | **Accepted** |
| [0012](0012-distribution-workspaces-tarballs-npm-later.md) | Distribución: workspaces y tarballs ahora; npm público solo con aprobación; registry estilo shadcn diferido | Accepted (revisada 2026-11-22) |
| [0013](0013-dependency-boundary-enforcement.md) | Reglas de dependencias aplicadas con dependency-cruiser | Proposed |
| [0014](0014-zero-cost-github-first-infrastructure.md) | Desarrollo sin coste y GitHub como única plataforma externa | **Accepted** (decisión del propietario) |
| [0015](0015-npm-namespace-provisional-no-publication.md) | Espacio de nombres npm provisional y sin publicación | **Accepted** (+ mapeo de nombres internos Proposed) |
| [0016](0016-package-distribution-validation-with-pnpm-pack.md) | Validación de la distribución con `pnpm pack` | **Accepted** (procedimiento validado en F1-T09; SSR/peers/size-limit en F2) |
| [0017](0017-theme-engine-and-studio.md) | Motor de temas y Theme Studio | **Accepted** (F5) |

Plantilla: [`_template.md`](_template.md).
