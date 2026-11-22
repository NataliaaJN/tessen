import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { accordionContract, parseAccordionValue } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { describe, it } from 'vitest';
import { h } from 'vue';
import { TAccordion, TAccordionContent, TAccordionItem, TAccordionTrigger } from './index.js';

/** Fixture of the contract: three items (one, two disabled, three) with "Item n" / "Content n". */
function mountFixture(props: Record<string, unknown>) {
  return mount(TAccordion, {
    props: props as never,
    slots: {
      default: () => [
        h(TAccordionItem, { value: 'one' }, () => [
          h(TAccordionTrigger, null, () => 'Item one'),
          h(TAccordionContent, null, () => 'Content one'),
        ]),
        h(TAccordionItem, { value: 'two', disabled: true }, () => [
          h(TAccordionTrigger, null, () => 'Item two'),
          h(TAccordionContent, null, () => 'Content two'),
        ]),
        h(TAccordionItem, { value: 'three' }, () => [
          h(TAccordionTrigger, null, () => 'Item three'),
          h(TAccordionContent, null, () => 'Content three'),
        ]),
      ],
    },
    attachTo: document.body,
  });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const { defaultValue, ...extra } = (neutral.extra ?? {}) as Record<string, string | boolean>;
    const wrapper = mountFixture({
      ...extra,
      ...(defaultValue !== undefined && {
        defaultValue: parseAccordionValue(String(defaultValue)),
      }),
      variant: neutral.variant,
      class: neutral.class,
      'onUpdate:modelValue': (value?: string[]) => {
        if (value) emitted.push(value.join(','));
      },
    });
    return {
      root: wrapper.element as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(accordionContract, vueAdapter);

describe('TAccordion · axe', () => {
  it('has no violations collapsed or expanded', async () => {
    for (const defaultValue of [[], ['one']]) {
      const wrapper = mountFixture({ defaultValue });
      await expectNoA11yViolations(document.body);
      wrapper.unmount();
    }
  });
});
