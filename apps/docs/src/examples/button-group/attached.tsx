import { ButtonGroup, ToggleButton } from '@tessen-ui/react';

export default function Example() {
  return (
    <ButtonGroup aria-label="Align" attached>
      <ToggleButton>Left</ToggleButton>
      <ToggleButton defaultPressed>Center</ToggleButton>
      <ToggleButton>Right</ToggleButton>
    </ButtonGroup>
  );
}
