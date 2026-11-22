# Flujo de desarrollo (local primero, GitHub como única plataforma)

> Decisiones: [ADR 0014](../planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md) (sin coste, GitHub-first) · [ADR 0015](../planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md) (npm provisional) · [ADR 0016](../planning/13-architecture-decisions/0016-package-distribution-validation-with-pnpm-pack.md) (tarballs).
> Los comandos son el **diseño objetivo**: no existen hasta que se ejecute `F1-T01` (no hay código todavía).

## 1. Principios

1. Todo funciona **desde el repositorio**, sin publicar y sin servicios de pago.
2. pnpm workspaces es el mecanismo de compartición; **no** hay symlinks globales (`pnpm link --global`/`npm link`) salvo necesidad demostrada.
3. Cada paquete es **construible por separado** (`pnpm --filter <pkg> build`) y su `package.json` declara sus dependencias reales.
4. La arquitectura y los límites de paquetes **no cambian** por este flujo ([`dependency-rules`](dependency-rules.md)).

## 2. Entorno local

| Requisito | Notas |
|---|---|
| Node | Recomendado **LTS** (22 o 24) con `engines` y `.nvmrc`. Storybook 10 exige 20.16+/22.19+/24+ **[V]**. *En la máquina actual está activo Node 26 (no LTS); fijar una LTS al empezar F1.* |
| pnpm | Versión fijada con `packageManager` en el `package.json` raíz. *Hoy `pnpm` no está instalado para el Node activo*; instalarlo en F1-T01 (gratuito) |
| Git | Ramas y merges según [`repository-structure` §7](repository-structure.md) |
| Navegadores para tests | Playwright descarga Chromium/Firefox/WebKit (herramienta libre; no es un servicio) |
| Docker/Podman | **Opcional**: solo para reproducir en local el *rendering* de los baselines visuales. Docker Desktop tiene condiciones de licencia propias; Podman es libre |

Instalación: `pnpm install` en la raíz (resuelve todos los `workspace:*` sin registro para los paquetes internos).

## 3. Desarrollo dentro del monorepo

```jsonc
// packages/vue/package.json (ilustrativo; nombres provisionales, ADR 0015)
{
  "name": "@tessen-ui/vue",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "dependencies": { "@tessen-ui/core": "workspace:*" },
  "peerDependencies": { "vue": "^3.5.0", "@tessen-ui/styles": "workspace:*" }
}
```

| Tarea | Comando objetivo |
|---|---|
| Instalar | `pnpm install` |
| Desarrollar un paquete (watch) | `pnpm --filter @tessen-ui/vue dev` |
| Compilar un paquete (independiente) | `pnpm --filter @tessen-ui/vue build` |
| Compilar todo (orden por grafo) | `pnpm build` (Turborepo; caché local, **sin** caché remota de pago) |
| Tests | `pnpm test` / `pnpm --filter … test` |
| Verificación completa previa a PR | `pnpm verify` (lint + tipos + `tokens:check` + `deps:check` + tests + build) |
| Apps en local | `pnpm --filter docs dev` · `pnpm --filter theme-studio dev` · `pnpm --filter playground dev` (o `pnpm dev` para todas) |
| Storybook (QA interno) | `pnpm --filter @tessen-ui/vue storybook` · `… react storybook` |

Las apps (`docs`, `theme-studio`, `playground`) consumen los paquetes del workspace; **también** existen apps de integración (`integration/*`) que consumen los **artefactos empaquetados** (§4).

## 4. Consumir Tessen desde un proyecto externo propio

El proyecto externo **no** debe depender de ficheros fuente internos ni de alias no documentados: consume paquetes **construidos**.

### Opción A — Tarballs (recomendada)
```powershell
# En el repositorio de Tessen
pnpm build
pnpm pack:all                     # genera .tarballs/*.tgz (carpeta ignorada por git)
# En tu proyecto
pnpm add ..\tessen\.tarballs\tessen-ui-vue-<versión>.tgz ..\tessen\.tarballs\tessen-ui-styles-<versión>.tgz
```
Como el tarball de `vue` depende de otros paquetes internos (`core`, …), el proyecto debe forzarlos a los `.tgz` con `pnpm.overrides` (el script `pnpm pack:all --print-overrides` imprime el bloque listo para pegar) **para evitar que se resuelvan desde el registro** (ADR 0015).

