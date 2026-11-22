# ADR 0002 — Component-oriented en packages, feature-first en apps

- **Estado:** **Accepted** (decisión definida por el propietario del proyecto; no se modifica sin un ADR que la sustituya)
- **Fecha:** 2026-11-22

## Contexto
Un monorepo con librería de componentes y aplicaciones de producto mezcla dos naturalezas: la librería se organiza alrededor de **componentes reutilizables** que se distribuyen y consumen uno a uno; las aplicaciones se organizan alrededor de **funcionalidades de usuario**. Aplicar una sola estrategia a ambas degrada una de las dos.

## Decisión
1. `packages/vue` y `packages/react` → **component-oriented**: `src/components/<componente>/…` con co-location de implementación, tipos, variantes, utilidades y pruebas; `composables/` / `hooks/` para lógica reutilizable; entrada pública controlada por `index.ts`.
2. Paquetes de fundamentos (`tokens`, `theme`, `styles`, `icons`, `core`, `motion`) → **por responsabilidad/dominio técnico**.
3. `apps/docs`, `apps/theme-studio`, `apps/playground` → **feature-first**: `app/`, `pages/`, `features/`, `shared/`.
4. **No** existe `features/` en `packages/vue|react`; **no** existe una colección global de componentes de TESSEN dentro de las apps (se consumen de los paquetes públicos).

## Alternativas consideradas
| Alternativa | Por qué no |
|---|---|
| Component-oriented en todo | Las apps acaban con `components/` gigantes sin frontera funcional |
| Feature-first en todo | La librería se fragmenta y pierde la unidad «un componente = una carpeta publicable» |
| Layered (`ui/ domain/ infra/`) | Añade capas sin beneficio para una librería de UI |

## Consecuencias
(+) Cada nivel usa la estrategia donde aporta valor. (+) Reglas verificables por herramienta (ADR 0013). (−) Dos convenciones que documentar y enseñar (`docs/architecture/*`).

## Disparadores de revisión
Solo mediante un nuevo ADR aprobado por el propietario.
