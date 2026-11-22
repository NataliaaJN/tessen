import { Radio, RadioGroup } from '@tessen-ui/react';

export default function Example() {
  return (
    <RadioGroup aria-label="Plan" defaultValue="pro" orientation="horizontal">
      <Radio value="free">Free</Radio>
      <Radio value="pro">Pro</Radio>
      <Radio value="team">Team</Radio>
    </RadioGroup>
  );
}
