# ADR 0015 — Espacio de nombres npm provisional y sin publicación

- **Estado:** **Accepted** para las prohibiciones y el carácter provisional (decisión del propietario); el **mapeo de nombres internos** (§3) está `Proposed` hasta su aprobación.
- **Fecha:** 2026-11-22

## Contexto
Hay que elegir el nombre de los paquetes sin comprometerse con un scope público definitivo y sin publicar. Se investigó la disponibilidad real en el registro y en las páginas oficiales de npm. **Un `E404` de `npm view` no demuestra que un scope esté libre.**

## Hallazgos (verificados el 2026-11-22; solo lecturas)

| Nombre | Resultado | Evidencia |
|---|---|---|
| `tessen` (sin scope) | **Ocupado** — v0.0.5, **deprecado**, licencia LGPL-3.0-or-later, mantenido por terceros, última modificación 2025-07-26 | registro `registry.npmjs.org/tessen` (HTTP 200) y `npm view` del propietario |
| `@tessen` (scope) | **Ocupado** — existe una organización/usuario `tessen` con 2 paquetes: `tessen` y `@tessen/type-gen` (ambos deprecados, publicados por terceros en 2025). Los nombres `@tessen/core`, `/vue`, `/react`, `/tokens`, `/styles`, `/icons`, `/motion`, `/theme` devuelven 404, **pero el scope no es nuestro** | `npmjs.com/org/tessen` y `registry.npmjs.org/@tessen%2Ftype-gen` |
| `tessen-ui` (sin scope) | Libre según el registro (`E404`; lo verificó también el propietario) | registro |
| `@tessen-ui` | **No consta ningún usuario u organización**: `npmjs.com/org/tessen-ui` y `npmjs.com/~tessen-ui` → «Scope not found» (HTTP 404); los 8 nombres candidatos (`vue`, `react`, `core`, `tokens`, `styles`, `icons`, `motion`, `theme`) → 404 | registro + páginas de npm |
| `@tessenui` | Igual que el anterior: «Scope not found» en `org/` y `~`, los 8 nombres → 404 | registro + páginas de npm |
| Control del método | `npmjs.com/org/vue` y `npmjs.com/org/tessen` muestran perfil con paquetes, por lo que la página **sí distingue** un scope existente de uno inexistente | navegador |

Nota metodológica: la búsqueda del registro (`/-/v1/search?text=scope:…`) **no es fiable** para esto (con `scope:tessen` devolvió 0 resultados aunque el scope existe) y se descarta como prueba. Los scopes de npm comparten espacio con los nombres de usuario.

## Qué no se puede afirmar todavía
1. **Que `@tessen-ui` o `@tessenui` se puedan crear.** La única prueba concluyente es intentar crear la organización, lo cual está **prohibido** en esta fase. Pueden existir nombres reservados/bloqueados, reglas de similitud o nombres retirados que no son visibles públicamente.
2. **Que sigan libres cuando se decida publicar** (carrera con terceros).
3. Conflictos de **marca** («Tessen» ya existe como nombre de otros paquetes y productos).
4. Disponibilidad de **dominio** (fuera de alcance; no se compra nada).

## Decisión
1. **No se usa** el nombre sin scope `tessen` ni el scope `@tessen`.
2. **No se publica nada**, **no se crea ninguna organización npm** y no se contrata ningún plan.
3. **Nombres internos provisionales** (`Proposed`): mientras no haya scope aprobado, los paquetes del monorepo usan el scope **`@tessen-ui`** (`@tessen-ui/core`, `/tokens`, `/styles`, `/icons`, `/motion`, `/theme`, `/vue`, `/react`) con `"private": true` y `"version": "0.0.0"`. Razón: `@tessen` **no es nuestro** y usarlo siquiera internamente abre un riesgo de *dependency confusion* (que un paquete interno acabe resolviéndose desde el registro contra un scope de terceros).
4. **Los documentos conservan la notación `@tessen/<paquete>` como marcador ilustrativo**; no se renombran hasta que el propietario apruebe el scope final. Regla de lectura: `@tessen/<x>` en la documentación ⇄ `@tessen-ui/<x>` en los `package.json` durante la fase provisional.
5. El scope se **centraliza** para que renombrarlo sea mecánico: un único script `tooling/scripts/rename-scope` (sustituye en `package.json`, imports, `exports` y docs) y una comprobación de CI que falla si aparece un scope distinto del declarado.
6. Cuando el propietario apruebe la distribución pública: comprobar de nuevo la disponibilidad, **crear entonces** la organización gratuita (paquetes públicos), reservar los nombres y ejecutar la publicación según [`npm-publication-strategy`](../../architecture/npm-publication-strategy.md).

## Alternativas
| Alternativa | Motivo |
|---|---|
| Mantener `@tessen/*` internamente | Scope de un tercero; riesgo de resolución accidental desde el registro |
| Esperar a decidir antes de crear paquetes | Bloquea la Fase 1 sin necesidad; el renombrado es mecánico |
| Scope neutro no relacionado (p. ej. `@tessen-workspace`) | Evita el tema pero introduce un tercer nombre; no resuelve la decisión final |
| `@tessenui` como provisional | Posible, pero la forma con guion se lee mejor y coincide con `tessen-ui` sin scope, libre en el registro |

## Consecuencias
(+) Sin dependencia de npm para desarrollar. (+) Riesgo de confusión de dependencias acotado. (−) Un renombrado futuro (mecánico). (−) La documentación usa una notación distinta de los `package.json` hasta la aprobación.

## Mitigación del riesgo de *dependency confusion* (independiente del scope)
- Todos los paquetes internos `private: true` (no se pueden publicar por accidente) y dependencias entre ellos con `workspace:*`.
- Comprobación de CI sobre `pnpm-lock.yaml`: cualquier dependencia del scope interno debe resolverse a `link:`/`file:`/workspace, nunca a una entrada de registro.
- En proyectos de consumo (tarballs) se fuerzan los paquetes internos con `overrides` a `file:` ([ADR 0016](0016-package-distribution-validation-with-pnpm-pack.md)).

## Disparadores de revisión
Aprobación del scope definitivo; cambio de decisión sobre publicación; aparición de un tercero en `@tessen-ui`/`@tessenui`.
