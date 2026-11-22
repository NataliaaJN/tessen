// Uses only the public entry points. The contract cases and `defineContract` are NOT used here
// on purpose: the build check asserts they are tree-shaken out of the bundle.
import { CheckIcon } from '@tessen-ui/icons/react';
import { Button } from '@tessen-ui/react';

export function App() {
  return (
    <Button tone="danger" block leadingIcon={<CheckIcon size={16} />}>
      Save
    </Button>
  );
}
