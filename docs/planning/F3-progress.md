# F3 · Framework support y paridad: estado

> **Siguiente fase en curso:** [F4](F4-progress.md) (2026-11-22; el propietario dejó para más adelante el lector de pantalla y el gate de paridad obligatorio).
>
> **Estado:** F3 **iniciada, no cerrada** (2026-11-22). Se cerró primero la deuda del gate de F2 (paridad visual y navegador real) y se entregaron los componentes T2: el lote nativo (§2) y el lote sobre Zag (§2b). **El catálogo T2 queda completo.** `parity:api` y el aviso de terceros ya están (§3b). SSR (§3c), matriz de versiones y presupuesto de tamaño (§3d) también. Queda el lector de pantalla (§4).

## 1. Deuda de F2 cerrada

| Pendiente de F2 | Resultado |
| --- | --- |
| CI en rojo en `develop` | Causa: `typecheck` no dependía de `^build` y un runner limpio no tiene los `dist/` de los paquetes del workspace (`TS2307` en `contract-runner`). Arreglado en `turbo.json`; verificado desde un estado limpio con toda la secuencia de CI. |
| **Paridad visual Vue ↔ React** | `tooling/e2e`: un arnés renderiza la misma escena con `@tessen-ui/vue` y `@tessen-ui/react` en el mismo navegador y compara las capturas (≤ 0,1 % de píxeles distintos, claro y oscuro, con estados de foco, tooltip abierto, pestaña elegida y diálogo abierto). Sin capturas de referencia guardadas: la fuente y el antialiasing cambian por sistema operativo, pero Vue y React nunca deberían diferir entre sí. |
| **Pruebas en navegador real** (C3 de ADR 0004) | Playwright, mismas aserciones para Vue y React: trampa de foco, Escape, clic fuera, devolución del foco y salida de `Dialog`; apertura/cierre y posición de `Tooltip`; teclas de `Tabs`; clic real en `Checkbox`/`Switch`; flechas en `RadioGroup`; cableado de `Field`. Job `e2e` en CI (Chromium de Playwright en el runner; nada se publica). |

**Hallazgo de las pruebas en navegador:** el `Portal` de React se montaba en un `useEffect`, así que un `Dialog` con `defaultOpen` arrancaba su motor antes de que existiera su contenido: no atrapaba el foco, no cerraba con Escape y no ocultaba el resto de la página. jsdom no lo detectó. Ahora el `Portal` usa `useSyncExternalStore` (el servidor y la hidratación no renderizan nada; un render de cliente monta el portal en el mismo commit).

> Límite conocido: con SSR + hidratación + `defaultOpen`, el primer commit sigue sin contenido y el problema podría reaparecer. Cubierto con las fixtures de Nuxt/Next (§3c): hidrata y funciona.

## 2. Componentes T2 entregados (Vue y React)

