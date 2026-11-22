<script setup lang="ts">
import { PRESETS, generateScale } from '@tessen-ui/theme';
import { TButton, TInput } from '@tessen-ui/vue';
import { ref } from 'vue';
import {
  applyPreset,
  jumpTo,
  loadSavedTheme,
  removeSavedTheme,
  saveCurrent,
  studio,
  theme,
} from '../state';

const title = ref('');

function onSave(): void {
  saveCurrent(title.value || theme.value.name);
  title.value = '';
}

const time = (at: number): string =>
  new Date(at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
</script>

<template>
  <div class="left">
    <section aria-labelledby="l-presets">
      <h2 id="l-presets" class="side-title">Presets</h2>
      <ul class="presets">
        <li v-for="p in PRESETS" :key="p.id">
          <button type="button" class="preset" :title="p.description" @click="applyPreset(p.id)">
            <span class="preset__dots" aria-hidden="true">
              <span :style="{ background: generateScale(p.theme.accent)[800] }" />
              <span :style="{ background: generateScale(p.theme.accent)[400] }" />
            </span>
            <span class="preset__name">{{ p.label }}</span>
            <span class="preset__mode">{{
              p.theme.previewMode === 'dark' ? 'Oscuro' : 'Claro'
            }}</span>
          </button>
        </li>
      </ul>
    </section>

    <section aria-labelledby="l-saved">
      <h2 id="l-saved" class="side-title">Mis temas</h2>
      <form class="save" @submit.prevent="onSave">
        <TInput
          v-model="title"
          size="sm"
          aria-label="Nombre para guardar"
          placeholder="Nombre del tema"
        />
        <TButton size="sm" type="submit" variant="secondary">Guardar</TButton>
      </form>
      <p v-if="studio.saved.length === 0" class="hint">
        Aún no has guardado ninguno. Se guardan solo en este navegador.
      </p>
      <ul v-else class="saved">
        <li v-for="s in studio.saved" :key="s.id">
          <button type="button" class="link-button" @click="loadSavedTheme(s.id)">
            {{ s.title }}
          </button>
          <TButton
            size="sm"
            variant="ghost"
            :aria-label="`Eliminar ${s.title}`"
            @click="removeSavedTheme(s.id)"
            >✕</TButton
          >
        </li>
      </ul>
    </section>

    <section aria-labelledby="l-history">
      <h2 id="l-history" class="side-title">Historial</h2>
      <ol class="history" reversed>
        <li v-for="(e, i) in studio.history.entries.slice().reverse()" :key="e.at + e.label + i">
          <button
            type="button"
            class="link-button"
            :aria-current="
              studio.history.entries.length - 1 - i === studio.history.cursor ? 'step' : undefined
            "
            @click="jumpTo(studio.history.entries.length - 1 - i)"
          >
            {{ e.label }} <small>{{ time(e.at) }}</small>
          </button>
        </li>
      </ol>
    </section>
  </div>
</template>
