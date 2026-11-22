# F5 · Theme Studio: estado

> **Estado:** F5 **cerrada para el alcance de la hoja de ruta** (2026-11-23): modo rápido, modo avanzado, vista previa con componentes reales, contraste WCAG en vivo, exportación CSS/DTCG/Tailwind v4/TS/JSON, importación, guardado, URL compartible, deshacer/rehacer, comparación con la base y mini-panel «Apariencia» en la documentación. La salida de fase (US-02) está comprobada: un tema exportado desde Studio se aplica a una app de `integration/` y cambia su aspecto sin tocar la librería. Decisión: [ADR 0017](13-architecture-decisions/0017-theme-engine-and-studio.md).
>
> **Idioma:** a petición del propietario (2026-11-23) **el sitio de documentación y el Studio están en español** (resuelve D-14 para esta fase). Los enunciados de las pruebas de comportamiento de cada componente (`behaviours[].describe` en los contratos) siguen en inglés porque también son los nombres de los tests.

## 1. Entregado

| Pieza | Qué es |
| --- | --- |
| **`@tessen-ui/theme`** (`packages/theme`) | Motor sin dependencias ni Vue/React: escalas OKLCH desde una semilla, contraste WCAG, modelo de tema validado (`parseTheme`), 8 presets, exportación (`toCss`, `toDtcg`, `toTailwind`, `toTypeScript`, `toThemeJson`), importación (`importTheme`), códigos para compartir (`encodeTheme`/`decodeTheme`) y auditoría de contraste (`auditTheme`, `suggestForeground`). 25 tests. |
| **`apps/theme-studio`** (Vite + Vue 3) | Studio con presets, «Mis temas», historial, editor rápido y avanzado, vista previa en `iframe` aislado con 5 escenas (Componentes, Formularios, Panel, Landing, Tipografía) y anchos Completo/Tableta/Móvil. 8 tests de historial y 10 de navegador real. |
| **Tokens** | `tokens.json` incluye `aliases` por modo (el Studio necesita saber a qué primitivo apunta cada semántico en claro y en oscuro) y el paquete exporta `contrast-pairs.json`. |
| **Docs** | `/studio/` se sirve desde el build de la documentación (se copia `apps/theme-studio/dist`); botón «Apariencia» (acento, radio, densidad) que usa el mismo motor y se guarda en el navegador; la documentación completa pasa a español. |
| **Integración (US-02)** | `integration/vite-vue` importa `acme.theme.json` (formato de Studio), genera su CSS con `@tessen-ui/theme` desde el tarball y el build comprueba que el tema llega después del CSS de la librería con sus valores. |

## 2. Cómo funciona

- **Un tema son datos pequeños** (`Theme`, JSON): acento, radio, densidad, movimiento, fuentes y, en modo avanzado, `overrides` de primitivos y de semánticos por modo.
- **Escala del acento:** una semilla da tono y croma; la luminosidad sigue la escalera fija de Tessen (la misma que genera la paleta base). Así los pasos que usa la capa semántica (800 con texto blanco, 700 en enlaces, 400 en superficies oscuras) conservan su contraste con cualquier tono; los 8 presets y el barrido de 18 tonos lo comprueban en tests.
- **CSS exportado:** solo lo que difiere de la base, **sin capa** (`@layer`), así gana a `tessen.tokens` sin `!important`. Los ajustes por modo se emiten para `data-tessen-theme='light|dark'` y para `prefers-color-scheme` cuando no hay atributo.
- **Vista previa:** `iframe` del mismo origen que recibe el CSS por `postMessage` (se valida origen y emisor). Las variables se aplican en el `:root` del iframe, que es donde viven los semánticos; en un contenedor normal los alias ya resueltos no cambiarían.
- **Auditoría de contraste:** reutiliza la tabla de pares que verifica `tokens:check` (`contrast-pairs.json`), recalculada con los alias de cada modo. Si un par falla, propone un color corregido que cumple **todos** los fondos de ese texto en ese modo.
- **Compartir:** `#t=v1.<base64url>` con solo las diferencias respecto a la base (un tema simple ocupa < 150 caracteres). No se usa `lz-string` (la doc 08 lo marcaba como candidato **[C]**): evita una dependencia y no hace falta con estos tamaños.
- **Persistencia:** `localStorage` (`tessen:studio:themes`, esquema versionado; `tessen:studio:draft`), siempre dentro de `try/catch`.

## 3. Decisiones tomadas por defecto

- **Idioma:** español (petición del propietario).
- **Framework del shell (D-04):** Vue 3 + Vite; la vista previa usa los componentes Vue reales (el CSS es común a Vue y React).
- **Fuentes:** el Studio **no descarga ni empaqueta fuentes** (coste cero y sin peticiones externas): ofrece nombres habituales y avisa de que la app debe tenerlas instaladas o cargarlas con `@font-face`. THS-08 queda cubierto en lo que es *elegir y exportar* la familia; la carga de fuentes es del consumidor.
- **Un solo acento:** la semilla genera `brand` y `accent`. Un acento distinto para el modo oscuro se logra en el modo avanzado (sobrescribiendo `accent.*` o el alias semántico).
- **Densidad y movimiento:** la densidad se exporta como `--tessen-density-scale`; «Sin movimiento» pone las duraciones a 0 ms y «Reducido» se aplica con `data-tessen-motion="reduced"` (el CSS no puede poner atributos; se avisa en el panel y en el CSS exportado).
- **Superficies translúcidas (D-13):** no se incluyen (opcional y marcada experimental en la spec).
- **Formato nativo de tema:** `Theme` v1 (JSON plano). No es el esbozo de `04` §4.3 (`extends`/`modes`/`generate`): ese formato se descartó por ser más complejo de validar; el DTCG exportado conserva el tema entero en `$extensions.tessen.theme`.

## 4. Pendiente (no bloquea el cierre de F5)

| Pendiente | Nota |
| --- | --- |
| Exportar a Tokens Studio / Figma Variables (THS-09) | P2; la spec lo sitúa en F8+ |
| Editor de tipografía con escala propia | Hoy: familias. La escala (tamaños) sigue siendo la de los tokens |
| Pares de contraste de superficies del propio tema | La tabla es la de `tokens:check`; no se validan pares que el usuario invente |
| Vista previa React | El CSS es común; la vista previa usa Vue por diseño |
| Revisión con lector de pantalla del Studio | Manual (como C9 de F3), pendiente |
| Beta 0.5.0 (F3) | Lector de pantalla (C9) y gate de paridad obligatorio, aplazados por el propietario |

## 5. Verificación

`pnpm verify` completo, más `pnpm e2e` (92 tests: 10 del Studio), `pnpm docs:smoke` (41 páginas), `pnpm pack:all` + `tarball:check` (incluye `@tessen-ui/theme`) y `integration:test` de `vite-vue` con el tema exportado.
