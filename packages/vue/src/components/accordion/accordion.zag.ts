import * as accordion from '@zag-js/accordion';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, inject, provide, useId, type ComputedRef, type InjectionKey } from 'vue';

/** Behavior adapter of Accordion: the only file of the component that talks to Zag (ADR 0004). */
type AccordionApi = ReturnType<typeof accordion.connect>;

interface AccordionContext {
  api: ComputedRef<AccordionApi>;
  headingLevel: ComputedRef<2 | 3 | 4 | 5 | 6>;
}

const key: InjectionKey<AccordionContext> = Symbol('tessen-accordion');
const itemKey: InjectionKey<ComputedRef<{ value: string; disabled: boolean }>> =
  Symbol('tessen-accordion-item');

export interface AccordionRootOptions {
  value: () => string[] | undefined;
  defaultValue: () => string[] | undefined;
  multiple: () => boolean;
  collapsible: () => boolean;
  disabled: () => boolean | undefined;
  headingLevel: () => 2 | 3 | 4 | 5 | 6;
  onValueChange: (value: string[]) => void;
}

export function provideAccordion(options: AccordionRootOptions): ComputedRef<AccordionApi> {
  const id = useId();
  const service = useMachine(
    accordion.machine,
    computed(() => ({
      id,
      value: options.value(),
      defaultValue: options.defaultValue(),
      multiple: options.multiple(),
      collapsible: options.collapsible(),
      disabled: options.disabled(),
      onValueChange: (details: { value: string[] }) => options.onValueChange(details.value),
    })),
  );
  const api = computed(() => accordion.connect(service, normalizeProps));
  provide(key, { api, headingLevel: computed(() => options.headingLevel()) });
  return api;
}

export function useAccordion(): AccordionContext {
  const context = inject(key);
  if (!context) throw new Error('Accordion parts must be used inside <TAccordion>');
  return context;
}

export function provideAccordionItem(value: () => string, disabled: () => boolean): void {
  provide(
    itemKey,
    computed(() => ({ value: value(), disabled: disabled() })),
  );
}

export function useAccordionItem() {
  const item = inject(itemKey);
  if (!item) {
    throw new Error('TAccordionTrigger and TAccordionContent must be inside <TAccordionItem>');
  }
  return item;
}
