import { expectNoA11yViolations, runContract } from '@tessen-ui/contract-runner';
import { sliderContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { vueAdapter } from '../../../test/adapter.ts';
import TSlider from './Slider.vue';

runContract(
  sliderContract,
  vueAdapter('Vue (VTU)', TSlider, {
    labelAs: 'none',
    valueEvent: 'onUpdate:modelValue',
    rename: { value: 'modelValue' },
    props: { label: 'Volume' },
  }),
);

describe('TSlider · axe', () => {
  it('has no violations enabled or disabled', async () => {
    for (const disabled of [false, true]) {
      const wrapper = mount(TSlider, {
        props: { label: 'Volume', defaultValue: 30, disabled },
        attachTo: document.body,
      });
      await expectNoA11yViolations(document.body);
      wrapper.unmount();
    }
  });
});
