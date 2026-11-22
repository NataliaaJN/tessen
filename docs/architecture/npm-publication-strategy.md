# Estrategia de publicación npm

> Estado: **sin publicación.** Este documento fija qué se hace **hoy** (nada se publica), cómo se valida que los paquetes serían distribuibles (tarballs) y qué se prepararía **solo si el propietario aprueba** la distribución pública.
> Decisiones: [ADR 0012](../planning/13-architecture-decisions/0012-distribution-workspaces-tarballs-npm-later.md) · [0014](../planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md) · [0015](../planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md) · [0016](../planning/13-architecture-decisions/0016-package-distribution-validation-with-pnpm-pack.md).

## 1. Decisiones registradas

1. **`tessen` (sin scope) está ocupado** y no debe usarse como nombre de paquete.
2. El **scope npm final no está aprobado**; el espacio de nombres es **provisional**.
3. **No se necesita publicar en npm** durante el desarrollo.
4. **pnpm workspaces** es el mecanismo principal para compartir paquetes.
5. **`pnpm pack`** es el mecanismo de validación de la distribución.
6. **Prohibido ahora:** publicar, crear una organización npm, contratar un plan, usar paquetes privados, usar `tessen` sin scope.

## 2. Hallazgos de nombres (2026-11-22, solo lecturas)

| Nombre | Estado | Cómo se comprobó |
|---|---|---|
| `tessen` | Ocupado (v0.0.5, deprecado, LGPL-3.0-or-later, terceros) | registro y `npm view` |
| **`@tessen`** | **Ocupado**: existe organización/usuario `tessen` (2 paquetes: `tessen`, `@tessen/type-gen`, deprecados) | página `npmjs.com/org/tessen` + registro |
| `tessen-ui` (sin scope) | Libre en el registro (`E404`) | registro, propietario |
| `@tessen-ui` | Sin usuario/organización: «Scope not found» en `org/` y `~`; 8 nombres candidatos → 404 | registro + páginas de npm |
| `@tessenui` | Ídem | registro + páginas de npm |

**Lo que no se puede afirmar** (y por qué): que el scope se pueda *crear* (solo se confirma intentándolo, prohibido ahora), que siga libre cuando se decida publicar, ni la ausencia de conflictos de marca. Un `E404` de `npm view` **no** prueba disponibilidad: p. ej. `@tessen/core` devuelve 404 y sin embargo el scope `@tessen` es de un tercero.

## 3. Nombres de paquete

### 3.1 Provisional interno (propuesto)

| Documentación (marcador ilustrativo) | `package.json` durante la fase provisional |
|---|---|
| `@tessen/tokens` | `@tessen-ui/tokens` |
| `@tessen/theme` | `@tessen-ui/theme` |
| `@tessen/styles` | `@tessen-ui/styles` |
| `@tessen/icons` | `@tessen-ui/icons` |
| `@tessen/core` | `@tessen-ui/core` |
| `@tessen/motion` | `@tessen-ui/motion` |
| `@tessen/vue` | `@tessen-ui/vue` |
| `@tessen/react` | `@tessen-ui/react` |

Todos con `"private": true`, `"version": "0.0.0"` y dependencias entre sí mediante `workspace:*`. **Se requiere aprobación del propietario** para fijar este mapeo; los documentos **no** se renombran hasta aprobar el scope final.

### 3.2 Centralización del scope
- Una única fuente (`tooling/scope.json` o campo en el `package.json` raíz) declara el scope vigente.
- `pnpm scope:check` (CI) falla si aparece un scope interno distinto.
- `pnpm scope:rename --to @nuevo` (script en `tooling/scripts/`) sustituye de forma mecánica en `package.json`, imports, `exports`, snippets generados y documentación.

### 3.3 Riesgo de *dependency confusion*
Usar un scope que no controlamos (como `@tessen`) permitiría que una dependencia interna no resuelta se descargue del registro desde un tercero. Mitigaciones: scope interno propio sin publicar, `private: true`, `workspace:*`, comprobación del lockfile (las entradas del scope interno deben ser `link:`/`file:`/workspace) y `overrides` a tarballs en los proyectos de consumo.

## 4. Validación de la distribución con `pnpm pack` (sin publicar)

### 4.1 Flujo

```text
pnpm -r build                       # dist/ de cada paquete
pnpm pack:all                       # pnpm pack por paquete → .tarballs/*.tgz  (carpeta ignorada por git)
pnpm integration:install            # genera overrides → instala los .tgz en integration/*
pnpm integration:test               # build + tests de consumo
```
- `pnpm pack` reemplaza `workspace:*` por la versión concreta del paquete en el `package.json` empaquetado **[V]**.
- Cada paquete declara `files`/`exports` explícitos; el tarball **no** contiene `src/`, tests, stories ni configuración.
- Los proyectos de `integration/*` **no** forman parte del grafo del workspace (instalación aislada: sin symlinks al código fuente, sin alias).
- Para que ningún paquete interno se resuelva desde el registro, el `package.json` de cada proyecto de consumo recibe `pnpm.overrides` → `file:../../.tarballs/<paquete>-<versión>.tgz` para **todos** los paquetes internos (el script lo genera).
- **Versiones únicas por empaquetado** (p. ej. `0.0.0-local.<sha>.<n>`) para que la caché de pnpm no reutilice un tarball antiguo con la misma versión.

