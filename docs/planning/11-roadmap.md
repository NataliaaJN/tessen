# 11 — Roadmap

> Leyenda: **[R]** recomendación. Estimaciones en **semanas de trabajo efectivo** para **1 persona + agentes de IA**; son órdenes de magnitud con confianza baja-media y se recalibran al cerrar cada fase (hito M2 mide el coste real de los primeros componentes).
> Las fases siguen las 9 propuestas en el encargo, con **un ajuste justificado** (§1).

## 1. Ajuste respecto a las fases del encargo

| Encargo | Roadmap propuesto | Motivo |
|---|---|---|
| F2 «Core components» y F3 «Framework support» separadas | **F2** = contratos + CSS + *rebanadas verticales* (cada componente se entrega con Vue **y** React); **F3** = ampliar al resto de T2, endurecer paridad, SSR y publicar alpha | Separar «componentes» de «frameworks» invita a construir una librería y luego portarla (justo lo que se quiere evitar). La paridad debe existir **antes** de que crezca el volumen |
| (no existe) | **Spike S1** (motor Zag) y **S2** (pipeline contrato→codegen→paridad) dentro de F1 | Reduce el mayor riesgo técnico antes de comprometer 40+ componentes |
| Docs (F4) tras componentes | F4 puede **solaparse** con la segunda mitad de F3 | Los contratos ya alimentan las docs |

## 2. Fases

### Fase 0 — Research y definición ✅ (este conjunto de documentos)
**Entregables:** `docs/planning/01–13`, `docs/architecture/*`. **Salida:** documentos fusionados en `develop`; decisiones D-01…D-05 resueltas o con responsable.
**Esfuerzo:** completado en esta sesión (revisión por el propietario: ~0.5 sem).

### Fase 1 — Foundations (4–6 sem)
| ID | Tarea | Depende de |
|---|---|---|
| F1-T01 ✅ | Esqueleto del monorepo (pnpm, Turborepo, tsconfig/eslint/vite compartidos en `tooling/`, **dependency-cruiser** con las reglas de `docs/architecture/dependency-rules.md`, CI básico en GitHub Actions, `packageManager`/`.nvmrc` y scope interno provisional `@tessen-ui` con `private: true`, ADR 0015). Solo los paquetes que se usen ya (sin carpetas vacías) | D-02 |
| F1-T02 ✅ | `@tessen/tokens`: fuente DTCG, Style Dictionary, salidas CSS/TS/JSON, `tokens:check` (ciclos, huecos, contraste); escalas `brand` a partir de las semillas de `docs/brand/` | F1-T01 |
| F1-T03 ✅ | `@tessen/styles`: capas, reset/base opcionales, importación de tokens, temas light/dark/densidad | T02 |
| F1-T04 | `@tessen/icons`: pipeline SVG → Vue/React/sprite + set inicial | D-07 |
| F1-T05 ✅ | `@tessen/motion` L0: tokens + keyframes CSS + `data-tessen-motion` (L1 en F2) | T02, T03 |
| F1-T06 | **Spike S1**: `Dialog` + `Tabs` (+`Tooltip`) con Zag en Vue y React; medir criterios de `06` §6 → actualizar **ADR 0004** | T01–T03 |
| F1-T07 | **Spike S2**: contrato de `Button` → codegen de snippets → runner de contrato en Vue/React → diff visual de paridad | T06 |
| F1-T08 | `@tessen/core` mínimo: `defineContract`, `defineVariants`, tipos | T07 |
| F1-T09 | **Validación por tarballs** (ADR 0016): `pack:all`, proyectos `integration/vite-vue` y `vite-react` instalados desde `.tgz` con `overrides`, checklist de `npm-publication-strategy` §4 sobre `tokens`/`styles`/`core`, comprobación de lockfile `scope:check` | T01–T03, T08 |
**Salida (gate):** tokens empaquetables y validados como tarball; ADR 0004 `Accepted` o reemplazado por plan D; pipeline de paridad demostrado con `Button`.

