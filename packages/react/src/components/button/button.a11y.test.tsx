import { expectNoA11yViolations } from '@tessen-ui/contract-runner';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Button, type ButtonProps } from './Button.tsx';

const states: [string, ButtonProps][] = [
  ['default', {}],
  ['secondary danger', { variant: 'secondary', tone: 'danger' }],
  ['link', { variant: 'link' }],
  ['disabled', { disabled: true }],
  ['loading', { loading: true }],
];

describe('Button · axe', () => {
  it.each(states)('%s has no violations', async (_name, props) => {
    const { container } = render(<Button {...props}>Save</Button>);
    await expectNoA11yViolations(container);
  });

  it('with only an icon it needs an accessible name (aria-label)', async () => {
    const { container } = render(
      <Button aria-label="Close" leadingIcon={<svg aria-hidden="true" width="16" height="16" />} />,
    );
    await expectNoA11yViolations(container);
  });
});
