# 08 — Plataforma web de Tessen

> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[H]** hipótesis · **[R]** recomendación.
> Fuentes de inspiración: Fluent 2 (estructura documental) y rM Theme Studio (experiencia de personalización). Análisis en `02`.

## 1. Visión de la plataforma

La plataforma es el «centro de operaciones» de Tessen: **no** una landing comercial ni una documentación estática. Combina:

- **Claridad documental de Fluent 2** [V]: portada con doble entrada *Diseñar / Desarrollar*, fundamentos como disciplina, página de componente con anclas (Resources · Types · Behavior · Layout · Accessibility · Content), tokens en capas, guías de contenido y accesibilidad.
- **Experiencia interactiva de rM Theme Studio** [V]: tema global siempre a mano en un *drawer*, cambios instantáneos sobre todo el sistema, presets + acento + palancas, estado persistido en el navegador, exportación, Motion lab, Spaces/Templates como prueba de composición.
- **Lo que ninguna ofrece junto [R]**: guía + demo + API + código **Vue y React** en una página, generados de una única fuente.

## 2. Arquitectura de la plataforma

Tres aplicaciones independientes (ADR 0002, 0008), todas **feature-first**, que consumen los paquetes públicos de Tessen:

| App | Rol | Tecnología | URL prevista |
|---|---|---|---|
| `apps/docs` | Home, Components, Documentation, Guidelines, Resources, Motion, Changelog | Astro + MDX + islas Vue/React | `tessen.dev/` |
| `apps/theme-studio` | Editor visual de temas/tokens | Vite + Vue 3 | `tessen.dev/studio` o subdominio |
| `apps/playground` | Laboratorio de componentes + codegen | Vite + Vue 3 | `tessen.dev/playground` |

Navegación cruzada: cabecera común (**Components · Docs · Studio · Playground · Guidelines · Resources**), tema compartido entre apps vía `localStorage` + parámetro URL, y enlaces profundos («Abrir en Playground», «Personalizar en Studio») que transportan estado en la URL.

### 2.1 Flujo de datos (único origen)

```text
packages/core/contracts  ─┐
packages/vue|react (tipos)─┼─► tooling/docs-gen ─► api.json por componente ─► apps/docs, apps/playground
packages/tokens (dist)   ──┘                       tokens.json            ─► apps/docs, apps/theme-studio
apps/docs/.../examples/*.vue|*.tsx  ──(?raw)──► código mostrado == código ejecutado
```

- **API Reference** (PLT-03): `vue-component-meta` + `react-docgen-typescript`/TS API **[C]** extraen props/eventos/slots y comentarios TSDoc; se fusionan con el **contrato** (variantes, descripciones editoriales, accesibilidad). `docs:check` en CI falla si hay *drift* (prop sin documentar, prop del contrato ausente en un framework).
- **Ejemplos** (PLT-04): cada ejemplo existe como par `*.vue` / `*.tsx` con el mismo *id*; el sitio los importa `?raw` para mostrarlos y como módulo para ejecutarlos. Un manifiesto comprueba que cada id exista en ambos frameworks.
- **`llms.txt` y JSON por componente** (PLT-10): se emiten en build desde las mismas fuentes **[V: Ark UI publica `llms-vue.txt`]**.

## 3. Sitemap y navegación

```text
/                              Home / Overview
/get-started/
    installation  vue  react  nuxt  nextjs  tailwind
/foundations/                  color · typography · spacing · elevation · radius · layout · motion · iconography
/tokens/                       explorer de tokens (primitivo/semántico/componente) + temas
/components/                   catálogo (filtro por categoría, estado, framework)
    <categoría>/<componente>/  overview · anatomy · variants · behavior · accessibility · content · api · code
/patterns/                     formularios, navegación, feedback, estados vacíos…   (Fase 7)
/guidelines/                   principios · accesibilidad · responsive · motion · contenido · buenas prácticas
/motion/                       tokens interactivos · presets · laboratorio                (inspirado en Motion lab de rM [V])
/theming/                      guía + enlace al Studio
/studio/                       Theme Studio (app)
/playground/                   Playground / Component Lab (app)
/resources/                    iconos · tokens descargables · snippets · plantillas · Figma
/migration/                    guías de migración por versión
/changelog/                    por paquete (Changesets)
/search                        Ctrl/⌘ K (paleta)
```

**Cabecera:** logo (propuesta 11, pendiente de asset), buscador `⌘K`, selector Vue/React (persistente), conmutador claro/oscuro y botón de **Apariencia** (mini-panel de tema, patrón rM [V]), enlace a GitHub. **Lateral:** árbol por sección con búsqueda local. **Derecha:** tabla de contenidos de la página (anclas, patrón Fluent [V]).

### 3.1 Preferencia de framework
Selector global `Vue | React` que cambia todos los ejemplos del sitio y el valor por defecto del Playground; persistido y reflejado en URL (`?fw=vue`). Los bloques de código muestran pestañas locales.

