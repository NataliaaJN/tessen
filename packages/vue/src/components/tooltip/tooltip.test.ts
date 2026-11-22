import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { tooltipContract } from '@tessen-ui/core';
import { mount } from '@vue/test-utils';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import { TTooltip, TTooltipContent, TTooltipTrigger } from './index.js';

/** Fixture of the contract: Tooltip > TooltipTrigger "Save" + TooltipContent "Save the file". */
function mountFixture(props: Record<string, unknown>, className?: string) {
  return mount(TTooltip, {
    props: props as never,
    slots: {
      default: () => [
        h(TTooltipTrigger, { class: className }, () => 'Save'),
        h(TTooltipContent, null, () => 'Save the file'),
      ],
    },
    attachTo: document.body,
  });
}

const vueAdapter: Adapter = {
  name: 'Vue (VTU)',
  mount(neutral) {
    const wrapper = mountFixture({ ...neutral.extra }, neutral.class);
    return {
      root: document.body.querySelector<HTMLElement>('.t-tooltip__trigger')!,
      clicks: () => 0,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(tooltipContract, vueAdapter);

describe('TTooltip · behaviour and axe', () => {
  it('opens on keyboard Tab with no delay and has no axe violations', async () => {
    const wrapper = mountFixture({ openDelay: 0 });
    await userEvent.setup().tab();
    await expect.poll(() => document.body.querySelector('[role="tooltip"]')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
