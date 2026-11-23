# ADR 0018 — Playground: escenas neutrales, vista previa en dos `iframe` y código generado

- **Estado:** **Accepted** (F6, 2026-11-23). Concreta `08` §6 y `03` PLG-01..06.
- **Fecha:** 2026-11-23

## Contexto
El Playground debe mostrar el mismo componente en Vue y en React a partir de un único estado y generar el código de ambos que **compile sin cambios** (US-03, objetivo O4). Lo difícil no son las props simples (`variant`, `size`): son los compuestos (`Dialog` + 5 partes), los slots de Vue frente a las props de React (`Card.header`), los datos estructurados (`items`) y los pocos casos con comportamiento (`Toast`). El `generateSnippet` de F1 solo sabía describir un `Button`.

## Decisión
1. **Una escena es un árbol de datos** (`Scene`/`SceneNode` en `@tessen-ui/core/scene`, puro TypeScript): `{ c, p, k, s }` = componente (nombre React; el de Vue es `T` + nombre, ADR 0011), props, hijos y slots con nombre. Las minúsculas son etiquetas HTML. Los valores son JSON, salvo `{ $expr }` para el puñado de expresiones JavaScript que se leen igual en plantillas Vue y en JSX (`toaster`, `() => toaster.create(...)`).
2. **Un solo estado produce todo.** `renderScene(scene, 'vue' | 'react')` genera el SFC o el módulo (importaciones ordenadas, `kebab-case` en Vue, eventos `@click`/`onClick`, slots como `<template #header>` o `header={...}`, constantes elevadas para `items` largos). Los `iframe` de vista previa montan **la misma escena** con `h()` y `createElement()` sobre los paquetes reales. Por construcción, la vista previa y el código copiado no pueden divergir.
3. **Las recetas (`recipes`) viven en la app**, no en `core`: son contenido de demostración, no contrato. Cada una declara su contrato, controles propios y cómo construir la escena. **Los controles se derivan del contrato** (enum → selector, boolean → casilla, string → texto) y las props con el valor por defecto del contrato no se escriben. Una prueba exige una receta por cada contrato (41).
4. **Vista previa en dos `iframe` del mismo origen** (`preview-vue.html`, `preview-react.html`) alimentados por `postMessage` con origen y emisor validados. Dos mensajes: `scene` (remonta; así `defaultOpen`/`defaultChecked` empiezan de nuevo) y `appearance` (CSS del tema, modo claro/oscuro, estado forzado; no remonta).
5. **Estados forzados sin tocar `@tessen-ui/styles`.** Al cargar, el `iframe` duplica cada regla con `:hover`, `:active`, `:focus-visible`, `:focus` o `:focus-within` con una gemela `[data-force-state~=…]` (la técnica del addon de pseudo-estados de Storybook) y marca los elementos de la escena. `disabled`, `invalid` y `loading` son props reales del contrato. La doc `08` §6.2 proponía que el CSS de `styles` respetara `data-force-state`; se descarta para no añadir al paquete publicable código que solo usa una herramienta.
6. **Tema:** presets de `@tessen-ui/theme` (mismo motor que el Studio) y modo claro/oscuro; el CSS se inyecta solo en los `iframe`. Los temas propios se crean en el Studio.
7. **Estado en la URL:** `#s=v1.<base64url>` con solo las diferencias respecto a la receta; `#c=<slug>&fw=<vue|react>` es la forma legible que usa la documentación («Abrir en Playground»). Una URL mala nunca lanza: da los valores por defecto.
8. **Los fragmentos compilan en CI (`pnpm snippets:check`):** 284 casos (cada receta por defecto y cada control movido por separado) se escriben como `.vue`/`.tsx` reales y `vue-tsc` los comprueba contra los paquetes **construidos**. Detectó de entrada que `size` de `Dialog` pertenece a `DialogContent` en ambos frameworks, aunque el contrato lo liste en la raíz.
9. **Sin hosting:** `base: '/playground/'` y el build de docs copia la salida a `dist/playground` (como el Studio). Nada se despliega (ADR 0014).

## Alternativas
| Alternativa | Motivo de descarte |
| --- | --- |
| Ampliar `generateSnippet` (props neutrales de `Button`) | No describe compuestos, slots ni datos; cada componente nuevo exigiría código a medida |
| Generar el código desde el DOM renderizado | Pierde los nombres de las props y las constantes; el resultado no es idiomático |
| Que cada framework mantenga su propia demo y un texto de código aparte | Es justo la divergencia que el Playground debe impedir |
| `data-force-state` en el CSS de `styles` | Añade a la librería código solo de herramientas; la gemela en el `iframe` da el mismo resultado |
| Editor de código en vivo (CodeMirror + compilador en navegador) | PLG-07 es P2 y fase 7+ |

## Consecuencias
(+) Añadir un componente al Playground es una receta de 5–15 líneas; los controles, el código y la prueba de compilación salen solos. (+) Cualquier prop mal escrita en uno de los dos frameworks rompe `snippets:check`. (−) Las recetas duplican a mano la estructura de los ejemplos de la documentación (los ejemplos están en SFC/TSX reales; las escenas son datos). Unificarlos queda como mejora posible. (−) El estado forzado marca todos los elementos de la escena: en un compuesto verás el mismo estado en cada parte interactiva.
