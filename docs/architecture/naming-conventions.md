# Convenciones de nombres

> Consistencia **dentro de cada framework**; no se fuerza que Vue y React tengan exactamente los mismos nombres de archivo si perjudica la DX. Decisión de API pública: [ADR 0011](../planning/13-architecture-decisions/0011-public-api-naming.md).
> Ver también: [component-architecture](component-architecture.md) · [feature-architecture](feature-architecture.md).

## 1. Paquetes

| Tipo | Convención | Ejemplos |
|---|---|---|
| Nombre npm | `@tessen/<responsabilidad>` en minúscula | `@tessen/tokens`, `@tessen/vue`, `@tessen/react` |
| Carpeta | igual que el nombre sin scope | `packages/tokens` |
| Subrutas (`exports`) | kebab-case, una por componente | `@tessen/react/date-picker` |
| Paquetes privados | `@tessen-internal/<x>` o `private: true` | `tooling/vite-config` |

## 2. Componentes (paquetes `vue` y `react`)

| Elemento | Vue | React |
|---|---|---|
| Carpeta de componente | `kebab-case` (`date-picker/`) | `kebab-case` |
| Archivo del componente | `PascalCase.vue` (`DatePicker.vue`) | `PascalCase.tsx` (`DatePicker.tsx`) |
| Subcomponentes | `PascalCase` con prefijo del padre (`DialogContent.vue`) | igual (`DialogContent.tsx`) |
| Nombre exportado | prefijo **`T`** (`TButton`, `TDialogContent`) | **sin prefijo** (`Button`, `DialogContent`) |
| `defineOptions({ name })` (Vue) | igual que el export (`TButton`) | — |
| Tipos de props | `ButtonProps` en `button.types.ts` (o en el archivo si es pequeño) | `ButtonProps` (en el `.tsx` o `button.types.ts`) |
| Contexto | `dialog.context.ts` (`provide/inject` con clave tipada) | `dialog.context.ts` (`createContext`) |
| Composables / hooks | `composables/useTheme.ts` | `hooks/useTheme.ts` |
| Directivas (Vue) | `directives/v-motion.ts` → `vMotion` | — |
| Utilidades de framework | `button.utils.ts` (solo si existe) | idem |
| Internos | `internal/<nombre>.ts` | `internal/<nombre>.ts` |
| Punto de export | `index.ts` por componente | `index.ts` por componente |

**Reglas de exports:** exports **con nombre**; sin `default` exports públicos (los `.vue` se re-exportan como nombrado en `index.ts`). Los tipos se exportan con `export type`.

## 3. Contratos, variantes y estilos (compartidos)

| Elemento | Convención | Ejemplo |
|---|---|---|
| Contrato | `contracts/<kebab>.contract.ts`, export `<camel>Contract` | `button.contract.ts` → `buttonContract` |
| Variantes | export `<camel>Variants` dentro del contrato | `buttonVariants` |
| Casos de contrato | `id` con `<componente>.<comportamiento>` | `tabs.arrow-right-moves-focus` |
| Archivo CSS | `styles/src/components/<kebab>.css` | `date-picker.css` |
| Clase de bloque | `t-<kebab>` | `t-date-picker` |
| Clase de parte | `t-<kebab>__<parte>` | `t-dialog__content` |
| Atributos de variante/estado | `data-variant`, `data-size`, `data-tone`, `data-state`, `data-disabled`, `data-invalid`, `data-block` | `[data-variant='outline']` |
| Variables locales | `--t-<kebab>-<propiedad>` | `--t-button-radius` |
| Variables de token | `--tessen-<ruta-del-token>` | `--tessen-color-action-primary-default` |
| Atributos de tema | `data-tessen-theme`, `data-tessen-density`, `data-tessen-motion`, `data-tessen-contrast` | |

## 4. Tokens

- Ruta DTCG `categoría.rol.variante.estado` en kebab-case; sin referencias a pantallas/campañas/componentes concretos en tokens semánticos.
- Tokens de componente: `button.radius`, `dialog.max-width` (carpeta `tokens/src/components/`).
- Capas: primitivos (`color.blue.600`), semánticos (`color.text.primary`), componente (`button.primary.background`).
- Los nombres publicados son **API** (renombrar = *breaking*).

## 5. Tests y stories

| Tipo | Archivo |
|---|---|
| Componente | `<c>.test.ts` / `<c>.test.tsx` |
| Accesibilidad | `<c>.a11y.test.ts(x)` |
| Runner de contrato | `<c>.contract.test.ts(x)` |
| Stories | `<Pascal>.stories.ts(x)` |
| Unitarios de utilidades | `<archivo>.test.ts` junto al archivo |
| Integración | `integration/<caso>/…` |
| E2E | `apps/<app>/e2e/<flujo>.spec.ts` |
| `describe` | Usa IDs de requisito cuando aplique (`describe('CMP-05 Select …')`) |

Consultas de test por **rol y nombre accesible**; `data-testid` solo como último recurso.

## 6. Aplicaciones y features

| Elemento | Convención | Ejemplo |
|---|---|---|
| Feature (carpeta) | `kebab-case`, nombre de capacidad (no de componente) | `color-editor`, `code-generator` |
| Componente de feature | `PascalCase` con el nombre de la feature | `ColorEditorPanel.vue` |
| Composable / hook | `use<Feature>.ts` | `useColorEditor.ts` |
| Estado | `<feature>.store.ts` | `color-editor.store.ts` |
| Servicios | `<feature>.service.ts` | `export-theme.service.ts` |
| Tipos | `<feature>.types.ts` | |
| API pública de feature | `index.ts` | |
| Página | `PascalCase` + `Page` (Vite) · ruta por archivo (Astro) | `PlaygroundPage.vue` · `pages/components/[slug].astro` |
| `shared/` | subcarpetas por tipo con contenido real: `components`, `composables`, `lib`, `types`, `state`, `events` | |

## 7. Archivos y herramientas

| Tipo | Convención |
|---|---|
| Archivos TS no-componentes | `kebab-case.ts` |
| Constantes | `UPPER_SNAKE` solo para constantes verdaderas; si no, `camelCase` |
| Tipos/Interfaces | `PascalCase`; sin prefijo `I` |
| Scripts de repo | `tooling/scripts/<verbo>-<objeto>.ts` (`check-tokens.ts`) |
| Comandos pnpm | `verbo:objeto` (`tokens:check`, `deps:check`, `parity:api`, `docs:check`) |
| Changesets | descripciones en inglés, imperativo, mencionando el paquete |

## 8. Git

| Elemento | Convención |
|---|---|
| Ramas | `feat/…`, `fix/…`, `docs/…`, `chore/…`, `refactor/…`, `test/…`; **en inglés**, `kebab-case`, desde `develop` |
| Commits | *Conventional Commits* en inglés: `feat(react): add Dialog`, `docs(planning): …` |
| Merge | `--no-ff` a `develop`; la rama de trabajo se **elimina** al terminar |
| Releases | desde `main` vía Changesets |

## 9. Idiomas

- Documentos de planificación y arquitectura internos: **español**.
- Código, identificadores, comentarios de código, commits y ramas: **inglés**.
- Documentación pública de la plataforma: recomendada en inglés (decisión D-14).
