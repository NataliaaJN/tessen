import { Card, Grid } from '@tessen-ui/react';

export default function Example() {
  return (
    <Grid columns="3" gap="3">
      <Card>One</Card>
      <Card>Two</Card>
      <Card>Three</Card>
    </Grid>
  );
}
