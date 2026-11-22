# F3 · Framework support y paridad: estado

> **Estado:** F3 **iniciada, no cerrada** (2026-11-22). Se cerró primero la deuda del gate de F2 (paridad visual y navegador real) y se entregaron los componentes T2: el lote nativo (§2) y el lote sobre Zag (§2b). **El catálogo T2 queda completo.** Quedan SSR, `parity:api`, matriz de versiones, `size-limit`, lector de pantalla y aviso de terceros (§4).

## 1. Deuda de F2 cerrada

| Pendiente de F2 | Resultado |
| --- | --- |
| CI en rojo en `develop` | Causa: `typecheck` no dependía de `^build` y un runner limpio no tiene los `dist/` de los paquetes del workspace (`TS2307` en `contract-runner`). Arreglado en `turbo.json`; verificado desde un estado limpio con toda la secuencia de CI. |
| **Paridad visual Vue ↔ React** | `tooling/e2e`: un arnés renderiza la misma escena con `@tessen-ui/vue` y `@tessen-ui/react` en el mismo navegador y compara las capturas (≤ 0,1 % de píxeles distintos, claro y oscuro, con estados de foco, tooltip abierto, pestaña elegida y diálogo abierto). Sin capturas de referencia guardadas: la fuente y el antialiasing cambian por sistema operativo, pero Vue y React nunca deberían diferir entre sí. |
| **Pruebas en navegador real** (C3 de ADR 0004) | Playwright, mismas aserciones para Vue y React: trampa de foco, Escape, clic fuera, devolución del foco y salida de `Dialog`; apertura/cierre y posición de `Tooltip`; teclas de `Tabs`; clic real en `Checkbox`/`Switch`; flechas en `RadioGroup`; cableado de `Field`. Job `e2e` en CI (Chromium de Playwright en el runner; nada se publica). |

**Hallazgo de las pruebas en navegador:** el `Portal` de React se montaba en un `useEffect`, así que un `Dialog` con `defaultOpen` arrancaba su motor antes de que existiera su contenido: no atrapaba el foco, no cerraba con Escape y no ocultaba el resto de la página. jsdom no lo detectó. Ahora el `Portal` usa `useSyncExternalStore` (el servidor y la hidratación no renderizan nada; un render de cliente monta el portal en el mismo commit).

> Límite conocido: con SSR + hidratación + `defaultOpen`, el primer commit sigue sin contenido y el problema podría reaparecer. Se cubrirá con las fixtures de Nuxt/Next (§4).

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

## 4. Pendiente de F3 (no hecho)

| Pendiente | Nota |
| --- | --- |
| `parity:api` (paridad de API entre Vue y React) y compilación de snippets | Sin construir |
| Fixtures SSR de Nuxt y Next (hidratación) | Incluye el límite de `defaultOpen` de arriba |
| Matriz Vue 3.5 / React 18.3–19 y `size-limit` | |
| Checklist manual con lector de pantalla (NVDA, VoiceOver) de los compuestos | Antes de una alpha publicada (C9) |
| Aviso de terceros de Zag y lista de licencias (C10) | |
| Beta `0.5.0` en tarballs | Requiere ≥ 25 componentes **estables** y el gate de paridad obligatorio (hoy en CI, sin protección de rama por decisión del propietario) |

**Gate de F3** («≥ 25 componentes estables; paridad obligatoria en CI; `0.5.0` beta»): **parcial**. 41 componentes (catálogo T2 completo) y paridad visual en CI; faltan SSR, `parity:api` y la beta.
