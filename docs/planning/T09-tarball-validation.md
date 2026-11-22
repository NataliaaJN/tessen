# F1-T09 · Validación por tarballs

> **Estado:** completado (2026-11-22). Mecanismo de [ADR 0016](13-architecture-decisions/0016-package-distribution-validation-with-pnpm-pack.md) y checklist de [`npm-publication-strategy` §4](../architecture/npm-publication-strategy.md) ejecutados sobre `tokens`, `styles` y `core` (y, de paso, `icons` y `motion`).
> **Pregunta:** ¿funcionan los paquetes **como los instalaría un consumidor**, sin `src/`, sin alias y sin el grafo del workspace?
> **Respuesta:** sí, tras corregir dos defectos de empaquetado que los tests del workspace no veían (§3).

## 1. Qué se construyó

| Pieza | Dónde | Qué hace |
| --- | --- | --- |
| `pnpm pack:all` | `tooling/scripts/pack-all.mjs` | `pnpm pack` de cada paquete a `.tarballs/` (ignorada por git) con versión única `0.0.0-local.<sha>.<segundos>` (escrita solo durante el empaquetado y restaurada siempre) y `manifest.json` |
| `pnpm tarball:check` | `tooling/scripts/tarball-check.mjs` | Contenido contra lista blanca y prohibiciones, sin `workspace:` en el manifiesto empaquetado, cada destino de `exports` presente, `publint --strict` y `attw --profile esm-only` |
| `pnpm integration:install` | `tooling/scripts/integration-install.mjs` | Por proyecto: genera `pnpm-workspace.yaml` (raíz propia, `overrides` a **todos** los tarballs), borra `node_modules`/lockfile e instala con `--force`; luego revisa el lockfile |
| `pnpm integration:test` | `tooling/scripts/integration-test.mjs` | `typecheck` + `build` + comprobaciones de consumo en cada proyecto |
| `integration/vite-vue`, `integration/vite-react` | fuera del workspace | App mínima con Vite que usa `styles`, `motion`, `core` e `icons` solo por subrutas públicas |
| `scope:check` ampliado | `tooling/scripts/scope-check.mjs` | Los lockfiles de `integration/*` solo pueden resolver paquetes internos desde `file:` (sin entradas del registro y con al menos una) |
| `pnpm dist:verify` | `package.json` | Cadena completa: build → pack → tarball:check → install → test → scope:check |

En CI (`.github/workflows/ci.yml`) se ejecuta tras `pnpm build`. Solo se crean archivos locales: no se publica nada.

## 2. Resultados por área del checklist

| Área (§4.2) | Resultado |
| --- | --- |
| Exports públicos | `publint --strict` limpio; cada subruta JS se importa con `node --input-type=module -e "import(...)"` desde el proyecto de consumo; los CSS/JSON/SVG resuelven con `import.meta.resolve`; rutas internas (`core/dist/...`, `tokens/src/...`, `styles/dist/...`, `icons/dist/...`) lanzan `ERR_PACKAGE_PATH_NOT_EXPORTED` |
| Declaraciones TypeScript | `attw` limpio (ESM; `node16` y `bundler`); `tsc --strict` con `moduleResolution: bundler` (Vue con `vue-tsc`) **y** `NodeNext`, con `skipLibCheck: false`; un `@ts-expect-error` prueba que los tipos de variantes llegan al consumidor |
| Dependencias de ejecución | Instalación limpia desde tarballs; ningún paquete tiene `dependencies` de ejecución (solo `peerDependencies` opcionales en `icons`) |
| Peers | `vite-vue` no tiene `react` y `vite-react` no tiene `vue`: sin avisos (peers opcionales). **Matriz de versiones mínimas: pendiente** |
| CSS | `import '@tessen-ui/styles/index.css'` y `@tessen-ui/motion/motion.css` en Vite (Vue y React): el CSS entra en el build; orden efectivo de capas `reset → tokens → base → components → utilities` y tokens/`@keyframes` presentes |
| Tree-shaking | La app importa solo `buttonVariants`; el bundle no contiene `defineContract`, los casos del contrato ni `leadingIcon` |
| ESM | Todos los paquetes `"type": "module"`, sin CJS |
| Contenido | Lista blanca por paquete; sin tests, `tsconfig`, mapas, scripts ni stories |
| Lockfile | Las entradas `@tessen-ui/*` son `file:` en los dos proyectos; `scope:check` lo comprueba |

## 3. Hallazgos

1. **`styles` exportaba `./components/*.css` sin ningún archivo.** `publint` lo marca como error. Se retira el export hasta que exista la primera hoja de componente (F2); el comodín debe volver con ella.
2. **`import '@tessen-ui/styles'` falla con TS 6 estricto (TS2882)**: un `import` de efecto lateral sin extensión no casa con el `*.css` de `vite/client`. Se añade el alias `./index.css` (misma ruta que `.`) y las apps lo usan. La entrada `.` se mantiene para bundlers que no tipan.
3. **`attw` no entiende subrutas CSS/JSON/SVG** y las da por «Resolution failed». Se le pasan solo las entradas con condición `types`; el resto lo cubren `publint` y las comprobaciones de consumo.
4. **Vite minifica `@layer a, b, c;` en varias sentencias** (`@layer tessen.reset;` … `@layer tessen.components,tessen.utilities;`). Es equivalente, pero una comprobación textual falla: el check compara el orden efectivo de aparición.
5. **Versiones únicas.** Con `pnpm install --force` y versión distinta por empaquetado no se vio caché obsoleta de `file:`.
6. **GNU `tar` interpreta `C:` como host.** Los scripts ejecutan `tar` con el tarball como ruta relativa a su carpeta.
7. **Windows:** no dejar la terminal dentro de `integration/*/dist` al compilar (EPERM de Rolldown).

## 4. Fuera de alcance (no hecho, con motivo)

- **Nuxt/Next (SSR e hidratación):** ya se probó SSR con Zag en `spikes/zag-s2-nuxt` y `-next`, pero no hay componentes Tessen que hidratar. Entra con los primeros componentes (F2).
- **`npm install` adicional y matriz de peers mínimos/último:** no aportan hasta que existan `@tessen-ui/vue`/`react` con peers reales.
- **`size-limit`:** sin presupuestos definidos todavía; se fija con el primer componente.
- **Tipado de snippets generados** (hallazgo 7 de [T07](T07-button-parity.md)): `Button` aún no existe como paquete; se compilarán los snippets con `vue-tsc`/`tsc` en estos proyectos cuando exista.
- **Instalación desde un registro local (Verdaccio):** el flujo de tarballs no resultó incómodo; no se reevalúa.

## 5. Veredicto

**Gate de la Fase 1 (parte «tokens empaquetables y validados como tarball»): cumplido.** ADR 0016: el procedimiento pasa de `Proposed` a `Accepted` para el alcance de F1 (el resto del checklist se activa con F2). Siguiente: revisión del gate de Fase 1.
