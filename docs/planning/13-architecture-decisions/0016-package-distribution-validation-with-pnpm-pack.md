# ADR 0016 — Validación de la distribución con `pnpm pack`

- **Estado:** **Accepted** el mecanismo (`pnpm pack`, decisión del propietario); el procedimiento detallado está `Proposed` y se valida en `F1-T09`.
- **Fecha:** 2026-11-22

## Contexto
Los tests dentro del workspace no demuestran que un paquete funcione **como lo instalaría un consumidor**: pueden ocultar exports que apuntan a `src/`, dependencias no declaradas, tipos ausentes, CSS no incluido o `workspace:*` sin resolver. No se publica nada para probar la distribución.

## Decisión
1. Cada paquete publicable se empaqueta con **`pnpm pack`** (genera un `.tgz`; pnpm reemplaza el protocolo `workspace:` por la versión concreta del paquete del workspace **[V: documentación de pnpm]**).
2. Los `.tgz` se instalan en **proyectos de integración independientes** (`integration/*`: `vite-vue`, `vite-react`, `nuxt`, `next`) que **no** pertenecen al grafo del workspace (instalación aislada, sin acceso a `src/` ni a alias no documentados).
3. Los proyectos de consumo fuerzan los paquetes internos con `pnpm.overrides` apuntando a los tarballs, de modo que **ninguna dependencia interna se resuelva desde el registro**.
4. **Se valida** (detalle en [`npm-publication-strategy` §4](../../architecture/npm-publication-strategy.md)): exports públicos, declaraciones TypeScript, dependencias de ejecución y *peers*, CSS y assets, tree-shaking, compatibilidad ESM, SSR/hidratación (Vue, React, Nuxt, Next), instalación y build desde cero.
5. **Un paquete no está «listo para distribución pública» hasta superar la validación de tarballs**, además de los tests del workspace. No se confía solo en la integración por workspace.
6. Herramientas gratuitas y locales: `publint`, `@arethetypeswrong/cli --pack`, `npm pack --dry-run` (contenido), `size-limit`, Vite/Playwright en los proyectos de integración.

## Alternativas
| Alternativa | Motivo de descarte |
|---|---|
| Solo tests por workspace | No detecta problemas de empaquetado |
| Publicar versiones *canary* en npm para probar | Prohibido (no se publica) y requiere organización/cuenta |
| Registro local (Verdaccio) | Software libre y local, pero añade un servicio a mantener; `pnpm pack` basta. Reevaluar si los tarballs resultan incómodos |
| `pnpm link` global / symlinks | Oculta problemas de empaquetado y de resolución de *peers*; el encargo pide evitarlo salvo necesidad demostrada |

## Consecuencias
(+) Se prueba el artefacto real. (+) Sin servicios externos. (−) Hay que mantener el script de empaquetado/overrides y gestionar versiones únicas para evitar caché obsoleta de `file:` (ver riesgos en `npm-publication-strategy`).

## Disparadores de revisión
Incomodidad sostenida del flujo de tarballs (→ evaluar Verdaccio); aprobación de publicación pública (se añade validación del paquete publicado en un registro temporal local, nunca el público, antes del primer *release*).
