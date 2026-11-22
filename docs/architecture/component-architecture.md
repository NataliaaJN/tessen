# Arquitectura de componentes (`packages/vue` y `packages/react`)

> Estrategia: **component-oriented** ([ADR 0002](../planning/13-architecture-decisions/0002-component-oriented-packages-feature-first-apps.md)). Cada componente es una unidad que encapsula lo que realmente necesita, y la estructura **crece con su complejidad real**.
> Ver también: [repository-structure](repository-structure.md) · [dependency-rules](dependency-rules.md) · [naming-conventions](naming-conventions.md).

## 1. Principios

1. **Responsabilidad clara por componente.** Un componente, una carpeta, una razón de cambio.
2. **Co-location:** lo que cambia junto vive junto (implementación, tipos, utilidades, tests, stories).
3. **Estructura proporcional.** Un `Divider` no necesita diez archivos; un `DatePicker` sí puede necesitar subcomponentes y lógica de calendario.
4. **Sin archivos por obligación.** No se crea `*.utils.ts`, `*.types.ts` ni `context.ts` si no hay contenido.
5. **API pública controlada.** Lo exportado sale **solo** de `index.ts`; lo interno no es API.
6. **Compartir solo lo que tiene sentido.** Variantes, tokens, CSS y contratos son compartidos (`core`, `styles`, `tokens`); el código de framework **no** se comparte.
7. **Idiomático.** Vue: SFC, `defineProps/Emits/Slots`, `v-model`. React: función + hooks, `value/onValueChange`, `ref`.

## 2. Dónde vive cada cosa de un componente

| Pieza | Ubicación | Compartida |
|---|---|---|
| Contrato (anatomía, props, variantes, teclado, ARIA, casos) | `packages/core/src/contracts/<c>.contract.ts` | Sí (Vue, React, docs, playground) |
| Resolución de variantes | dentro del contrato (`<c>Variants`) usando `core/variants` | Sí |
| CSS | `packages/styles/src/components/<c>.css` | Sí |
| Implementación + tipos de props + contexto + subcomponentes + utilidades específicas de framework | `packages/<vue\|react>/src/components/<c>/` | No |
| Tests de componente/a11y y runner de contrato | junto a la implementación | No |
| Stories (QA) | junto a la implementación | No |

## 3. Crecimiento con la complejidad

### 3.1 Nivel 1 — simple (p. ej. `Divider`, `Spinner`, `Badge`)

```text
packages/vue/src/components/divider/
├── Divider.vue
├── divider.test.ts
└── index.ts

packages/react/src/components/divider/
├── Divider.tsx
├── divider.test.tsx
└── index.ts
```
Los tipos de props pueden vivir dentro del propio archivo si son pocos (`export interface DividerProps`). No hay `utils`, `variants` ni `context`.

### 3.2 Nivel 2 — con variantes y estados (p. ej. `Button`)

```text
packages/vue/src/components/button/
├── Button.vue
├── button.types.ts          # ButtonProps (tipado Vue)
├── button.test.ts           # comportamiento
├── button.a11y.test.ts      # axe + teclado
├── button.contract.test.ts  # runner de casos del contrato
├── Button.stories.ts
└── index.ts
```
React equivalente: `Button.tsx`, `button.types.ts` (si se separa), `button.test.tsx`, … Idéntico criterio.
`button.utils.ts` **solo** si aparece lógica propia del framework que justifique archivo (no hay en este caso).

### 3.3 Nivel 3 — compuesto (p. ej. `Dialog`)

```text
packages/vue/src/components/dialog/
├── Dialog.vue               # root: instancia la máquina del motor y provee contexto
├── DialogTrigger.vue
├── DialogContent.vue        # Portal + Presence + posicionamiento
├── DialogTitle.vue
├── DialogDescription.vue
├── DialogClose.vue
├── dialog.context.ts        # provide/inject del api de la máquina
├── dialog.types.ts
├── dialog.test.ts
├── dialog.a11y.test.ts
├── dialog.contract.test.ts
└── index.ts                 # exporta TDialog, TDialogTrigger, … y tipos
```
Reglas: las partes son **API pública** si aparecen en `index.ts`; helpers como `dialog.context.ts` **no** se exportan salvo necesidad documentada.

### 3.4 Nivel 4 — complejo (p. ej. `DatePicker`)

