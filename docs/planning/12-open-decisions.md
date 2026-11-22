# 12 — Decisiones abiertas

> Cada decisión indica **alternativas, impacto y recomendación**, y **cuándo** debe resolverse. Las que bloquean trabajo están marcadas **🔴**; las que pueden esperar, 🟡/🟢. Al resolverse, se registra en un ADR (o se actualiza el existente) y se elimina de esta lista.

| ID | Prioridad | Decisión | Necesaria antes de |
|---|---|---|---|
| D-01 | ✅ Resuelta | Asset del logotipo (propuesta 11) — incorporado en `docs/brand/` | — |
| D-02 | ✅ Resuelta (interno) | Scope interno `@tessen-ui` aprobado tras evaluar 5 candidatos (ADR 0015); `tessen` y `@tessen` **ocupados**; el scope **público** sigue en D-18 | — |
| D-03 | 🟡 | Nomenclatura pública (ADR 0011) | F2 |
| D-04 | 🟡 | Framework del *shell* de Theme Studio y Playground (ADR 0008) | F5 |
| D-05 | ✅ Resuelta con condiciones | Motor de comportamiento: **Zag.js** (spike S1 5/6 y validación [S2](S2-zag-validation.md) *APPROVE WITH CONDITIONS*; ADR 0004 `Accepted` con condiciones C1–C10) | — |
| D-06 | 🟡 | Tipografía por defecto (la marca ya usa Inter/Outfit/JetBrains Mono) | F1-T03 |
| D-07 | ✅ Resuelta (provisional) | Lucide (ISC) como set abierto, 35 iconos iniciales en `@tessen-ui/icons`; revisable cambiando `src/svg` | — |
| D-08 | 🔴 | Licencia de Tessen | Primera publicación |
| D-09 | 🟢 | Librería base de gráficos | F7 |
| D-10 | 🟢 | Polimorfismo (`as`/`asChild`) | F3 |
| D-11 | 🟡 | Rango de versiones soportadas (Vue/React) | F2 |
| D-12 | ✅ Resuelta | Hosting y dominio: **ninguno** (todo en local; ADR 0014) | — |
| D-13 | 🟢 | Alcance de «superficies translúcidas» (estilo «Cristal» de rM) | F5 |
| D-14 | 🟡 | Idioma de la documentación pública e i18n | F4 |
| D-15 | 🟢 | Estrategia Figma | F7 |
| D-16 | 🟡 | Repositorio público en GitHub, protección de ramas y flujo de PR | F1-T01 |
| D-17 | 🟡 | Formato del contrato (TS vs esquema JSON) | F1-T08 |
| D-18 | 🟡 | Scope npm definitivo y momento de la distribución pública (requiere aprobación del propietario) | Publicación |
| D-19 | 🟢 | Si algún día se despliega la plataforma (p. ej. GitHub Pages) | Aprobación explícita |

---

### D-01 — Logotipo (propuesta 11, chat «Propuestas de logotipo con gato»)
- **Resolución (2026-11-22):** el propietario aportó la tarjeta de variantes de la propuesta 11 «Ears and Tassel». Se extrajeron la marca (color, sobre oscuro, mono negro y blanco) y un lockup a `docs/brand/logo/`, con paleta «Cobalt / Cyan», tipografías (Outfit, Inter, JetBrains Mono) y contrastes medidos en `docs/brand/README.md`.
- **Pendientes derivados (menores):** convertir el texto «TESSEN» del lockup a contornos; generar favicons (16/24/40 px) y el icono de app a partir de la variante `on-dark`; fijar las escalas `brand` finales en Fase 1 (las semillas `#2B7BE0` y `#38C6F4` no cumplen AA con texto blanco, ver `04` §3.1).

### D-02 — Nombre y scope npm (resuelta parcialmente; 2026-11-22)
- **Hallazgos verificados (solo lecturas):**
  - `tessen` (sin scope): **ocupado** (v0.0.5, deprecado, LGPL-3.0-or-later, terceros). **No se usa.**
  - **`@tessen`: ocupado** — existe la organización/usuario `tessen` con 2 paquetes de terceros (`tessen`, `@tessen/type-gen`). `npm view @tessen/core` da 404 y aun así el scope no es nuestro: un `E404` no prueba disponibilidad. *(Corrige la premisa de las versiones anteriores de este documento, que asumía `@tessen`.)*
  - `tessen-ui` (sin scope): `E404`.
  - `@tessen-ui` y `@tessenui`: «Scope not found» en `npmjs.com/org/<n>` y `/~<n>`; los 8 nombres candidatos (`vue`, `react`, `core`, `tokens`, `styles`, `icons`, `motion`, `theme`) → 404.
- **Sin resolver:** que esos scopes se puedan **crear** (solo se sabe intentándolo, prohibido ahora), que sigan libres al publicar, conflictos de marca. Detalle y método: [ADR 0015](13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md).
- **Decisión vigente:** no usar `tessen` sin scope; no publicar; no crear organización; no comprar plan; **namespace provisional**. Interno provisional propuesto: `@tessen-ui/*` con `private: true` (mapeo ilustrativo `@tessen/x` ⇄ `@tessen-ui/x`).
- **Evaluación de candidatos (2026-11-22):** `@tessen-ui` (40/45), `@tessen-design` (39), `@tessenui` (32), `@tessen-labs` (29), `@tessenjs` (25). Los cinco aparecen como «Scope not found» en npm (la disponibilidad no desempata). **Resuelto: `@tessen-ui` es el scope interno** (`private: true`, `workspace:*`); `@tessen-design` queda como plan B. Detalle en [ADR 0015](13-architecture-decisions/0015-npm-namespace-provisional-no-publication.md).
- **Pendiente de tu aprobación:** el scope público definitivo, solo cuando decidas distribuir (D-18).

