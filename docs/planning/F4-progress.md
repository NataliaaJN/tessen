# F4 · Plataforma de documentación: estado

> **Siguiente fase:** [F5](F5-progress.md) (Theme Studio).
>
> **Estado:** F4 **cerrada para el alcance de `apps/docs`** (2026-11-22): sitio local con catálogo, página por componente con demos vivas Vue/React, explorador de tokens, getting started, guidelines, búsqueda `⌘K` y selector de framework. Theme Studio y Playground son F5/F6. F3 sigue con la beta pendiente (lector de pantalla y gate de paridad obligatorio, decisión del propietario de dejarlos para más adelante).

## 1. Entregado

- **F4-T01 `tooling/docs-gen`** (`@tessen-ui/docs-gen`): contratos + paquetes construidos → JSON por componente, índice y `llms.txt`. **`pnpm docs:check`** (en `verify` y CI) falla por drift entre contrato, Vue y React.
- **F4-T01 `apps/docs`** (Astro 7, estático, solo local, ADR 0014): inicio, catálogo, página por componente, `/components/<slug>.json`, `/llms.txt`.
- **F4-T02** explorador de tokens (`/tokens/`).
- **F4-T03** demos vivas: islas Vue/React `client:visible`; ejemplos en `src/examples/<slug>/<id>.{vue,tsx}`; el build falla si falta uno de los dos.
- **F4-T04** demos para **los 41 componentes** (antes 9); **`pnpm docs:smoke`** visita las 41 páginas, hidrata todas las islas y falla ante cualquier error o aviso de consola (necesita el sitio servido en `DOCS_URL`, p. ej. `astro preview`).
- **F4-T05** `/get-started/` (Vue, React, Nuxt, Next, Tailwind, tema) y `/guidelines/` (principios, accesibilidad, contenido, layout, theming).
- **F4-T06** selector global **Both / Vue / React** persistente (`localStorage` y `?fw=`), búsqueda **⌘K / Ctrl+K** sobre un índice estático (`/search-index.json`).
- **F4-T07** prosa editorial por componente (`src/lib/editorial.ts`): «cuándo usarlo», alternativas con enlace y reglas de contenido.

## 2. Decisiones tomadas por defecto

- **Idioma del sitio: español** (decisión del propietario, 2026-11-23; antes era inglés por defecto). El texto está en las plantillas y en `src/lib/editorial.ts`. Los enunciados de comportamiento de cada contrato siguen en inglés.
- **Búsqueda sin Pagefind:** con ~44 entradas un índice JSON estático evita una dependencia y un binario; si el contenido crece (MDX, muchas guías) se reevalúa.
- **Comprobación de ejemplos:** las demos son fuentes reales, compiladas por `astro build` y `astro check` y ejecutadas por `docs:smoke`. El bloque «Usage» generado desde el contrato es mínimo (marcador).

## 3. Pendiente (no bloquea el cierre de F4)

| Pendiente | Nota |
| --- | --- |
| *Do / Don't* con ejemplos vivos | Hoy hay reglas de texto; faltan los pares visuales |
| Fundamentos editoriales (`/foundations/*`) y `/motion/` | Los tokens se ven en `/tokens/`; falta la prosa por disciplina |
| `docs:smoke` en CI | Necesita levantar `astro preview` en el job `e2e` |
| Usage del contrato → ejemplo real | Sustituir el bloque mínimo por el primer ejemplo |
| Beta 0.5.0 (F3) | Lector de pantalla (C9) y gate de paridad obligatorio |
