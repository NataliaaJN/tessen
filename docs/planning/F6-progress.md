# F6 · Playground: estado

> **Estado:** F6 **cerrada para el alcance de la hoja de ruta** (2026-11-23): selector de los 41 componentes, controles generados desde el contrato, vista previa en vivo en **Vue y React** (un `iframe` cada uno) a partir del mismo estado, código generado para ambos (copiar y descargar), estados forzados, tema y modo claro/oscuro, ancho responsive, estado en la URL y «Abrir en Playground» desde la documentación. Salida de fase (US-03) comprobada: los fragmentos generados **compilan en CI**. Decisión: [ADR 0018](13-architecture-decisions/0018-playground-scenes-and-codegen.md).
>
> **Idioma:** español, como el resto de la plataforma (decisión del propietario, D-14).

## 1. Entregado

| Pieza | Qué es |
| --- | --- |
| **`@tessen-ui/core/scene`** | Modelo de escena (árbol de datos) y `renderScene`: SFC de Vue y módulo de React desde el mismo árbol (kebab-case, eventos, slots, constantes elevadas, setup compartido). 6 tests. |
| **`apps/playground`** (Vite + Vue 3, puerto 5175) | Selector por categorías, panel de propiedades, estado forzado, tema, modo, ancho, vista Vue/React/ambas, panel de código con copiar/descargar, «Copiar enlace». 11 tests unitarios y 12 de navegador real. |
| **Recetas** | Una por contrato (41). Controles derivados del contrato (enum/boolean/string) más los propios (`text`, `defaultChecked`, números). |
| **Vista previa** | `iframe` del mismo origen por framework, `postMessage` con origen y emisor validados; `scene` remonta, `appearance` solo restiliza. |
| **Estados forzados** | Reglas gemelas `[data-force-state]` creadas en el `iframe` a partir del CSS de la librería; la librería no cambia. |
| **`pnpm snippets:check`** | 284 casos × 2 frameworks escritos como `.vue`/`.tsx` y comprobados con `vue-tsc` contra los paquetes construidos. En `verify` y en CI. |
| **Docs** | Enlace «Playground» en la cabecera y «Abrir en Playground» en cada componente (`#c=slug&fw=…`); el build de docs copia el Playground a `dist/playground`. |

## 2. Cómo funciona

- **Una escena, dos salidas.** `recipe.build(estado)` devuelve una `Scene`. `renderScene` la convierte en código y los `iframe` la montan con `h()`/`createElement()`. Vue y React no pueden divergir en la demo ni en el código.
- **Los controles salen del contrato.** Las props con el valor por defecto no se escriben en el código. Las controladas (`value`, `open`, `checked`…) no se ofrecen: el Playground usa sus gemelas `default*`.
- **Estado en la URL.** `#s=v1.<base64url>` guarda solo las diferencias; `#c=button&fw=react` es la forma que escribe la documentación. Cualquier URL inválida cae en los valores por defecto.
- **Toast** es el único caso con comportamiento: la escena lleva el `setup` (`const toaster = createToaster();`) y expresiones `{ $expr }` que el `iframe` evalúa (solo contenido del repositorio, nunca texto del usuario).

## 3. Decisiones tomadas por defecto

- **Recetas en la app, no en `core`** (contenido de demostración, no contrato).
- **Un solo estado forzado a la vez** (normal, hover, foco, pulsado) y se aplica a todos los elementos de la escena.
- **Temas:** los presets del Studio; para uno propio, el Studio. No hay pegado de códigos `v1.` en el Playground.
- **Ancho libre o 320/768/1024** con `iframe` real (las media queries y container queries son las del ancho elegido).
- **Sin editor de código en vivo** (PLG-07, P2).

## 4. Pendiente (no bloquea el cierre de F6)

| Pendiente | Nota |
| --- | --- |
| Composición de varios componentes y edición de código en vivo (PLG-07) | P2, fase 7+ |
| Más de un ejemplo por componente (variantes de contenido: iconos, slots) | Hoy una receta por componente; `Button` no ofrece iconos |
| Importar un tema del Studio por código `v1.` | Hoy solo los presets |
| Unificar recetas y ejemplos de la documentación | Hoy están duplicados a mano (SFC/TSX vs. datos) |
| Revisión con lector de pantalla del Playground | Manual (como C9 de F3), pendiente |
| Beta 0.5.0 (F3) | Lector de pantalla (C9) y gate de paridad obligatorio, aplazados por el propietario |

## 5. Verificación

`pnpm verify` completo (incluye `snippets:check`), `pnpm e2e` (104 tests: 12 del Playground), `pnpm docs:smoke` (41 páginas) y construcción de la documentación con `dist/playground`.
