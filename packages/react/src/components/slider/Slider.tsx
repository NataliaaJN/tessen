'use client';

import { sliderVariants, type SliderVariantProps } from '@tessen-ui/core/contracts/slider';
import { forwardRef, type HTMLAttributes } from 'react';
import { cx } from '../../internal/cx.ts';
import { useSliderRoot } from './slider.zag.ts';

export interface SliderProps
  extends
    Omit<SliderVariantProps, 'orientation'>,
    Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange'> {
  /** Visible label. It is also the accessible name of the thumb. */
  label: string;
  value?: number;
  /** Initial value when `value` is not used. Defaults to `min`. */
  defaultValue?: number;
  /** Runs on every change while dragging or pressing keys. */
  onValueChange?: (value: number) => void;
  /** Runs once when the person stops dragging or releases a key. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Adds a hidden input with this name so the value reaches a `<form>`. */
  name?: string;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
}

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    value,
    defaultValue,
    onValueChange,
    onValueCommit,
    min = 0,
    max = 100,
    step = 1,
    name,
    disabled,
    orientation = 'horizontal',
    className,
    ...rest
  },
  ref,
) {
  const api = useSliderRoot({
    value,
    defaultValue,
    min,
    max,
    step,
    name,
    disabled,
    orientation,
    onValueChange,
    onValueCommit,
  });
  const resolved = sliderVariants({ orientation });
  return (
    <div
      {...api.getRootProps()}
      {...rest}
      {...resolved.attrs}
      ref={ref}
      className={cx(resolved.class, className)}
    >
      <div className="t-slider__header">
        <label {...api.getLabelProps()} className="t-slider__label">
          {label}
        </label>
        <output {...api.getValueTextProps()} className="t-slider__value">
          {api.value[0]}
        </output>
      </div>
      <div {...api.getControlProps()} className="t-slider__control">
        <div {...api.getTrackProps()} className="t-slider__track">
          <div {...api.getRangeProps()} className="t-slider__range" />
        </div>
        <div {...api.getThumbProps({ index: 0 })} className="t-slider__thumb">
          <input {...api.getHiddenInputProps({ index: 0 })} />
        </div>
      </div>
    </div>
  );
});
