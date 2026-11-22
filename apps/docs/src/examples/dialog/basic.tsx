import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@tessen-ui/react';

export default function Example() {
  return (
    <Dialog>
      <DialogTrigger>Delete account</DialogTrigger>
      <DialogContent>
        <DialogTitle>Delete account?</DialogTitle>
        <DialogDescription>This cannot be undone.</DialogDescription>
        <DialogClose>Cancel</DialogClose>
      </DialogContent>
    </Dialog>
  );
}
