import { Tooltip, TooltipTrigger, TooltipContent } from '@tessen-ui/react';

export default function Example() {
  return (
    <Tooltip>
      <TooltipTrigger>Save</TooltipTrigger>
      <TooltipContent>Save the file</TooltipContent>
    </Tooltip>
  );
}
