import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { dropdownMenuContract } from '@tessen-ui/core';
import { userEvent } from '@testing-library/user-event';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { h } from 'vue';
import {
  TDropdownMenu,
  TDropdownMenuContent,
  TDropdownMenuItem,
  TDropdownMenuSeparator,
  TDropdownMenuTrigger,
} from './index.js';

/** Fixture of the contract: Trigger "Actions" + Content (Edit, Duplicate disabled, separator, Delete). */
function mountFixture(
  props: Record<string, unknown>,
  emitted: (string | boolean)[] = [],
  cls?: string,
) {
  return mount(TDropdownMenu, {
    props: { ...props, onSelect: (value: string) => emitted.push(value) } as never,
    slots: {
      default: () => [
        h(TDropdownMenuTrigger, { class: cls }, () => 'Actions'),
        h(TDropdownMenuContent, null, () => [
          h(TDropdownMenuItem, { value: 'edit' }, () => 'Edit'),
          h(TDropdownMenuItem, { value: 'duplicate', disabled: true }, () => 'Duplicate'),
          h(TDropdownMenuSeparator),
          h(TDropdownMenuItem, { value: 'delete' }, () => 'Delete'),
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
    const wrapper = mountFixture({ ...neutral.extra }, emitted, neutral.class);
    return {
      root: document.body.querySelector<HTMLElement>('.t-menu__trigger')!,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => wrapper.unmount(),
    };
  },
};

runContract(dropdownMenuContract, vueAdapter);

describe('TDropdownMenu · axe', () => {
  it('has no violations open or closed', async () => {
    const wrapper = mountFixture({});
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('.t-menu__trigger')!);
    await expect.poll(() => document.body.querySelector('[role="menu"]')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    wrapper.unmount();
  });
});
