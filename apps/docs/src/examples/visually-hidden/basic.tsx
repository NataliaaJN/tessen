import { IconButton, VisuallyHidden } from '@tessen-ui/react';

export default function Example() {
  return (
    <IconButton label="Search">
      ⌕<VisuallyHidden>Search</VisuallyHidden>
    </IconButton>
  );
}
