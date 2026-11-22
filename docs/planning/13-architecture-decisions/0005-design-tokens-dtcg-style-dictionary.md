# ADR 0005 — Tokens en DTCG 2025.10 con Style Dictionary y 3 capas

- **Estado:** Proposed
- **Fecha:** 2026-11-22

## Contexto
Se necesita una única fuente de verdad para tokens que alimente CSS, TypeScript, docs, Theme Studio y, opcionalmente, Tailwind y herramientas de diseño.

## Decisión
- Formato canónico: **DTCG 2025.10** (primera versión estable, 2025-10-28 **[V]**) en JSON.
- Build con **Style Dictionary 5** (implementación de referencia **[V]**; v5.5 soporta `dimension` como objeto **[V]**), con formatos propios para CSS con `calc()` derivado y puente Tailwind v4.
- **Tres capas**: primitivo, semántico, componente (Fluent usa global+alias **[V]**; el repo añade componente). Los componentes consumen **solo semánticos** (y tokens de componente cuando existan).
- Prefijo CSS `--tessen-*`; atributo de tema `data-tessen-theme`.
- Extensiones propias bajo `$extensions.tessen` (`deriveFrom`, `factor`, `provisional`).

## Alternativas
| Alternativa | Motivo de descarte |
|---|---|
| Terrazzo | También de referencia **[V]**, pero menor ecosistema de transformaciones **[C]**. Reversible por usar DTCG |
| Tokens Studio como fuente | Acopla la fuente a un plugin de Figma |
| Tokens en TS/JS propios | Esquema privado no portable; reinventa validación |
| Tailwind como fuente | Convierte un consumidor opcional en dueño del sistema (contradice la skill de foundations) |

## Consecuencias
(+) Portabilidad y herramientas estándar. (+) Theme Studio edita el mismo formato que se publica. (−) Algunas funciones (derivación en runtime) requieren extensión no estándar: se documenta y se aísla.

## Disparadores de revisión
Nueva versión de DTCG con *breaking changes*; Style Dictionary abandonado; necesidad de modos nativos en la spec (hoy los temas se resuelven por archivos/overrides).

## Notas de implementación (F1-T02, 2026-11-22)
Detalle en [`packages/tokens/README.md`](../../../packages/tokens/README.md). Lo que la implementación fijó o corrigió respecto al texto de arriba:
- **Style Dictionary 5.8** parsea DTCG, hereda `$type` y resuelve alias; los ficheros se ensamblan en `scripts/lib/emit.ts` porque una hoja combina light, dark y densidad (un formato de Style Dictionary solo ve un diccionario).
- **DTCG 2025.10 no admite `em` ni claves con punto**: `letterSpacing` es `number` con `$extensions.tessen.unit = "em"` y `space.0.5` se llama `space.0-5`.
- Extensiones propias en uso: `deriveFrom`, `factor` (número o razón `"n/d"`), `unit`, `provisional`. Cualquier otra se rechaza en `tokens:check`.
- Se añadió la escala `accent` (cian) a las seis de la especificación: en temas oscuros es el color de acción y enlace.
- Pendiente (llega con su consumidor): puente Tailwind v4, `data-tessen-contrast`, tokens de grid y de componente.
- Estado del ADR: sigue `Proposed`; pasarlo a `Accepted` es decisión del propietario.
