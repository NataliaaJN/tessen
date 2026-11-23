<script setup lang="ts">
import { TButton } from '@tessen-ui/vue';
import { ref } from 'vue';
import type { Framework } from '../state/model.ts';

const props = defineProps<{
  framework: Framework;
  code: string;
  fileName: string;
}>();
const emit = defineEmits<{ 'update:framework': [value: Framework] }>();

const copied = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
  } catch {
    // Clipboard blocked: select the text so Ctrl+C still works.
    const pre = document.querySelector<HTMLElement>('.code-pre');
    if (pre) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    return;
  }
  clearTimeout(timer);
  timer = setTimeout(() => (copied.value = false), 1500);
}

function download(): void {
  const url = URL.createObjectURL(new Blob([props.code], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = props.fileName;
  a.click();
  URL.revokeObjectURL(url);
}

const tabs: [Framework, string][] = [
  ['vue', 'Vue'],
  ['react', 'React'],
];
</script>

<template>
  <section class="code" aria-label="Código generado">
    <div class="code-bar">
      <div class="code-tabs" role="group" aria-label="Framework del código">
        <button
          v-for="[id, label] in tabs"
          :key="id"
          type="button"
          class="seg"
          :aria-pressed="framework === id"
          @click="emit('update:framework', id)"
        >
          {{ label }}
        </button>
      </div>
      <span class="code-file">{{ fileName }}</span>
      <span class="spacer" />
      <TButton size="sm" variant="outline" data-testid="copy" @click="copy">
        {{ copied ? 'Copiado' : 'Copiar' }}
      </TButton>
      <TButton size="sm" variant="outline" data-testid="download" @click="download">
        Descargar
      </TButton>
    </div>
    <pre class="code-pre" tabindex="0" data-testid="code"><code>{{ code }}</code></pre>
    <p class="sr-only" role="status">{{ copied ? 'Código copiado al portapapeles' : '' }}</p>
  </section>
</template>
