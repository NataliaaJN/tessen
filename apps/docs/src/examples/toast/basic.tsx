import { Button, Toaster, createToaster } from '@tessen-ui/react';

const toaster = createToaster();

export default function Example() {
  return (
    <div>
      <Button onClick={() => toaster.create({ title: 'Saved', description: 'Changes stored' })}>
        Notify
      </Button>
      <Toaster toaster={toaster} />
    </div>
  );
}
