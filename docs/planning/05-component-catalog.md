# 05 — Catálogo de componentes

> Este documento fija **taxonomía, inventario, prioridad, motor de comportamiento y complejidad**, y especifica en detalle los componentes de la primera tanda. La **especificación canónica y ejecutable** de cada componente será su *contrato* (`packages/core/src/contracts/<nombre>.contract.ts`); este catálogo define qué contiene ese contrato.
> Nombres de API: **Vue = prefijo `T`** (`TButton`), **React = sin prefijo** (`Button`) — ver ADR 0011. Son ejemplos de API, no una decisión cerrada del nombre final.

## 1. Clasificación

| Clase | Definición | Ejemplos | Regla |
|---|---|---|---|
| **Fundamental** | Elemento único, normalmente sobre HTML nativo; sin motor de estado | Button, Input, Checkbox, Switch, Badge, Divider, Spinner, Skeleton, Card | Implementación nativa por framework; CSS compartido |
| **Compuesto** | Varias partes coordinadas (estado compartido, ARIA entre partes) | Tabs, Accordion, Dialog, Select, Menu, Toast, Pagination | Motor de comportamiento compartido (ver motor) + partes con `Root/Part` |
| **Headless / primitiva** | Comportamiento sin estilo, reutilizable para construir otros | `Presence`, `Portal`, `FocusScope`, `Collection`, `VisuallyHidden`, `useControllable` | Internas por defecto; solo se exportan las estables |
| **Visual avanzado** | Efectos y animación como propósito principal | Spotlight, Marquee, 3D Card, Text Reveal | Opcionales, entrada de paquete separada, usan `@tessen/motion` |

**Motor de comportamiento (columna «Motor»)** — ver ADR 0004:
`N` nativo/sin motor · `Z:<máquina>` máquina Zag.js candidata **[C: validar existencia y madurez en el spike S1]** · `C` lógica propia · `T` TanStack (`table-core`/`virtual`) **[C]** · `L` librería externa específica.

**Complejidad** (esfuerzo por componente **para ambos frameworks**, incluyendo contrato, tests y docs): `S` ≤ 1 día · `M` 2–4 días · `L` 1–2 semanas · `XL` > 2 semanas.
**Tier**: `T1` (v0.x, núcleo) · `T2` (v1.0) · `T3` (v1.x) · `T4` (v2 / avanzado).

## 2. Inventario por categoría

### 2.1 Foundations (no son componentes; viven en `tokens/styles/icons/motion`)
Design tokens · Color · Typography · Spacing · Elevation · Border radius · Breakpoints · Grid · Motion tokens · Iconography → `04`.

### 2.2 Actions
| Componente | Clase | Motor | Tier | Cx | Notas / dependencias |
|---|---|---|---|---|---|
| Button | Fundamental | N | T1 | S | Base de IconButton, Toggle, Split |
| IconButton | Fundamental | N | T1 | S | `aria-label` obligatorio (tipo) |
| Link | Fundamental | N | T1 | S | Variante «inline» y «standalone» |
| ToggleButton | Fundamental | N (`aria-pressed`) | T2 | S | |
| ButtonGroup | Fundamental | N | T2 | S | `role="group"` |
| SplitButton | Compuesto | Z:menu | T3 | M | Primario + menú; Fluent: la acción principal no se repite en el menú **[V]** |
| FloatingActionButton | Fundamental | N | T3 | S | Solo móvil/app; dudoso valor en web (evaluar) |

