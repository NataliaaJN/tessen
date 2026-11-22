# 10 — Calidad y estrategia de pruebas

> Leyenda: **[V]** verificado · **[C]** conocimiento previo · **[R]** recomendación. Decisión de fondo: ADR 0009. Alineado con la skill `testing-accessibility` del repositorio.

## 1. Estándares de calidad (obligatorios en todos los paquetes)

| Área | Estándar | Cómo se comprueba |
|---|---|---|
| TypeScript | `strict`, sin `any` en API pública, `noUncheckedIndexedAccess`; tipos de props derivados de contratos | `tsc`/`vue-tsc` en CI; regla ESLint |
| API tipada | Genéricos donde haya valor (`Select<TValue>`), uniones literales para variantes | tests de tipos (`expectTypeOf`/`tsd`) en contratos |
| Accesibilidad | **WCAG 2.2 AA** como objetivo; HTML nativo primero; teclado completo; gestión de foco; ARIA solo si es necesario | axe + tests de teclado + checklist manual |
| Lectores de pantalla | NVDA+Firefox/Chrome, VoiceOver+Safari, TalkBack/VoiceOver iOS para overlays/menús/combobox/toast | Checklist manual por release y por componente complejo |
| Responsive | Container queries; objetivos táctiles ≥ 44 px (`pointer: coarse`), ≥ 24 px siempre | Pruebas visuales a 320/768/1280 |
| Dark mode / densidad / alto contraste | Todos los componentes en light, dark y alto contraste | Matriz visual |
| Reducción de movimiento | `prefers-reduced-motion` respetado | Tests unitarios + visual con emulación |
| Rendimiento | CSS completo ≤ 40 kB gzip *(objetivo inicial)*; componente sin motor ≤ 3 kB *(inicial)* | `size-limit` en CI |
| Tree-shaking | ESM, `sideEffects` correcto, imports individuales | Test de bundle (Vite/esbuild) con consumidor ficticio |
| Dependencias | Mínimas; peers declarados | `knip`, revisión de `package.json`, licencias |
| SSR | Sin `window` en render; ids estables; sin avisos de hidratación en Nuxt y Next | Fixtures en `integration/` |

## 2. Pirámide de pruebas

| Nivel | Qué prueba | Herramienta | Dónde vive | Cuándo |
|---|---|---|---|---|
| **Unitario** | Funciones puras (variantes, tokens, color/contraste, codegen, presets) | Vitest | junto al código (`*.test.ts`) en `core`, `theme`, `tokens`, `motion` | cada PR |
| **Componente** | DOM, interacción, foco, eventos/callbacks, slots/children, ciclo de vida | Vitest + VTU (Vue) / RTL + user-event (React); `jsdom`/`happy-dom` para simples, **Browser Mode + Playwright** para overlays y posicionamiento | junto al componente (`button.test.ts`, `button.a11y.test.ts`) | cada PR |
| **Contrato** | Los mismos casos de comportamiento del contrato contra Vue y React | Vitest (ambos harness) | casos en `core/contracts`; *runners* en cada paquete | cada PR |
| **Accesibilidad** | Reglas axe en cada estado/variante; teclado/foco | axe-core (vitest + Storybook a11y + Playwright) | junto al componente + stories | cada PR |
| **Visual** | Estados, temas, densidades, responsive | Playwright `toHaveScreenshot` sobre Storybook (Docker) | `packages/*/.storybook` + specs | PR (afectados) / nightly (todo) |
| **Paridad visual** | Misma historia en Vue vs React | Playwright (diff entre capturas) | `integration/parity` | cada PR |
| **Integración** | Consumo real (Vite Vue, Vite React, Nuxt, Next): build, hidratación, snippets compilados | Playwright + apps de `integration/` | `integration/*` | PR / nightly |
| **E2E de apps** | Flujos de docs, Studio y Playground | Playwright | `apps/*/e2e` | PR / main |
| **Tokens** | Ciclos, huecos, contraste, nombres | script `tokens:check` + Vitest | `packages/tokens` | cada PR |

**No duplicar niveles sin motivo**: p. ej. el teclado de `Tabs` se prueba en contrato y componente **una vez** (contrato define casos; el runner de cada framework los ejecuta); no se vuelve a probar en E2E salvo flujo real.

## 3. Casos de contrato (mecanismo)

