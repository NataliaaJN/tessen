# Reglas de dependencias

> Aplican a todo el monorepo. Se comprueban automáticamente con **dependency-cruiser** ([ADR 0013](../planning/13-architecture-decisions/0013-dependency-boundary-enforcement.md)). La configuración de este documento es el **punto de partida** que se instala y calibra en `F1-T01`; hasta que exista código no hay nada que ejecutar.

## 1. Las diez reglas

| # | Regla | Mecanismo |
|---|---|---|
| 1 | Las **páginas** pueden componer features | Permitido `pages → features` |
| 2 | Las **features** pueden consumir `shared` | Permitido `features → shared` |
| 3 | Las features **no** dependen de páginas | `features-not-import-pages` |
| 4 | `shared` **no** depende de features (ni de pages) | `shared-not-import-features/pages` |
| 5 | Los componentes públicos de Tessen **no** dependen de las apps | `packages-not-import-apps` |
| 6 | Los paquetes compartidos **no** dependen de las apps | misma regla |
| 7 | Dependencias entre paquetes **justificadas y explícitas** | Matriz §2 + `package.json` + revisión; `knip` detecta no declaradas |
| 8 | **Sin ciclos** | `no-circular` |
| 9 | Sin dependencias entre features «por comodidad» | `no-cross-feature` (+ patrones §5) |
| 10 | No duplicar componentes/lógica de Tessen en apps | `apps-use-public-entry-only` + comprobación §4 |

Reglas derivadas: `vue ↮ react`; fundamentos libres de Vue/React/Zag; import de componentes hermanos solo por su `index.ts`; imports profundos entre paquetes prohibidos.

## 2. Matriz de dependencias entre paquetes

`✔` permitido · `opt` peer opcional · `—` prohibido.

| ↓ importa a → | tokens | theme | styles | icons | core | motion | vue | react | apps |
|---|---|---|---|---|---|---|---|---|---|
| **tokens** | | — | — | — | — | — | — | — | — |
| **theme** | ✔ | | — | — | — | — | — | — | — |
| **styles** | ✔ (build) | — | | — | — | — | — | — | — |
| **icons** | — | — | — | | — | — | — | — | — |
| **core** | — | — | — | — | | — | — | — | — |
| **motion** | ✔ | — | — | — | — | | — | — | — |
| **vue** | — | — | — (peer CSS) | opt | ✔ | opt | | **—** | — |
| **react** | — | — | — (peer CSS) | opt | ✔ | opt | **—** | | — |
| **apps** | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | (solo la propia) |

- `vue`/`react` dependen de `@zag-js/*` (npm) **solo ellos**; ningún fundamento importa Zag (permite el plan de contingencia del ADR 0004).
- `tooling/` e `integration/` pueden depender de todo; **nada** depende de ellos.

## 3. Reglas dentro de un paquete de componentes (component-oriented)

| Regla | Detalle |
|---|---|
| Un componente **no** importa los archivos internos de otro; solo su `index.ts` | `components/dialog/` puede usar `../button` (índice), nunca `../button/button.types` si no lo exporta |
| Dependencias entre componentes **justificadas** | p. ej. `Dialog → Button` solo para `DialogClose`; documentado en el contrato (`dependencies`) |
| Sin `features/` en `packages/vue|react` | Estructura por componente |
| `internal/` nunca se exporta desde `index.ts` raíz | y no es alcanzable por `exports` |
| Exports públicos únicamente vía `index.ts` de componente → `index.ts` raíz | el `exports` map del paquete se **genera** desde `components/*/index.ts` |

## 4. Reglas en aplicaciones (feature-first)

| Regla | Detalle |
|---|---|
| `pages/` y `app/` acceden a una feature **solo por su `index`** | encapsulación |
| `features/` no importa de `pages/` ni de `app/` | las features no conocen su contexto de montaje |
| `features/<a>` no importa `features/<b>` | ver §5 |
| `shared/` no importa de `features/`, `pages/` ni `app/` | `shared` es hoja |
| Las apps usan **solo la API pública** de los paquetes (`@tessen/vue`, no `packages/vue/src/...`) | sin imports profundos ni copiar componentes |
| `shared/ui` de una app **no recrea** componentes de Tessen | solo composiciones propias de la app (p. ej. `AppShell`, `PageHeader`) que **usan** Tessen |

**Comprobación de duplicados (regla 10):** script `tooling/scripts/check-no-duplicated-components` — compara los nombres exportados por `packages/{vue,react}/src/components/*` con los componentes declarados en `apps/*/src/**` (p. ej. `Button.vue`, `Dialog.tsx`); coincidencias → error. Complemento humano: revisión en PR.

## 5. Interacción entre features sin dependencias directas

Cuando una feature necesita algo de otra:

