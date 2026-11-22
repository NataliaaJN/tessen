# Documentación de Tessen

| Carpeta | Contenido |
|---|---|
| [`planning/`](planning/) | Fase 0: visión, research, requisitos, design system, catálogo, arquitectura multiframework, motion, plataforma, stack, calidad, roadmap, decisiones abiertas y [ADRs](planning/13-architecture-decisions/README.md) |
| [`architecture/`](architecture/) | Reglas de organización del repositorio: [estructura](architecture/repository-structure.md), [componentes](architecture/component-architecture.md), [features](architecture/feature-architecture.md), [dependencias](architecture/dependency-rules.md), [nombres](architecture/naming-conventions.md), [publicación npm](architecture/npm-publication-strategy.md), [flujo de desarrollo](architecture/development-workflow.md), [despliegue](architecture/deployment-strategy.md) |
| [`brand/`](brand/README.md) | Logotipo (propuesta 11 «Ears and Tassel»), variantes SVG, paleta Cobalt / Cyan, tipografías y contrastes medidos |

> Decisión que no debe modificarse sin un ADR: **component-oriented en packages, feature-first en apps** ([ADR 0002](planning/13-architecture-decisions/0002-component-oriented-packages-feature-first-apps.md)).

Por dónde empezar: [`planning/01-vision-and-product-strategy.md`](planning/01-vision-and-product-strategy.md) → [`planning/12-open-decisions.md`](planning/12-open-decisions.md).

> **Nota de nomenclatura de paquetes:** en la documentación `@tessen/<paquete>` es un **marcador ilustrativo**. El scope npm no está aprobado y `@tessen` pertenece a un tercero; durante la fase provisional los `package.json` usan `@tessen-ui/<paquete>` (privados, sin publicar). Ver [ADR 0015](planning/13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md).
>
> **Política de coste:** desarrollo local, GitHub como única plataforma externa, sin servicios de pago ni despliegue ([ADR 0014](planning/13-architecture-decisions/0014-zero-cost-github-first-infrastructure.md)).
