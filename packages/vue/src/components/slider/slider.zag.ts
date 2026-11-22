import * as slider from '@zag-js/slider';
import { normalizeProps, useMachine } from '@zag-js/vue';
import { computed, useId } from 'vue';

/** Behavior adapter of Slider: the only file of the component that talks to Zag (ADR 0004). */
export interface SliderRootOptions {
  value: () => number | undefined;
  defaultValue: () => number | undefined;
  min: () => number;
  max: () => number;
  step: () => number;
  name: () => string | undefined;
  disabled: () => boolean | undefined;
  orientation: () => 'horizontal' | 'vertical';
  onValueChange: (value: number) => void;
  onValueCommit: (value: number) => void;
}

export function useSliderRoot(options: SliderRootOptions) {
  const id = useId();
  const service = useMachine(
    slider.machine,
    computed(() => {
      const value = options.value();
      return {
        id,
        min: options.min(),
        max: options.max(),
        step: options.step(),
        name: options.name(),
        disabled: options.disabled(),
        orientation: options.orientation(),
        value: value === undefined ? undefined : [value],
        defaultValue: [options.defaultValue() ?? options.min()],
        onValueChange: (details: { value: number[] }) =>
          options.onValueChange(details.value[0] ?? options.min()),
        onValueChangeEnd: (details: { value: number[] }) =>
          options.onValueCommit(details.value[0] ?? options.min()),
      };
    }),
  );
  return computed(() => slider.connect(service, normalizeProps));
}
