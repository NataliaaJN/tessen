# 01 — Visión y estrategia de producto

> **TESSEN** — *One structure. Endless possibilities.*
> Estado: Propuesta (Fase 0). Fecha: 2026-11-22.

## Leyenda de fiabilidad (se usa en todos los documentos de `docs/planning/`)

| Marca | Significado |
|---|---|
| **[V]** | Hecho verificado en esta sesión (navegando el sitio o con fuente oficial/documentación citada). |
| **[C]** | Conocimiento previo del autor, no re-verificado en esta sesión. Validar antes de depender de ello. |
| **[H]** | Hipótesis o inferencia sobre decisiones ajenas. No es un hecho. |
| **[R]** | Recomendación de Tessen: decisión propuesta y justificada. |

---

## 1. Visión

Tessen es un **ecosistema de diseño frontend**, no un paquete npm de componentes. Un sistema formado por:

1. **Fundamentos compartidos** (tokens, temas, estilos, motion, iconos) que son la única fuente de verdad visual.
2. **Implementaciones nativas** para Vue y React que se sienten idiomáticas en cada framework.
3. **Una plataforma web** que une la claridad documental de Fluent 2 con la experimentación de Theme Studio: documentación, explorador de componentes, Theme Studio y Playground con generación de código.

### La metáfora: el abanico (tessen, 鉄扇)

Un abanico japonés es un conjunto de varillas **independientes** que giran sobre un **eje común** y forman una superficie coherente. Traducción directa a la arquitectura:

| Elemento del abanico | Equivalente en Tessen |
|---|---|
| Eje (pivote) | Tokens + estilos + contratos de componente (`@tessen/tokens`, `@tessen/styles`, `@tessen/core`) |
| Varillas | Componentes independientes e importables de forma individual |
| Despliegue | Composición: de un `Button` a un `DataGrid` sin cambiar de lenguaje visual |
| Las dos caras del abanico | Vue y React: misma estructura, cada cara con su propio acabado |

## 2. Objetivos

### Objetivos de producto (medibles)

| # | Objetivo | Indicador de éxito (v1.0) |
|---|---|---|
| O1 | Una librería usable en Vue 3.5+ y React 18.3+/19 con paridad de comportamiento | 100 % de los componentes publicados con contrato, implementación Vue y React, y suite de contrato verde en ambos |
| O2 | Una única fuente de verdad visual | 0 valores visuales hardcodeados en componentes; todo vía tokens semánticos (verificado por lint) |
| O3 | Personalización sin tocar el código fuente | Un tema completo (colores, radios, tipografía, densidad, motion) aplicable solo con CSS variables exportadas desde Theme Studio |
| O4 | Experimentar y copiar código funcional | Cualquier componente del Playground genera código Vue **y** React que compila sin modificaciones |
| O5 | Accesibilidad como requisito, no como auditoría final | WCAG 2.2 AA objetivo; 0 violaciones axe en las suites; checklist de teclado documentado por componente |
| O6 | Motion coherente y opcional | Todos los componentes animados usan tokens/presets de motion; la librería funciona sin la capa JS de motion |
| O7 | Mantenibilidad a largo plazo | Añadir un componente simple cuesta ≤ 1 día-persona una vez estable el pipeline (métrica a medir en Fase 3) |

### No-objetivos (explícitos)

- No replicar shadcn/ui, Fluent, PrimeVue ni ninguna otra librería.
- No soportar Svelte/Solid/Angular en v1 (la arquitectura no debe impedirlo; ver ADR 0003 y ADR 0004).
- No crear un editor visual de diseño tipo Figma. Theme Studio edita **tokens y temas**, no layouts.
- No resolver estado global, routing, data-fetching ni formularios de negocio: Tessen es capa de UI.
- No ofrecer en v1 un modo «copiar código fuente» (estilo shadcn registry). Se evalúa en Fase 7+ (ver `12-open-decisions.md`).

## 3. Usuarios

| Persona | Necesidad principal | Qué le damos |
|---|---|---|
| **P1 · Dev Vue** (producto/agencia) | Componentes accesibles que se sientan Vue (`v-model`, slots, tipado) | `@tessen/vue`, docs con ejemplos Vue primero-clase |
| **P2 · Dev React** | Componentes composables, tipados, SSR-safe (Next.js) | `@tessen/react` con patrones `value`/`onValueChange`, refs, `children` |
| **P3 · Design engineer / diseñador técnico** | Ajustar el sistema a una marca y ver el resultado al instante | Theme Studio, export de tokens, recursos para Figma |
| **P4 · Responsable de design system** (equipo) | Consistencia, versionado, gobernanza, regresión visual | Contratos, changelogs, reglas de dependencias, suites de paridad |
| **P5 · Agente de IA que implementa o consume Tessen** | Especificaciones sin ambigüedad, legibles por máquina | Contratos tipados, `llms.txt`, `api.json` por componente (ver §6, diferenciador D7) |

Persona prioritaria en v1: **P1 y P2 a la vez** (la promesa multi-framework es el eje). P3 es prioritaria desde la Fase 5 (Theme Studio).

## 4. Casos de uso principales

1. **Adoptar Tessen en un proyecto existente**: `pnpm add @tessen/vue @tessen/styles`, importar CSS, usar componentes. Tiempo hasta el primer botón renderizado ≤ 5 min.
2. **Ajustar la marca**: abrir Theme Studio, elegir acento/radio/densidad, comprobar contraste, exportar CSS variables y pegarlas en el proyecto.
3. **Explorar un componente**: en su página, cambiar props en vivo, alternar Vue/React, copiar el snippet.
4. **Construir un formulario accesible**: componer `Field` + `Input` + `Select` con validación y mensajes asociados correctamente por ARIA.
5. **Migrar entre frameworks**: el mismo equipo tiene una app Vue y otra React y quiere el mismo look and feel.
6. **Añadir motion**: activar presets de animación de forma opt-in sin añadir peso a quienes no los usan.
7. **Contribuir un componente nuevo**: seguir la skill/flujo `cross-framework-component` (contrato → implementación Vue → React → tests → docs).