### 2.3 Forms
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Field (FormField) | Compuesto | C | T1 | M | Provee id/label/description/error vía contexto |
| Label · HelperText | Fundamental | N | T1 | S | |
| Input | Fundamental | N | T1 | S | Slots leading/trailing |
| Textarea | Fundamental | N | T1 | S | Autosize opcional (T3) |
| Checkbox | Fundamental | N | T1 | S | Indeterminate |
| Radio / RadioGroup | Compuesto | N | T1 | M | Nativo con `name` |
| Switch | Fundamental | N (`role=switch`) | T1 | S | |
| NativeSelect | Fundamental | N | T1 | S | `<select>` con estilo |
| Select | Compuesto | Z:select | T2 | L | Listbox propio, teclado, typeahead |
| Combobox / Autocomplete | Compuesto | Z:combobox | T2 | L | Autocomplete = Combobox con filtrado local |
| Slider / RangeSlider | Compuesto | Z:slider | T2 | M | |
| NumberInput | Compuesto | Z:number-input | T3 | M | |
| OTP / PinInput | Compuesto | Z:pin-input | T3 | M | `autocomplete="one-time-code"` |
| DatePicker / DateRange | Compuesto | Z:date-picker | T3 | XL | `@internationalized/date` **[C]**, i18n/calendarios |
| TimePicker | Compuesto | C/Z | T3 | L | |
| FileUpload | Compuesto | Z:file-upload | T3 | L | Drag & drop accesible |
| ColorPicker | Compuesto | Z:color-picker | T4 | L | Reutilizado por Theme Studio |
| TagsInput · Rating · Editable | Compuesto | Z | T4 | M | |

### 2.4 Navigation
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Tabs | Compuesto | Z:tabs | T1 | M | |
| Breadcrumbs | Fundamental | N | T2 | S | `nav` + `aria-current` |
| Pagination | Compuesto | Z:pagination | T2 | M | |
| NavigationMenu | Compuesto | C | T3 | L | Disclosure vs menu: seguir APG (no usar `role=menu` para nav) |
| Sidebar | Compuesto | C | T3 | L | Colapsable, responsive |
| Stepper | Compuesto | Z:steps | T3 | M | |
| CommandMenu | Compuesto | Z:combobox+Dialog | T3 | L | Base de Ctrl K de la plataforma |
| Menubar | Compuesto | C/Z:menu | T4 | L | |

### 2.5 Feedback
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Alert | Fundamental | N | T1 | S | `role="alert"`/`status` según severidad |
| Badge | Fundamental | N | T1 | S | |
| Spinner | Fundamental | N | T1 | S | `role="status"` + etiqueta |
| Skeleton | Fundamental | N | T1 | S | Respeta reduced-motion |
| Progress (linear/circular) | Fundamental | N/Z:progress | T2 | S | `role=progressbar` |
| Tooltip | Compuesto | Z:tooltip | T1 | M | |
| Toast / Notification | Compuesto | Z:toast | T2 | L | Región `aria-live`, cola, pausa en hover/focus |
| EmptyState | Fundamental | N | T2 | S | |

### 2.6 Overlays
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Dialog (Modal) | Compuesto | Z:dialog | T1 | L | Base de Drawer/Sheet |
| AlertDialog | Compuesto | Z:dialog (`role=alertdialog`) | T2 | S | |
| Popover | Compuesto | Z:popover | T2 | M | |
| DropdownMenu | Compuesto | Z:menu | T2 | L | |
| ContextMenu | Compuesto | Z:menu | T3 | M | |
| Drawer / Sheet | Compuesto | Z:dialog + lógica | T3 | M | Gestos opcionales (T4) |
| HoverCard | Compuesto | Z:hover-card | T3 | S | |

### 2.7 Data display
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Card | Fundamental | N | T1 | S | |
| Avatar / AvatarGroup | Fundamental | N/Z:avatar | T2 | S | Fallback de imagen |
| Accordion | Compuesto | Z:accordion | T2 | M | |
| List | Fundamental | N | T2 | S | |
| Table (simple) | Fundamental | N | T2 | M | Semántica `<table>` |
| DataGrid | Compuesto | T (`table-core`) + `virtual` | T4 | XL | Ordenar, filtrar, virtualizar; accesibilidad de grid compleja |
| Timeline · StatCard | Fundamental | N | T3 | S | |
| Calendar | Compuesto | Z:date-picker | T3 | L | |
| Carousel | Compuesto | Z:carousel | T3 | M | |
| Chart wrappers | Wrapper | L (decisión D-09) | T4 | L | Solo tematizar con tokens; no escribir un motor de gráficos |

