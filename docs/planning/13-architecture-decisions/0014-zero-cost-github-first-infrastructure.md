# ADR 0014 — Desarrollo sin coste y GitHub como única plataforma externa

- **Estado:** **Accepted** (decisión del propietario, 2026-11-22)
- **Fecha:** 2026-11-22

## Contexto
Tessen es hoy un proyecto personal mantenido por una persona, sin intención comercial. El propietario **no quiere pagar** suscripciones de npm, hosting, despliegue, dominios ni infraestructura, y no autoriza servicios externos sin aprobación explícita.

## Decisión
1. **GitHub es la única plataforma externa requerida**: repositorio **público** (`github.com/NataliaaJN/tessen`) como fuente de verdad, Issues para tareas cuando sea útil y GitHub Actions para CI.
2. **Todo el ciclo de desarrollo funciona en local**: monorepo con pnpm workspaces, builds, tests, documentación, Theme Studio y Playground se ejecutan en la máquina del desarrollador.
3. **No se activa ni configura**: Cloudflare Pages, Vercel, Netlify, hosting de pago, dominios, servicios de despliegue, GitHub Pages (opción futura, ver [`deployment-strategy`](../../architecture/deployment-strategy.md)), ni se crean cuentas en ellos.
4. **No se publica nada en npm**, no se crea organización npm y no hay paquetes privados ([ADR 0015](0015-npm-namespace-provisional-no-publication.md)).
5. **Política de herramientas:** preferir software libre, ejecutable en local, capacidades estándar del gestor de paquetes y capacidades gratuitas de GitHub. No se introduce un servicio por tener *trial* gratuito ni se depende de pruebas que luego exijan pago.
6. **Registro de servicios:** cualquier servicio externo propuesto se documenta en el [registro de servicios](../../architecture/development-workflow.md#9-registro-de-servicios-externos) (gratuito, límites, tarjeta, cargos automáticos, esencial, alternativa local) y **no se activa sin aprobación explícita**.
7. **Sustituciones derivadas** (frente a lo propuesto en la Fase 0): Renovate → **Dependabot** (integrado en GitHub); Chromatic → **descartado** (regresión visual con Playwright en local/CI); previews por PR y despliegue de docs → **descartados**; baselines visuales sin **Git LFS** (cuota con posible cargo).

## Alternativas
| Alternativa | Motivo de descarte |
|---|---|
| Hosting gratuito de terceros (Cloudflare/Vercel/Netlify) para docs | Requiere cuenta, términos propios y no es necesario hoy |
| npm público desde el inicio | No hace falta para desarrollar; riesgo de nombres/scope no resueltos |
| Servicios de visual regression (Chromatic) | Cuenta + posibles planes de pago; Playwright cubre la necesidad |
| Repositorio privado | Los minutos de Actions dejan de ser ilimitados y pasan a tener cuota |

## Consecuencias
(+) Coste cero y sin dependencias de cuentas. (+) Reproducibilidad: cualquiera clona y ejecuta. (−) Sin previews de PR ni sitio público de docs (se abordará con aprobación). (−) La regresión visual depende de runners de GitHub o de contenedores locales para estabilidad.

## Disparadores de revisión
Decisión del propietario de distribuir públicamente en npm o desplegar documentación; cambios en los límites gratuitos de GitHub Actions/Pages (se revisan en la fecha de cada aprobación).
