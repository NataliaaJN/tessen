# 04 — Especificación del Design System

> Esta especificación fija **estructura, nombres y reglas**. Los valores numéricos marcados *(inicial)* son punto de partida que debe validarse en Fase 1 con contraste y componentes reales; no se inventan para «rellenar» escalas.
> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[R]** recomendación (por defecto en este documento).

## 1. Principios de los fundamentos

1. **Un único origen**: la fuente canónica es `packages/tokens/src/**/*.json` en formato **DTCG 2025.10** **[V]** (spec estable desde 2025-10-28). Todo lo demás se **genera**; los artefactos generados son de solo lectura.
2. **Tres capas** (alineado con Fluent global/alias **[V]** y con la skill `design-system-foundations`):
   - **Primitivos**: escalas crudas sin significado de UI (`color.blue.600`, `space.4`).
   - **Semánticos**: roles (`color.text.primary`, `color.action.primary`). **Los componentes solo consumen esta capa.**
   - **Componente**: solo cuando una decisión debe ser tematizable de forma independiente (`button.radius`, `dialog.max-width`).
3. **No tokenizar todo**: se tokeniza lo que debe ser consistente, tematizable o intencionalmente personalizable.
4. **Los tokens publicados son API**: renombrar un token público es *breaking change*.
5. **Funciona sin Tailwind ni JS**: las variables CSS son el contrato de runtime.

## 2. Pipeline de tokens

```text
packages/tokens/src/*.json  (DTCG, fuente canónica)
        │  Style Dictionary 5 (+ formatos/transformaciones propios)
        ├─► dist/css/tokens.css        → :root / [data-tessen-theme] (runtime)
        ├─► dist/css/tokens.*.css      → por tema / densidad
        ├─► dist/js/*.js + .d.ts       → TypeScript (tooling, docs, Theme Studio)
        ├─► dist/json/tokens.json      → datos (docs, Playground)
        └─► dist/tailwind/theme.css    → puente Tailwind v4 (@theme inline), OPCIONAL
```

- **Style Dictionary** se elige porque implementa DTCG 2025.10 y es referencia de la spec; v5.5 ya soporta el tipo `dimension` como objeto **[V]**. Alternativa evaluada: **Terrazzo** (también implementación de referencia **[V]**) — se descarta *por ahora* por menor madurez/ecosistema de transformaciones **[C]**; revisar en ADR 0005.
- **Validación (FND-08)** — script `pnpm tokens:check`: sin ciclos de alias, sin referencias huérfanas, cada token semántico resuelve en cada tema, contraste mínimo de pares declarados, nombres únicos tras el aplanado a CSS.

### 2.1 Convención de nombres

| Concepto | Regla | Ejemplo |
|---|---|---|
| Ruta DTCG | `categoría.rol.variante.estado`, kebab-case, sin referencias a UI concreta | `color.action.primary.hover` |
| Variable CSS | prefijo `--tessen-` + ruta con guiones | `--tessen-color-action-primary-hover` |
| Atributo de tema | `data-tessen-theme="light\|dark\|<custom>"` | `<html data-tessen-theme="dark">` |
| Otros atributos | `data-tessen-density`, `data-tessen-motion` | `data-tessen-motion="reduced"` |
| Clase de componente | `t-<componente>` y `t-<componente>__<parte>` | `t-button`, `t-dialog__content` |
| Variante/estado en CSS | atributos `data-variant`, `data-size`, `data-tone` y los `data-state`/`data-disabled`… del motor | `[data-variant="outline"]` |
| Variable local de componente (hook) | `--t-<componente>-<propiedad>` | `--t-button-bg` |

### 2.2 Ejemplo de token (DTCG)

```json
{
  "color": {
    "action": {
      "primary": {
        "$type": "color",
        "$value": "{color.brand.600}",
        "$description": "Fondo de la acción principal (botón primario, selección activa)."
      }
    }
  }
}
```

Los valores derivables en runtime (p. ej. radios a partir de un radio base, para el slider de «Geometría» del Theme Studio, inspirado en rM **[V]**) se declaran con extensión propia y se emiten como `calc()`:

```json
{ "radius": { "md": { "$type": "dimension",
  "$value": { "value": 6, "unit": "px" },
  "$extensions": { "tessen": { "deriveFrom": "radius.base", "factor": 1 } } } } }
```
```css
--tessen-radius-md: calc(var(--tessen-radius-base) * 1);
```

