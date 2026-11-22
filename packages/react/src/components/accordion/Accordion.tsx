'use client';

import { accordionVariants, type AccordionVariantProps } from '@tessen-ui/core/contracts/accordion';
import { createElement, forwardRef, useMemo, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import {
  AccordionContext,
  AccordionItemContext,
  useAccordion,
  useAccordionItem,
  useAccordionRoot,
} from './accordion.zag.ts';

export interface AccordionProps
  extends AccordionVariantProps, Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Values of the open items. Omit it to let the component keep the state. */
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  /** More than one item can be open at once. */
  multiple?: boolean;
  /** The open item can be closed again. With `false` one item always stays open. */
  collapsible?: boolean;
  disabled?: boolean;
  /** Level of the heading around each trigger: pick the one that fits the page outline. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    collapsible = true,
    disabled,
    headingLevel = 3,
    variant,
    className,
    ...rest
  },
  ref,
) {
  const context = useAccordionRoot({
    value,
    defaultValue,
    onValueChange,
    multiple,
    collapsible,
    disabled,
    headingLevel,
  });
  const resolved = accordionVariants({ variant });
  return (
    <AccordionContext.Provider value={context}>
      <div
        {...context.api.getRootProps()}
        {...rest}
        {...resolved.attrs}
        ref={ref}
        className={cx(resolved.class, className)}
      />
    </AccordionContext.Provider>
  );
});

export interface AccordionItemProps extends Omit<HTMLAttributes<HTMLDivElement>, 'value'> {
  /** Identifies the item in the accordion value. */
  value: string;
  disabled?: boolean;
}

export const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(function AccordionItem(
  { value, disabled = false, className, ...rest },
  ref,
) {
  const { api } = useAccordion();
  const item = useMemo(() => ({ value, disabled }), [value, disabled]);
  return (
    <AccordionItemContext.Provider value={item}>
      <div
        {...api.getItemProps(item)}
        {...rest}
        ref={ref}
        className={cx('t-accordion__item', className)}
      />
    </AccordionItemContext.Provider>
  );
});

export type AccordionTriggerProps = HTMLAttributes<HTMLButtonElement>;

/** The button inside the item heading. Its children are the visible title. */
export const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger({ className, children, ...rest }, ref) {
    const { api, headingLevel } = useAccordion();
    const item = useAccordionItem();
    return createElement(
      `h${headingLevel}`,
      { className: 't-accordion__heading' },
      <button
        type="button"
        {...api.getItemTriggerProps(item)}
        {...rest}
        ref={ref}
        data-value={item.value}
        className={cx('t-accordion__trigger', className)}
      >
        <span className="t-accordion__title">{children}</span>
        <span
          {...api.getItemIndicatorProps(item)}
          className="t-accordion__indicator"
          aria-hidden="true"
        />
      </button>,
    );
  },
);

export type AccordionContentProps = HTMLAttributes<HTMLDivElement>;

export const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  function AccordionContent({ className, ...rest }, ref) {
    const { api } = useAccordion();
    const item = useAccordionItem();
    return (
      <div
        {...api.getItemContentProps(item)}
        {...rest}
        ref={ref}
        className={cx('t-accordion__content', className)}
      />
    );
  },
);