### 2.8 Layout
| Componente | Clase | Motor | Tier | Cx | Notas |
|---|---|---|---|---|---|
| Container · Stack · Flex · Grid · Divider · AspectRatio | Fundamental | N | T1 | S | `Stack`/`Grid` con tokens de espaciado |
| ScrollArea | Compuesto | N/CSS | T3 | M | Preferir `overflow` nativo + estilo de scrollbar |
| ResizablePanels | Compuesto | Z:splitter | T3 | M | Teclado según APG *window splitter* |
| VisuallyHidden · Portal · FocusScope · Presence | Headless | C | T1 | S–M | Infraestructura interna |

### 2.9 Advanced & Creative (T4, paquete separado, `@tessen/motion`)
| Componente | Motor | Cx | Notas |
|---|---|---|---|
| AnimatedCard · 3DCard · GradientBorder · AnimatedBorder | N + CSS (`@property`, `conic-gradient`) | S–M | Mayormente CSS; sin JS cuando sea posible |
| Spotlight · MagneticButton · CursorEffects | M/C (puntero) | M | Desactivados en `pointer: coarse` y reduced-motion |
| TextReveal · NumberCounter · ScrollReveal · Marquee | M/WAAPI/CSS scroll-timeline | M | `aria-label` del texto original; contador con `aria-live` controlado |
| Parallax · InteractiveBackground · MorphingElements | M / canvas·WebGL (L) | L | Evaluar GSAP/Motion solo aquí (ADR 0007) |

Inspiración: Aceternity UI y Magic UI **[V: Magic UI es MIT; licencia de Aceternity sin verificar]**. **No se copia código**: se reimplementan los conceptos sobre tokens/motion de Tessen.

## 3. Totales y cortes

| Tier | Nº componentes (aprox.) | Esfuerzo (pares Vue+React) |
|---|---|---|
| T1 | ~22 (incl. infra headless) | ~7–9 semanas |
| T2 | ~16 | ~9–12 semanas |
| T3 | ~18 | ~12–16 semanas |
| T4 | ~20 | ~14–20 semanas |

*(Estimaciones **[R]** de orden de magnitud para 1 persona + agentes; revisar tras medir el coste real de los primeros 5 componentes — ver `11`.)*

## 4. Plantilla de especificación (obligatoria para cada contrato)

Un contrato (TypeScript tipado, framework-neutral, sin tipos de Vue/React) contiene:

1. **Identidad**: `name`, `category`, `tier`, `class`, `engine`, `apgPattern` (URL), `since`.
2. **Propósito y no-objetivos** + *cuándo usar / alternativas* (estilo Fluent **[V]**).
3. **Anatomía**: partes y sus roles (`root`, `trigger`, `content`…).
4. **Props** (nombre, tipo abstracto, valores, defecto, descripción) con **mapeo por framework** de la sintaxis (v-model vs value/onValueChange).
5. **Variantes, tamaños, estados** (matriz).
6. **Eventos y semántica de valor** (controlado/no controlado, payload).
7. **Slots/Composición** (slots Vue ↔ children/partes React).
8. **Teclado y foco** (tabla tecla→acción, entrada/salida de foco).
9. **Accesibilidad**: roles, nombre/descripcion accesible, ARIA, relaciones, anuncios.
10. **Responsive** (container queries, tamaño de objetivo táctil).
11. **Motion**: preset de entrada/salida, `prefers-reduced-motion`.
12. **Tokens consumidos** (semánticos y de componente).
13. **Casos de prueba de contrato** (lista de comportamientos verificables por ambos frameworks).
14. **Content guidelines** (etiquetas, longitud, etc.).
15. **Dependencias** (otros componentes, motor, paquetes).

## 5. Especificaciones detalladas — primera tanda

> Convención de props: `V:` sintaxis Vue · `R:` sintaxis React. Los tipos se escriben en forma neutral.

