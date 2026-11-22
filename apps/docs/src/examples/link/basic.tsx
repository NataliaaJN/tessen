import { Link, Stack } from '@tessen-ui/react';

export default function Example() {
  return (
    <Stack direction="horizontal" gap="4">
      <Link href="/components/">Components</Link>
      <Link href="https://example.com" external>
        External
      </Link>
    </Stack>
  );
}
