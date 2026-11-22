# ADR 0017 — Motor de temas y Theme Studio

- **Estado:** **Accepted** (F5, 2026-11-23). Resuelve D-04 (framework del shell) y concreta `08` §5 y `04` §4.3.
- **Fecha:** 2026-11-23

## Contexto
La fase 5 pide un Studio que cree, previsualice y exporte temas, y que un tema exportado cambie el aspecto de una app sin tocar la librería (US-02). La lógica (escalas, contraste, serialización) no debe vivir en una app: los usuarios también querrán usarla por código (`06` §3.1).

## Decisión
1. **`@tessen-ui/theme`** es un paquete independiente, puro TypeScript, sin dependencias de runtime ni de Vue/React (lo exige `deps:check`). Depende de `tokens` solo en tests; en ejecución recibe los datos de tokens como parámetro (`TokenData`), de modo que no acopla versiones.
2. **El tema es un JSON pequeño y validado** (`Theme` v1): acento (semilla), radio, densidad, movimiento, fuentes y `overrides` (primitivos y semánticos por modo). Toda entrada no confiable (archivo, URL, `localStorage`) pasa por `parseTheme`, que descarta claves desconocidas y lista todos los errores. Los nombres de fuente se restringen a letras, números, espacio, `_`, `.` y `-` para que no se pueda salir de una declaración CSS.
3. **Los temas cambian variables, no componentes.** El CSS exportado contiene solo la diferencia con la base y va **sin capa**, para ganar a `@layer tessen.tokens`. Los ajustes semánticos por modo se emiten para `data-tessen-theme` y para `prefers-color-scheme`.
4. **La escala del acento** reutiliza la escalera de luminosidad de `packages/tokens` y parte de una semilla, sin anclas: el contraste de los pasos que usa la capa semántica no depende del tono.
5. **`tokens.json` incluye `aliases` por modo** y el paquete exporta `contrast-pairs.json`: el Studio recalcula los semánticos y audita el contraste con los mismos datos que verifica `tokens:check`.
6. **Studio = Vite + Vue 3** (D-04). La **vista previa vive en un `iframe` del mismo origen** alimentado por `postMessage` (origen y emisor validados): aísla el CSS del tema, da anchos responsive reales y evita que los alias ya resueltos en `:root` ignoren los cambios de primitivos.
7. **Compartir por URL sin compresión**: `#t=v1.<base64url>` con solo las diferencias; se descarta `lz-string` (dependencia extra sin necesidad).
8. **Sin hosting:** el Studio se construye con `base: '/studio/'` y el build de la documentación copia su salida a `dist/studio`. Nada se despliega (ADR 0014).
9. **Sin descarga de fuentes ni peticiones externas:** el Studio elige y exporta la familia; cargar la fuente es responsabilidad de la app.

## Alternativas
| Alternativa | Motivo de descarte |
| --- | --- |
| Lógica dentro de `apps/theme-studio` | Los usuarios no podrían generar ni auditar temas por código; el motor no se probaría aislado |
| Formato `extends`/`modes`/`generate` de `04` §4.3 | Más superficie que validar; el JSON plano cubre los mismos casos y se importa/exporta sin pérdida |
| Previsualizar en un contenedor del mismo documento | Los semánticos están resueltos en `:root`; habría que redeclararlos todos en el contenedor |
| Descargar fuentes de Google Fonts | Petición externa y datos del usuario hacia terceros; contrario al principio de coste cero y local |
| `lz-string` | Una dependencia más para ahorrar unos cientos de bytes |

## Consecuencias
(+) El motor se prueba sin DOM (25 tests) y se reutiliza desde docs, Studio y consumidores. (+) US-02 queda comprobada en un build de consumidor desde tarball y en navegador real. (−) La vista previa usa Vue (el CSS es común, así que React se ve igual). (−) El CSS exportado sin capa gana siempre a la librería: quien quiera un tema que pueda ser sobrescrito por otros debe envolverlo en su propia capa.

## Disparadores de revisión
Si los temas con muchos `overrides` superan los ~16 KB de URL (→ comprimir); si se añade un segundo acento o superficies translúcidas (→ ampliar `Theme`, subir `version` y mantener `parseTheme` compatible); si aparece Figma Variables (THS-09).
