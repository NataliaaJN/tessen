<script setup lang="ts">
import { STEPS, describeSeed, generateScale } from '@tessen-ui/theme';
import type { Density, MotionMode } from '@tessen-ui/theme';
import { TNativeSelect, TRadio, TRadioGroup } from '@tessen-ui/vue';
import { computed } from 'vue';
import { ACCENT_SWATCHES, FONT_CHOICES } from '../fonts';
import { edit, theme } from '../state';
import ColorField from './ColorField.vue';

const scale = computed(() => generateScale(theme.value.accent));
const seed = computed(() => describeSeed(theme.value.accent));

const densities: [Density, string][] = [
  ['compact', 'Compacta'],
  ['default', 'Normal'],
  ['comfortable', 'Cómoda'],
];
const motions: [MotionMode, string][] = [
  ['full', 'Completo'],
  ['reduced', 'Reducido'],
  ['off', 'Sin movimiento'],
];

function fontOptions(kind: 'sans' | 'display' | 'mono'): string[] {
  const current = theme.value.fonts[kind];
  const list: readonly string[] = FONT_CHOICES[kind];
  return list.includes(current) ? [...list] : [current, ...list];
}
</script>

<template>
  <div class="panel-body">
    <section aria-labelledby="q-accent">
      <h3 id="q-accent">Acento</h3>
      <ul class="swatches" aria-label="Colores sugeridos">
        <li v-for="s in ACCENT_SWATCHES" :key="s.hex">
          <button
            type="button"
            class="swatch"
            :style="{ background: s.hex }"
            :aria-label="s.label"
            :aria-pressed="theme.accent.toUpperCase() === s.hex.toUpperCase()"
            :title="s.label"
            @click="edit('Acento', (t) => (t.accent = s.hex))"
          />
        </li>
      </ul>
      <ColorField
        label="Color de acento"
        :model-value="theme.accent"
        @update:model-value="(hex) => edit('Acento', (t) => (t.accent = hex))"
      />
      <ol class="ramp" aria-label="Escala generada">
        <li
          v-for="step in STEPS"
          :key="step"
          :style="{ background: scale[step] }"
          :title="`${step} · ${scale[step]}`"
        >
          <span class="sr-only">{{ step }}: {{ scale[step] }}</span>
        </li>
      </ol>
      <p class="hint">
        Tu color tiene contraste {{ seed.white }}:1 con blanco y {{ seed.black }}:1 con negro. Los
        componentes usan los pasos 700–800 con texto blanco y 400 sobre superficies oscuras, así que
        la escala conserva el contraste con cualquier tono.
      </p>
    </section>

    <section aria-labelledby="q-shape">
      <h3 id="q-shape">Geometría</h3>
      <label class="range">
        <span class="range__head">
          <span>Radio de esquina</span>
          <output>{{ theme.radius }} px</output>
        </span>
        <input
          type="range"
          min="0"
          max="16"
          step="1"
          :value="theme.radius"
          @input="
            (e) => edit('Radio', (t) => (t.radius = Number((e.target as HTMLInputElement).value)))
          "
        />
        <span class="range__ends"><span>Preciso</span><span>Orgánico</span></span>
      </label>
    </section>

    <section aria-labelledby="q-density">
      <h3 id="q-density">Densidad</h3>
      <TRadioGroup
        aria-label="Densidad"
        orientation="horizontal"
        :model-value="theme.density"
        @update:model-value="(v: string) => edit('Densidad', (t) => (t.density = v as Density))"
      >
        <TRadio v-for="[value, label] in densities" :key="value" :value="value">{{ label }}</TRadio>
      </TRadioGroup>
    </section>

    <section aria-labelledby="q-motion">
      <h3 id="q-motion">Movimiento</h3>
      <TRadioGroup
        aria-label="Movimiento"
        orientation="horizontal"
        :model-value="theme.motion"
        @update:model-value="(v: string) => edit('Movimiento', (t) => (t.motion = v as MotionMode))"
      >
        <TRadio v-for="[value, label] in motions" :key="value" :value="value">{{ label }}</TRadio>
      </TRadioGroup>
      <p class="hint">
        «Reducido» añade <code>data-tessen-motion="reduced"</code> a tu <code>&lt;html&gt;</code>;
        «Sin movimiento» pone las duraciones a 0 ms en el CSS exportado.
      </p>
    </section>

    <section aria-labelledby="q-type">
      <h3 id="q-type">Tipografía</h3>
      <label
        v-for="[kind, label] in [
          ['sans', 'Texto'],
          ['display', 'Titulares'],
          ['mono', 'Código'],
        ] as const"
        :key="kind"
        class="select-row"
      >
        <span>{{ label }}</span>
        <TNativeSelect
          size="sm"
          :model-value="theme.fonts[kind]"
          :aria-label="`Fuente de ${label.toLowerCase()}`"
          @update:model-value="(v: string) => edit('Fuente', (t) => (t.fonts[kind] = v))"
        >
          <option v-for="f in fontOptions(kind)" :key="f" :value="f">{{ f }}</option>
        </TNativeSelect>
      </label>
      <p class="hint">
        Studio no descarga fuentes: deben estar instaladas o cargadas en tu aplicación (por ejemplo
        con <code>@font-face</code>). Si no, el navegador usa la alternativa del sistema.
      </p>
    </section>
  </div>
</template>