`Progress`, `Avatar`, `Breadcrumbs` (+ `BreadcrumbItem`), `EmptyState`, `List` (+ `ListItem`), `ToggleButton`, `ButtonGroup`, `Table` (+ `TableCaption`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`) y `Pagination`.

Cada uno con contrato en `@tessen-ui/core` (datos), CSS en `@tessen-ui/styles`, Vue, React, casos de contrato compartidos y axe. Lógica compartida y probada una sola vez en `core`: `paginationRange` (longitud constante al paginar), `avatarInitials`, `progressPercent`. Total: **24 → 33 componentes** públicos por framework.

Decisiones:

1. **`Progress` expone el nombre accesible por `aria-label`**, no por una prop: una barra sola no tiene nombre y el consumidor debe darlo (documentado en el componente).
2. **`Avatar`** cae a las iniciales si falla la imagen y se recupera si cambia `src`; con imagen, el nombre sale del `alt`.
3. **`Pagination` usa botones, no enlaces**: sirve para cambiar lo que muestra una vista. Para paginación con URL hará falta una variante con enlaces (pendiente de decisión).
4. **`Table` es la `<table>` nativa** con partes planas; sin ordenación, selección ni virtualización (eso es T3, `DataTable`).
5. **`EmptyState`**: el título es un `<p>`, no un encabezado, para no imponer un nivel en la jerarquía de la página.
6. **Vue: nunca comentarios HTML en la raíz del `<template>`**: crean un fragmento y se pierde el paso de atributos (`class`, `aria-*`). Los comentarios van en el `<script>`.

## 2b. Componentes T2 sobre Zag entregados (Vue y React)

`Select`, `Combobox`, `Slider`, `Toaster` (+ `createToaster`), `Popover`, `DropdownMenu`, `AlertDialog` y `Accordion`, cada uno con contrato en `@tessen-ui/core`, CSS en `@tessen-ui/styles`, Vue, React, casos de contrato compartidos y axe. **33 → 41** componentes públicos por framework. Un comportamiento por componente que jsdom no puede comprobar se verifica en Chromium real (`tooling/e2e`, mismas aserciones para Vue y React) y las escenas nuevas entran en la paridad visual.

Decisiones:

1. **`Select` y `Combobox` reciben `items` (`{ value, label, disabled? }`) y `label`**, no partes compuestas: cubren el 90 % de los usos y mantienen la API pequeña. El contenido enriquecido por opción (iconos, grupos) queda para una API compuesta posterior. `Combobox` filtra por «contiene» (`filterItems`, una sola vez en `core`) y solo con lo que la persona teclea: elegir una opción rellena el campo sin esconder las demás la próxima vez que se abra. Sin valores libres ni creación de opciones (T3).
2. **Estado controlado**: `value`/`v-model` (`null` = «nada»), `defaultValue`, `open`/`v-model:open`. En `Slider` el valor es un `number` y hay `onValueCommit`/`@commit` al soltar.
3. **`Toaster` + `createToaster()`**: el manejador se crea una vez, se llama desde cualquier sitio y `<Toaster :toaster>` se monta una vez. El manejador oculta el motor (un `WeakMap` guarda el almacén de Zag) y es lo único que no es un componente en la API pública (la prueba de API pública lo admite por su nombre). `title` y `description` son texto plano. Sin `promise()` todavía.
4. **`AlertDialog` es un `Dialog` con `role="alertdialog"`** que un clic fuera no cierra. Reutiliza las partes de `Dialog` y añade `AlertDialogCancel` y `AlertDialogAction` (con la apariencia de `Button`). Para compartir el adaptador sin que un componente alcance los internos de otro, `dialog.zag.ts` pasó a `internal/` (la regla de dependencias solo deja a un componente usar el `index` de otro).
5. **`DropdownMenu` es para acciones, no navegación.** El valor del elemento llega al `onSelect(value)`/`@select` de la raíz: Zag 1.48 no expone un `onSelect` por elemento en `getItemProps`. Sin submenús, grupos ni elementos con casilla todavía.
6. **`Popover` no es modal** (el resto de la página sigue accesible, un clic fuera lo cierra) y, como todo lo que se abre en un portal sobre un posible modal, usa la capa `layer.popover` (1400 > `layer.modal` 1300). Hallazgo de S2 confirmado en navegador real: un `Select` dentro de un `Dialog` queda encima y cada Escape cierra una sola capa.
7. **`Accordion`: `collapsible` por defecto** (el elemento abierto se puede cerrar), `multiple` opcional, nivel de encabezado configurable (`headingLevel`, 3 por defecto) para respetar el esquema de la página.
8. **Limitaciones de jsdom (documentadas en las pruebas)**: no tiene `scrollTo` (polyfill en el `setup`), no se puede hacer clic «a través» de una página inerte (el cierre por clic fuera se prueba en Chromium) y los temporizadores por fotograma del `Toast` se atrasan con la CPU saturada, así que el cierre por tiempo se comprueba en navegador real y no en el contrato.
9. **Vue**: con `v-bind="api.getTriggerProps()"` seguido de un atributo, gana el atributo posterior (en React el orden del spread decide igual): `aria-label` del botón del `Combobox` va después del `v-bind`.

## 3. Verificación

`pnpm verify`, empaquetado, `tarball:check`, instalación y build de `integration/*` desde tarballs y `pnpm e2e` (82 pruebas, con la paridad visual de las escenas nuevas) en verde en local; el CI de GitHub (`verify` y `e2e`) pasa en cada PR.

## 3b. `parity:api` y licencias (C10)

- **`pnpm parity:api`** (`tooling/scripts/parity-api.mjs`): carga los bundles **construidos** de `@tessen-ui/vue` y `@tessen-ui/react`, asigna `TButton` → `Button` (ADR 0011) y falla si un componente existe en un framework y no en el otro, o si un componente Vue pierde el prefijo `T`. Una asimetría deliberada debe listarse en `ALLOWED_ONLY_IN` con su motivo. Hoy: 82 exports compartidos, sin asimetrías. Corre en `pnpm verify` y en el job `verify` de CI, después del build. No compara las props (los nombres difieren por convención: `v-model` frente a `value`/`onValueChange`); eso lo cubren los contratos compartidos.
- **`pnpm licenses:check`** (`tooling/scripts/licenses-check.mjs`): recorre las dependencias de producción de los paquetes, falla si una licencia no está en la lista blanca (MIT, ISC, Apache-2.0, BSD-2/3-Clause, 0BSD; en expresiones SPDX, `OR` pide una permitida y `AND` todas) y falla si `THIRD-PARTY-NOTICES.md` está desactualizado (`pnpm licenses:check --write` lo regenera). 34 paquetes de terceros, todos permitidos. Prettier ignora el archivo generado.

## 3c. SSR: fixtures de Next y Nuxt

- **`integration/next`** (Next 16, App Router) y **`integration/nuxt`** (Nuxt 4) son proyectos consumidores (ADR 0016): se instalan desde los tarballs, sin alias ni `transpilePackages`. Una página renderiza en servidor `Button`, `Tabs`, `Select`, `Accordion` y `Progress`, y un `Dialog` con `defaultOpen`. En Next, la página es un **componente de servidor** que importa `@tessen-ui/react` directamente (el paquete lleva `'use client'`, C4).
- **`pnpm integration:test`** construye cada uno y su `check` arranca el servidor de producción y comprueba el HTML servido (contenido del lado servidor, hoja de estilos, y que el portal del `Dialog` **no** se renderiza en servidor).
- **`pnpm ssr:e2e`** (`tooling/e2e/ssr`) arranca ambos servidores y, en un navegador real, comprueba la hidratación: sin errores ni avisos de desajuste ni respuestas ≥ 400; el `Dialog` `defaultOpen` queda abierto, modal, con el foco dentro y se cierra con Escape (**el límite de §1 queda cubierto y no reaparece**); `Tabs`, `Select` y `Accordion` renderizados en servidor responden tras hidratar. Mismas aserciones para Vue y React. Corre en el job `verify` de CI (instala Chromium).
- `INTEGRATION_ONLY=next pnpm integration:install` limita la instalación a un proyecto.

## 3d. Matriz de versiones y presupuesto de tamaño

- **Extremos bajos de los rangos de peer**, como consumidores instalados desde tarballs (ADR 0016): `integration/vite-react18` (React **18.3.1** y `@types/react` 18) e `integration/vite-vue352` (Vue **3.5.2**). Cada uno hace typecheck estricto (`skipLibCheck: false`), build y comprobaciones de consumidor, y `pnpm ssr:e2e` ejecuta en Chromium real `tooling/e2e/ssr/matrix.spec.ts` (Tabs, Checkbox, Dialog con trampa de foco y devolución del foco). Los extremos altos ya los cubren el workspace y los demás consumidores (React 19.3, Vue 3.5.46).
- **Hallazgo:** nuestros `.d.ts` de Vue no tipan con Vue 3.5.0–3.5.1 (`DefineComponent` ganó un parámetro de tipo en 3.5.2). El peer de `@tessen-ui/vue` y `@tessen-ui/icons` pasa de `^3.5.0` a **`^3.5.2`**. Sin la matriz, el rango declarado era falso.
- **`pnpm size`** (`size-limit`, `.size-limit.json`): presupuestos en brotli con todas las dependencias (Zag incluido), sin React/Vue: `Button` ≤ 2 kB, `Dialog` ≤ 22 kB, `Select` ≤ 34 kB, el paquete completo ≤ 97 kB (React) / 98 kB (Vue) y `index.css` ≤ 10,5 kB, con ~15 % de margen sobre el tamaño medido. Que `Button` pese 1,4 kB comprueba que el tree-shaking funciona. Corre en `pnpm verify` y en CI.

## 4. Pendiente de F3 (no hecho)

| Pendiente | Nota |
| --- | --- |
| Compilación de snippets de la documentación | Sin construir |
| Checklist manual con lector de pantalla (NVDA, VoiceOver) de los compuestos | Antes de una alpha publicada (C9) |
| Beta `0.5.0` en tarballs | Requiere ≥ 25 componentes **estables** y el gate de paridad obligatorio (hoy en CI, sin protección de rama por decisión del propietario) |

**Gate de F3** («≥ 25 componentes estables; paridad obligatoria en CI; `0.5.0` beta»): **parcial**. 41 componentes (catálogo T2 completo) y paridad visual en CI; SSR cubierto (§3c); falta la beta (lector de pantalla y gate de paridad obligatorio).