```text
packages/vue/src/components/date-picker/
├── DatePicker.vue
├── DatePickerInput.vue
├── DatePickerCalendar.vue      # subcomponentes con razón funcional
├── DatePickerMonthGrid.vue
├── date-picker.context.ts
├── date-picker.types.ts
├── calendar/                   # subcarpeta cuando hay lógica sustantiva propia
│   ├── calendar-grid.ts
│   └── calendar-grid.test.ts
├── date-picker.test.ts
├── date-picker.a11y.test.ts
├── date-picker.contract.test.ts
└── index.ts
```
Si parte de esa lógica es **independiente de framework** y la usan Vue **y** React (p. ej. aritmética de calendario), se promueve a `@tessen/core` con su propio test; **no** se duplica en los dos paquetes.

## 4. Exportaciones públicas

```ts
// packages/vue/src/components/button/index.ts
export { default as TButton } from './Button.vue'
export type { ButtonProps } from './button.types'
```
```ts
// packages/vue/src/index.ts  (punto de entrada público)
export * from './components/button'
export * from './components/dialog'
// …
export { useTheme, useMotion } from './composables'
```
- El paquete declara `exports` por subruta (`"./button"`) **generadas por script** desde `components/*/index.ts` (no se mantienen a mano).
- `internal/` y cualquier archivo no re-exportado quedan **fuera** de la API.
- `export *` solo desde `index.ts` de componente; en el barrel raíz se prefieren re-exports explícitos si hay riesgo de colisión.

## 5. Ejemplo real: `Button`

### 5.1 Contrato y variantes (compartido, `@tessen/core`)

```ts
// packages/core/src/contracts/button.contract.ts
import { defineContract, defineVariants } from '../variants'

export const buttonVariants = defineVariants({
  base: 't-button',
  variants: {
    variant: ['primary', 'secondary', 'outline', 'ghost', 'link'],
    size: ['sm', 'md', 'lg'],
    tone: ['default', 'danger'],
    block: 'boolean',
  },
  defaults: { variant: 'primary', size: 'md', tone: 'default', block: false },
})
// buttonVariants({ variant: 'outline' })
// → { class: 't-button', attrs: { 'data-variant': 'outline', 'data-size': 'md', 'data-tone': 'default' } }
//   (los variants booleanos como `block` solo emiten su atributo, `data-block`, cuando valen true)

export type ButtonVariantProps = Parameters<typeof buttonVariants>[0]

export const buttonContract = defineContract({
  name: 'Button', category: 'actions', tier: 'T1', engine: 'native',
  apgPattern: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
  // anatomía, props, teclado, aria, motion y casos de prueba…
})
```

### 5.2 CSS (compartido, `@tessen/styles`)

```css
/* packages/styles/src/components/button.css */
@layer tessen.components {
  .t-button {
    --_bg: var(--t-button-bg, var(--tessen-color-action-primary-default));
    background: var(--_bg);
    border-radius: var(--t-button-radius, var(--tessen-radius-md));
    transition: background var(--tessen-motion-duration-fast) var(--tessen-motion-easing-standard);
    &[data-variant='outline'] { --_bg: transparent; border: 1px solid var(--tessen-color-border-default); }
    &:focus-visible { outline: var(--tessen-focus-ring-width) solid var(--tessen-color-focus-ring); outline-offset: var(--tessen-focus-ring-offset); }
    &[aria-disabled='true'] { cursor: progress; }
  }
}
```

### 5.3 Vue

```vue
<!-- packages/vue/src/components/button/Button.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { buttonVariants } from '@tessen/core/contracts/button'
import type { ButtonProps } from './button.types'

defineOptions({ name: 'TButton' })
const props = withDefaults(defineProps<ButtonProps>(), { type: 'button' })
const emit = defineEmits<{ click: [event: MouseEvent] }>()
defineSlots<{ default(): unknown; leading?(): unknown; trailing?(): unknown }>()

const v = computed(() => buttonVariants(props))

function onClick(event: MouseEvent) {
  if (props.loading) return event.preventDefault()
  emit('click', event)
}
</script>

<template>
  <button
    :class="v.class" v-bind="v.attrs" :type="type" :disabled="disabled"
    :aria-busy="loading || undefined" :aria-disabled="loading || undefined"
    @click="onClick"
  >
    <span v-if="loading" class="t-button__spinner" aria-hidden="true" />
    <span v-if="$slots.leading" class="t-button__icon"><slot name="leading" /></span>
    <span class="t-button__label"><slot /></span>
    <span v-if="$slots.trailing" class="t-button__icon"><slot name="trailing" /></span>
  </button>
</template>
```