### 5.1 Button · IconButton (T1 · S · N)

**Propósito**: iniciar una única acción. Para navegar se usa `Link` **[V: guía Fluent]**.
**Anatomía**: `root` (`<button>`) · `leading` (icono) · `label` · `trailing` (icono) · `spinner` (si `loading`).

| Prop | Tipo | Defecto | Notas |
|---|---|---|---|
| `variant` | `primary\|secondary\|outline\|ghost\|link` | `primary` | |
| `tone` | `default\|danger` | `default` | |
| `size` | `sm\|md\|lg` | `md` | alturas 28/36/44 |
| `disabled` | boolean | false | `disabled` nativo (no focusable) |
| `loading` | boolean | false | `aria-busy="true"` + `aria-disabled="true"`, mantiene foco, suprime click, conserva ancho |
| `type` | `button\|submit\|reset` | `button` | **Nunca `submit` implícito** |
| `block` | boolean | false | ancho 100 % |
| IconButton: `label` | string (**obligatorio**) | — | genera `aria-label`; el tipo impide omitirlo |

**Eventos**: V: `click` (MouseEvent) · R: `onClick`. Con `disabled`/`loading` no se emite.
**Slots/children**: V: `default`, `leading`, `trailing` · R: `children`, props `leadingIcon`, `trailingIcon` (ReactNode).
**Teclado**: `Enter`, `Space` (nativo). **A11y**: texto/icono ≥ 4.5:1/3:1 en todos los estados **[V: criterio Fluent]**; foco visible.
**Motion**: hover = transición de fondo `fast`; `:active` = `scale(.98)` `fast`; spinner con rotación (CSS); reduced → sin scale.
**Tokens**: `color.action.*`, `radius.md` (`--t-button-radius`), `size.control.*`, `font.label.*`.

```vue
<script setup lang="ts">
import { TButton } from '@tessen/vue'
</script>
<template>
  <TButton variant="primary" size="lg" :loading="saving" @click="save">
    <template #leading><SaveIcon /></template>
    Guardar
  </TButton>
</template>
```
```tsx
import { Button } from '@tessen/react'
<Button variant="primary" size="lg" loading={saving} onClick={save} leadingIcon={<SaveIcon />}>
  Guardar
</Button>
```

### 5.2 Field + Input (T1 · M · C/N)

**Propósito**: asociar etiqueta, descripción y error con un control y propagar estado.
**Anatomía**: `Field` (root, contexto) · `FieldLabel` · `Input` · `FieldDescription` · `FieldError`.
`Field` genera ids estables (SSR-safe: derivados de `useId` en React / `useId` en Vue 3.5 **[C]**) y conecta `for`, `aria-describedby` (descripción + error si existe), `aria-invalid`, `aria-required`.

| Prop | Tipo | Notas |
|---|---|---|
| Field: `invalid`, `required`, `disabled`, `readOnly` | boolean | se propagan a hijos |
| Input: `V: v-model` / `R: value + onValueChange` | string | `onValueChange(value: string)`; también `onChange` nativo permitido |
| Input: `size`, `type`, `placeholder` | | `type` ∈ text,email,password,search,tel,url,number |
| Input slots: `leading`, `trailing` | | iconos/acciones; `trailing` puede contener `IconButton` (limpiar/mostrar) |

**Teclado**: nativo. **A11y**: error anunciado con `aria-live="polite"` al aparecer; `aria-errormessage` no se usa (soporte irregular **[C]**), se usa `aria-describedby`. **Motion**: borde/halo de foco con transición `fast`.

```vue
<TField :invalid="!!error" required>
  <TFieldLabel>Correo</TFieldLabel>
  <TInput v-model="email" type="email" />
  <TFieldError>{{ error }}</TFieldError>
</TField>
```
```tsx
<Field invalid={!!error} required>
  <FieldLabel>Correo</FieldLabel>
  <Input value={email} onValueChange={setEmail} type="email" />
  <FieldError>{error}</FieldError>
</Field>
```

