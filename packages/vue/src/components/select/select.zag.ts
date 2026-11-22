import type { SelectItem } from '@tessen-ui/core/contracts/select';
import * as select from '@zag-js/select';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, useId, type ComputedRef } from 'vue';

/** Behavior adapter of Select: the only file of the component that talks to Zag (ADR 0004). */
export interface SelectRootOptions {
  items: () => readonly SelectItem[];
  /** `undefined`: uncontrolled. `null`: controlled with nothing selected. */
  value: () => string | null | undefined;
  defaultValue: () => string | undefined;
  open: () => boolean | undefined;
  defaultOpen: () => boolean | undefined;
  disabled: () => boolean | undefined;
  name: () => string | undefined;
  onValueChange: (value: string | null) => void;
  onOpenChange: (open: boolean) => void;
}

export function useSelectRoot(options: SelectRootOptions): {
  api: ComputedRef<ReturnType<typeof select.connect>>;
  collection: ComputedRef<ReturnType<typeof select.collection<SelectItem>>>;
} {
  const id = useId();
  const collection = computed(() => select.collection({ items: [...options.items()] }));
  const service = useMachine(
    select.machine,
    computed(() => {
      const value = options.value();
      const defaultValue = options.defaultValue();
      return {
        id,
        collection: collection.value,
        value: value === undefined ? undefined : value === null ? [] : [value],
        defaultValue: defaultValue === undefined ? undefined : [defaultValue],
        open: options.open(),
        defaultOpen: options.defaultOpen(),
        disabled: options.disabled(),
        name: options.name(),
        positioning: { sameWidth: true },
        onValueChange: (details: { value: string[] }) =>
          options.onValueChange(details.value[0] ?? null),
        onOpenChange: (details: { open: boolean }) => options.onOpenChange(details.open),
      };
    }),
  );
  const api = computed(() => select.connect(service, normalizeProps));
  return { api, collection };
}