### Opción B — Directorio local construido
`pnpm add file:..\tessen\packages\vue` (usa el `package.json` real del paquete, con `exports` apuntando a `dist/`). Útil para iteraciones rápidas; **no** equivale a un tarball (no aplica `files`/`pack`), así que la validación final es la A.

### Cuándo usar cada una
| Situación | Opción |
|---|---|
| Probar que un paquete es distribuible | A |
| Iterar rápido en una app propia | B (o trabajar dentro del workspace) |
| Dentro del monorepo | `workspace:*` |

Cuando los paquetes sean estables y se apruebe publicarlos, npm público pasará a ser el mecanismo de consumo más simple ([`npm-publication-strategy` §5](npm-publication-strategy.md)); **no forma parte del alcance actual**.

## 5. Validación de tarballs
Procedimiento y checklist completos en [`npm-publication-strategy` §4](npm-publication-strategy.md): `pnpm pack:all` → `integration:install` → `integration:test` (Vite-Vue, Vite-React, Nuxt, Next).

## 6. Estrategia de repositorio en GitHub

| Aspecto | Decisión |
|---|---|
| Repositorio | **Público**: `github.com/NataliaaJN/tessen` (fuente de verdad: código, docs, ADRs, planificación, tests, configuración de build, workflows CI, changelogs y notas de versión) |
| Estado observado | `git remote` apunta a `git@github.com:NataliaaJN/tessen.git`, pero la API pública de GitHub devuelve **404** para ese repositorio (no existe o es privado). Hay que crearlo/publicarlo por el propietario. **No se ha hecho `push`** |
| Ramas | `main` (estable), `develop` (integración), ramas de trabajo en inglés (`feat/…`, `fix/…`, `docs/…`, `chore/…`) con merge `--no-ff` a `develop` y borrado de la rama |
| PRs | Cuando el repo sea público: PR de cada rama a `develop` con CI verde. Hasta entonces, merges locales |
| Issues | Para tareas cuando aporten (etiquetas: `phase:*`, `type:*`, `area:*`, `good-first-task`); sin herramientas externas de gestión |
| Protección de ramas | `main` y `develop` con CI obligatorio y sin *force push*; disponible gratis en repos públicos |
| Changelogs / notas | Changesets genera `CHANGELOG.md` por paquete; **GitHub Releases** (gratis) para notas cuando se publique una versión etiquetada |
| Secretos | **Ninguno necesario** hoy (sin publicación ni despliegue). `GITHUB_TOKEN` con permisos mínimos |
| Dependencias | **Dependabot** (npm + GitHub Actions) integrado en GitHub; sustituye a Renovate |

## 7. CI con GitHub Actions (diseño; se crea en F1-T01)

**Coste:** en repositorios **públicos** los *runners* estándar alojados por GitHub son gratuitos y sin tope de minutos **[V: documentación de GitHub]**; si el repositorio pasara a privado habría cuota incluida y cargos al excederla. **Larger runners siempre se cobran → no se usan.** Sin tarjeta, sin servicios externos.

| Workflow | Disparador | Jobs | Notas |
|---|---|---|---|
| `ci.yml` | PR y push a `develop`/`main` | `verify` (lint, tipos, `tokens:check`, `deps:check`, `scope:check`) · `test` (Vitest, matriz de paquetes) · `build` (+ `publint`, `attw`, `size-limit`) · `pack-integration` (tarballs → `integration/*`) · `a11y-visual` (Playwright; *sharded*) | `permissions: contents: read`; `concurrency` con cancelación; caché de pnpm; artefactos con retención corta (≤ 7 días) |
| `nightly.yml` | `schedule` | Matriz completa (Vue 3.5.x mín./último, React 18.3/19, Nuxt/Next SSR, navegadores) | Los workflows programados se desactivan tras inactividad prolongada en repos públicos **[C]** |
| `dependabot.yml` | semanal | actualizaciones agrupadas npm y Actions | Revisión manual |
| **No existe** | — | `release`, `deploy-*`, `pages` | Hasta aprobación explícita |

Buenas prácticas: usar solo acciones oficiales (`actions/*`) y `pnpm/action-setup`, **fijadas por SHA**; sin `pull_request_target`; sin secretos.

**Regresión visual y coste:** los baselines se generan y comparan en el *runner* Linux de CI (fuente de verdad) y se almacenan en el repositorio **sin Git LFS** (la cuota de LFS puede acarrear cargos); se limita el número/peso de capturas y se evitan baselines de pantalla completa. En local, las pruebas visuales son informativas salvo que se use contenedor Linux.

