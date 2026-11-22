# Arquitectura feature-first de las aplicaciones

> Aplica a `apps/docs`, `apps/theme-studio` y `apps/playground` ([ADR 0002](../planning/13-architecture-decisions/0002-component-oriented-packages-feature-first-apps.md)). Las aplicaciones se organizan alrededor de **lo que ofrecen al usuario**, no alrededor de una colección global de componentes.
> Ver también: [repository-structure](repository-structure.md) · [dependency-rules](dependency-rules.md) · [naming-conventions](naming-conventions.md).

## 1. Las cuatro carpetas de `src/`

```text
apps/<app>/src/
├── app/        # arranque: montaje, router, providers, layouts globales, configuración
├── pages/      # rutas; componen features
├── features/   # funcionalidades completas
└── shared/     # lo verdaderamente transversal
```

| Carpeta | Responsabilidad | Puede depender de | No puede |
|---|---|---|---|
| `app/` | Bootstrap, rutas (registro), providers globales (tema, motion), layouts | `pages`, `features` (por `index`), `shared`, paquetes Tessen | — |
| `pages/` | **Delgadas.** Representan rutas; **componen** features; leen parámetros de ruta y los pasan | `features` (por `index`), `shared`, paquetes | Contener lógica de negocio ni estado complejo |
| `features/<x>/` | Funcionalidad autocontenida: UI, estado, lógica, tipos, servicios y tests propios. Interfaz pública = `index.ts` | `shared`, paquetes Tessen | `pages`, `app`, **otras features** |
| `shared/` | Abstracciones **transversales**: componentes de aplicación reutilizables, utilidades, composables, tipos y servicios | paquetes Tessen, librerías | `features`, `pages`, `app` (es hoja) |

## 2. Anatomía de una feature

No hay plantilla fija: **crece con la necesidad**. Una feature puede contener cualquiera de estas piezas:

```text
features/<feature>/
├── index.ts                  # API pública (lo único importable desde fuera)
├── <Feature>Panel.vue        # UI propia de la feature
├── components/               # solo si hay varios subcomponentes
├── use<Feature>.ts           # composable / hook de la feature
├── <feature>.store.ts        # estado propio (si lo hay)
├── <feature>.service.ts      # lógica/servicios
├── <feature>.types.ts        # tipos
├── <feature>.test.ts         # tests (también de la feature, no solo de la app)
└── …                         # lo que realmente haga falta
```
Reglas:
1. **Encapsulación:** lo que no está en `index.ts` es privado a la feature.
2. **Independencia:** una feature no conoce la página ni la ruta donde se monta.
3. **Sin plantillas vacías:** una feature pequeña puede ser `index.ts` + un componente.
4. **Pruebas:** unitarias/componente junto a la feature; E2E en `apps/<app>/e2e`.

## 3. Prueba de admisión para `shared/`

Antes de mover algo a `shared/` debe cumplirse **una** condición:
1. Lo usan **≥ 2 features** hoy (no «podrían usarlo»).
2. Es una abstracción transversal inequívoca (cliente HTTP, i18n, router helpers, tipos globales, layout de aplicación).

Si falla: **se queda en la feature**. Estructura de `shared/` (solo subcarpetas con contenido): `components/`, `composables/`, `lib/`, `types/`, `state/`, `events/`.

**`shared/components` ≠ componentes de Tessen.** Puede haber `AppShell`, `PageHeader`, `CodeBlock` (composiciones específicas de la app **que usan** `@tessen/vue`). **Prohibido** recrear `Button`, `Dialog`, `Input`… (regla 10 en [dependency-rules](dependency-rules.md)).

## 4. Mapa de features por aplicación

### 4.1 `apps/docs` (Astro)
`component-explorer` (listado, filtros, página de componente, demo) · `documentation` (MDX, TOC, guías) · `global-search` (Ctrl/⌘ K) · `navigation` (sidebar, migas) · `api-reference` (render de `api.json`) · `tokens-explorer` · `motion-lab` · `framework-switcher` (selector Vue/React global). *(Se añaden cuando se implementan; no se crean vacías.)*

### 4.2 `apps/theme-studio`
`theme-manager` (guardar/importar/lista/historial) · `color-editor` (acento, escala OKLCH, contraste) · `typography-editor` · `token-editor` (modo avanzado, alias, validación) · `theme-preview` (galería e iframe) · `export-theme` (CSS/DTCG/Tailwind/TS).

### 4.3 `apps/playground`
`component-preview` (iframes Vue/React + protocolo) · `props-editor` (controles desde el contrato) · `state-controls` (hover/focus/disabled/invalid/loading) · `code-generator` (snippets Vue/React) · `responsive-preview` (anchos, tema).

