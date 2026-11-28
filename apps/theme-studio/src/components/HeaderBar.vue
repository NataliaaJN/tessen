<script setup lang="ts">
import { slugify } from '@tessen-ui/theme';
import { TButton, TSwitch } from '@tessen-ui/vue';
import { ref } from 'vue';
import {
  canRedo,
  canUndo,
  edit,
  importText,
  redo,
  reset,
  say,
  shareUrl,
  studio,
  theme,
  undo,
} from '../state';

const base = import.meta.env.BASE_URL;
const file = ref<HTMLInputElement | null>(null);

async function onFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const f = input.files?.[0];
  input.value = '';
  if (!f) return;
  importText(await f.text(), f.name);
}

async function share(): Promise<void> {
  try {
    await navigator.clipboard.writeText(shareUrl());
    say('success', 'Enlace copiado: quien lo abra verá exactamente este tema.');
  } catch {
    say('error', 'No se pudo copiar el enlace. Cópialo desde la barra de direcciones.');
  }
}
</script>

<template>
  <header class="bar">
    <a class="bar__brand" href="../" aria-label="Tessen, inicio">
      <img class="mark mark-light" :src="`${base}tessen-mark.svg`" alt="" width="32" height="32" />
      <img
        class="mark mark-dark"
        :src="`${base}tessen-mark-on-dark.svg`"
        alt=""
        width="32"
        height="32"
      />
      tessen <span>studio</span>
    </a>

    <label class="bar__name">
      <span class="sr-only">Nombre del tema</span>
      <input
        type="text"
        :value="theme.name"
        maxlength="40"
        spellcheck="false"
        @change="
          (e) => edit('Nombre', (t) => (t.name = slugify((e.target as HTMLInputElement).value)))
        "
      />
    </label>

    <div class="bar__group" role="group" aria-label="Modo de color de la vista previa">
      <button
        type="button"
        :aria-pressed="theme.previewMode === 'light'"
        @click="edit('Modo', (t) => (t.previewMode = 'light'))"
      >
        Claro
      </button>
      <button
        type="button"
        :aria-pressed="theme.previewMode === 'dark'"
        @click="edit('Modo', (t) => (t.previewMode = 'dark'))"
      >
        Oscuro
      </button>
    </div>

    <TSwitch v-model="studio.compare" size="sm">Comparar con la base</TSwitch>

    <div class="bar__group bar__actions">
      <TButton
        size="sm"
        variant="ghost"
        :disabled="!canUndo"
        aria-keyshortcuts="Control+Z Meta+Z"
        @click="undo"
        >Deshacer</TButton
      >
      <TButton
        size="sm"
        variant="ghost"
        :disabled="!canRedo"
        aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z"
        @click="redo"
        >Rehacer</TButton
      >
      <TButton size="sm" variant="ghost" @click="reset">Restablecer</TButton>
      <TButton size="sm" variant="outline" @click="file?.click()">Importar</TButton>
      <TButton size="sm" variant="outline" @click="share">Copiar enlace</TButton>
      <TButton size="sm" @click="studio.exportOpen = true">Exportar</TButton>
      <input
        ref="file"
        class="sr-only"
        type="file"
        accept=".json,application/json"
        tabindex="-1"
        aria-label="Importar un tema (.json)"
        @change="onFile"
      />
    </div>
  </header>
</template>
