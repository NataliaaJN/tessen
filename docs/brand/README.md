# Marca Tessen

Logotipo: **propuesta 11 — «Ears and Tassel»** (del chat «Propuestas de logotipo con gato»).

> Cinco varillas de abanico: la segunda y la cuarta se elevan en forma de orejas puntiagudas. La empuñadura es el gato visto de espaldas y su cola termina en el borlón del abanico, con flecos.

## Archivos (`logo/`)

Extraídos **fielmente** de la tarjeta de variantes (misma geometría, máscara de separación entre varillas y colores). Cada marca es un SVG independiente de 64 × 64 unidades.

| Archivo | Uso |
|---|---|
| `tessen-mark.svg` | Marca a color sobre fondo claro (gradiente radial `#12306E → #38C6F4`, gato `#12306E`, borlón `#38C6F4`) |
| `tessen-mark-on-dark.svg` | Marca sobre fondo oscuro (gradiente `#2B6BD0 → #7FE0FA`, gato `#F1F7FE`, borlón `#5ED3F8`) |
| `tessen-mark-mono-black.svg` | Monocromo negro (`#0A0A0A`) |
| `tessen-mark-mono-white.svg` | Monocromo blanco |
| `tessen-lockup.svg` | Marca + «TESSEN» en horizontal. **El texto es texto vivo** (Outfit 400, tracking 0.34 em): convertirlo a contornos antes de usarlo como artwork final |

La tarjeta original también define la variante de **icono de app / favicon 16 px**: marca `on-dark` sobre cuadrado redondeado `#060E24`. Se reproducirá al generar favicons (Fase 1, `@tessen/icons`/docs).

## Paleta («Cobalt / Cyan»)

> Rediseño de noviembre de 2026: los neutros del sistema (superficies y texto) pasan a una rampa grafito (`#F6F7F9`, `#16191F`, `#0D0F13`). Los azules de esta tabla siguen siendo los del logotipo y los de las rampas `brand` y `accent`.

| Rol | Color | Uso |
|---|---|---|
| Primary | `#12306E` | Gato, texto de marca, acción en tema claro |
| Secondary | `#2B7BE0` | Acento medio (la marca en la tarjeta usa `#2B6BD0` en el gradiente sobre oscuro) |
| Accent | `#38C6F4` | Borlón, resaltes |
| Dark bg | `#060E24` | Fondo oscuro |
| Light bg | `#F1F7FE` | Fondo claro |
| Text | `#0A1A3E` | Texto |

### Contraste medido (WCAG 2.x)

| Combinación | Ratio | ¿Texto AA (4.5)? |
|---|---|---|
| Blanco sobre `#12306E` | 12.55 | Sí |
| `#0A1A3E` sobre `#F1F7FE` | 15.83 | Sí |
| `#F1F7FE` sobre `#060E24` | 17.77 | Sí |
| `#38C6F4` sobre `#060E24` | 9.63 | Sí |
| `#12306E` sobre `#F1F7FE` | 11.64 | Sí |
| `#2B7BE0` sobre `#060E24` | 4.57 | Sí (justo) |
| Blanco sobre `#2B7BE0` | **4.19** | **No** — no usar `#2B7BE0` como fondo con texto blanco |
| `#2B7BE0` sobre `#F1F7FE` | **3.89** | **No** como texto; sí como borde/icono (≥ 3:1) |
| Blanco sobre `#38C6F4` | **1.99** | **No**; usar texto `#0A1A3E` (8.58) |

Consecuencia para el design system: los valores de la marca son **semillas**, no tokens finales; los roles semánticos (`color.action.primary`, `color.text.link`…) se derivan de ellas y se validan con `tokens:check` ([`04`](../planning/04-design-system-specification.md) §3.1).

## Tipografías (según la tarjeta)

- **Outfit** — wordmark y titulares de marca.
- **Inter** — texto de interfaz.
- **JetBrains Mono** — etiquetas técnicas y código.

## Reglas de uso (provisionales, hasta tener guía de marca)

- Respetar el área libre: al menos el ancho de una varilla alrededor de la marca.
- No alterar proporciones, recolorear ni añadir efectos fuera de las variantes entregadas.
- Tamaño mínimo recomendado de la marca completa: 24 px; por debajo usar la variante de favicon.
- Verificar legibilidad de la marca a 16 px (las orejas y el borlón son los detalles más finos).