## 3. Foundations

### 3.1 Color

**Primitivos** (escalas de 11 pasos `50, 100 … 900, 950`): `neutral`, `brand`, `success`, `warning`, `danger`, `info`. **[R]** Se generan en **OKLCH** con pasos de luminosidad fijos y croma limitado por gamut sRGB, y se *validan* (no se aceptan a ojo). Los valores hex concretos se fijan en Fase 1.

> **Acento de marca:** se deriva del logotipo (propuesta 11) cuando se aporte el asset (`12` D-01). Hasta entonces el tema por defecto usa un acento provisional neutro-frío marcado `provisional` en el JSON.

**Semánticos (conjunto mínimo obligatorio, cada uno en light y dark):**

| Grupo | Tokens |
|---|---|
| `color.text` | `primary`, `secondary`, `tertiary`, `disabled`, `inverse`, `link`, `link-hover`, `on-action` (texto sobre acción), `on-feedback` |
| `color.surface` | `canvas` (fondo app), `default`, `raised`, `sunken`, `overlay`, `inverse` |
| `color.border` | `subtle`, `default`, `strong`, `focus`, `disabled` |
| `color.action.primary` | `default`, `hover`, `active`, `disabled`, `subtle` (fondo suave), `on` (texto encima) |
| `color.action.neutral` | `default`, `hover`, `active`, `disabled`, `subtle` |
| `color.action.danger` | `default`, `hover`, `active`, `disabled`, `subtle` |
| `color.selected` | `background`, `border`, `text` |
| `color.focus` | `ring`, `ring-offset` |
| `color.feedback.{success,warning,danger,info}` | `background`, `border`, `text`, `icon`, `solid` |
| `color.overlay` | `scrim`, `backdrop-blur` (dimensión) |
| `color.input` | `background`, `border`, `border-hover`, `border-invalid`, `placeholder` |

**Estados por rol** (se definen solo donde proceda): default · hover · active · focus-visible · disabled · selected · invalid · read-only.

**Requisitos de contraste (NFR-01)**: texto ≥ 4.5:1, texto grande ≥ 3:1, iconos/bordes de controles/foco ≥ 3:1 **[V: reglas que Fluent aplica a botones 4.5:1 texto, 3:1 iconos]**; los deshabilitados están exentos pero deben distinguirse sin depender solo del color.

### 3.2 Tipografía *(inicial)*

| Token | Valores |
|---|---|
| `font.family.sans` | pila del sistema + `Inter`/variable como recomendada (fuente final: decisión D-06) |
| `font.family.mono` | `ui-monospace, SFMono-Regular, Menlo, monospace` |
| `font.family.display` | opcional, para marca |
| `font.size` | `2xs 11` `xs 12` `sm 14` `md 16` `lg 18` `xl 20` `2xl 24` `3xl 30` `4xl 36` `5xl 48` `6xl 60` (px → `rem`) |
| `font.weight` | `regular 400`, `medium 500`, `semibold 600`, `bold 700` |
| `font.lineHeight` | `tight 1.2`, `snug 1.35`, `normal 1.5`, `relaxed 1.65` |
| `font.letterSpacing` | `tight -0.01em`, `normal 0`, `wide 0.02em`, `caps 0.06em` |

**Estilos compuestos** (tokens DTCG tipo `typography`): `display-lg/md`, `heading-xl…xs`, `body-lg/md/sm`, `label-lg/md/sm`, `caption`, `code`. Los componentes consumen estilos compuestos, no tamaños sueltos.

### 3.3 Espaciado y tamaño *(inicial)*

- Base 4 px: `space.0 0 · 0.5 2 · 1 4 · 2 8 · 3 12 · 4 16 · 5 20 · 6 24 · 8 32 · 10 40 · 12 48 · 16 64 · 20 80 · 24 96`.
- **Alturas de control**: `size.control.sm 28`, `md 36`, `lg 44` px. Mínimo de objetivo ≥ 24 × 24 px (WCAG 2.5.8); bajo `@media (pointer: coarse)` los controles interactivos suben a ≥ 44 px.
- **Densidad** (`data-tessen-density`): `compact`, `default`, `comfortable` escalan `space.*` de componente mediante `--tessen-density-scale` (0.875 / 1 / 1.125 *(inicial)*). Inspirado en el interruptor «Densidad compacta» de rM **[V]**.

