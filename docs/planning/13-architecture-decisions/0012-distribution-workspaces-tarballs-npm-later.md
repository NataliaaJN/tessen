# ADR 0012 — Distribución: workspaces y tarballs ahora; npm público solo con aprobación; registry estilo shadcn diferido

- **Estado:** Accepted — **revisada el 2026-11-22** (sustituye el planteamiento original «npm primero»; ver ADR [0014](0014-zero-cost-github-first-infrastructure.md), [0015](0015-npm-namespace-provisional-no-publication.md) y [0016](0016-package-distribution-validation-with-pnpm-pack.md))
- **Fecha original:** 2026-11-22

## Contexto
shadcn/ui popularizó distribuir **código fuente** mediante CLI y un `registry.json` **[V]**. Tessen prioriza paquetes versionados y personalización por tokens. Además, hoy no se paga ni se publica nada (ADR 0014) y el scope npm no está aprobado (ADR 0015); el uso previsto es propio.

## Decisión
1. **Fase de desarrollo (actual):** los paquetes se comparten mediante **pnpm workspaces** (`workspace:*`). Los proyectos propios y las apps de integración los consumen desde el repositorio o desde **tarballs generados con `pnpm pack`**.
2. **Futuro, solo con aprobación explícita del propietario:** distribución pública en **npm** (paquetes públicos; la organización gratuita de npm admite paquetes públicos, los privados requieren plan de pago **[V: documentación de npm]**). No se prepara la organización ni la publicación hasta entonces.
3. **Personalización** por tokens/variables, no por copia de código (ver ADR 0006).
4. Un modo opcional «copiar el código» (CLI + registry propio, como shadcn) se **evalúa tras v1**, reutilizando los mismos contratos y CSS.

## Alternativas
| Alternativa | Motivo |
|---|---|
| npm público desde el inicio (decisión original) | No necesario; scope sin aprobar; cuenta/organización no autorizadas |
| Paquetes privados en npm | Requieren plan de pago; prohibido |
| Solo registry de código | Contradice «personalizar sin tocar la fuente» y la paridad verificada |
| Registro local (Verdaccio) | Servicio adicional; solo si los tarballs resultan insuficientes |

## Consecuencias
(+) Cero coste y cero dependencias de cuentas externas. (+) La verificación como consumidor real se hace con tarballs. (−) Para usar Tessen fuera del monorepo hay que referenciar tarballs o directorios locales hasta que exista publicación.

## Disparadores de revisión
Aprobación de publicación pública; peticiones de personalización que tokens/variables no cubran.
