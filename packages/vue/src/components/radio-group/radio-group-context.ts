import { inject, provide, type ComputedRef, type InjectionKey } from 'vue';

export interface RadioGroupContext {
  name: ComputedRef<string>;
  value: ComputedRef<string | undefined>;
  disabled: ComputedRef<boolean>;
  invalid: ComputedRef<boolean>;
  select(value: string): void;
}

const key: InjectionKey<RadioGroupContext> = Symbol('tessen-radio-group');

export const provideRadioGroup = (context: RadioGroupContext) => provide(key, context);
export const useRadioGroup = () => inject(key, null);
