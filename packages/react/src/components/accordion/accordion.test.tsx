import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { accordionContract, parseAccordionValue } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionProps,
} from './index.ts';

/** Fixture of the contract: three items (one, two disabled, three) with "Item n" / "Content n". */
function renderFixture(props: AccordionProps) {
  return render(
    <Accordion {...props}>
      <AccordionItem value="one">
        <AccordionTrigger>Item one</AccordionTrigger>
        <AccordionContent>Content one</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two" disabled>
        <AccordionTrigger>Item two</AccordionTrigger>
        <AccordionContent>Content two</AccordionContent>
      </AccordionItem>
      <AccordionItem value="three">
        <AccordionTrigger>Item three</AccordionTrigger>
        <AccordionContent>Content three</AccordionContent>
      </AccordionItem>
    </Accordion>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const emitted: (string | boolean)[] = [];
    const { defaultValue, ...extra } = (neutral.extra ?? {}) as Record<string, string | boolean>;
    const result = renderFixture({
      ...(extra as AccordionProps),
      ...(defaultValue !== undefined && {
        defaultValue: parseAccordionValue(String(defaultValue)),
      }),
      variant: neutral.variant as AccordionProps['variant'],
      className: neutral.class,
      onValueChange: (value) => emitted.push(value.join(',')),
    });
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(accordionContract, reactAdapter);

describe('Accordion · axe', () => {
  it('has no violations collapsed or expanded', async () => {
    for (const defaultValue of [[], ['one']]) {
      const { unmount } = renderFixture({ defaultValue });
      await expectNoA11yViolations(document.body);
      unmount();
    }
  });
});