### 5.3 Checkbox · Switch · Radio (T1 · S/M · N)

- **Checkbox**: `<input type="checkbox">` con `appearance: none` y dibujo CSS. Props: `checked` (`V: v-model`/`R: checked + onCheckedChange`), `indeterminate`, `disabled`, `invalid`. Estado `data-state="checked|unchecked|indeterminate"`. Teclado: `Space`. Mantiene participación nativa en formularios.
- **Switch**: `<input type="checkbox" role="switch">`; mismas props; **efecto inmediato** (si requiere confirmación, usar Checkbox) **[V: criterio de uso Fluent para Switch vs Toggle]**. Animación de la pastilla: `transform` `normal`.
- **RadioGroup/Radio**: inputs nativos con `name` compartido (flechas nativas); `RadioGroup` aporta `role="radiogroup"`, valor y etiqueta del grupo.

### 5.4 Tabs (T1 · M · Z:tabs)

**Anatomía**: `Tabs` (root) · `TabList` · `Tab` (trigger) · `TabPanel` · `TabIndicator` (opcional).
| Prop | Tipo | Defecto |
|---|---|---|
| `value` (`V: v-model` / `R: value+onValueChange`) · `defaultValue` | string | primer tab |
| `orientation` | `horizontal\|vertical` | `horizontal` |
| `activationMode` | `automatic\|manual` | `automatic` |
| `variant` | `underline\|pill\|segmented` | `underline` |

**Teclado** (patrón APG *Tabs*): `←/→` (o `↑/↓` en vertical) mueven, `Home/End`, `Tab` entra al panel; en `manual`, `Enter/Space` activa. **A11y**: `role=tablist/tab/tabpanel`, `aria-selected`, `aria-controls`, `aria-labelledby`. **Motion**: indicador deslizante (`transform`/`width` vía FLIP en CSS variables), reduced → salto.

### 5.5 Dialog (T1 · L · Z:dialog)

**Anatomía**: `Dialog` (root/contexto) · `DialogTrigger` · `DialogBackdrop` · `DialogContent` (Portal) · `DialogTitle` · `DialogDescription` · `DialogClose`.
| Prop | Tipo | Defecto | Notas |
|---|---|---|---|
| `open` (`V: v-model:open` / `R: open+onOpenChange`) · `defaultOpen` | boolean | false | |
| `modal` | boolean | true | no modal = sin trampa de foco ni inertización |
| `role` | `dialog\|alertdialog` | `dialog` | |
| `closeOnEscape`, `closeOnOutsideInteraction` | boolean | true/true | `alertdialog`: outside=false |
| `initialFocus`, `restoreFocus` | selector/ref · boolean | primer foco, true | |
| `lazyMount`, `unmountOnExit` | boolean | true | SSR-safe |

**Reglas**: título obligatorio (si visualmente oculto, `VisuallyHidden`); foco atrapado y devuelto al disparador; `Esc` cierra; scroll del `body` bloqueado sin salto de layout; contenido externo inerte (`inert`/`aria-hidden`). **Motion**: entrada `decelerate` `normal` (opacity + scale .98→1 + translate `distance.sm`), backdrop opacity; salida `accelerate` `fast`; requiere `Presence` para animar la salida; reduced → solo opacity ≤ `fast`. **Botones del diálogo** responden al título (p. ej. «¿Eliminar archivo?» → *Eliminar/Cancelar*) **[V: guía de contenido Fluent]**.

### 5.6 Select (T2 · L · Z:select) y NativeSelect (T1 · S · N)

`NativeSelect` = `<select>` estilizado (mejor móvil/a11y básica). `Select` = listbox propio (`role=combobox` + `listbox`) para contenido enriquecido.
Props: `items` o slots `Option/OptionGroup`, `value` (`V: v-model`/`R: value+onValueChange`; `string` o `string[]` si `multiple`), `placeholder`, `disabled`, `invalid`, `size`, `clearable` (T3), `positioning` (`placement`, `offset`, `matchTriggerWidth`). Teclado APG: `↑/↓`, `Home/End`, typeahead, `Enter/Space` selecciona, `Esc` cierra, `Tab` cierra y avanza. Participa en formularios (input oculto con `name`). Motion: apertura `decelerate` `fast`.

