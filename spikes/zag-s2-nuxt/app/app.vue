<script setup lang="ts">
import {
  Combobox,
  DatePicker,
  Dialog,
  Menu,
  Popover,
  Select,
  Tooltip,
} from '@tessen-ui/spike-zag-s2/vue';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana', disabled: true },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
];
const actions = [
  { value: 'edit', label: 'Edit' },
  { value: 'duplicate', label: 'Duplicate', disabled: true },
  { value: 'delete', label: 'Delete' },
];
const fruit = ref<string | null>('cherry');
const day = ref<string | null>('2026-11-15');
const dialogOpen = ref(false);
const selected = ref('');
</script>

<template>
  <main>
    <h1>Nuxt</h1>
    <p id="fruit-state">
      fruit={{ fruit }} day={{ day }} dialogOpen={{ dialogOpen }} menu={{ selected }}
    </p>
    <div><Select v-model="fruit" label="Fruit" :items="fruits" /></div>
    <div><Combobox v-model="fruit" label="Fruit search" :items="fruits" /></div>
    <div>
      <Menu :items="actions" @select="selected = $event"
        ><template #trigger>Actions</template></Menu
      >
    </div>
    <div>
      <Popover title="Popover"><template #trigger>Popover</template>Body</Popover>
    </div>
    <div>
      <Dialog v-model:open="dialogOpen" title="Dialog" description="Described">
        <template #trigger>Open dialog</template>
        <button type="button">Inside</button>
      </Dialog>
    </div>
    <div>
      <Tooltip content="Save the file"><template #default>Save</template></Tooltip>
    </div>
    <div><DatePicker v-model="day" label="Date" :disabled-dates="['2026-11-20']" /></div>
  </main>
</template>
