import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@tessen-ui/react';

export default function Example() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Delete item</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Delete item?</AlertDialogTitle>
        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
        <AlertDialogCancel>Keep</AlertDialogCancel>
        <AlertDialogAction tone="danger">Remove</AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}