En `core/contracts/tabs.contract.ts` (ilustrativo):

```ts
cases: [
  { id: 'tabs.arrow-right-moves-focus',
    given: { render: 'default', focus: 'tab:0' },
    when:  [{ press: 'ArrowRight' }],
    then:  [{ focus: 'tab:1' }, { attr: { target: 'tab:1', 'aria-selected': 'true' } }] },
  // …
]
```
Cada paquete (`vue`/`react`) incluye un *runner* de ~100 líneas que traduce `given/when/then` a su harness (render, `userEvent`/`trigger`, consultas por rol). Ventaja: **los casos se escriben una vez**, el montaje es nativo.

## 4. Accesibilidad: estrategia

1. **Diseño**: el contrato exige `apgPattern`, roles, teclado, foco y nombre accesible *antes* de implementar.
2. **Automatizada**: axe en estados (default/hover simulado/focus/disabled/invalid/open) y temas. Falla el CI con cualquier violación ≥ *serious*; *moderate* requiere excepción documentada.
3. **Teclado**: tests explícitos de orden de tabulación, atajos y trampa/retorno de foco.
4. **Manual**: checklist con lectores de pantalla para componentes compuestos antes de marcarlos *Estable*; el resultado se publica en la página del componente («Accessibility report»: fecha, herramienta, versión).
5. **Visual**: contraste de tokens verificado por `tokens:check` y por Theme Studio.
6. **Limitaciones**: la automatización detecta una parte (referencias típicas: ~30–40 % de los problemas **[C]**); no sustituye lo manual.

## 5. Regresión visual y paridad

- **Fuente de verdad visual**: historias Storybook por componente y tema (`default`, `dark`, `compact`, `rtl`, `forced-colors`, `reduced-motion`).
- **Captura**: Playwright dentro de contenedor Docker (mismas fuentes y *rendering*) para evitar ruido entre máquinas; baselines versionadas en el repo (si crecen demasiado → Git LFS o artefactos de CI).
- **Animaciones**: `animations: 'disabled'` y fecha/valores simulados.
- **Paridad**: el mismo *story* se captura en Vue y React → `pixelmatch`/`toHaveScreenshot` entre ambas; umbral inicial ≤ 0.1 % *(a calibrar)*; diferencias aceptadas se registran en el contrato (`knownDifferences`).
- **Opcional**: Chromatic como complemento (no requisito).

## 6. Compatibilidad

| Eje | Matriz |
|---|---|
| Navegadores | Chromium, Firefox, WebKit (Playwright) — últimas 2 versiones mayores |
| Frameworks | Vue 3.5.x (mínimo y último), React 18.3 y 19 |
| SSR | Nuxt (último estable), Next.js (App Router + Pages) |
| Herramientas | Vite, webpack (smoke test de exports), Tailwind v4 (smoke test del puente) |
| Dispositivos | Táctil (emulación) + comprobación manual en dispositivos reales antes de v1 |

## 7. Puertas de calidad (quality gates)

**PR**: lint, tipos, `tokens:check`, `deps:check`, unit + componente + contrato, axe, build, publint/attw, size-limit, `docs:check`, paridad API.
**Antes de release**: visual completa, paridad visual, integración SSR, checklist manual de a11y de componentes nuevos, revisión de changelog/Changesets.
**Definition of Done de un componente público** (de la skill `cross-framework-component`):
- [ ] Contrato revisado · [ ] Vue · [ ] React · [ ] Tokens/CSS compartidos · [ ] Teclado y a11y definidos · [ ] Tests por framework verdes · [ ] Suite de contrato verde · [ ] Paridad visual comprobada · [ ] Docs con ejemplos Vue y React · [ ] Exports y tipos validados · [ ] Changeset.

## 8. Métricas de calidad a seguir

Cobertura de contrato por componente (% de casos implementados en ambos) · violaciones axe abiertas · diferencias de paridad abiertas · tamaño por componente · tiempo de CI · flakiness de tests visuales (objetivo < 1 %).

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| Baselines visuales ruidosas | Docker, animaciones off, umbrales, revisión en PR |
| Coste de mantener el runner de contrato | Mantenerlo mínimo; cubrir solo comportamiento observable |
| Falsa seguridad de axe | Checklist manual + informes visibles |
| Tests en jsdom que no detectan problemas de layout/foco reales | Browser Mode para overlays/posicionamiento |
