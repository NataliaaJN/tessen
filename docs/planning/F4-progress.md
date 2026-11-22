# F4 · Plataforma de documentación: estado

> **Estado:** F4 **iniciada, no cerrada** (2026-11-22). Se hizo primero la base: datos generados desde los contratos y un sitio Astro local con catálogo y página por componente. F3 sigue con la beta pendiente (lector de pantalla y gate de paridad obligatorio, decisión del propietario de dejarlos para más adelante).

## 1. Entregado (F4-T01)

- **`tooling/docs-gen`** (`@tessen-ui/docs-gen`): lee los contratos (`@tessen-ui/core`) y los paquetes **construidos** de Vue y React y genera un JSON por componente (props, valores, defaults, partes compuestas, anatomía, comportamientos tal como los describe el contrato, ejemplo Vue/React), un índice y `llms.txt`. La lógica es pura y está probada (`node --test`).
- **`pnpm docs:check`** (en `pnpm verify` y en el job `verify` de CI): falla si un componente no existe en ambos frameworks, si un contrato no tiene casos, o si una prop del contrato no existe en el componente de Vue. `value`/`checked` se aceptan como `modelValue` y `aria-label` como `ariaLabel`; las excepciones deliberadas están en `KNOWN_EXCEPTIONS` con su motivo (`Dialog.size` vive en `DialogContent`, `placeholder` es un atributo nativo), y una excepción obsoleta también falla. Después ejecuta `astro check` sobre el sitio.
- **`apps/docs`** (Astro 7, estático, solo local, ADR 0014): inicio, catálogo por categoría y una página por componente (uso en Vue y React, anatomía, partes, tabla de props, comportamiento y accesibilidad) más `/components/<slug>.json` y `/llms.txt`. Usa solo los tokens y el CSS públicos de `@tessen-ui/styles`, con tema claro/oscuro. `pnpm --filter @tessen-ui/docs dev` lo arranca; los datos generados (`src/generated`, `public/llms.txt`) no se versionan.

## 2. Decisión tomada por defecto

**Idioma del sitio: inglés** (D-14, opción recomendada). Los documentos de planificación y arquitectura siguen en español. Es reversible: todo el texto está en las plantillas de `apps/docs`.

## 3. Pendiente de F4

| Pendiente | Nota |
| --- | --- |
| Demos vivas (islas Vue/React) y ejemplos `*.vue`/`*.tsx` con el mismo id, mostrados con `?raw` | Hoy el uso es un snippet generado, no un ejemplo ejecutado |
| Búsqueda `⌘K` (Pagefind) | Sin construir |
| ~~Explorador de tokens~~ | Hecho (F4-T02, `/tokens/`). Faltan las páginas de fundamentos editoriales (principios, accesibilidad) |
| Getting started (Vue, React, Nuxt, Next, Tailwind) y guidelines | Sin construir |
| Selector global Vue / React persistente | Hoy se ven los dos lado a lado |
| Descripciones editoriales («cuándo usarlo», contenido) y *Do/Don't* | El contrato no tiene prosa todavía: hace falta un lugar para ella |
| Comprobación de ejemplos (compilar los snippets) | Es el pendiente de F3 «compilación de snippets» |
