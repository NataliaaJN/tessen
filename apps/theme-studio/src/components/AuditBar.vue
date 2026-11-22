<script setup lang="ts">
import { TButton } from '@tessen-ui/vue';
import { computed, ref } from 'vue';
import { audit, edit } from '../state';

const open = ref(false);
const total = computed(() => audit.value.checks.length);
const bad = computed(() => audit.value.failures);

function fix(i: number): void {
  const f = bad.value[i];
  if (!f?.suggestion) return;
  edit('Corregir contraste', (t) => {
    t.overrides[f.mode][f.foreground] = f.suggestion as string;
  });
}

const modeName = (m: string): string => (m === 'light' ? 'claro' : 'oscuro');
</script>

<template>
  <section class="audit" aria-labelledby="audit-title">
    <button
      type="button"
      class="audit__summary"
      :data-ok="bad.length === 0"
      :aria-expanded="open"
      aria-controls="audit-details"
      @click="open = !open"
    >
      <strong id="audit-title">Contraste WCAG 2.2</strong>
      <span v-if="bad.length === 0"
        >✔ {{ total }} pares correctos (texto ≥ 4,5:1, controles ≥ 3:1)</span
      >
      <span v-else>⚠ {{ bad.length }} de {{ total }} pares no cumplen</span>
    </button>
    <div v-show="open" id="audit-details" class="audit__details">
      <p v-if="bad.length === 0" class="hint">
        Todos los pares de la tabla de contraste de Tessen cumplen en claro y oscuro.
      </p>
      <ul v-else class="audit__list">
        <li v-for="(f, i) in bad" :key="f.mode + f.foreground + f.background">
          <span class="chip" :style="{ background: f.bgHex }">
            <span :style="{ color: f.fgHex }">Aa</span>
          </span>
          <span>
            <code>{{ f.foreground.replace('color.', '') }}</code> sobre
            <code>{{ f.background.replace('color.', '') }}</code>
            (modo {{ modeName(f.mode) }}): <strong>{{ f.ratio }}:1</strong>, mínimo {{ f.min }}:1
          </span>
          <TButton v-if="f.suggestion" size="sm" variant="outline" @click="fix(i)">
            Usar {{ f.suggestion }}
          </TButton>
        </li>
      </ul>
    </div>
  </section>
</template>