### 4.2 Qué se valida (checklist por paquete)

| Área | Cómo |
|---|---|
| **Exports públicos** | `publint` sobre el tarball; importar cada subruta del `exports` desde un script ESM de consumo; comprobar que las rutas internas **no** son importables |
| **Declaraciones TypeScript** | `@arethetypeswrong/cli --pack`; `tsc --noEmit` en el proyecto de consumo con `strict` y `moduleResolution: bundler` y `nodenext` |
| **Dependencias de ejecución** | Instalación limpia (sin caché ni `node_modules` previos); `pnpm why`/lockfile: solo lo declarado; sin dependencias fantasma (pnpm estricto) |
| **Peer dependencies** | `vue`/`react` como *peers*; sin avisos de peers sin cumplir; rango mínimo y último (matriz) |
| **Distribución de CSS** | `import '@tessen-ui/styles'` en Vite (Vue y React): el CSS aparece en el build, las capas `@layer` mantienen su orden, importaciones por componente funcionan |
| **Resolución de assets** | Fuentes/SVG referenciados desde CSS/JS resuelven en el build del consumidor (rutas relativas, sin `src/`) |
| **Tree-shaking** | Build de consumo que importa **un** componente; se comprueba que el bundle no contiene los demás (análisis de salida + `size-limit`) |
| **Compatibilidad ESM** | `node --input-type=module -e "import(...)"`; sin CJS salvo decisión explícita; `"type": "module"` coherente |
| **SSR e hidratación** | Fixtures Nuxt (Vue) y Next (React): render en servidor, hidratación sin avisos, ids estables |
| **Integración Vue / React** | Apps `vite-vue` y `vite-react` con un caso de uso por componente publicado |
| **Instalación y build** | `pnpm install --frozen-lockfile` + `pnpm build` en limpio; comprobación adicional con `npm install` |
| **Contenido del paquete** | `npm pack --dry-run` / listado del tarball contra una lista blanca |
| **Tamaño** | `size-limit` sobre el tarball y sobre el bundle del consumidor |

### 4.3 Criterio
Un paquete **no se considera listo para distribución pública** hasta que supera esta validación **además** de los tests del workspace. Se ejecuta en cada PR (subconjunto rápido) y completa en *nightly*/antes de cada versión.

### 4.4 Riesgos
| Riesgo | Mitigación |
|---|---|
| Caché de pnpm con el mismo número de versión | Versiones únicas por empaquetado; `pnpm install --force` en integración |
| Olvidar un paquete interno en los `overrides` | El script los genera desde el grafo; CI falla si el lockfile tiene entradas del scope interno que no sean `file:`/workspace |
| Fixtures SSR (Nuxt/Next) lentos | Subconjunto en PR, completo en nightly |
| Tarballs grandes | `files` explícito y `size-limit` |

## 5. Si el propietario aprueba la distribución pública (futuro, no ahora)

Pasos **preparatorios** que solo se ejecutarán tras aprobación explícita:
1. Elegir el scope definitivo; **volver a comprobar** su disponibilidad (§2).
2. Crear la **organización gratuita** de npm (paquetes **públicos**). Los paquetes privados exigen plan de pago (npm Teams, listado oficialmente en 7 USD por usuario y mes en la documentación consultada el 2026-11-22; verificar la página de precios vigente) **[V con salvedad]** → **no se usan**.
3. Habilitar 2FA en la cuenta; preferir **publicación desde GitHub Actions con *trusted publishing*/provenance** en lugar de tokens de larga duración **[C: validar la opción vigente de npm]**.
4. Renombrar con `pnpm scope:rename`, quitar `private: true` de los paquetes a publicar y revisar `license`, `repository`, `files`, `exports`, `sideEffects`.
5. Versionado y *changelog* con **Changesets** (ya previstos); `pnpm publish` (no `npm publish`, que no reescribe `workspace:` **[V]**).
6. Validar los tarballs (§4) y una **publicación de ensayo contra un registro local** antes de la real.
7. Notas de versión en GitHub Releases (gratuito para repos públicos).
8. Marcar la fase en `docs/planning/11-roadmap.md` (Fase 8) con el desbloqueo de la aprobación.

## 6. Qué no hace falta ahora
Cuenta o token de npm para publicar, organización, dominio, registro privado, CI de publicación, Changesets bot (el CLI local basta).
