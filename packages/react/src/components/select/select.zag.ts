import type { SelectItem } from '@tessen-ui/core/contracts/select';
import { normalizeProps, useMachine } from '@zag-js/react';
import * as select from '@zag-js/select';
import { useId, useMemo } from 'react';

/** Behavior adapter of Select: the only file of the component that talks to Zag (ADR 0004). */
export type SelectApi = ReturnType<typeof select.connect>;

export interface SelectRootOptions {
  items: readonly SelectItem[];
  /** `undefined`: uncontrolled. `null`: controlled with nothing selected. */
  value: string | null | undefined;
  defaultValue: string | undefined;
  open: boolean | undefined;
  defaultOpen: boolean | undefined;
  disabled: boolean | undefined;
  name: string | undefined;
  onValueChange: ((value: string | null) => void) | undefined;
  onOpenChange: ((open: boolean) => void) | undefined;
}

export function useSelectRoot(options: SelectRootOptions) {
  const id = useId();
  const collection = useMemo(
    () => select.collection({ items: [...options.items] }),
    [options.items],
  );
  const service = useMachine(select.machine, {
    id,
    collection,
    value: options.value === undefined ? undefined : options.value === null ? [] : [options.value],
    defaultValue: options.defaultValue === undefined ? undefined : [options.defaultValue],
    open: options.open,
    defaultOpen: options.defaultOpen,
    disabled: options.disabled,
    name: options.name,
    positioning: { sameWidth: true },
    onValueChange: (details) => options.onValueChange?.(details.value[0] ?? null),
    onOpenChange: (details) => options.onOpenChange?.(details.open),
  });
  return { api: select.connect(service, normalizeProps), collection };
}
