<script setup lang="ts">
import { TButton, TCheckbox, TInput, TNativeSelect } from '@tessen-ui/vue';
import type { Control, ControlValue, Recipe } from '../recipes/index.ts';

defineProps<{ recipe: Recipe; values: Record<string, ControlValue> }>();
const emit = defineEmits<{
  change: [name: string, value: ControlValue];
  reset: [];
}>();

const onNumber = (name: string, raw: string): void => {
  if (raw.trim() === '') return;
  const n = Number(raw);
  if (Number.isFinite(n)) emit('change', name, n);
};

const id = (c: Control): string => `ctl-${c.name}`;
</script>

<template>
  <section class="controls" aria-label="Controles del componente">
    <div class="panel-head">
      <h2>Propiedades</h2>
      <TButton size="sm" variant="ghost" data-testid="reset" @click="emit('reset')">
        Restablecer
      </TButton>
    </div>
    <p v-if="recipe.controls.length === 0" class="muted">Este componente no tiene propiedades.</p>
    <div v-for="c in recipe.controls" :key="c.name" class="control" :data-control="c.name">
      <template v-if="c.kind === 'boolean'">
        <TCheckbox
          size="sm"
          :model-value="Boolean(values[c.name])"
          @update:model-value="(v: boolean) => emit('change', c.name, v)"
        >
          {{ c.label }}
        </TCheckbox>
      </template>
      <template v-else>
        <label :for="id(c)" class="control-label">{{ c.label }}</label>
        <TNativeSelect
          v-if="c.kind === 'select'"
          :id="id(c)"
          size="sm"
          :model-value="String(values[c.name])"
          @update:model-value="(v: string) => emit('change', c.name, v)"
        >
          <option v-for="o in c.options" :key="o" :value="o">{{ o }}</option>
        </TNativeSelect>
        <TInput
          v-else-if="c.kind === 'number'"
          :id="id(c)"
          size="sm"
          type="number"
          :model-value="String(values[c.name])"
          :min="c.min"
          :max="c.max"
          :step="c.step"
          @update:model-value="(v: string) => onNumber(c.name, v)"
        />
        <TInput
          v-else
          :id="id(c)"
          size="sm"
          :model-value="String(values[c.name])"
          @update:model-value="(v: string) => emit('change', c.name, v)"
        />
      </template>
    </div>
  </section>
</template>