## 4. Página de componente (plantilla)

Orden y contenido (derivado de la estructura de *Button* en Fluent [V] ampliada):

1. **Cabecera**: nombre, una frase, badges (`Estable | Beta`, `Vue ✓ React ✓`, tier, motor), enlaces (APG, GitHub, Playground).
2. **Demo interactiva**: componente real + barra de controles (props generadas del contrato), selector de tema, vista claro/oscuro, botón «Abrir en Playground».
3. **Cuándo usarlo** y alternativas (ej.: «para navegar usa `Link`») [V patrón Fluent].
4. **Anatomía** (diagrama con partes `t-*`).
5. **Variantes · Tamaños · Estados** (cuadrícula con todas las combinaciones).
6. **Comportamiento** (controlado/no controlado, teclado, foco).
7. **Layout y uso** (*Do / Don't* con imágenes/ejemplos vivos) [V patrón Fluent].
8. **Accesibilidad** (roles, teclado, contraste, lectores de pantalla, reduced-motion) + enlace al patrón APG.
9. **Contenido** (reglas de etiquetas) [V patrón Fluent].
10. **Motion** (preset por defecto, personalización).
11. **Código**: pestañas Vue / React con los ejemplos reales; instalación del componente individual.
12. **API Reference**: props, eventos, slots/children, CSS variables (`--t-*`), tokens, tipos.
13. **Relacionados** y *changelog* del componente.

Nota [R]: Fluent separa guía y código en sitios distintos (Fluent 2 ↔ Storybook) [V]; en Tessen **todo va en una sola página**; Storybook es solo QA interno.

## 5. Theme Studio

### 5.1 Principios (de rM [V] y mejoras [R])
1. El tema es **datos pequeños + variables CSS** → cambios inmediatos sin recompilar [V: así funciona rM].
2. **Dos modos** [R]: *Rápido* (rM-like, acotado y opinado) y *Avanzado* (editor de tokens completo con validación).
3. Siempre muestra la **vista previa real** con componentes reales y plantillas de pantalla.
4. Todo cambio es reversible (deshacer/rehacer, reset, comparar con base).

### 5.2 Layout
```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: Studio · nombre del tema · [Claro|Oscuro] · [Deshacer/Rehacer] · Exportar │
├───────────────┬─────────────────────────────────────┬────────────────────┤
│ Panel izq.    │ Vista previa                        │ Panel der. (modo)  │
│ Presets       │  Tabs: Componentes · Formularios ·  │  RÁPIDO: acento,   │
│ Mis temas     │  Dashboard · Landing · Tipografía   │  radio, densidad,  │
│ Historial     │  (iframe aislado, responsive)       │  motion, fuente    │
│               │                                     │  AVANZADO: árbol de│
│               │  Barra: contraste · a11y · export   │  tokens + alias    │
└───────────────┴─────────────────────────────────────┴────────────────────┘
```
Alternativa compacta (móvil/embebida): *drawer* lateral derecho con **Apariencia** (patrón de rM [V]) disponible desde cualquier página de docs.

### 5.3 Controles del modo rápido
Presets (≥ 8: 4 claros / 4 oscuros, **propios de Tessen**, no copiados de rM) · **Acento** (swatches + selector libre → genera escala OKLCH, comprueba contraste) · **Geometría** (slider de `radius.base` «Preciso ↔ Orgánico», patrón rM [V]) · **Densidad** (compact/default/comfortable) · **Motion** (off/reduced/full) · **Tipografía** (familia y escala) · **Superficies** (opaca/translúcida: *opcional* y marcada experimental; rM lo llama «Cristal» [V]) · **EN VIVO** (tarjeta de muestra) · **Exportar** · **Restablecer**.

### 5.4 Modo avanzado
Árbol de tokens (primitivos/semánticos/componente) con búsqueda; editor por tipo (color con OKLCH, dimensión, sombra compuesta, tipografía compuesta, curva de easing); **resolución de alias** visible; **validación en vivo** (ciclos, huecos por tema, contraste); *diff* contra el tema base; pares light/dark editables lado a lado.

### 5.5 Persistencia, importación y exportación (THS-05/06)
| Acción | Detalle |
|---|---|
| Guardar | `localStorage` (`tessen:studio:themes`, versión de esquema); sin backend en v1 (como rM [V]) |
| Estado compartible | Tema serializado + comprimido en URL (`#t=` con `lz-string` **[C]**) |
| Importar | Archivo `.json` (formato de tema Tessen, `04` §4.3) y DTCG |
| Exportar | **CSS** (`:root[data-tessen-theme="x"]` con capas), **DTCG JSON**, **Tailwind v4 `@theme`**, **TS**, y *copiar CSS* mínimo (solo overrides) |
| Validación al exportar | `tokens:check` en el navegador (misma librería de `@tessen/theme`) |

> Pendiente conocido: el formato de «Exportar configuración» de rM no se pudo inspeccionar [V: no verificado]. Tessen define el suyo.

## 6. Playground / Component Lab

### 6.1 Layout
```text
┌ Selector de componente ─────────────────────────────────────────────────┐
├ Controles (props) ────┬ Vista previa (iframe, Vue|React) ────────────────┤
│ variant  [primary ▾]  │   [ componente real ]                            │
│ size     (•) md       │   Barra: ancho (320/768/1024/libre) · tema ·     │
│ loading  [x]          │          estado (hover/focus/disabled/invalid)   │
│ …                     ├───────────────────────────────────────────────────┤
│ Estado: [Reset]       │ Código: [Vue | React]  [Copiar] [Descargar]       │
└───────────────────────┴───────────────────────────────────────────────────┘
```

### 6.2 Cómo funciona (PLG-01..06)
- **Controles generados del contrato**: cada prop del contrato declara su control (`select`, `boolean`, `text`, `number`, `slot-text`, `icon`).
- **Estado único** (JSON) → (a) mensaje `postMessage` a los `iframe` de preview (uno Vue y otro React; cada uno monta el componente real del paquete) y (b) `core/codegen` produce el snippet para cada framework desde ese mismo estado. Por eso Vue y React no pueden divergir en la demo.
- **Estados forzados** (hover/focus/pressed) mediante atributos de test (`data-force-state`) que el CSS de `styles` respeta solo en el Playground/Storybook.
- **Tema y densidad** compartidos con el Studio; vista **responsive real** con `iframe` (media queries y container queries reales).
- **Estado en URL** compartible; **Restablecer** y **Copiar**.
- **Calidad del código generado** (US-03): los snippets se compilan en CI (P4, `06` §4). Antes de cada release se compilan **todos** los presets de ejemplo.
- **Fase 7+ (PLG-07)**: composición de varios componentes y edición de código en vivo con compilación en navegador (Vue SFC compiler / sucrase) evaluando Sandpack/WebContainers **[C]**; no entra en v1.

## 7. Búsqueda, versionado y changelogs

- **Búsqueda** (PLT-05): Pagefind sobre el build estático **[C]** + UI propia tipo `CommandMenu` (Ctrl/⌘ K) con grupos (Componentes, Docs, Tokens, Guidelines); índice generado desde MDX y contratos.
- **Versionado** (PLT-08): versión mayor visible (`/v1/…`) cuando exista v2; Changesets alimenta `/changelog` por paquete; los componentes muestran «Añadido en x.y».
- **Migraciones**: una página por *breaking change* con *codemod* o pasos.

## 8. Recursos (PLT-09)

Iconos (explorador, copiar SVG/componente Vue/React) · Tokens descargables (CSS, JSON, Tailwind) · Snippets (plantillas de formularios, layouts) · Plantillas de aplicación (*Templates*, Fase 7: panel, auth, ajustes, landing; patrón de rM Spaces/Templates [V]) · **Kit Figma** (variables importadas desde DTCG; el plugin bidireccional se pospone) · Logo y marca (cuando se aporte el asset).

## 9. Otras secciones que aportan valor [R]

| Sección | Valor | Fase |
|---|---|---|
| **Playground de motion** (editar curvas/duraciones y verlas aplicadas a componentes reales) | Alto: diferencia | 5–7 |
| **Tokens explorer** con búsqueda y copia | Alto, bajo coste | 4 |
| **Accessibility report** por componente (matriz de pruebas, versión de axe, fecha) | Alto: transparencia | 4+ |
| **Showcase** (proyectos que usan Tessen) | Medio | post-v1 |
| **Roadmap público + changelog** | Medio | 8 |
| **Comparar frameworks** (Vue vs React lado a lado con diff) | Muy diferencial pero costoso; reutiliza la infraestructura de paridad | 7+ |

## 10. Estructura interna de las apps (resumen; detalle en `docs/architecture/feature-architecture.md`)

```text
apps/docs/src/{app,pages,features,shared}
  features/: component-explorer · documentation · global-search · navigation · api-reference · tokens-explorer · motion-lab
apps/theme-studio/src/{app,pages,features,shared}
  features/: theme-manager · color-editor · typography-editor · token-editor · theme-preview · export-theme
apps/playground/src/{app,pages,features,shared}
  features/: component-preview · props-editor · state-controls · code-generator · responsive-preview
```

## 11. Riesgos

| Riesgo | Mitigación |
|---|---|
| Alcance excesivo de la plataforma | Entrega por fases (4: docs, 5: studio, 6: playground); modo rápido antes que avanzado |
| Previews de dos frameworks en una página | Islas en docs; `iframe` aislados en playground con protocolo mínimo |
| Rendimiento del Theme Studio (muchos componentes re-renderizados) | Cambios por CSS variables (no re-render de Vue) |
| Cumplimiento de a11y en la propia plataforma | Se audita con las mismas suites (axe/Playwright) |
| Dependencia de formatos de terceros (Figma) | Solo export DTCG en v1 |
