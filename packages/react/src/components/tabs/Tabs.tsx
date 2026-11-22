'use client';

import { tabsVariants, type TabsVariantProps } from '@tessen-ui/core/contracts/tabs';
import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useIsoLayoutEffect } from '../../internal/use-iso-layout-effect.ts';
import { TabsContext, useTabs, useTabsRoot } from './tabs.zag.ts';

export interface TabsProps
  extends
    Omit<TabsVariantProps, 'orientation'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  value?: string;
  /** Initial tab when `value` is not used. Defaults to the first tab. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  /** `automatic` selects on focus; `manual` waits for Enter or Space. */
  activationMode?: 'automatic' | 'manual';
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    variant,
    orientation = 'horizontal',
    activationMode = 'automatic',
    className,
    children,
    ...rest
  },
  ref,
) {
  const context = useTabsRoot({ value, defaultValue, orientation, activationMode, onValueChange });
  const resolved = tabsVariants({ variant, orientation });
  return (
    <TabsContext.Provider value={context}>
      <div
        {...context.api.getRootProps()}
        {...rest}
        {...resolved.attrs}
        ref={ref}
        className={cx(resolved.class, className)}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export type TabListProps = HTMLAttributes<HTMLDivElement>;

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList(
  { className, ...rest },
  ref,
) {
  const { api } = useTabs();
  return (
    <div {...api.getListProps()} {...rest} ref={ref} className={cx('t-tabs__list', className)} />
  );
});

export interface TabProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  /** Pairs the tab with the `TabPanel` of the same value. */
  value: string;
}

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, disabled, className, ...rest },
  ref,
) {
  const { api, registerTab } = useTabs();
  useIsoLayoutEffect(() => {
    if (!disabled) registerTab(value);
  }, [disabled, value, registerTab]);
  return (
    <button
      type="button"
      {...api.getTriggerProps({ value, disabled })}
      {...rest}
      ref={ref}
      className={cx('t-tabs__tab', className)}
    />
  );
});

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Pairs the panel with the `Tab` of the same value. */
  value: string;
}

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, className, ...rest },
  ref,
) {
  const { api } = useTabs();
  return (
    <div
      {...api.getContentProps({ value })}
      {...rest}
      ref={ref}
      className={cx('t-tabs__panel', className)}
    />
  );
});