### Fase 2 — Core components (8–10 sem)
Tier **T1** (~22 incl. infra: Button, IconButton, Link, Field/Label/Input/Textarea, Checkbox, Radio, Switch, NativeSelect, Tabs, Tooltip, Dialog, Alert, Badge, Spinner, Skeleton, Card, layout (`Stack/Container/Grid/Divider/AspectRatio`), `VisuallyHidden/Portal/FocusScope/Presence`).
Por componente: contrato → CSS → Vue → React → tests (componente, contrato, axe) → story → ejemplos.
- `@tessen/motion` L1 (presets, `animate`, `presence`, control global).
- Tras los 5 primeros: **generador de esqueletos** (`pnpm new:component`) y medición del coste real.
**Salida:** T1 completo en ambos frameworks con contrato/axe/paridad visual verdes; alpha `0.1.0` **empaquetada y validada como tarballs** (sin publicar).

### Fase 3 — Framework support y paridad (8–12 sem)
Tier **T2** (~16: Select, Combobox, Slider, Toast, Popover, DropdownMenu, AlertDialog, Accordion, Progress, Pagination, Breadcrumbs, Avatar, Table, List, EmptyState, ToggleButton/ButtonGroup).
- Paridad: `parity:api`, visual Vue↔React, compilación de snippets.
- Fixtures de **SSR** (Nuxt, Next), compatibilidad Vue 3.5/React 18.3-19, `publint`/`attw`/`size-limit`.
- Checklist manual con lectores de pantalla de los compuestos.
**Salida:** ≥ 25 componentes estables; gate de paridad obligatorio en CI; `0.5.0` beta (tarballs validados; sin publicar).

### Fase 4 — Documentation platform (6–8 sem; solapable con F3)
`apps/docs` (Astro): Home, Getting started, Foundations, Tokens explorer, Components (plantilla de `08` §4), API reference generada, búsqueda `⌘K`, `llms.txt`/JSON, Guidelines iniciales, versión de framework global.
**Salida:** docs ejecutables en local con los T1+T2, `docs:check` en CI; **sin despliegue** (ADR 0014).

### Fase 5 — Theme Studio (5–7 sem)
`apps/theme-studio`: modo rápido (presets, acento OKLCH, radio, densidad, motion, tipografía), vista previa real, contraste, exportación CSS/DTCG/Tailwind/TS, importar, guardar, URL compartible, deshacer/rehacer; luego **modo avanzado** (árbol de tokens, alias, diff). Mini-panel de apariencia en docs.
**Salida:** un tema exportado desde Studio aplicado a una app de `integration/` cambia el aspecto sin tocar la librería (US-02).

### Fase 6 — Playground (4–6 sem)
`apps/playground`: controles desde contratos, previews Vue/React en `iframe`, estados forzados, responsive, `core/codegen` para ambos frameworks, copiar/descargar, estado en URL, «Abrir en Playground» desde docs.
**Salida:** US-03 cumplida; snippets generados compilan en CI.

### Fase 7 — Advanced components y extras (12–20 sem, abierta)
T3 (DatePicker, Calendar, NumberInput, PinInput, FileUpload, ContextMenu, Drawer/Sheet, HoverCard, Stepper, CommandMenu, NavigationMenu, Sidebar, Carousel, ResizablePanels, Timeline…) y T4 (DataGrid, ColorPicker, Chart wrappers, **creativos**: Spotlight, Magnetic, Marquee, TextReveal, Parallax, 3D, etc.), Motion L2 (Motion opcional), plantillas/Patterns, recursos Figma, comparador Vue↔React.
**Salida:** priorizar por demanda; cada lote con la misma Definition of Done.

### Fase 8 — Production readiness (3–5 sem)
Estabilización de APIs, auditoría de accesibilidad completa, rendimiento, documentación de migración, Changesets (versionado y changelog), versionado de docs, **preparación de la publicación npm solo si el propietario la aprueba** (`docs/architecture/npm-publication-strategy.md` §5), política de soporte/semver, seguridad (licencias, dependencias), checklist de lanzamiento.
**Salida:** **v1.0.0** (tarballs validados; la publicación en npm queda sujeta a aprobación).

