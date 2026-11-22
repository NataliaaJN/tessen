# 12 — Decisiones abiertas

> Cada decisión indica **alternativas, impacto y recomendación**, y **cuándo** debe resolverse. Las que bloquean trabajo están marcadas **🔴**; las que pueden esperar, 🟡/🟢. Al resolverse, se registra en un ADR (o se actualiza el existente) y se elimina de esta lista.

| ID | Prioridad | Decisión | Necesaria antes de |
|---|---|---|---|
| D-01 | 🔴 | Asset del logotipo (propuesta 11) | F1-T02 / F4 |
| D-02 | 🔴 | Disponibilidad de nombre, scope npm `@tessen`, dominio y marca | F1-T01 |
| D-03 | 🟡 | Nomenclatura pública (ADR 0011) | F2 |
| D-04 | 🟡 | Framework del *shell* de Theme Studio y Playground (ADR 0008) | F5 |
| D-05 | 🔴 | Motor de comportamiento (ADR 0004, spike S1) | F2 |
| D-06 | 🟡 | Tipografía por defecto | F1-T03 |
| D-07 | 🟡 | Fuente del set de iconos | F1-T04 |
| D-08 | 🔴 | Licencia de Tessen | Primera publicación |
| D-09 | 🟢 | Librería base de gráficos | F7 |
| D-10 | 🟢 | Polimorfismo (`as`/`asChild`) | F3 |
| D-11 | 🟡 | Rango de versiones soportadas (Vue/React) | F2 |
| D-12 | 🟡 | Hosting de la plataforma y dominio | F4 |
| D-13 | 🟢 | Alcance de «superficies translúcidas» (estilo «Cristal» de rM) | F5 |
| D-14 | 🟡 | Idioma de la documentación pública e i18n | F4 |
| D-15 | 🟢 | Estrategia Figma | F7 |
| D-16 | 🟡 | Remoto GitHub, protección de ramas y flujo de PR | F1-T01 |
| D-17 | 🟡 | Formato del contrato (TS vs esquema JSON) | F1-T08 |

---

### D-01 — Logotipo (propuesta 11, chat «Propuestas de logotipo con gato»)
- **Situación:** el encargo pide usar la propuesta 11, pero **ese chat no es accesible desde este entorno** (no aparece en las sesiones locales de Claude Code ni hay archivos con ese nombre en el equipo). No se ha inventado ni sustituido.
- **Qué hace falta:** el archivo del logotipo (SVG preferible; PNG alta resolución como mínimo), variantes (monocromo, claro/oscuro) y, si existe, la paleta.
- **Impacto:** acento de marca del tema por defecto (`04` §3.1), favicon, cabecera de la plataforma, README, `@tessen/icons` (marca).
- **Recomendación:** colocar el asset en `docs/brand/logo/` y abrir una rama `feat/brand-logo`; hasta entonces el tema usa un acento **provisional** marcado en el JSON.

### D-02 — Nombre, scope npm, dominio y marca
- **Alternativas:** mantener `@tessen`; scope alternativo (`@tessen-ui`, `@tessenui`).
- **Impacto:** todos los `package.json`, imports de los usuarios, URLs.
- **Recomendación:** comprobar **antes de F1** `npm view @tessen/core`, la organización npm, el dominio candidato (`tessen.dev`/`tessen.design`) y conflictos de marca. No se ha verificado en esta sesión.

### D-03 — Nomenclatura pública
- Alternativas: `T`-prefijo en Vue y sin prefijo en React (**recomendado, ADR 0011**) · prefijo `T` en ambos · sin prefijo en ambos (colisiones en Vue).

### D-04 — Framework de las SPAs (Studio y Playground)
- Alternativas: **Vue 3 (recomendado)** · React · Astro islas.
- Impacto: dogfooding y ecosistema del shell; **bajo** porque las apps son independientes y el tema es CSS.

### D-05 — Motor de comportamiento
- Alternativas: **Zag.js (recomendado, condicionado a spike S1)** · Radix+Reka · Base UI+Reka · Ark UI · propio · sin motor (plan D).
- Impacto: coste de los componentes compuestos (≈ 40 % del catálogo) y paridad.

### D-06 — Tipografía
- Alternativas: pila del sistema (rendimiento, sin licencias) · **Inter variable (recomendada, OFL)** **[C]** · fuente de marca (licencia a revisar). rM usa Manrope Variable **[V]**.
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

### D-12 — Hosting
- Alternativas: Cloudflare Pages / Vercel / GitHub Pages. Recomendación: Cloudflare Pages o Vercel por previews por PR y despliegue estático rápido; decidir con D-02 (dominio).

### D-13 — Superficies translúcidas
- Alternativas: fuera de v1 · opción experimental en Studio. Riesgo: rendimiento (`backdrop-filter`), contraste y alto contraste. Recomendación: experimental y desactivada por defecto.

### D-14 — Idioma de la documentación pública
- Alternativas: **inglés primero, español después (recomendado para alcance internacional)** · español primero · bilingüe desde F4. Los documentos de `docs/planning` y `docs/architecture` permanecen en español (equipo).
- Impacto: coste de redacción y mantenimiento; infraestructura i18n (PLT-11).

### D-15 — Figma
- Alternativas: kit manual · variables importadas desde DTCG (recomendado) · plugin propio bidireccional (posponer).

### D-16 — Remoto y flujo
- **Estado observado:** el repositorio local tiene `origin = git@github.com:NataliaaJN/tessen.git`; la rama inicial era `master` (sin commits) y se ha renombrado a `main`. No se ha hecho `push`.
- **Recomendación:** `main` protegida (releases) y `develop` integración; PRs de ramas de trabajo en inglés (`feat/…`, `fix/…`, `docs/…`, `chore/…`), merge `--no-ff` a `develop` y borrado de la rama. Habilitar GitHub Actions al configurar CI.

### D-17 — Formato del contrato
- Alternativas: **TypeScript con `defineContract` (recomendado: tipado, autocompletado, serializable a JSON)** · JSON Schema/YAML (neutral pero sin tipos ricos).
- Impacto: `core`, docs, Playground y agentes.
