'use client';

// The known limit from F3-progress §1: SSR + hydration + `defaultOpen`. The dialog must end up open,
// trapping focus and closing with Escape after hydration.
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@tessen-ui/react';

export function DialogOpenOnLoad() {
  return (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogTitle>Opened on load</DialogTitle>
        <DialogDescription>Rendered after hydration.</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
