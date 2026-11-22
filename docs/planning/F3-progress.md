# F3 · Framework support y paridad: estado

> **Estado:** F3 **iniciada, no cerrada** (2026-11-22). Se cerró primero la deuda del gate de F2 (paridad visual y navegador real) y se entregó el lote de componentes T2 que no necesitan motor de comportamiento. Quedan los T2 sobre Zag y el resto de F3 (§4).

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

## 3. Verificación

`pnpm verify`, empaquetado, `tarball:check`, instalación y build de `integration/*` desde tarballs y `pnpm e2e` en verde en local; el CI de GitHub (`verify` y `e2e`) pasó en el PR de paridad y navegador real.

## 4. Pendiente de F3 (no hecho)

| Pendiente | Nota |
| --- | --- |
| T2 sobre Zag: `Select`, `Combobox`, `Slider`, `Toast`, `Popover`, `DropdownMenu`, `AlertDialog`, `Accordion` | Los costosos (ver §3 de `F2-closing.md`). `AlertDialog` puede salir de `Dialog` (`role="alertdialog"` ya existe) |
| `parity:api` (paridad de API entre Vue y React) y compilación de snippets | Sin construir |
| Fixtures SSR de Nuxt y Next (hidratación) | Incluye el límite de `defaultOpen` de arriba |
| Matriz Vue 3.5 / React 18.3–19 y `size-limit` | |
| Checklist manual con lector de pantalla (NVDA, VoiceOver) de los compuestos | Antes de una alpha publicada (C9) |
| Aviso de terceros de Zag y lista de licencias (C10) | |
| Beta `0.5.0` en tarballs | Requiere ≥ 25 componentes **estables** y el gate de paridad obligatorio (hoy en CI, sin protección de rama por decisión del propietario) |

**Gate de F3** («≥ 25 componentes estables; paridad obligatoria en CI; `0.5.0` beta»): **parcial**. 33 componentes y paridad visual en CI; faltan los T2 de Zag, SSR, `parity:api` y la beta.
