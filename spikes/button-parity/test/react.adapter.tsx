import { render } from '@testing-library/react';
import type { NeutralProps } from '../src/core/contract.ts';
import { Button, type ButtonProps } from '../src/react/Button.tsx';
import type { Adapter } from './runner.ts';

/** Neutral props -> React idiom: props, `onClick`, `leadingIcon`/`trailingIcon` and children. */
export const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral: NeutralProps) {
    const { label, leading, trailing, ...props } = neutral;
    let clicks = 0;
    const result = render(
      <Button
        {...(props as ButtonProps)}
        leadingIcon={leading}
        trailingIcon={trailing}
        onClick={() => clicks++}
      >
        {label}
      </Button>,
    );
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => clicks,
      unmount: () => result.unmount(),
    };
  },
};