### D-03 — Nomenclatura pública
- Alternativas: `T`-prefijo en Vue y sin prefijo en React (**recomendado, ADR 0011**) · prefijo `T` en ambos · sin prefijo en ambos (colisiones en Vue).

### D-04 — Framework de las SPAs (Studio y Playground)
- Alternativas: **Vue 3 (recomendado)** · React · Astro islas.
- Impacto: dogfooding y ecosistema del shell; **bajo** porque las apps son independientes y el tema es CSS.

### D-05 — Motor de comportamiento
- Alternativas: **Zag.js (recomendado, condicionado a spike S1)** · Radix+Reka · Base UI+Reka · Ark UI · propio · sin motor (plan D).
- Impacto: coste de los componentes compuestos (≈ 40 % del catálogo) y paridad.

### D-06 — Tipografía
- La tarjeta del logotipo ya usa **Inter** (interfaz), **Outfit** (wordmark) y **JetBrains Mono** (técnico). Recomendación: adoptar Inter variable como fuente de interfaz y JetBrains Mono para código, ambas con pila del sistema de respaldo; Outfit solo para marca/titulares y opcional para consumidores. Verificar licencias (suelen ser OFL **[C]**) y estrategia de carga (autoalojada, `font-display: swap`) en F1. rM usa Manrope Variable **[V]**.
- Impacto: percepción de marca y CLS; Theme Studio permite cambiarla.

### D-07 — Iconos
- Alternativas: **curar un set abierto (Lucide, ISC [C], usado también por rM [V])** · otro set (Phosphor) · set propio.
- Recomendación: set abierto + iconos propios solo para la marca; verificar licencia en el momento.

### D-08 — Licencia
- Alternativas: **MIT (recomendada)** · Apache-2.0. Revisar compatibilidad con dependencias (Zag MIT **[C]**, Motion MIT **[V]**, GSAP licencia propia **[V]** → no entra en v1).

### D-09 — Gráficos
- Alternativas: wrapper de ECharts / Chart.js / uPlot **[C]**. Recomendación: decidir en F7 según demanda; solo tematizado por tokens.

### D-10 — Polimorfismo
- Alternativas: sin polimorfismo (recomendado en v1) · `as`/`asChild`. Impacto: ergonomía con routers (`RouterLink`/`next/link`). Recomendación: documentar patrón de composición con `Link` y reevaluar.

### D-11 — Versiones soportadas
- Alternativas: Vue ≥ 3.5 y React ≥ 18.3 (**recomendado**) · React 19 solo (más simple, menos alcance). Impacto: `ref` como prop vs `forwardRef`, `useId`.

### D-12 — Hosting (resuelta)
- **Decisión (ADR 0014):** no hay hosting ni dominio; documentación, Theme Studio y Playground **se ejecutan en local**. No se configura Cloudflare Pages, Vercel, Netlify ni GitHub Pages. GitHub Pages queda como opción futura **solo con aprobación explícita** (D-19; ver [`deployment-strategy`](../architecture/deployment-strategy.md)).

### D-13 — Superficies translúcidas
- Alternativas: fuera de v1 · opción experimental en Studio. Riesgo: rendimiento (`backdrop-filter`), contraste y alto contraste. Recomendación: experimental y desactivada por defecto.

### D-14 — Idioma de la documentación pública
- Alternativas: **inglés primero, español después (recomendado para alcance internacional)** · español primero · bilingüe desde F4. Los documentos de `docs/planning` y `docs/architecture` permanecen en español (equipo).
- Impacto: coste de redacción y mantenimiento; infraestructura i18n (PLT-11).

### D-15 — Figma
- Alternativas: kit manual · variables importadas desde DTCG (recomendado) · plugin propio bidireccional (posponer).

### D-16 — Repositorio y flujo en GitHub
- **Estado (2026-11-22):** el propietario hizo público `github.com/NataliaaJN/tessen` (antes privado). `origin` accesible por SSH y vacío al empezar F1.
- **Decisión (ADR 0014):** repositorio **público** como fuente de verdad; CI con GitHub Actions (gratis en públicos); Issues cuando aporten; sin servicios externos de gestión.
- **Flujo (decidido por el propietario):** `main` = producción, `develop` = preproducción; ramas de trabajo en inglés (`feat/…`, `fix/…`, `docs/…`, `chore/…`) desde `develop`; **PR a `develop` con auto-merge** y borrado de la rama al fusionarse. Detalle en [`development-workflow`](../architecture/development-workflow.md).
- **Pendiente:** proteger `main` y `develop` con el check de CI obligatorio y activar Dependabot (ajustes del repositorio, gratis en repos públicos).

### D-17 — Formato del contrato
- Alternativas: **TypeScript con `defineContract` (recomendado: tipado, autocompletado, serializable a JSON)** · JSON Schema/YAML (neutral pero sin tipos ricos).
- Impacto: `core`, docs, Playground y agentes.

### D-18 — Scope npm definitivo y publicación pública
- **No se decide ahora.** Cuando el propietario apruebe la distribución pública: elegir scope (`@tessen-ui`, `@tessenui` u otro), **volver a comprobar** disponibilidad, crear entonces la organización gratuita (solo paquetes públicos), reservar nombres y seguir [`npm-publication-strategy` §5](../architecture/npm-publication-strategy.md).
- **Costes:** publicar paquetes públicos es gratis; los privados requieren plan de pago (no se usan).

### D-19 — Despliegue futuro de la plataforma
- **No se decide ahora.** Opción documentada: GitHub Pages (gratis en repos públicos, con límites). Requiere aprobación explícita y la lista de comprobación de [`deployment-strategy` §4](../architecture/deployment-strategy.md).
