import { Card, Grid } from '@tessen-ui/react';

export default function Example() {
  return (
    <Grid columns="2" gap="4">
      <Card variant="outlined" header="Outlined" footer="Footer">
        Body
      </Card>
      <Card variant="elevated" padding="lg">
        Elevated, large padding
      </Card>
      <Card variant="filled" padding="sm">
        Filled, small padding
      </Card>
      <Card padding="none">No padding</Card>
    </Grid>
  );
}
