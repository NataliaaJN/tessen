import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { fieldContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { Input } from '../input/index.ts';
import { Field, FieldDescription, FieldError, FieldLabel } from './index.ts';

/** Fixture of the contract: Field > Label "Email" + Input (+ Description / Error from `extra`). */
function renderFixture(
  fieldProps: Record<string, unknown>,
  className?: string,
  description?: string,
  error?: string,
  onValueChange?: (value: string) => void,
) {
  return render(
    <Field {...fieldProps} className={className}>
      <FieldLabel>Email</FieldLabel>
      <Input onValueChange={onValueChange} />
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && <FieldError>{error}</FieldError>}
    </Field>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const { description, error, ...fieldProps } = neutral.extra ?? {};
    const emitted: (string | boolean)[] = [];
    const result = renderFixture(
      fieldProps,
      neutral.class,
      description as string | undefined,
      error as string | undefined,
      (value) => emitted.push(value),
    );
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => emitted,
      unmount: () => result.unmount(),
    };
  },
};

runContract(fieldContract, reactAdapter);

describe('Field · axe', () => {
  it.each([
    ['default', {}, undefined, undefined],
    ['with description', {}, 'Help text', undefined],
    ['invalid with error', { invalid: true, required: true }, 'Help text', 'Required'],
    ['disabled', { disabled: true }, undefined, undefined],
  ])('%s has no violations', async (_name, props, description, error) => {
    const { container, unmount } = renderFixture(props, undefined, description, error);
    await expectNoA11yViolations(container);
    unmount();
  });
});