| Situación | Solución |
|---|---|
| Dos features se muestran juntas en una pantalla | La **página** las compone y conecta (props/eventos) |
| Comparten estado (p. ej. tema activo) | El estado va a `shared/state` (o a un módulo `app/`) **solo si ≥ 2 features lo usan** |
| Una feature emite algo que otra escucha | Contrato de eventos en `shared/events` (tipos) y publicación/suscripción explícita |
| Mucha lógica común | Extraer a `shared/` **o** a un paquete (`@tessen/theme`, `@tessen/core`) si es agnóstica |
| Excepción puntual y justificada | Se añade a `allowCrossFeature` de la config con **comentario obligatorio** (revisión en PR) |

## 6. Configuración de partida (`.dependency-cruiser.cjs`)

> Se instala en F1-T01. Es una **especificación inicial** a validar con el primer código (los *regex* y la resolución de workspaces pnpm se calibran entonces).

```js
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } },

    // 5, 6 — nada en packages depende de apps
    { name: 'packages-not-import-apps', severity: 'error',
      from: { path: '^packages/' }, to: { path: '^apps/' } },
    { name: 'nothing-imports-tooling-or-integration', severity: 'error',
      from: { pathNot: '^(tooling|integration)/' }, to: { path: '^(tooling|integration)/' } },

    // Vue ↮ React
    { name: 'vue-not-import-react', severity: 'error',
      from: { path: '^packages/vue/' }, to: { path: '^packages/react/' } },
    { name: 'react-not-import-vue', severity: 'error',
      from: { path: '^packages/react/' }, to: { path: '^packages/vue/' } },

    // Fundamentos libres de frameworks y del motor
    { name: 'foundations-framework-free', severity: 'error',
      from: { path: '^packages/(tokens|theme|styles|core|motion)/src' },
      to: { path: 'node_modules/(vue|@vue|react|react-dom|@zag-js)/' } },

    // Componentes hermanos: solo por index
    { name: 'components-sibling-index-only', severity: 'error',
      from: { path: '^packages/(vue|react)/src/components/([^/]+)/' },
      to: { path: '^packages/$1/src/components/[^/]+/.+',
            pathNot: ['^packages/$1/src/components/$2/',
                      '^packages/$1/src/components/[^/]+/index\\.ts$'] } },
    { name: 'internal-not-exported', severity: 'error',
      from: { path: '^packages/(vue|react)/src/index\\.ts$' },
      to: { path: '^packages/$1/src/internal/' } },

    // Apps: pages/features/shared
    { name: 'features-not-import-pages-or-app', severity: 'error',
      from: { path: '^apps/([^/]+)/src/features/' }, to: { path: '^apps/$1/src/(pages|app)/' } },
    { name: 'shared-is-a-leaf', severity: 'error',
      from: { path: '^apps/([^/]+)/src/shared/' }, to: { path: '^apps/$1/src/(features|pages|app)/' } },
    { name: 'feature-public-api-only', severity: 'error',
      from: { path: '^apps/([^/]+)/src/(pages|app)/' },
      to: { path: '^apps/$1/src/features/[^/]+/.+',
            pathNot: '^apps/$1/src/features/[^/]+/index\\.(ts|tsx|vue)$' } },
    { name: 'no-cross-feature', severity: 'error',
      from: { path: '^apps/([^/]+)/src/features/([^/]+)/' },
      to: { path: '^apps/$1/src/features/', pathNot: '^apps/$1/src/features/$2/' } },

    // Apps/integración: sin imports profundos de paquetes
    { name: 'apps-use-public-entry-only', severity: 'error',
      from: { path: '^(apps|integration)/' }, to: { path: '^packages/[^/]+/src/' } },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'types'] },
    exclude: { path: '(\\.test\\.|\\.stories\\.|/dist/)' },
  },
};
```

## 7. Mecanismos complementarios

| Mecanismo | Qué cubre |
|---|---|
| `exports` en cada `package.json` | Impide imports profundos de consumidores externos; mapa de subrutas generado |
| `publint` + `@arethetypeswrong/cli` | Validan `exports`/tipos de lo publicado |
| `knip` | Dependencias no declaradas/usadas; exports sin uso (detecta *barrels* inflados) |
| ESLint `no-restricted-imports` | Mensajes de error claros para los casos más habituales (p. ej. importar de `packages/*/src`) |
| `pnpm deps:check` en `verify` (CI) | Falla el PR ante cualquier regla `error` |
| Revisión de PR | Justificar nuevas dependencias entre paquetes (actualizar matriz §2) |

## 8. Cómo se amplía

1. Nueva dependencia entre paquetes → actualizar **la matriz §2**, la regla de config y, si es relevante, un ADR.
2. Nueva app → copiar el bloque de reglas de apps (los *regex* usan el nombre de app como captura `$1`, no hay que tocarlos).
3. Excepciones: siempre con comentario (`// allowed because …`) y reviewer.
