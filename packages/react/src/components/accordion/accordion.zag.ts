import * as accordion from '@zag-js/accordion';
import { normalizeProps, useMachine } from '@zag-js/react';
import { createContext, useContext, useId } from 'react';

/** Behavior adapter of Accordion: the only file of the component that talks to Zag (ADR 0004). */
type AccordionApi = ReturnType<typeof accordion.connect>;

export interface AccordionContextValue {
  api: AccordionApi;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordion(): AccordionContextValue {
  const context = useContext(AccordionContext);
  if (!context) throw new Error('Accordion parts must be used inside <Accordion>');
  return context;
}

export interface AccordionItemContextValue {
  value: string;
  disabled: boolean;
}

export const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export function useAccordionItem(): AccordionItemContextValue {
  const context = useContext(AccordionItemContext);
  if (!context)
    throw new Error('AccordionTrigger and AccordionContent must be inside <AccordionItem>');
  return context;
}

export interface AccordionRootOptions {
  value: string[] | undefined;
  defaultValue: string[] | undefined;
  multiple: boolean;
  collapsible: boolean;
  disabled: boolean | undefined;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  onValueChange: ((value: string[]) => void) | undefined;
}

export function useAccordionRoot(options: AccordionRootOptions): AccordionContextValue {
  const id = useId();
  const service = useMachine(accordion.machine, {
    id,
    value: options.value,
    defaultValue: options.defaultValue,
    multiple: options.multiple,
    collapsible: options.collapsible,
    disabled: options.disabled,
    onValueChange: (details) => options.onValueChange?.(details.value),
  });
  return { api: accordion.connect(service, normalizeProps), headingLevel: options.headingLevel };
}
