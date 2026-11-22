# ADR 0011 — Nomenclatura de la API pública

- **Estado:** **Accepted** (2026-11-22, propietario; D-03 resuelta con la recomendación)
- **Fecha:** 2026-11-22

## Contexto
Los ejemplos del encargo usan `TButton` (Vue) y `Button` (React). Hay que decidir una convención consistente.

## Decisión
- **Vue:** exports con prefijo `T` (`TButton`, `TDialog`, `TDialogContent`). Razón: la guía de estilo de Vue pide nombres multi-palabra y evita colisión con elementos HTML **[C]**; `T` es corto y reservado.
- **React:** exports **sin prefijo** (`Button`, `Dialog`, `DialogContent`), idiomático; el consumidor puede aliasar si colisiona con otras librerías.
- Compuestos: partes con nombre `Dialog` + `DialogContent`… como **exports nombrados planos** (mejor tree-shaking y tipado que `Dialog.Content`); en React se podrá además ofrecer el namespace como azúcar si se demuestra útil.
- Clases CSS `t-<componente>[__parte]`; variables `--t-<componente>-*`; tokens `--tessen-*`.
- Paquetes: `@tessen/<responsabilidad>`.

## Consecuencias
(+) Natural en cada framework. (−) Ejemplos de docs difieren de nombre (se generan desde el contrato). 

## Disparadores de revisión
Conflictos reales de nombres con ecosistemas populares o feedback de usuarios.