### 3.4 Elevación y sombras

`elevation.0` (plano) … `elevation.5`; semánticos `elevation.raised` (cards), `elevation.overlay` (popover/menú), `elevation.modal` (dialog/drawer). En dark mode la elevación se expresa más con **superficie más clara** que con sombra. Cada nivel = sombra compuesta (`shadow` DTCG con capas).

### 3.5 Radio y bordes

`radius.base` (slider del Theme Studio) y escala derivada: `none 0 · xs 2 · sm 4 · md 6 · lg 8 · xl 12 · 2xl 16 · full 9999` *(inicial; `md` = control por defecto)*. Anchos de borde: `border.width.hairline 1`, `thick 2`, `focus 2`.

### 3.6 Foco

`focus.ring.width 2px`, `focus.ring.offset 2px`, color `color.focus.ring` (contraste ≥ 3:1 contra superficies adyacentes). Se aplica con `:focus-visible`. Debe ser visible en `forced-colors` (usar `outline`, no solo `box-shadow`).

### 3.7 Capas, breakpoints y grid

- **z-index** (`layer.*`): `base 0`, `dropdown 1000`, `sticky 1100`, `overlay 1200`, `modal 1300`, `popover 1400`, `toast 1500`, `tooltip 1600`.
- **Breakpoints**: `sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536` *(inicial)*. Las variables CSS no valen en `@media`, por lo que se publican como TS/JSON y para Tailwind. **Los componentes se adaptan con *container queries* (`@container`) siempre que sea posible**, no con breakpoints de viewport.
- **Grid**: 12 columnas, `grid.gutter` y `grid.margin` por breakpoint; utilidades de layout (`Container`, `Stack`, `Grid`) en `@tessen/*`.

### 3.8 Iconografía

- Rejilla 24 px (`16/20/24` tamaños soportados), trazo 1.5 px, esquinas redondeadas, `currentColor`.
- **Fuente de iconos** (decisión D-07): curar un conjunto abierto (candidato: Lucide, licencia ISC **[C]**, el mismo que usa rM **[V]**) y/o iconos propios; `@tessen/icons` los **transforma** (SVGO) en: componentes Vue, componentes React y sprite SVG. No se dibuja un set propio completo en v1.
- Accesibilidad: decorativos `aria-hidden="true"`; significativos con `aria-label`/`<title>` obligatorio (el contrato lo exige).

### 3.9 Motion tokens

Resumen (detalle completo en `07-motion-system.md`):

| Token | Valores *(inicial)* |
|---|---|
| `motion.duration` | `instant 0`, `fast 100ms`, `normal 200ms`, `slow 300ms`, `slower 500ms` |
| `motion.easing` | `standard cubic-bezier(.2,0,0,1)`, `decelerate (.0,0,0,1)` (entradas), `accelerate (.3,0,1,1)` (salidas), `emphasized (.2,0,0,1)+overshoot opcional` |
| `motion.distance` | `xs 4`, `sm 8`, `md 16` px |
| `motion.stagger` | `step 40ms`, `max 8 pasos` |

## 4. Temas

### 4.1 Modelo

| Eje | Atributo | Valores | Notas |
|---|---|---|---|
| Modo de color | `data-tessen-theme` | `light`, `dark`, `<custom>` o ausente = sigue `prefers-color-scheme` | Ausente funciona **sin JS** y sin *flash* |
| Densidad | `data-tessen-density` | `compact`, `default`, `comfortable` | |
| Movimiento | `data-tessen-motion` | `off`, `reduced`, `full` | Ver `07` |
| Contraste | `data-tessen-contrast` | `standard`, `high` | + `@media (forced-colors: active)` |

### 4.2 Implementación CSS

```css
@layer tessen.reset, tessen.tokens, tessen.base, tessen.components, tessen.utilities;

@layer tessen.tokens {
  :root { color-scheme: light dark; /* primitivos + semánticos light */ }
  @media (prefers-color-scheme: dark) { :root:not([data-tessen-theme]) { /* semánticos dark */ } }
  :root[data-tessen-theme="light"] { color-scheme: light; /* semánticos light */ }
  :root[data-tessen-theme="dark"]  { color-scheme: dark;  /* semánticos dark  */ }
}
```

