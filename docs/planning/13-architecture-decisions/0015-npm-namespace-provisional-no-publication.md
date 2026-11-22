# ADR 0015 — Espacio de nombres npm provisional y sin publicación

- **Estado:** **Accepted** para las prohibiciones, el carácter provisional y el **scope interno `@tessen-ui`** (evaluado frente a otros cuatro candidatos, ver [§ Evaluación de candidatos](#evaluación-de-candidatos-de-scope-interno)). El **scope público definitivo** sigue **sin aprobar** (D-18).
- **Fecha:** 2026-11-22 (evaluación de candidatos ampliada el mismo día)

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

### Verificación de los tres candidatos adicionales (2026-11-22; solo lecturas)

| Scope | `npmjs.com/org/<n>` | `npmjs.com/~<n>` | `vue` `react` `core` `tokens` `styles` `icons` `motion` `theme` en el registro | Sin scope (`<n>` sin `@`) |
|---|---|---|---|---|
| `@tessen-design` | «Scope not found» | «Scope not found» | 404 ×8 | 404 (`tessen-design`) |
| `@tessenjs` | «Scope not found» | «Scope not found» | 404 ×8 | 404 (`tessenjs`) |
| `@tessen-labs` | «Scope not found» | «Scope not found» | 404 ×8 | 404 (`tessen-labs`) |

Las páginas de npm se consultaron con el navegador (las peticiones automáticas reciben HTTP 403). **Los cinco candidatos están en la misma situación**: sin propietario visible y sin que se pueda probar que son creables. Por tanto **la disponibilidad no desempata**; decide la calidad del nombre.

## Evaluación de candidatos de scope interno

Requisito del propietario: el scope debe soportar paquetes más allá de componentes (`core`, `tokens`, `styles`, `icons`, `motion`, `vue`, `react` y futuras herramientas e integraciones) **sin restringir el ecosistema a un framework ni a una tecnología de implementación**, y el sufijo es solo un identificador técnico que **no cambia la marca** (TESSEN, logotipo, lenguaje visual y nombres de producto no se tocan).

Puntuación 1 (peor) – 5 (mejor); es un juicio razonado, no una medición.

| Criterio | `@tessen-ui` | `@tessenui` | `@tessen-design` | `@tessenjs` | `@tessen-labs` |
|---|:-:|:-:|:-:|:-:|:-:|
| Legibilidad | 5 | 3 | 5 | 3 | 5 |
| Memorabilidad | 4 | 3 | 4 | 3 | 3 |
| Coherencia con la marca | 4 | 3 | 4 | 2 | 2 |
| Ergonomía de desarrollo (longitud, escritura) | 5 | 4 | 4 | 4 | 3 |
| Legibilidad de los imports | 5 | 3 | 4 | 3 | 3 |
| Adecuación a Vue y React (neutral) | 5 | 5 | 5 | 3 | 5 |
| Adecuación a un ecosistema completo de Design System | 4 | 4 | 5 | 2 | 2 |
| Extensibilidad futura | 4 | 4 | 4 | 2 | 4 |
| Riesgo de confusión con otros proyectos (más alto = menos riesgo) | 4 | 3 | 4 | 3 | 2 |
| **Total / 45** | **40** | **32** | **39** | **25** | **29** |

**Lectura por candidato**
- **`@tessen-ui`** — el nombre se lee igual que el patrón consolidado del sector (`@radix-ui/*`, `@chakra-ui/react`, `@ark-ui/*`, `@heroui/*`): el consumidor identifica de inmediato «marca + UI». Es el más corto con guion, el import `@tessen-ui/react` se lee sin ambigüedad y no nombra ningún framework. Debilidad: «ui» describe peor `tokens`, `icons` o futuras herramientas, aunque `@radix-ui/colors` o `@chakra-ui/cli` muestran que el sector lo tolera.
- **`@tessen-design`** — **alternativa más cercana** (1 punto de diferencia). Describe mejor un ecosistema con tokens, temas y recursos de diseño (precedente: `@ant-design/icons`, `@ant-design/colors`). Pierde por longitud (+4 caracteres en cada import y en cada `workspace:`/filtro de pnpm) y porque «design» puede leerse como *solo* activos de diseño, no como paquetes de código. Es el **plan B** si el propietario prefiere un nombre menos centrado en componentes.
- **`@tessenui`** — misma idea que `@tessen-ui` pero sin guion: peor segmentación visual («tessen·ui») y, sobre todo, **casi idéntico** a `@tessen-ui`; si algún día un tercero registra uno de los dos, el otro queda expuesto a confusión y *typosquatting*. No aporta nada que el guion no dé.
- **`@tessenjs`** — **descartado**: ata el ecosistema a una tecnología de implementación (JS), y `tokens`, `styles` y `icons` son en buena parte CSS/SVG/JSON. Contradice el requisito del propietario.
- **`@tessen-labs`** — **descartado**: «labs» comunica experimentación, el mensaje contrario al de un Design System que aspira a estabilidad (`@tessen-labs/react` parece un prototipo) y es un patrón habitual de organizaciones para repos de investigación.

**Resultado.** `@tessen-ui` es el scope interno. La diferencia con `@tessen-design` es pequeña, de modo que **no se considera cerrada** la elección pública (D-18): se revisará con el criterio de que el scope público final también debe comprobarse de nuevo en el registro.

**Marca vs. namespace.** `-ui` es solo un identificador técnico de los `package.json` y del `import`. La marca pública sigue siendo **TESSEN**; el nombre de producto, el logotipo y el lenguaje visual no incorporan «ui», y en la documentación pública se mantiene el marcador `@tessen/<paquete>` hasta aprobar el scope final.

### Mapa de paquetes (provisional; todos `private: true`, `version: 0.0.0`)

| Paquete | Rol | Dependencias internas (`workspace:*`) | Se crea |
|---|---|---|---|
| `@tessen-ui/tokens` | Tokens DTCG y salidas CSS/TS/JSON | — | F1-T02 |
| `@tessen-ui/theme` | Utilidades de tema (OKLCH, contraste, exportación) | `tokens` | cuando haya contenido |
| `@tessen-ui/styles` | CSS en capas por componente | `tokens` (build) | F1-T03 |
| `@tessen-ui/icons` | Pipeline SVG → Vue/React/sprite | — | F1-T04 |
| `@tessen-ui/motion` | Tokens, presets y utilidades de movimiento | `tokens` | F1-T05 |
| `@tessen-ui/core` | Contratos, variantes y *codegen*; sin framework | — | F1-T08 |
| `@tessen-ui/vue` | Componentes Vue | `core`; opcionales `icons`, `motion`; *peer* de `styles` | F2 |
| `@tessen-ui/react` | Componentes React | `core`; opcionales `icons`, `motion`; *peer* de `styles` | F2 |
| `@tessen-ui/<herramienta>` | Futuras integraciones (`cli`, `eslint-plugin`, módulos Nuxt/Next…) | según caso | bajo demanda |

La lista de dependencias reales es la de la [matriz de `dependency-rules` §2](../../architecture/dependency-rules.md): `vue` y `react` **no** se importan entre sí y los fundamentos no importan Vue, React ni Zag. El ejemplo del encargo (`@tessen-ui/vue` → `"@tessen-ui/core": "workspace:*"`) es exactamente esa arista.

## Qué no se puede afirmar todavía
1. **Que `@tessen-ui` o `@tessenui` se puedan crear.** La única prueba concluyente es intentar crear la organización, lo cual está **prohibido** en esta fase. Pueden existir nombres reservados/bloqueados, reglas de similitud o nombres retirados que no son visibles públicamente.
2. **Que sigan libres cuando se decida publicar** (carrera con terceros).
3. Conflictos de **marca** («Tessen» ya existe como nombre de otros paquetes y productos).
4. Disponibilidad de **dominio** (fuera de alcance; no se compra nada).

## Decisión
1. **No se usa** el nombre sin scope `tessen` ni el scope `@tessen`.
2. **No se publica nada**, **no se crea ninguna organización npm** y no se contrata ningún plan.
3. **Nombres internos provisionales** (`Accepted` tras la evaluación anterior; los precedentes de otros ecosistemas citados en ella son conocimiento previo **[C]**, no verificado hoy): mientras no haya scope público aprobado, los paquetes del monorepo usan el scope **`@tessen-ui`** (`@tessen-ui/core`, `/tokens`, `/styles`, `/icons`, `/motion`, `/theme`, `/vue`, `/react`) con `"private": true` y `"version": "0.0.0"`. Razón: `@tessen` **no es nuestro** y usarlo siquiera internamente abre un riesgo de *dependency confusion* (que un paquete interno acabe resolviéndose desde el registro contra un scope de terceros).
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
