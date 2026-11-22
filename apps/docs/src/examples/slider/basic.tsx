import { Slider } from '@tessen-ui/react';

export default function Example() {
  return (
    <Slider label="Volume" defaultValue={40} style={{ maxInlineSize: '20rem' }} />
  );
}