- **Las capas (`@layer`)** hacen que cualquier CSS del consumidor *sin capa* gane sin guerras de especificidad (personalización sin fork).
- **Temas de marca** = archivos de override que redefinen **semánticos y/o primitivos** bajo `[data-tessen-theme="acme"]` (mismo formato que exporta Theme Studio).
- Anti-*flash*: la guía de instalación incluye un script inline mínimo que aplica `data-tessen-theme` desde `localStorage` antes del primer pintado.
- Los componentes **no** se duplican por tema; **solo cambian variables**.

### 4.3 Anatomía de un tema exportable (Theme Studio)

```json
{
  "$schema": "https://tessen.dev/schemas/theme-1.json",
  "name": "acme",
  "extends": "tessen",
  "modes": {
    "light": { "color.action.primary": "{color.brand.600}" },
    "dark":  { "color.action.primary": "{color.brand.400}" }
  },
  "primitives": { "color.brand": { "generate": { "seed": "#3b5bdb", "method": "oklch" } } },
  "controls": { "radius.base": 8, "density": "default", "motion": "full" }
}
```

## 5. Variantes, tamaños y estados

Sistema único para todos los componentes (la lógica es **pura TS** en `@tessen/core/variants`, compartida por Vue y React):

| Eje | Descripción | Ejemplo |
|---|---|---|
| `variant` | Nivel de énfasis visual | `primary`, `secondary`, `outline`, `ghost`, `link` |
| `tone` | Intención semántica (cuando aplica) | `default`, `danger`, `success` |
| `size` | Escala de controles | `sm`, `md`, `lg` |
| Estado | Atributos de estado, no props visuales | `disabled`, `loading`, `invalid`, `selected`, `readonly` |

- Regla de uso heredada de Fluent **[V]**: *un solo botón primario por layout*; más de dos acciones equivalentes → neutras.
- El CSS aplica variante/tamaño/estado por **atributos de datos** (`data-variant`, `data-size`, `data-tone`) y pseudo-clases (`:hover`, `:active`, `:focus-visible`), no por clases combinatorias.
- Contrato de resolución (en `@tessen/core`):

```ts
// core/variants/button.variants.ts (ilustrativo)
export const buttonVariants = defineVariants({
  base: 't-button',
  variants: { variant: ['primary','secondary','outline','ghost','link'],
              size: ['sm','md','lg'], tone: ['default','danger'] },
  defaults: { variant: 'primary', size: 'md', tone: 'default' },
})
// → { class: 't-button', 'data-variant': 'primary', 'data-size': 'md', 'data-tone': 'default' }
```

### 5.1 Ganchos de personalización por instancia

Cada componente expone variables locales con *fallback* al token semántico:

```css
@layer tessen.components {
  .t-button { --_bg: var(--t-button-bg, var(--tessen-color-action-primary-default));
              background: var(--_bg); border-radius: var(--t-button-radius, var(--tessen-radius-md)); }
}
```

El consumidor puede hacer `<TButton style="--t-button-radius: 999px">` o una regla global, sin editar la librería.

## 6. Guidelines (esqueleto; contenido en la plataforma)

| Área | Reglas base |
|---|---|
| Uso de componentes | Cada componente documenta *cuándo usar / cuándo no / alternativa* (patrón Fluent **[V]**) |
| Contenido | Etiquetas de acción con verbo, *sentence case*, sin punto final; «Next/Previous»; «Done/Finish/Close/Dismiss» según flujo **[V: guía Fluent para botones]** |
| Layout | Un primario por pantalla; primario arriba/izquierda (derecha en RTL) |
| Accesibilidad | HTML nativo primero; deshabilitados con explicación (tooltip) cuando sea posible |
| Responsive | Container queries; objetivos táctiles ≥ 44 px en `pointer: coarse` |
| Motion | Funcional, natural, consistente, atractivo (principios de Fluent **[V]**); siempre opcional |

## 7. Qué NO entra en la especificación de foundations

Valores hex finales y fuente definitiva (se fijan en Fase 1 con el logo/marca); componentes concretos (`05`); implementación de animaciones (`07`).
