import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { fieldContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { h } from 'vue';
import { TInput } from '../input/index.js';
import { TField, TFieldDescription, TFieldError, TFieldLabel } from './index.js';

/** Fixture of the contract: Field > Label "Email" + Input (+ Description / Error from `extra`). */
function mountFixture(fieldProps: Record<string, unknown>, description?: string, error?: string) {
  const emitted: (string | boolean)[] = [];
  const wrapper = mount(TField, {
    props: fieldProps as never,
    slots: {
      default: () => [
        h(TFieldLabel, null, () => 'Email'),
        h(TInput, {
          'onUpdate:modelValue': (value?: string) => {
            if (value !== undefined) emitted.push(value);
          },
        }),
        description ? h(TFieldDescription, null, () => description) : null,
        error ? h(TFieldError, null, () => error) : null,
      ],
    },
    attachTo: document.body,
  });
  return { wrapper, emitted };
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const { description, error, ...fieldProps } = neutral.extra ?? {};
    const { wrapper, emitted } = mountFixture(
      { ...fieldProps, class: neutral.class },
      description as string | undefined,
      error as string | undefined,
    );
    return {
      root: wrapper.element as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(fieldContract, vueAdapter);

describe('TField · axe', () => {
  it.each([
    ['default', {}, undefined, undefined],
    ['with description', {}, 'Help text', undefined],
    ['invalid with error', { invalid: true, required: true }, 'Help text', 'Required'],
    ['disabled', { disabled: true }, undefined, undefined],
  ])('%s has no violations', async (_name, props, description, error) => {
    const { wrapper } = mountFixture(props, description, error);
    await expectNoA11yViolations(wrapper.element);
    wrapper.unmount();
  });
});