## 5. Ejemplo real de feature: `code-generator` (Playground)

**Responsabilidad:** a partir del estado del componente (props elegidas) produce el código Vue y React copiable.
**Qué reutiliza:** la lógica pura de generación vive en `@tessen/core/codegen` (la usan también las docs); la feature aporta la **UI y el estado** del panel. No duplica la generación.

```text
apps/playground/src/features/code-generator/
├── index.ts                       # export { CodeGeneratorPanel, useGeneratedCode }
├── CodeGeneratorPanel.vue         # pestañas Vue|React, botones Copiar/Descargar
├── useGeneratedCode.ts            # computed: estado → snippet
├── code-generator.types.ts
└── code-generator.test.ts
```
```ts
// useGeneratedCode.ts
import { computed, type Ref } from 'vue'
import { generateSnippet } from '@tessen/core/codegen'
import type { ComponentState, Framework } from './code-generator.types'

export function useGeneratedCode(state: Ref<ComponentState>, framework: Ref<Framework>) {
  return computed(() => generateSnippet(state.value.contractId, state.value.props, framework.value))
}
```
```ts
// index.ts  (API pública)
export { default as CodeGeneratorPanel } from './CodeGeneratorPanel.vue'
export { useGeneratedCode } from './useGeneratedCode'
export type { ComponentState, Framework } from './code-generator.types'
```
```vue
<!-- pages/PlaygroundPage.vue — delgada: compone features -->
<script setup lang="ts">
import { ComponentPreview } from '@/features/component-preview'
import { PropsEditor } from '@/features/props-editor'
import { CodeGeneratorPanel } from '@/features/code-generator'
import { usePlaygroundRoute } from '@/app/router' // ← la página lee la ruta, las features no
const { componentId, state } = usePlaygroundRoute()
</script>
<template>
  <PropsEditor v-model="state" :component-id="componentId" />
  <ComponentPreview :component-id="componentId" :state="state" />
  <CodeGeneratorPanel :state="state" />
</template>
```
- La **página** conecta las features (`state` compartido); `PropsEditor` y `CodeGeneratorPanel` no se importan entre sí (regla 9).
- `CodeGeneratorPanel` usa `TButton`, `TTabs` de `@tessen/vue` (no copias).
- Las pruebas de la feature (`code-generator.test.ts`) verifican que el snippet cambia con el estado y que el botón copia; la **compilación** de snippets se cubre en integración (P4, `06` §4).

## 6. Ejemplo real de feature: `export-theme` (Theme Studio)

```text
features/export-theme/
├── index.ts                       # ExportThemeDialog, useExportTheme
├── ExportThemeDialog.vue
├── useExportTheme.ts
├── formatters/                    # sub-carpeta porque hay 4 formateadores con tests propios
│   ├── css.ts  dtcg.ts  tailwind.ts  typescript.ts
│   └── formatters.test.ts
└── export-theme.test.ts
```
Los formateadores **puros** viven en `@tessen/theme` si se reutilizan fuera de la app (docs, CLI); aquí solo orquesta la UI. Mientras solo los use esta feature, se quedan en la feature.

## 7. Comunicación entre features y estado

Ver tabla de patrones en [dependency-rules §5](dependency-rules.md): composición en la página → estado en `shared/state` solo si lo usan ≥ 2 features → eventos tipados → promoción a paquete si es agnóstico → excepción justificada.

Gestión de estado: composables/stores **por feature**; un store global solo para estado verdaderamente global (tema activo, preferencias) y ubicado en `shared/state`. Pinia solo si la complejidad lo exige.

## 8. Rutas y `pages/`

- En Astro: `src/pages/` son las rutas de Astro (file-based); las islas llaman a features.
- En Vite+Vue: `pages/` contiene los componentes de ruta; el **registro** de rutas está en `app/router`.
- Una página: ≤ ~80 líneas orientativas; si crece, la lógica sobra y debe bajar a una feature.

## 9. Anti-patrones

| Anti-patrón | Corrección |
|---|---|
| `shared/` como cajón de sastre | Prueba de admisión (§3) |
| Feature importa de otra feature | Componer en la página / evento / `shared` |
| Página con fetch, estado y reglas de negocio | Mover a la feature |
| `src/components/` global con todo | Cada componente pertenece a una feature o es de `shared` si es transversal |
| `shared/ui/Button.vue` | Usar `TButton` de `@tessen/vue` |
| Feature depende de la ruta/URL | Recibir datos por props/parámetros |
