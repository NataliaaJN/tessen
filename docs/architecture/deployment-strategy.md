# Estrategia de despliegue

> **Política vigente: no hay despliegue.** La plataforma (documentación, Theme Studio y Playground) **funciona en local** y no requiere ningún proveedor de hosting. Decisión: [ADR 0014](../planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md).

## 1. Lo que NO se hace

- No se configura ni activa Cloudflare Pages, Vercel, Netlify, hosting de pago ni dominios.
- No se crean cuentas en esos servicios ni se despliega la aplicación.
- **No se configura GitHub Pages** ni se crea ningún workflow de despliegue.
- No se asume que la arquitectura deba apuntar a GitHub Pages.
- No se compromete el *routing*, el SSR o la funcionalidad para encajar con un proveedor.

Cualquier despliegue futuro necesita **aprobación explícita del propietario**.

## 2. Ejecución local

| App | Comando objetivo | Puerto por defecto |
|---|---|---|
| `apps/docs` (Astro) | `pnpm --filter docs dev` / `build` / `preview` | 4321 |
| `apps/theme-studio` (Vite + Vue) | `pnpm --filter theme-studio dev` / `build` / `preview` | 5173 |
| `apps/playground` (Vite + Vue) | `pnpm --filter playground dev` / `build` / `preview` | 5174 (configurable) |
| Todas | `pnpm dev` (Turborepo, tareas persistentes) | — |
| Storybook (QA) | `pnpm --filter <vue\|react> storybook` | 6006 / 6007 |

- Las apps se **construyen** a `apps/<app>/dist` y se sirven localmente con `preview`; no se publica el resultado.
- La **búsqueda** de las docs (Pagefind) y el resto de funcionalidad se ejecutan en local; **no hay llamadas a servicios externos** en tiempo de ejecución (fuentes autoalojadas, sin analítica, sin CDNs).
- Theme Studio y Playground guardan estado en `localStorage` y en la URL (sin backend), así que no necesitan servidor.

## 3. Neutralidad respecto al proveedor (diseño, sin sobrecoste)

Sin condicionar la arquitectura, se mantienen buenas prácticas que no cuestan nada:
- `base` configurable (variable de entorno) en Astro/Vite; rutas **internas relativas** a esa base.
- Salida **estática** para `docs` (Astro); las SPAs requieren un *fallback* a `index.html` solo si se usa *history routing*; el enrutado concreto se decidirá en `F5/F6` según necesidad funcional, **no** por el hosting.
- Ningún secreto ni endpoint embebido.

## 4. Opción futura (no activa): GitHub Pages

| Aspecto | Dato |
|---|---|
| Disponibilidad | Repositorios **públicos** con GitHub Free **[V: documentación de GitHub]** |
| Límites | Sitio publicado ≤ 1 GB; ancho de banda ~100 GB/mes (límite blando); ~10 builds/hora (blando; **no** aplica si se despliega con workflow propio de Actions); despliegue con *timeout* de 10 min; posibles *rate limits* **[V]** |
| Coste/tarjeta | Sin coste ni tarjeta en repos públicos |
| Encaje | Sitio estático: encaja con `docs` (Astro). Las SPAs necesitarían `base` de proyecto (`/tessen/`) y gestión de rutas profundas |
| Inconvenientes | Sin SSR dinámico, URL `*.github.io`, sin previews por PR nativos |

### Lista de comprobación previa a cualquier despliegue (requiere aprobación)
1. Aprobación **explícita** y por escrito del propietario.
2. Confirmar que el servicio es gratuito, sin tarjeta y sin cargos automáticos (revisar de nuevo límites y condiciones ese día).
3. Documentar el servicio en el [registro](development-workflow.md#9-registro-de-servicios-externos).
4. Ajustar `base`/rutas **sin** degradar la app.
5. Workflow de despliegue en una rama dedicada y revisado.
6. Plan de retirada (desactivar y limpiar).

## 5. Alternativas descartadas por ahora

| Alternativa | Motivo |
|---|---|
| Cloudflare Pages, Vercel, Netlify | Requieren cuentas y términos propios; algunos planes gratuitos tienen restricciones de uso comercial **[C]**; no son necesarios |
| Dominio propio | De pago y no necesario |
| Servidores/VPS | Coste e infraestructura innecesarios |
