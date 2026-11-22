import { expectNoA11yViolations, runContract, type Adapter } from '@tessen-ui/contract-runner';
import { toastContract } from '@tessen-ui/core';
import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Toaster, createToaster, type ToastType } from './index.ts';

/** Fixture of the contract: a Toaster and a "Notify" button that creates one toast. */
function renderFixture(extra: { type?: ToastType; duration?: number }, className?: string) {
  const toaster = createToaster();
  return render(
    <>
      <button
        type="button"
        className={className}
        onClick={() => toaster.create({ title: 'Saved', description: 'Changes stored', ...extra })}
      >
        Notify
      </button>
      <Toaster toaster={toaster} />
    </>,
  );
}

const reactAdapter: Adapter = {
  name: 'React (RTL)',
  mount(neutral) {
    const result = renderFixture(neutral.extra as { type?: ToastType }, neutral.class);
    return {
      root: result.container.firstElementChild as HTMLElement,
      clicks: () => 0,
      emitted: () => [],
      unmount: () => result.unmount(),
    };
  },
};

runContract(toastContract, reactAdapter);

describe('Toaster · behaviour and axe', () => {
  it('has no violations with a toast on screen, and the toaster handle hides the engine', async () => {
    const toaster = createToaster();
    expect(Object.keys(toaster).sort()).toEqual(
      [
        'create',
        'dismiss',
        'error',
        'info',
        'loading',
        'remove',
        'success',
        'update',
        'warning',
      ].sort(),
    );
    const { unmount } = render(
      <>
        <button
          type="button"
          onClick={() => toaster.error({ title: 'Failed', description: 'Try again' })}
        >
          Notify
        </button>
        <Toaster toaster={toaster} />
      </>,
    );
    await expectNoA11yViolations(document.body);
    await userEvent.setup().click(document.body.querySelector('button')!);
    await expect.poll(() => document.body.querySelector('.t-toast')).not.toBeNull();
    await expectNoA11yViolations(document.body);
    unmount();
  });
});
