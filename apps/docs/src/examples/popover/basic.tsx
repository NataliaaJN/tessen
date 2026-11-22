import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from '@tessen-ui/react';

export default function Example() {
  return (
    <Popover>
      <PopoverTrigger>Details</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Shipping</PopoverTitle>
        <PopoverDescription>Arrives in two days.</PopoverDescription>
        <PopoverClose>Close</PopoverClose>
      </PopoverContent>
    </Popover>
  );
}
