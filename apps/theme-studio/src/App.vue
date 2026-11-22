<script setup lang="ts">
import { TTab, TTabList, TTabPanel, TTabs } from '@tessen-ui/vue';
import { onBeforeUnmount, onMounted } from 'vue';
import AdvancedPanel from './components/AdvancedPanel.vue';
import AuditBar from './components/AuditBar.vue';
import ExportDialog from './components/ExportDialog.vue';
import HeaderBar from './components/HeaderBar.vue';
import LeftPanel from './components/LeftPanel.vue';
import PreviewFrame from './components/PreviewFrame.vue';
import QuickPanel from './components/QuickPanel.vue';
import { redo, studio, undo } from './state';
import type { Panel, Scene, Viewport } from './state';

const scenes: [Scene, string][] = [
  ['components', 'Componentes'],
  ['forms', 'Formularios'],
  ['dashboard', 'Panel'],
  ['landing', 'Landing'],
  ['typography', 'Tipografía'],
];
const viewports: [Viewport, string][] = [
  ['fluid', 'Completo'],
  ['tablet', 'Tableta'],
  ['mobile', 'Móvil'],
];

function onKey(e: KeyboardEvent): void {
  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
  const el = e.target as HTMLElement | null;
  // Let text fields keep their own undo.
  if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
  e.preventDefault();
  if (e.shiftKey) redo();
  else undo();
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <a class="skip" href="#preview">Saltar a la vista previa</a>
  <div class="studio">
    <HeaderBar />

    <p v-if="studio.notice" class="notice" :data-kind="studio.notice.kind" role="status">
      {{ studio.notice.text }}
      <button type="button" class="link-button" @click="studio.notice = null">Cerrar</button>
    </p>

    <aside class="side side--left" aria-label="Presets, temas guardados e historial">
      <LeftPanel />
    </aside>

    <main id="preview" class="center" aria-label="Vista previa">
      <div class="toolbar">
        <div class="bar__group" role="group" aria-label="Escena">
          <button
            v-for="[id, label] in scenes"
            :key="id"
            type="button"
            :aria-pressed="studio.scene === id"
            @click="studio.scene = id"
          >
            {{ label }}
          </button>
        </div>
        <div class="bar__group" role="group" aria-label="Ancho de la vista previa">
          <button
            v-for="[id, label] in viewports"
            :key="id"
            type="button"
            :aria-pressed="studio.viewport === id"
            @click="studio.viewport = id"
          >
            {{ label }}
          </button>
        </div>
        <span v-if="studio.compare" class="badge-compare">Mostrando el tema base</span>
      </div>
      <PreviewFrame />
      <AuditBar />
    </main>

    <aside class="side side--right" aria-label="Ajustes del tema">
      <TTabs
        :model-value="studio.panel"
        @update:model-value="(v: string | undefined) => (studio.panel = v as Panel)"
      >
        <TTabList aria-label="Modo del editor">
          <TTab value="quick">Rápido</TTab>
          <TTab value="advanced">Avanzado</TTab>
        </TTabList>
        <TTabPanel value="quick"><QuickPanel /></TTabPanel>
        <TTabPanel value="advanced"><AdvancedPanel /></TTabPanel>
      </TTabs>
    </aside>
  </div>
  <ExportDialog />
</template>
