import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button.tsx';

describe('Button', () => {
  it('passes the click event to onClick', () => {
    let received: unknown;
    const { getByRole } = render(<Button onClick={(event) => (received = event)}>Save</Button>);
    getByRole('button').click();
    expect(received).toBeDefined();
  });

  it('forwards the ref to the DOM button', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Save</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('merges style from the consumer', () => {
    const { getByRole } = render(<Button style={{ marginLeft: 4 }}>Save</Button>);
    expect(getByRole('button').style.marginLeft).toBe('4px');
  });
});
