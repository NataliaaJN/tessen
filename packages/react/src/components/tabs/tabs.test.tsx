import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { tabsContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './index.ts';

/** Fixture of the contract: Tabs > TabList "Letters" > Alpha, Beta (disabled), Gamma + panels. */
function renderFixture(props: TabsProps) {
  return render(
    <Tabs {...props}>
      <TabList aria-label="Letters">
        <Tab value="alpha">Alpha</Tab>
        <Tab value="beta" disabled>
          Beta
        </Tab>
        <Tab value="gamma">Gamma</Tab>
      </TabList>
      <TabPanel value="alpha">Alpha panel</TabPanel>
      <TabPanel value="beta">Beta panel</TabPanel>
      <TabPanel value="gamma">Gamma panel</TabPanel>
    </Tabs>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const result = renderFixture({
      ...(neutral.extra as TabsProps),
      variant: neutral.variant as TabsProps['variant'],
      className: neutral.class,
      onValueChange: (value) => emitted.push(value),
    });
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(tabsContract, reactAdapter);

describe('Tabs · axe', () => {
  it.each([
    ['default', {}],
    ['vertical pill', { orientation: 'vertical', variant: 'pill' } as const],
    ['manual activation', { activationMode: 'manual', defaultValue: 'gamma' } as const],
  ])('%s has no violations', async (_name, props) => {
    const { container, unmount } = renderFixture(props);
    await expectNoA11yViolations(container);
    unmount();
  });
});
