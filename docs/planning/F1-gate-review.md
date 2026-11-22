# Revisión del gate de la Fase 1 — Foundations

> **Fecha:** 2026-11-22. **Veredicto: gate cumplido.** Se puede abrir la Fase 2 una vez resueltas las decisiones de §3 (D-03 y D-11), que el roadmap fija «antes de F2».

## 1. Criterios del gate (`11-roadmap.md`, Fase 1)

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Tokens empaquetables y validados como tarball | ✅ | [`T09-tarball-validation.md`](T09-tarball-validation.md): `tokens`, `styles`, `core`, `icons` y `motion` pasan `publint`, `attw`, contenido en lista blanca, instalación aislada y build en `vite-vue` y `vite-react`; CI en Linux verde |
| ADR 0004 `Accepted` o reemplazado por plan D | ✅ con condiciones | [`S2-zag-validation.md`](S2-zag-validation.md): Zag.js, condiciones C1–C10; D-05 resuelta |
| Pipeline de paridad demostrado con `Button` | ✅ | [`T07-button-parity.md`](T07-button-parity.md): contrato como datos → codegen → runner Vue/React → diff visual 0 px; 74 tests. Promovido a `@tessen-ui/core` en F1-T08 |

Las nueve tareas F1-T01…T09 están hechas y fusionadas en `develop`. `pnpm verify` (lint, formato, tipos, tokens, dependencias, scope, tests, build) y `pnpm dist:verify` pasan.

## 2. Estado real frente a lo planificado

- **Paquetes existentes:** `tokens`, `styles`, `icons`, `motion` (L0), `core`. Faltan `vue`, `react` y `theme`, que nacen en F2 (la regla «sin carpetas vacías» se mantiene).
- **Desviaciones asumidas:** el roadmap sigue nombrando `@tessen/*`; el nombre real es `@tessen-ui/*` (ADR 0015) y los documentos no se renombran hasta aprobar el scope público (D-18). Se añadió `integration/` (ADR 0016) y el alias `./index.css` en `styles`.
- **Rama de protección (D-16):** el propietario declinó proteger `develop`/`main`; los PR se fusionan sin esperar al CI. Riesgo aceptado; mitigación: comprobar el CI de la PR cuando añade pasos nuevos (así se hizo en F1-T09).

## 3. Decisiones que deben cerrarse antes de F2

> **Actualización (2026-11-22):** D-03, D-06 y D-11 se cerraron con las propuestas de la tabla; ADR 0011 pasa a `Accepted`. Se conserva la tabla como registro.

| ID | Tema | Por qué bloquea | Propuesta |
| --- | --- | --- | --- |
| D-03 | Nomenclatura pública (ADR 0011: Vue `T`-prefijo, React sin prefijo) | Los nombres de los primeros componentes quedan en el contrato (`names`) | Aceptar ADR 0011 tal cual |
| D-11 | Rango de versiones soportadas (Vue 3.5, React 18.3–19) | Fija los peers de `@tessen-ui/vue`/`react` y la matriz de CI | Vue ≥ 3.5, React ≥ 18.3 con pruebas en 18.3 y 19 |
| D-06 | Tipografía por defecto | Sigue 🟡 aunque `styles` ya se construyó con Outfit/Inter/JetBrains Mono | Marcar como resuelta con esa elección si es correcta |

Sin prisa pero antes de la primera publicación: D-08 (licencia), D-18 (scope público).

## 4. ADR por actualizar

Con evidencia ya disponible, estos siguen `Proposed` y conviene decidir si pasan a `Accepted` (decisión del propietario, no se ha cambiado nada):

| ADR | Evidencia |
| --- | --- |
| 0001 Monorepo pnpm + Turborepo | 13 paquetes, `turbo` en CI |
| 0005 Tokens DTCG + Style Dictionary | `tokens:check`, 58 tests |
| 0006 CSS autorado con `@layer` | `styles` + comprobación del orden de capas en el consumidor |
| 0009 Contratos y paridad | T07; se mantenía `Proposed` hasta F2 |
| 0013 dependency-cruiser | `deps:check` en CI, regla `zag-only-in-adapter-files` |

## 5. Deuda y riesgos que entran en F2

Reunidos de T06/S2, T07 y T09; ninguno bloquea el gate:

1. **Zag (C1–C10):** tests en navegador con Playwright en CI, `open || presence.present`, `'use client'` en `@tessen-ui/react`, capa z-index para popups dentro de modales, patrón `defaultValue` en Vue; DatePicker bloqueado por P1–P8.
2. **Contrato de `Button`:** casos de `class`/`style`/atributos nativos, `ref` e `IconButton`; decidir cómo se escribe el contrato de un componente compuesto.
3. **Playwright en CI Linux:** el diff visual solo se ha ejecutado con Chrome del sistema en local.
4. **Distribución (T09):** fixtures Nuxt/Next, matriz de peers, `size-limit`, `npm install`, tipado de snippets con `tsc`/`vue-tsc`; recuperar `./components/*.css` en `styles` con el primer CSS de componente.
5. **Diseño pendiente:** `secondary` + `tone=danger` se ve igual que el neutro; ADR 0005 y la parte de tokens aún sin construir (puente Tailwind, `data-tessen-contrast`, tokens de rejilla/componente).
6. **Arranque de F2:** `motion` L1, generador `pnpm new:component` tras los 5 primeros y medición del coste real (hito M2) para recalibrar el calendario.

## 6. Siguiente paso

Cerrar D-03, D-11 y D-06 y arrancar F2 con el primer componente completo (Button: contrato → CSS → Vue → React → tests → ejemplo) sobre el pipeline ya demostrado.