## 8. Flujo diario recomendado

1. `git checkout develop && git pull` → `git checkout -b feat/<tema>`.
2. Cambiar código con `pnpm dev`/Storybook; añadir tests y, si procede, un **changeset**.
3. `pnpm verify` en local (incluye `deps:check`).
4. Si cambia el empaquetado o los exports: `pnpm pack:all && pnpm integration:test`.
5. Commit (Conventional Commits en inglés) → merge `--no-ff` a `develop` → borrar la rama.

## 9. Registro de servicios externos

Ningún servicio se activa sin aprobación explícita. Columnas: ¿gratuito? · límites · ¿tarjeta? · ¿cargos automáticos posibles? · ¿esencial? · alternativa local/gratuita.

| Servicio | Estado | ¿Gratuito? | Límites relevantes | ¿Tarjeta? | ¿Cargos automáticos? | ¿Esencial? | Alternativa |
|---|---|---|---|---|---|---|---|
| **GitHub** (repo público, Issues, Releases) | **En uso** | Sí | Repo público sin cuota de coste | No | No, salvo que se activen funciones de pago | **Sí (única plataforma)** | Git local (sin Issues/CI) |
| **GitHub Actions** (runners estándar) | **Previsto** (CI) | Sí en repos públicos **[V]** | Ilimitado en públicos; larger runners **siempre** de pago; si el repo es privado, cuota | No para uso gratuito | **Solo** si se usan larger runners o repo privado con exceso y facturación activa | Recomendado | `pnpm verify` en local |
| **Dependabot** | **Previsto** | Sí | — | No | No | Opcional | Revisión manual de dependencias |
| **npm registry — instalación (lectura)** | En uso al instalar dependencias de terceros | Sí | — | No (sin cuenta) | No | Sí | — |
| **npm — publicación / organización** | **No usado** | Públicos: sí; **privados: no** (Teams ≈ 7 USD/usuario·mes **[V con salvedad]**) | — | Para planes de pago | Sí si se activan planes | No | Workspaces + tarballs |
| **GitHub Pages** | **No activado** | Sí en repos públicos **[V]** | Sitio ≤ 1 GB, ancho de banda ~100 GB/mes (blando), 10 builds/h (blando; no aplica con workflow propio), despliegue ≤ 10 min **[V]** | No | No esperables | No | Docs locales |
| **Cloudflare Pages / Vercel / Netlify** | **No usado / no autorizado** | Planes gratuitos existen **[C]** | Términos y límites propios; algunos planes gratuitos excluyen uso comercial **[C]** | Variable | Posible al exceder | No | Docs locales o GitHub Pages (futuro) |
| **Dominios** | **No usado** | No (de pago) | — | Sí | Renovaciones automáticas | No | Ninguna necesaria |
| **Chromatic** (visual testing) | **Descartado** | Plan gratuito limitado **[C]** | Cuota de capturas | Variable | Posible | No | Playwright |
| **Renovate** (app de GitHub) | **Descartado** | Sí para OSS **[C]** | — | No | No | No | Dependabot |
| **Git LFS** (GitHub) | **No usado** | Cuota gratuita limitada **[C]** | Almacenamiento/ancho de banda | Para ampliar | **Sí** al exceder con facturación activa | No | Baselines compactas sin LFS |
| **Google Fonts / CDNs de fuentes** | **No usado** | Gratis, pero es una dependencia externa en runtime | — | No | No | No | **Autoalojar** fuentes (p. ej. paquetes `@fontsource/*`, OFL **[C]**) |
| **Playwright browsers (descarga)** | Herramienta | Sí (software libre) | — | No | No | Sí para tests e2e/visuales | — |
| **Docker Desktop** | Opcional | Gratis para uso personal **[C]** (condiciones de licencia en empresas) | — | No | No | No | Podman, o solo CI |
| **Verdaccio** (registro local) | No usado | Sí (software libre, local) | — | No | No | No | `pnpm pack` |
| **Figma** (kit de diseño) | **Fuera de alcance** (D-15) | Plan gratuito existe **[C]** | Límites propios | No | No | No | Exportación DTCG |

### Costes potenciales identificados
- npm: **planes de pago solo para paquetes privados** → no se usan.
- GitHub: cargos solo por **larger runners**, **LFS** por encima de cuota, repositorio **privado** que exceda minutos y funciones como Codespaces/Copilot → **no se usan ni se activan**.
- Dominios y hosting: **ninguno** contratado.
