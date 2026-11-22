import { filterItems } from '@tessen-ui/core/contracts/combobox';
import type { SelectItem } from '@tessen-ui/core/contracts/select';
import * as combobox from '@zag-js/combobox';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, ref, useId, type ComputedRef } from 'vue';

/** Behavior adapter of Combobox: the only file of the component that talks to Zag (ADR 0004). */
export interface ComboboxRootOptions {
  items: () => readonly SelectItem[];
  /** `undefined`: uncontrolled. `null`: controlled with nothing selected. */
  value: () => string | null | undefined;
  defaultValue: () => string | undefined;
  open: () => boolean | undefined;
  defaultOpen: () => boolean | undefined;
  disabled: () => boolean | undefined;
  placeholder: () => string | undefined;
  onValueChange: (value: string | null) => void;
  onOpenChange: (open: boolean) => void;
}

export function useComboboxRoot(options: ComboboxRootOptions): {
  api: ComputedRef<ReturnType<typeof combobox.connect>>;
  collection: ComputedRef<ReturnType<typeof combobox.collection<SelectItem>>>;
} {
  const id = useId();
  // Filtering is TESSEN's job: the machine only renders the collection it is given. Only what
  // the person types narrows the list: choosing an option fills the input but must not hide
  // the other options the next time the list opens.
  const query = ref('');
  const collection = computed(() =>
    combobox.collection({ items: filterItems(options.items(), query.value) }),
  );
  const service = useMachine(
    combobox.machine,
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
        placeholder: options.placeholder(),
        positioning: { sameWidth: true },
        onInputValueChange: (details: { inputValue: string; reason?: string }) =>
          (query.value = details.reason === 'input-change' ? details.inputValue : ''),
        onValueChange: (details: { value: string[] }) =>
          options.onValueChange(details.value[0] ?? null),
        onOpenChange: (details: { open: boolean }) => options.onOpenChange(details.open),
      };
    }),
  );
  const api = computed(() => combobox.connect(service, normalizeProps));
  return { api, collection };
}