## 5. Propuesta de valor

> «Un sistema de diseño completo para Vue **y** React, con un solo eje visual y comportamiento verificado entre frameworks, personalizable en vivo y con código listo para copiar.»

Frente al mercado **[R]** (detalle en `02-competitive-research.md`):

- vs. **shadcn/ui**: Tessen no obliga a poseer y mantener el código copiado; la personalización es por tokens, y cubre Vue y React con paridad verificada.
- vs. **Fluent 2 / Material 3 / Ant Design**: Tessen no está atado a la identidad de un fabricante; identidad propia, themeable en vivo.
- vs. **PrimeVue / Vuetify**: Tessen no es Vue-only.
- vs. **Radix + Reka UI / Base UI + Reka UI** (dos librerías headless distintas): comportamiento compartido real vía motores de estado comunes (ver ADR 0004) en lugar de dos ecosistemas que evolucionan por separado.
- vs. **Aceternity / Magic UI**: Tessen ofrece componentes creativos **dentro** del mismo sistema de tokens y motion, con `prefers-reduced-motion` y accesibilidad, no como piezas sueltas copiables.

## 6. Diferenciadores (resumen; análisis completo en `02` §6)

| ID | Diferenciador | Valor real | Fase |
|---|---|---|---|
| D1 | **Paridad verificada Vue↔React** (contratos + tests compartidos + diff visual entre frameworks) | Alto: es la promesa central y casi nadie la verifica automáticamente | 3 |
| D2 | **Theme Studio con dos modos** (rápido tipo rM + editor de tokens DTCG avanzado con contraste) | Alto | 5 |
| D3 | **Playground que genera código para ambos frameworks** a partir del mismo estado | Alto | 6 |
| D4 | **Docs generadas desde contratos + tipos reales** (cero drift) | Alto (mantenibilidad) | 4 |
| D5 | **Motion por capas** (CSS → paquete WAAPI → Motion opcional) | Medio-alto | 1–2 / 7 |
| D6 | **Personalización 100 % por CSS variables** (sin rebuild, sin tocar fuente) | Alto | 1 |
| D7 | **Docs legibles por agentes** (`llms.txt`, JSON de contrato por componente) | Medio; barato de hacer una vez existen los contratos | 4 |
| D8 | Plugin de Figma / sincronización bidireccional de tokens | Incierto: gran coste | 8+ (solo export DTCG en v1) |

Descartadas por añadir complejidad sin valor claro: IA generativa de temas en v1, colaboración en tiempo real en Theme Studio, marketplace de temas.

## 7. Principios del producto

1. **One structure.** Todo se apoya en el mismo eje: tokens → estilos → contratos. Nada visual vive solo en un framework.
2. **Natural en cada framework.** Compartimos decisiones, tokens, CSS y comportamiento; **no** compartimos código de runtime de Vue/React ni forzamos APIs mínimas comunes.
3. **Accesible por construcción.** HTML nativo primero, ARIA después; teclado y foco definidos en el contrato antes de escribir código.
4. **Menos es más (arquitectura).** Estructura proporcional a la complejidad. Un `Divider` no necesita diez archivos. Sin carpetas ni capas anticipadas.
5. **Personalizable sin fork.** Si hay que editar el código fuente de la librería para cambiar el aspecto, el sistema ha fallado.
6. **El movimiento explica.** Cada animación comunica un cambio de estado. Siempre opcional y siempre respetando `prefers-reduced-motion`.
7. **La documentación es parte del producto y no puede desactualizarse.** Se genera de los contratos y los tipos; los ejemplos mostrados son los ejemplos ejecutados.
8. **Decisiones documentadas.** Cada decisión arquitectónica importante tiene su ADR; la dualidad *component-oriented (packages) / feature-first (apps)* no se modifica sin ADR.

## 8. Identidad de marca

- Nombre: **Tessen** (鉄扇, abanico de hierro/guerra).
- Logotipo: **propuesta 11** del chat «Propuestas de logotipo con gato».
  - **Estado:** el asset **no está accesible desde este repositorio ni desde las sesiones de Claude Code** de esta máquina. Hay que aportar el archivo (SVG preferible). Hasta entonces se reserva la ruta `docs/brand/` y se referencia en `12-open-decisions.md` (D-01).
  - Una vez aportado: derivar de él la paleta de acento (ver `04` §3.1) y el favicon/mark para la plataforma web.

## 9. Riesgos de producto (resumen; roadmap completo en `11`)

| Riesgo | Mitigación |
|---|---|
| Alcance desbordado («ecosistema completo») | Fases con entregables acotados; v1 = Foundations + ~25 componentes + docs + Theme Studio básico |
| La paridad Vue/React se degrada con el tiempo | Contratos + suite compartida + gate de paridad en CI desde la primera fase de componentes |
| Dependencia de un motor headless externo (Zag.js) | Spike de validación obligatorio en Fase 1; fallback documentado en ADR 0004 |
| Coste de mantener dos implementaciones | Compartir tokens, CSS, variantes, contratos y tests de datos; solo duplicar el «pegamento» de framework |
| Conflicto de nombre/marca «Tessen» en npm/dominio | Verificar disponibilidad de scope `@tessen` y dominio **antes** de la Fase 1 (D-02) |
