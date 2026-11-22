import { Button, EmptyState } from '@tessen-ui/react';

export default function Example() {
  return (
    <EmptyState title="No projects" description="Create one to start." icon="★">
      <Button>Create</Button>
    </EmptyState>
  );
}