## 3. Resumen de esfuerzo

| Fase | Semanas | Acumulado v1 |
|---|---|---|
| F0 | ~0.5 | 0.5 |
| F1 | 4–6 | 5–7 |
| F2 | 8–10 | 13–17 |
| F3 | 8–12 | 21–29 |
| F4 (solapada ~50 % con F3) | 6–8 (≈ 3–4 netas) | 24–33 |
| F5 | 5–7 | 29–40 |
| F6 | 4–6 | 33–46 |
| F8 | 3–5 | **36–51 (≈ 9–12 meses)** |
| F7 | 12–20 (post-v1 o incremental) | — |

## 4. Dependencias entre fases

```text
F0 ─► F1 (spikes) ─► F2 ─► F3 ─► F8 ─► v1.0
                      │     │
                      │     └──► F4 ─► F5 ─► F6 ──┘
                      └────────────► F4 (contratos alimentan docs)
F7 se alimenta de F2/F3 (infra) y F5/F6 (para mostrarlos), puede intercalarse tras F4
```

## 5. Hitos

| Hito | Criterio |
|---|---|
| **M0** | Documentación de planificación fusionada en `develop` |
| **M1** | `tokens` en alpha + ADR 0004 cerrado (spike S1) |
| **M2** | Primera rebanada vertical (`Button`+`Field`+`Input`) con contrato + Vue + React + paridad visual verde |
| **M3** | T1 completo, alpha `0.1.0` empaquetada y validada (tarballs) |
| **M4** | Docs v0 (en local) con ≥ 15 componentes |
| **M5** | Theme Studio (modo rápido) público |
| **M6** | Playground público con código Vue/React |
| **M7** | `v1.0.0-rc` (≥ 25 componentes, paridad y a11y verdes) |
| **M8** | `v1.0.0` |

## 6. Riesgos del proyecto

| # | Riesgo | Prob. | Impacto | Mitigación | Dueño de revisión |
|---|---|---|---|---|---|
| R1 | Zag no encaja (cobertura/API/SSR) | Media | Alto | Spike S1 en F1; plan D | F1 gate |
| R2 | Alcance desbordado | Alta | Alto | Fases con gates; T1/T2 antes que T3/T4; no abrir F7 sin v1 | cada fase |
| R3 | Coste de mantener dos implementaciones | Alta | Medio | Plantilla/generador, contratos, paridad en CI | F2 (medición) |
| R4 | Visual regression inestable | Media | Medio | Runner Linux fijo, umbrales, animaciones off | F2–F3 |
| R5 | a11y insuficiente en compuestos | Media | Alto | Contratos con APG, axe + manual, reportes públicos | F3 |
| R6 | Nombre/marca/scope en uso | **Confirmado** para `tessen` y `@tessen` (ocupados por terceros) | Medio | Scope interno provisional `@tessen-ui`; scope final por aprobar (D-02/D-18) antes de publicar | F1 / aprobación |
| R7 | Dependencia de herramientas pre-1.0 | Media | Medio | Evitarlas en v1 (tsdown) | F1 |
| R8 | Las semillas de marca no cumplen contraste AA en algunos roles (`#2B7BE0`, `#38C6F4` con texto blanco) | Alta (medido) | Bajo | Derivar roles por contraste en `tokens:check`; el cian lleva texto oscuro (`04` §3.1) | F1 |
| R9 | Fatiga de proyecto en solitario | Media | Alto | Entregas intermedias públicas (M2, M4), alcance recortable (Studio avanzado y Playground P2 son diferibles) | continuo |

## 7. Recortes seguros si el calendario aprieta
1. Diferir Theme Studio **avanzado** (queda el modo rápido). 2. Diferir `PLG-05/06/07`. 3. T2 reducido a 12 componentes. 4. Sin `llms.txt` en v1 (barato, pero diferible). **No recortar:** contratos, paridad, accesibilidad, tokens.
