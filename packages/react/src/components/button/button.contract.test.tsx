import { runContract, type Adapter } from '@tessen-ui/contract-runner';
import { buttonContract, type NeutralProps } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { Button, type ButtonProps } from './Button.tsx';

/** Neutral props -> React idiom: props, `onClick`, `leadingIcon`/`trailingIcon`, `className`. */
const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral: NeutralProps) {
    const { label, leading, trailing, class: className, attrs, ...props } = neutral;
    let clicks = 0;
    const result = render(
      <Button
        {...(props as ButtonProps)}
        {...attrs}
        className={className}
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

runContract(buttonContract, reactAdapter);
