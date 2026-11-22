// Uses only the public subpaths. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { buttonVariants } from '@tessen-ui/core/contracts/button';
import { CheckIcon } from '@tessen-ui/icons/react';

export function App() {
  const result = buttonVariants({ variant: 'primary', tone: 'danger', block: true });
  return (
    <button type="button" className={result.class} {...result.attrs}>
      <CheckIcon size={16} />
      Save
    </button>
  );
}