### 5.4 React

```tsx
// packages/react/src/components/button/Button.tsx
import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { buttonVariants, type ButtonVariantProps } from '@tessen/core/contracts/button'
import { cx } from '../../internal/cx'

export interface ButtonProps
  extends ButtonVariantProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  loading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  ref?: Ref<HTMLButtonElement> // React 19; en 18.3 se usa forwardRef (decisión D-11)
}

export function Button({
  variant, size, tone, block, loading = false, leadingIcon, trailingIcon,
  type = 'button', className, children, onClick, ref, ...rest
}: ButtonProps) {
  const v = buttonVariants({ variant, size, tone, block })
  return (
    <button
      {...rest} {...v.attrs} ref={ref} type={type} className={cx(v.class, className)}
      aria-busy={loading || undefined} aria-disabled={loading || undefined}
      onClick={(e) => (loading ? e.preventDefault() : onClick?.(e))}
    >
      {loading && <span className="t-button__spinner" aria-hidden="true" />}
      {leadingIcon && <span className="t-button__icon">{leadingIcon}</span>}
      <span className="t-button__label">{children}</span>
      {trailingIcon && <span className="t-button__icon">{trailingIcon}</span>}
    </button>
  )
}
```
```ts
// packages/react/src/components/button/index.ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

### 5.5 Qué se comparte y qué no en este ejemplo
Compartido: `buttonVariants`/contrato, CSS, tokens, casos de prueba. **No** compartido: el SFC y el TSX, sus tipos, el manejo de eventos y de refs. Ambos producen el **mismo DOM y atributos**, que es lo que verifica la suite de paridad.

## 6. Componentes internos y dependencias entre componentes

- Un subcomponente interno (p. ej. `DialogOverlay`) no se exporta salvo que el contrato lo declare parte de la anatomía pública.
- Un componente puede depender de otro **solo por su `index.ts`** y solo si el contrato lo declara (`dependencies`).
- Prohibido: ciclos entre componentes; dependencias de un componente hacia `internal/` de otro (`internal/` es del paquete, no de un componente concreto).
- Lógica reutilizable entre componentes del **mismo paquete**: `composables/` (Vue) o `hooks/` (React) si es pública; `internal/` si no.
- Lógica reutilizable entre Vue **y** React: `@tessen/core` (solo si pura y usada por ambos).

## 7. Pruebas

| Tipo | Archivo | Alcance |
|---|---|---|
| Componente | `<c>.test.ts(x)` | props, eventos, slots/children, foco, estados |
| Accesibilidad | `<c>.a11y.test.ts(x)` | axe por variante/estado + teclado |
| Contrato | `<c>.contract.test.ts(x)` | ejecuta los casos del contrato con el harness del framework |
| Visual | stories + Playwright | regresión y paridad (nivel de repo, no del paquete) |
| Integración / SSR / E2E | `integration/`, `apps/*/e2e` | fuera del componente |

No se repite en un nivel superior lo que ya cubre uno inferior (p. ej. el teclado de `Tabs` no se prueba otra vez en E2E).

## 8. Checklist para un componente nuevo

- [ ] Contrato en `core` (incl. variantes y casos).
- [ ] CSS en `styles` con solo tokens semánticos y `--t-<c>-*`.
- [ ] Carpeta en `vue` y en `react` con la estructura **mínima** necesaria.
- [ ] `index.ts` exporta únicamente la API pública.
- [ ] Tests (componente, a11y, contrato) y story.
- [ ] Docs: prosa + ejemplos Vue y React en `apps/docs/.../content/<c>/`.
- [ ] `pnpm deps:check`, `parity:api`, `publint` verdes · Changeset añadido.

## 9. Anti-patrones

| Anti-patrón | Por qué |
|---|---|
| `features/` en `packages/vue|react` | Rompe el modelo component-oriented |
| Copiar un componente a una app | Duplica lógica; usar el paquete |
| Mover a `core` «por si acaso» | Abstracción sin caso de uso real |
| Crear los 7 archivos del ejemplo siempre | Estructura que no responde a complejidad |
| Importar `../button/button.types` desde `dialog` | Salta el `index.ts` del componente |
| Exportar `internal/*` | Convierte detalles en API |
| Valores visuales literales en CSS | Debe haber token semántico |