### 5.7 Tooltip (T1 · M · Z:tooltip)

Solo información **complementaria** y no interactiva; nunca información esencial. Retardo de apertura 400–600 ms *(inicial)*, cierre inmediato al `Esc`, al salir el puntero y **mantiene abierto mientras el puntero esté sobre el tooltip** (WCAG 1.4.13). `role=tooltip` + `aria-describedby` en el disparador. No en táctil (se muestra con foco de teclado). En botones deshabilitados: tooltip que explique el motivo **[V: guía Fluent]** (el contrato exige disparador focusable). Motion: `fast`, solo opacity/translate sutil.

## 6. Especificación resumida del resto (T2–T4)

Cada fila se **expandirá a contrato completo** justo antes de su implementación (nunca se implementa sin contrato).

| Componente | Patrón APG / referencia | Puntos críticos a resolver en el contrato |
|---|---|---|
| Accordion | Accordion | Un/múltiple abierto, `aria-expanded`, animación de altura con `grid-template-rows`/`interpolate-size` **[C]** y fallback |
| Menu/DropdownMenu | Menu Button | Typeahead, submenús, `role=menuitemcheckbox/radio`, no usar para navegación |
| Popover | Dialog (no modal) | Posicionado (flip/shift), foco, cierre por interacción externa |
| Toast | Alert/Status | Cola, límite, pausa en hover/focus, `aria-live`, accesible por teclado (atajo para saltar a región) |
| Combobox | Combobox | Filtrado, `aria-activedescendant`, teclado, creación de opciones (T3) |
| Slider | Slider | Doble thumb, `aria-valuetext`, paso por teclado `PgUp/PgDn` |
| Pagination | — (Fluent: n/a) | `nav` con `aria-label`, `aria-current=page`, truncado |
| Progress | Meter/Progressbar | Determinado/indeterminado, `aria-valuenow` |
| DatePicker | Date Picker Dialog | Calendario + entrada de texto, rangos, i18n, límites min/max, zonas horarias (no manejar tiempo, solo fechas) |
| DataGrid | Grid | Roving tabindex, selección, orden, virtualización; **subconjunto** accesible primero |
| CommandMenu | Combobox en Dialog | Grupos, atajos, búsqueda, `aria-activedescendant` |
| ResizablePanels | Window Splitter | Teclado, persistencia de tamaños, mínimo/máximo |
| Sidebar/NavigationMenu | Disclosure Navigation | No usar `role=menu`; colapso responsive |
| Creative (Spotlight, Marquee…) | — | `aria-hidden` en decorativos; pausa accesible (WCAG 2.2.2) en marquee |

## 7. Reglas transversales de API

1. **Controlado y no controlado** siempre soportados donde haya valor (`value`/`defaultValue`, `open`/`defaultOpen`).
2. **Vue**: `v-model` (+ `v-model:open`) y eventos tipados; **React**: `value`/`onValueChange`, `open`/`onOpenChange` consistentes.
3. **Atributos nativos** pasan al elemento raíz: Vue (`$attrs`, `inheritAttrs` deliberado), React (`...rest`, `className`, `style`, `ref`).
4. **Composición**: Vue con slots y subcomponentes; React con *compound components* (`Dialog.Content` o exports nombrados `DialogContent`; decisión de forma final en ADR 0011).
5. **Polimorfismo (`as`/`asChild`)**: no en v1; se resuelve con subcomponentes y `Link`. Reevaluar (D-10).
6. **Nunca** exponer clases internas como API; las variables `--t-*` documentadas son la API de personalización.
7. **Exportaciones**: solo desde `index.ts` del componente y del paquete; los internos no son públicos.
