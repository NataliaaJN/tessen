import { normalizeProps, useMachine } from '@zag-js/react';
import * as slider from '@zag-js/slider';
import { useId } from 'react';

/** Behavior adapter of Slider: the only file of the component that talks to Zag (ADR 0004). */
export interface SliderRootOptions {
  value: number | undefined;
  defaultValue: number | undefined;
  min: number;
  max: number;
  step: number;
  name: string | undefined;
  disabled: boolean | undefined;
  orientation: 'horizontal' | 'vertical';
  onValueChange: ((value: number) => void) | undefined;
  onValueCommit: ((value: number) => void) | undefined;
}

export function useSliderRoot(options: SliderRootOptions) {
  const id = useId();
  const service = useMachine(slider.machine, {
    id,
    min: options.min,
    max: options.max,
    step: options.step,
    name: options.name,
    disabled: options.disabled,
    orientation: options.orientation,
    value: options.value === undefined ? undefined : [options.value],
    defaultValue: [options.defaultValue ?? options.min],
    onValueChange: (details) => options.onValueChange?.(details.value[0] ?? options.min),
    onValueChangeEnd: (details) => options.onValueCommit?.(details.value[0] ?? options.min),
  });
  return slider.connect(service, normalizeProps);
}
