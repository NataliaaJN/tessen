<script setup lang="ts">
import { toCss, toDtcg, toTailwind, toThemeJson, toTypeScript } from '@tessen-ui/theme';
import { TButton, TTab, TTabList, TTabPanel, TTabs } from '@tessen-ui/vue';
import { computed, ref, watch } from 'vue';
import { fileSlug, say, shareUrl, studio, theme } from '../state';

const dialog = ref<HTMLDialogElement | null>(null);
const format = ref('css');

interface Format {
  id: string;
  label: string;
  file: string;
  mime: string;
  hint: string;
  text: () => string;
}

const formats = computed<Format[]>(() => {
  const slug = fileSlug();
  return [
    {
      id: 'css',
      label: 'CSS',
      file: `${slug}.css`,
      mime: 'text/css',
      hint: 'Impórtalo después de @tessen-ui/styles. Solo contiene lo que cambia.',
      text: () => toCss(theme.value),
    },
    {
      id: 'dtcg',
      label: 'DTCG JSON',
      file: `${slug}.tokens.json`,
      mime: 'application/json',
      hint: 'Formato DTCG 2025.10. Se puede volver a importar en Studio.',
      text: () => `${JSON.stringify(toDtcg(theme.value), null, 2)}\n`,
    },
    {
      id: 'tailwind',
      label: 'Tailwind v4',
      file: `${slug}.tailwind.css`,
      mime: 'text/css',
      hint: 'CSS del tema más un bloque @theme inline con utilidades.',
      text: () => toTailwind(theme.value),
    },
    {
      id: 'ts',
      label: 'TypeScript',
      file: `${slug}.theme.ts`,
      mime: 'text/typescript',
      hint: 'Variables tipadas y una función para aplicarlas en tiempo de ejecución.',
      text: () => toTypeScript(theme.value),
    },
    {
      id: 'json',
      label: 'Tema (JSON)',
      file: `${slug}.tessen-theme.json`,
      mime: 'application/json',
      hint: 'El formato propio de Studio: el más compacto para guardar y compartir.',
      text: () => toThemeJson(theme.value),
    },
  ];
});

const active = computed(
  () => formats.value.find((f) => f.id === format.value) ?? (formats.value[0] as Format),
);
// The text is built once per change, not once per keystroke in the dialog.
const texts = computed(
  () => Object.fromEntries(formats.value.map((f) => [f.id, f.text()])) as Record<string, string>,
);

watch(
  () => studio.exportOpen,
  (open) => {
    const d = dialog.value;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  },
);

async function copy(text: string, what: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    say('success', `${what} copiado al portapapeles.`);
  } catch {
    say('error', 'No se pudo copiar. Selecciona el texto y cópialo a mano.');
  }
}

function download(): void {
  const f = active.value;
  const url = URL.createObjectURL(
    new Blob([texts.value[f.id] ?? ''], { type: `${f.mime};charset=utf-8` }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = f.file;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="export"
    aria-labelledby="export-title"
    @close="studio.exportOpen = false"
    @click.self="studio.exportOpen = false"
  >
    <header class="export__head">
      <h2 id="export-title">Exportar «{{ theme.name }}»</h2>
      <TButton variant="ghost" size="sm" @click="studio.exportOpen = false">Cerrar</TButton>
    </header>
    <TTabs v-model="format">
      <TTabList aria-label="Formato de exportación">
        <TTab v-for="f in formats" :key="f.id" :value="f.id">{{ f.label }}</TTab>
      </TTabList>
      <TTabPanel v-for="f in formats" :key="f.id" :value="f.id">
        <p class="hint">{{ f.hint }}</p>
        <pre class="code" tabindex="0"><code>{{ texts[f.id] }}</code></pre>
      </TTabPanel>
    </TTabs>
    <footer class="export__foot">
      <TButton @click="copy(texts[active.id] ?? '', active.label)"
        >Copiar {{ active.label }}</TButton
      >
      <TButton variant="outline" @click="download">Descargar {{ active.file }}</TButton>
      <TButton variant="ghost" @click="copy(shareUrl(), 'Enlace')">Copiar enlace del tema</TButton>
    </footer>
  </dialog>
</template>
