<script setup lang="ts">
import { paginationRange, paginationVariants } from '@tessen-ui/core/contracts/pagination';
import { computed } from 'vue';

defineOptions({ name: 'TPagination' });

const props = withDefaults(
  defineProps<{
    pageCount: number;
    /** Initial page when `v-model:page` is not used. */
    defaultPage?: number;
    /** Page buttons shown on each side of the current one. */
    siblings?: number;
    size?: 'sm' | 'md';
    ariaLabel?: string;
    /** Accessible text of the arrows, for translation. */
    previousLabel?: string;
    nextLabel?: string;
  }>(),
  {
    defaultPage: 1,
    siblings: 1,
    size: undefined,
    ariaLabel: 'Pagination',
    previousLabel: 'Previous page',
    nextLabel: 'Next page',
  },
);
const model = defineModel<number | undefined>('page', { default: undefined });

const current = computed(() => model.value ?? props.defaultPage);
const resolved = computed(() => paginationVariants({ size: props.size }));
const items = computed(() => paginationRange(current.value, props.pageCount, props.siblings));

function go(page: number) {
  model.value = page;
}
// Page navigation. Buttons, not links: use it to change what a view shows.
</script>

<template>
  <nav :class="resolved.class" v-bind="resolved.attrs" :aria-label="ariaLabel">
    <ul class="t-pagination__list">
      <li>
        <button
          type="button"
          class="t-pagination__control"
          data-part="previous"
          :aria-label="previousLabel"
          :disabled="current <= 1"
          @click="go(current - 1)"
        >
          <span aria-hidden="true">‹</span>
        </button>
      </li>
      <template v-for="item in items" :key="item.type === 'page' ? item.page : item.key">
        <li
          v-if="item.type === 'ellipsis'"
          class="t-pagination__ellipsis"
          data-part="ellipsis"
          aria-hidden="true"
        >
          …
        </li>
        <li v-else>
          <button
            type="button"
            class="t-pagination__page"
            :data-page="item.page"
            :aria-label="`Page ${item.page}`"
            :aria-current="item.page === current ? 'page' : undefined"
            @click="go(item.page)"
          >
            {{ item.page }}
          </button>
        </li>
      </template>
      <li>
        <button
          type="button"
          class="t-pagination__control"
          data-part="next"
          :aria-label="nextLabel"
          :disabled="current >= pageCount"
          @click="go(current + 1)"
        >
          <span aria-hidden="true">›</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
